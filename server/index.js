import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ override: true });

console.log(
  "Gemini key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

const app = express();
const PORT = process.env.PORT || 3001;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, });

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

// --------------------------------
// START SERVER
// --------------------------------

app.listen(PORT, "0.0.0.0", () => {
  console.log(`YouTube backend running on port ${PORT}`);
});