import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { google } from "googleapis";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

console.log("CLIENT ID =", process.env.GOOGLE_CLIENT_ID);

dotenv.config({ override: true });
console.log(
  "Gemini key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

const app = express();
const PORT = process.env.PORT || 3001;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, });
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const isHosted = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
const oauthRedirectUri = isHosted
  ? process.env.GOOGLE_REDIRECT_URI || `https://localhost:${PORT}/api/youtube/oauth/callback`
  : process.env.GOOGLE_LOCAL_REDIRECT_URI || `http://localhost:${PORT}/`;
const oauthCallbackPath = new URL(oauthRedirectUri).pathname;
const oauthStates = new Map();

app.use(cors());
app.use(express.json());

async function youtubeRequest(endpoint, params) {
  const url = new URL(
    `https://www.googleapis.com/youtube/v3/${endpoint}`
  );

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  url.searchParams.set(
    "key",
    process.env.YOUTUBE_API_KEY
  );

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

function createYoutubeOAuthClient() {
  const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret } = process.env;
  if (!clientId || !clientSecret) {
    throw new Error("YouTube OAuth client credentials are not configured.");
  }
  return new google.auth.OAuth2(clientId, clientSecret, oauthRedirectUri);
}

app.get("/api/youtube/oauth/start", (req, res) => {
  try {
    const oauthClient = createYoutubeOAuthClient();
    const state = randomBytes(32).toString("hex");
    oauthStates.set(state, Date.now() + 10 * 60 * 1000);

    for (const [savedState, expiresAt] of oauthStates) {
      if (expiresAt < Date.now()) oauthStates.delete(savedState);
    }

    return res.redirect(
      oauthClient.generateAuthUrl({
        access_type: "offline",
        include_granted_scopes: true,
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/yt-analytics.readonly"],
        state,
      }),
    );
  } catch (error) {
    return res.status(503).send(error.message);
  }
});

app.get(oauthCallbackPath, async (req, res) => {
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const expiresAt = oauthStates.get(state);
  oauthStates.delete(state);

  if (!state || !expiresAt || expiresAt < Date.now()) {
    return res.status(400).send("OAuth state is invalid or expired. Start the connection again.");
  }

  if (req.query.error) {
    return res.status(400).send("YouTube authorization was cancelled. You can close this tab.");
  }

  if (typeof req.query.code !== "string") {
    return res.status(400).send("YouTube did not return an authorization code.");
  }

  try {
    const oauthClient = createYoutubeOAuthClient();
    const { tokens } = await oauthClient.getToken(req.query.code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return res.status(400).send(
        "Google did not issue a refresh token. Revoke this app's access in your Google Account and connect again.",
      );
    }

    process.env.GOOGLE_REFRESH_TOKEN = refreshToken;

    if (process.env.NODE_ENV !== "production") {
      const envPath = path.join(projectRoot, ".env");
      const currentEnv = await readFile(envPath, "utf8").catch((error) => {
        if (error.code === "ENOENT") return "";
        throw error;
      });
      const envLines = currentEnv
        .split(/\r?\n/)
        .filter((line) => !/^\s*(?:export\s+)?GOOGLE_REFRESH_TOKEN=/.test(line));
      envLines.push(`GOOGLE_REFRESH_TOKEN=${refreshToken}`);
      await writeFile(envPath, `${envLines.filter(Boolean).join("\n")}\n`, { mode: 0o600 });
    }

    return res.type("html").send(
      "<!doctype html><html><head><meta charset=\"utf-8\"><title>YouTube connected</title></head><body style=\"font-family:system-ui;max-width:36rem;margin:12vh auto;padding:0 1.5rem;background:#101512;color:#f1f5f9\"><h1>YouTube connected</h1><p>Authorization succeeded. Return to Analytics and select Refresh to load your channel data.</p><p>For hosted deployments, add the refresh token as GOOGLE_REFRESH_TOKEN in the backend environment so it survives restarts.</p></body></html>",
    );
  } catch (error) {
    console.error("YouTube OAuth callback failed:", error.message);
    return res.status(502).send("YouTube authorization could not be completed. Check the OAuth redirect URI and try again.");
  }
});

app.get("/api/youtube/analytics", async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret) {
    return res.status(503).json({
      error: "YouTube OAuth client credentials are missing from the backend environment.",
    });
  }

  if (!refreshToken) {
    return res.status(503).json({
      error: "A channel-owner YouTube OAuth refresh token is required. Authorize the account with the yt-analytics.readonly scope and set GOOGLE_REFRESH_TOKEN on the backend.",
    });
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      return res.status(502).json({
        error: "YouTube Analytics authorization failed. Check the backend OAuth credentials and refresh token.",
      });
    }

    const { access_token: accessToken } = await tokenResponse.json();
    if (!accessToken) {
      return res.status(502).json({
        error: "YouTube did not return an Analytics access token.",
      });
    }

    const startDate = "2026-03-03";
    const endDate = new Date().toISOString().slice(0, 10);
    const pageSize = 200;
    const rows = [];
    let startIndex = 1;

    while (true) {
      const url = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
      const params = {
        ids: "channel==MINE",
        startDate,
        endDate,
        metrics: "views,subscribersGained,subscribersLost,estimatedMinutesWatched",
        dimensions: "day",
        sort: "day",
        maxResults: String(pageSize),
        startIndex: String(startIndex),
      };
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

      const reportResponse = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!reportResponse.ok) {
        return res.status(502).json({
          error: "Unable to retrieve channel analytics from YouTube.",
        });
      }

      const report = await reportResponse.json();
      const pageRows = report.rows || [];
      rows.push(...pageRows);
      if (pageRows.length < pageSize) break;
      startIndex += pageSize;
    }

    const dailyRows = rows.map(([day, views, gained, lost, watchTimeMinutes]) => ({
      day,
      views: Number(views || 0),
      subscribersGained: Number(gained || 0),
      subscribersLost: Number(lost || 0),
      subscribers: Number(gained || 0) - Number(lost || 0),
      watchTimeMinutes: Number(watchTimeMinutes || 0),
      watchTimeHours: Number(watchTimeMinutes || 0) / 60,
    }));

    const totals = dailyRows.reduce(
      (sum, row) => ({
        views: sum.views + row.views,
        subscribersGained: sum.subscribersGained + row.subscribersGained,
        subscribersLost: sum.subscribersLost + row.subscribersLost,
        subscribers: sum.subscribers + row.subscribers,
        watchTimeMinutes: sum.watchTimeMinutes + row.watchTimeMinutes,
        watchTimeHours: sum.watchTimeHours + row.watchTimeHours,
      }),
      {
        views: 0,
        subscribersGained: 0,
        subscribersLost: 0,
        subscribers: 0,
        watchTimeMinutes: 0,
        watchTimeHours: 0,
      },
    );

    return res.json({ startDate, endDate, totals, rows: dailyRows });
  } catch (error) {
    console.error("YouTube Analytics request failed:", error.message);
    return res.status(502).json({
      error: "Unable to retrieve channel analytics from YouTube.",
    });
  }
});

app.get("/api/youtube/data", async (req, res) => {
  try {
    console.log("Fetching YouTube data...");

    // --------------------------------
    // 1. CHANNEL
    // --------------------------------

    const channelData = await youtubeRequest("channels", {
      part: "snippet,contentDetails,statistics",
      forHandle: process.env.YOUTUBE_HANDLE
    });

    if (!channelData.items?.length) {
      return res.status(404).json({
        error: "YouTube channel not found"
      });
    }

    const channel = channelData.items[0];

    const channelId = channel.id;

    const uploadsPlaylistId =
      channel.contentDetails.relatedPlaylists.uploads;

    // --------------------------------
// 2. ALL VIDEOS
// --------------------------------

let allUploadItems = [];
let nextPageToken = null;

do {
  const params = {
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: "50",
  };

  if (nextPageToken) {
    params.pageToken = nextPageToken;
  }

  const uploadsData = await youtubeRequest(
    "playlistItems",
    params
  );

  allUploadItems.push(...(uploadsData.items || []));

  nextPageToken = uploadsData.nextPageToken || null;

} while (nextPageToken);

console.log(
  `Fetched ${allUploadItems.length} videos from YouTube`
);

const videoIds = allUploadItems
  .map((item) => item.contentDetails.videoId)
  .filter(Boolean)
  .join(",");

    let videoDetails = {
      items: []
    };

    let allVideoDetails = [];

const videoIdArray = allUploadItems
  .map((item) => item.contentDetails.videoId)
  .filter(Boolean);

for (let i = 0; i < videoIdArray.length; i += 50) {
  const batch = videoIdArray.slice(i, i + 50);

  const videoDetails = await youtubeRequest(
    "videos",
    {
      part: "snippet,contentDetails,statistics",
      id: batch.join(",")
    }
  );

  allVideoDetails.push(...(videoDetails.items || []));
}

console.log(
  `Fetched detailed data for ${allVideoDetails.length} videos`
);

    const videos = allVideoDetails.map((video) => {
      const seconds =
        parseDuration(video.contentDetails.duration);

      return {
        id: video.id,

        title: video.snippet.title,

        thumbnail:
          video.snippet.thumbnails?.high?.url ||
          video.snippet.thumbnails?.medium?.url ||
          video.snippet.thumbnails?.default?.url ||
          "",

        views: Number(
          video.statistics?.viewCount || 0
        ).toLocaleString(),

        date: video.snippet.publishedAt,

        duration: formatDuration(seconds),

        description:
          video.snippet.description || ""
      };
    });

    const totalLikes = allVideoDetails.reduce(
      (total, video) =>
      total + Number(video.statistics?.likeCount || 0),
      0
    );
   // --------------------------------
// 3. GET ALL PLAYLISTS
// --------------------------------

let allPlaylists = [];
let playlistPageToken = null;

do {
  const params = {
    part: "snippet,contentDetails",
    channelId,
    maxResults: "50",
  };

  if (playlistPageToken) {
    params.pageToken = playlistPageToken;
  }

  const playlistPage = await youtubeRequest(
    "playlists",
    params
  );

  allPlaylists.push(...(playlistPage.items || []));

  playlistPageToken =
    playlistPage.nextPageToken || null;

} while (playlistPageToken);

console.log(
  `Fetched ${allPlaylists.length} playlists from YouTube`
);

    const playlists = [];

    for (const playlist of allPlaylists) {
       let allPlaylistItems = [];
  let playlistItemsPageToken = null;

  do {
    const params = {
      part: "snippet,contentDetails",
      playlistId: playlist.id,
      maxResults: "50",
    };

    if (playlistItemsPageToken) {
      params.pageToken = playlistItemsPageToken;
    }

    const playlistPage = await youtubeRequest(
      "playlistItems",
      params
    );

    allPlaylistItems.push(...(playlistPage.items || []));

    playlistItemsPageToken =
      playlistPage.nextPageToken || null;

  } while (playlistItemsPageToken);

  console.log(
    `Playlist "${playlist.snippet.title}" → ${allPlaylistItems.length} videos`
  );

      const playlistVideoIds =
        allPlaylistItems
          .map(
            (item) =>
              item.contentDetails.videoId
          )
          .join(",");

      let playlistVideoData = {
        items: []
      };

      if (playlistVideoIds) {
        playlistVideoData =
          await youtubeRequest(
            "videos",
            {
              part:
                "snippet,contentDetails,statistics",
              id: playlistVideoIds
            }
          );
      }

      const playlistVideos =
        playlistVideoData.items.map(
          (video) => {
            const seconds =
              parseDuration(
                video.contentDetails.duration
              );

            return {
              id: video.id,

              title: video.snippet.title,

              thumbnail:
                video.snippet.thumbnails?.high?.url ||
                video.snippet.thumbnails?.medium?.url ||
                video.snippet.thumbnails?.default?.url ||
                "",

              views: Number(
                video.statistics?.viewCount || 0
              ).toLocaleString(),

              date: video.snippet.publishedAt,

              duration:
                formatDuration(seconds),

              description:
                video.snippet.description || ""
            };
          }
        );

      playlists.push({
        id: playlist.id,

        name: playlist.snippet.title,

        thumbnail:
          playlist.snippet.thumbnails?.high?.url ||
          playlist.snippet.thumbnails?.medium?.url ||
          playlist.snippet.thumbnails?.default?.url ||
          "",

        category: "Gaming",

        description:
          playlist.snippet.description || "",

        videoCount:
          playlist.contentDetails.itemCount || 0,

        videos: playlistVideos
      });
    }

// --------------------------------
// 4. POPULAR VIDEOS
// --------------------------------

const popularVideos = [...videos]
  .filter((video) => {
    const parts = video.duration.split(":").map(Number);

    let totalSeconds = 0;

    if (parts.length === 2) {
      totalSeconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      totalSeconds =
        parts[0] * 3600 +
        parts[1] * 60 +
        parts[2];
    }

    return totalSeconds > 181;
  })
  .sort((a, b) => {
    const viewsA = Number(
      String(a.views).replace(/,/g, "")
    );

    const viewsB = Number(
      String(b.views).replace(/,/g, "")
    );

    return viewsB - viewsA;
  })
  .slice(0, 3);

  console.log(
  "POPULAR VIDEOS:",
  popularVideos.map((video) => ({
    title: video.title,
    duration: video.duration,
    views: video.views,
  }))
);

    // --------------------------------
    // 5. FEATURED VIDEO
    // --------------------------------

    const featuredVideo =
      videos.length > 0
        ? videos[0]
        : null;

    // --------------------------------
    // 6. SEND EVERYTHING TO REACT
    // --------------------------------

    res.json({
      channel: {
        id: channel.id,

        name: channel.snippet.title,

        description:
          channel.snippet.description,

        thumbnail:
          channel.snippet.thumbnails?.high?.url ||
          channel.snippet.thumbnails?.medium?.url ||
          "",

        subscribers:
          channel.statistics?.subscriberCount ||
          "0",

        views:
          channel.statistics?.viewCount ||
          "0",

        videoCount:
          channel.statistics?.videoCount ||
          "0"
      },

      videos,

      playlists,

      popularVideos,

      featuredVideo,

      totalLikes
    });

  } catch (error) {
    console.error(
      "YouTube API error:",
      error.message
    );

    res.status(500).json({
      error: "Failed to fetch YouTube data",
      details: error.message
    });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  console.log("AI CHAT ROUTE HIT");

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    // --------------------------------
    // 1. GET CHANNEL
    // --------------------------------

    const channelData = await youtubeRequest("channels", {
      part: "snippet,contentDetails,statistics",
      forHandle: process.env.YOUTUBE_HANDLE,
    });

    if (!channelData.items?.length) {
      return res.status(404).json({
        error: "YouTube channel not found",
      });
    }

    const channel = channelData.items[0];

    const channelId = channel.id;

    // --------------------------------
    // 2. GET PLAYLISTS
    // --------------------------------

    const playlistData = await youtubeRequest("playlists", {
      part: "snippet,contentDetails",
      channelId,
      maxResults: "50",
    });

    const playlistContext = playlistData.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.snippet.title,
      description: playlist.snippet.description || "",
      videoCount: playlist.contentDetails.itemCount || 0,
    }));

    // --------------------------------
// 3. GET ALL INDIVIDUAL VIDEOS
// --------------------------------

const uploadsPlaylistId =
  channel.contentDetails.relatedPlaylists.uploads;

let allUploadItems = [];
let nextPageToken = null;

do {
  const params = {
    part: "snippet,contentDetails",
    playlistId: uploadsPlaylistId,
    maxResults: "50",
  };

  if (nextPageToken) {
    params.pageToken = nextPageToken;
  }

  const uploadsData = await youtubeRequest(
    "playlistItems",
    params
  );

  allUploadItems.push(...(uploadsData.items || []));

  nextPageToken =
    uploadsData.nextPageToken || null;

} while (nextPageToken);

console.log(
  `Fetched ${allUploadItems.length} videos from YouTube`
);

   const videoIdArray = allUploadItems
  .map((item) => item.contentDetails.videoId)
  .filter(Boolean);

    let videoContext = [];

    if (videoIdArray.length > 0) {
      const videoData = await youtubeRequest(
        "videos",
        {
          part: "snippet,contentDetails,statistics",
          id: videoIds,
        }
      );

      videoContext = videoData.items.map((video) => ({
        id: video.id,

        title: video.snippet.title,

        description:
          video.snippet.description || "",

        publishedAt:
          video.snippet.publishedAt,

        views:
          Number(
            video.statistics?.viewCount || 0
          ),

        likes:
          Number(
            video.statistics?.likeCount || 0
          ),

        comments:
          Number(
            video.statistics?.commentCount || 0
          ),

        duration:
          video.contentDetails?.duration || "",
      }));
    }

    // --------------------------------
    // 4. CHANNEL INFORMATION
    // --------------------------------

    const channelContext = {
      name: channel.snippet.title,

      description:
        channel.snippet.description || "",

      subscribers:
        Number(
          channel.statistics?.subscriberCount || 0
        ),

      totalViews:
        Number(
          channel.statistics?.viewCount || 0
        ),

      totalVideos:
        Number(
          channel.statistics?.videoCount || 0
        ),
    };

    // --------------------------------
    // 5. CALCULATE USEFUL VIDEO DATA
    // --------------------------------

    const mostViewedVideo =
      videoContext.length > 0
        ? [...videoContext].sort(
            (a, b) => b.views - a.views
          )[0]
        : null;

    const mostLikedVideo =
      videoContext.length > 0
        ? [...videoContext].sort(
            (a, b) => b.likes - a.likes
          )[0]
        : null;

    // --------------------------------
    // 6. CALCULATE LARGEST PLAYLIST
    // --------------------------------

    const largestPlaylist =
      playlistContext.length > 0
        ? [...playlistContext].sort(
            (a, b) => b.videoCount - a.videoCount
          )[0]
        : null;

    // --------------------------------
    // 7. GIVE GEMINI THE DATA
    // --------------------------------

    const context = `
You are XTRACT AI, the official AI assistant
for XTRACT's gaming portfolio website.

You have access to CURRENT DATA fetched directly
from XTRACT's YouTube channel.

========================
IMPORTANT RULES
========================

1. Use the data below to answer questions about XTRACT.

2. NEVER ask the user to provide a dataset,
YouTube channel, database, or additional context.

3. NEVER tell the user to go to YouTube to find
information that is already provided below.

4. NEVER invent video titles, views, dates,
playlist counts, subscribers, or other statistics.

5. If information exists below, give the exact
information.

6. If information is not available, clearly say
that the information is not available.

7. When asked about a specific video, search the
INDIVIDUAL VIDEOS section using the video title
or relevant keywords.

8. When asked about the most viewed video, use
MOST VIEWED VIDEO.

9. When asked about the most liked video, use
MOST LIKED VIDEO.

10. When asked about playlists, use PLAYLIST DATA.

11. When asked which playlist has the most videos,
use LARGEST PLAYLIST.

12. Keep responses concise and natural.

========================
CHANNEL DATA
========================

${JSON.stringify(channelContext, null, 2)}

========================
PLAYLIST DATA
========================

${JSON.stringify(playlistContext, null, 2)}

========================
INDIVIDUAL VIDEOS
========================

${JSON.stringify(videoContext, null, 2)}

========================
MOST VIEWED VIDEO
========================

${JSON.stringify(mostViewedVideo, null, 2)}

========================
MOST LIKED VIDEO
========================

${JSON.stringify(mostLikedVideo, null, 2)}

========================
LARGEST PLAYLIST
========================

${JSON.stringify(largestPlaylist, null, 2)}

========================
USER QUESTION
========================

${message}

Answer the user's question using the
authoritative YouTube data above.
`;

    // --------------------------------
    // 8. ASK GEMINI
    // --------------------------------

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: context,
    });

    res.json({
      reply: response.text,
    });

  } catch (error) {
    console.error("Gemini API error:", error);

    res.status(500).json({
      error: "Failed to generate AI response",
      details: error.message,
    });
  }
});

// --------------------------------
// HELPERS
// --------------------------------

function parseDuration(duration) {
  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) return 0;

  const hours =
    parseInt(match[1] || "0");

  const minutes =
    parseInt(match[2] || "0");

  const seconds =
    parseInt(match[3] || "0");

  return (
    hours * 3600 +
    minutes * 60 +
    seconds
  );
}

function formatDuration(totalSeconds) {
  const hours =
    Math.floor(totalSeconds / 3600);

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );

  const seconds =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.get("/auth/google", (req, res) => {
  console.log("REDIRECT URI:", process.env.GOOGLE_REDIRECT_URI);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/yt-analytics.readonly"
    ]
  });
  res.redirect(url);
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);

    res.send("YouTube authorization successful! Check VS Code terminal.");
  } catch (error) {
    console.error(error);
    res.status(500).send("OAuth failed");
  }
});
// --------------------------------
// START SERVER
// --------------------------------

const server = app.listen(PORT, () => {
  console.log(`YouTube backend running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("SERVER ERROR:", err);
});