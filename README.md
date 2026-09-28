
  # Premium Gaming Portfolio Website

  This is a code bundle for Premium Gaming Portfolio Website. The original project is available at https://www.figma.com/design/Uzgs1IMmtYJWCZq2i6dh6h/Premium-Gaming-Portfolio-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## YouTube Analytics

  The Analytics page reads daily views, net subscriber changes, and watch time from March 3, 2026 through the current date. It requires YouTube Analytics API access for the channel owner account. Configure these variables on the backend host (never in frontend `VITE_` variables):

  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REFRESH_TOKEN`

  The backend exposes `/api/youtube/oauth/start` to authorize the channel owner with the `https://www.googleapis.com/auth/yt-analytics.readonly` scope. For local development, register `http://localhost:3001/` as an authorized redirect URI in Google Cloud; the callback stores the refresh token as `GOOGLE_REFRESH_TOKEN` in the ignored `.env`. For a hosted backend, set `GOOGLE_REDIRECT_URI` to its registered callback URL and save the resulting refresh token as `GOOGLE_REFRESH_TOKEN` in the backend host's environment so it persists across restarts.

  The frontend uses `https://xtract-youtube-backend.onrender.com` for YouTube API requests in both development and production.
  