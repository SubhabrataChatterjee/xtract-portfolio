import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

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
    // 2. VIDEOS
    // --------------------------------

    const uploadsData = await youtubeRequest(
      "playlistItems",
      {
        part: "snippet,contentDetails",
        playlistId: uploadsPlaylistId,
        maxResults: "50"
      }
    );

    const videoIds = uploadsData.items
      .map((item) => item.contentDetails.videoId)
      .join(",");

    let videoDetails = {
      items: []
    };

    if (videoIds) {
      videoDetails = await youtubeRequest(
        "videos",
        {
          part: "snippet,contentDetails,statistics",
          id: videoIds
        }
      );
    }

    const videos = videoDetails.items.map((video) => {
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

    // --------------------------------
    // 3. PLAYLISTS
    // --------------------------------

    const playlistData = await youtubeRequest(
      "playlists",
      {
        part: "snippet,contentDetails",
        channelId,
        maxResults: "50"
      }
    );

    const playlists = [];

    for (const playlist of playlistData.items) {
      const playlistItems =
        await youtubeRequest(
          "playlistItems",
          {
            part: "snippet,contentDetails",
            playlistId: playlist.id,
            maxResults: "50"
          }
        );

      const playlistVideoIds =
        playlistItems.items
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
      .sort((a, b) => {
        const viewsA = Number(
          a.views.replace(/,/g, "")
        );

        const viewsB = Number(
          b.views.replace(/,/g, "")
        );

        return viewsB - viewsA;
      })
      .slice(0, 3);

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

      featuredVideo
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