
  # Premium Gaming Portfolio Website

  This is a code bundle for Premium Gaming Portfolio Website. The original project is available at https://www.figma.com/design/Uzgs1IMmtYJWCZq2i6dh6h/Premium-Gaming-Portfolio-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## YouTube Analytics

  The Analytics page reads daily views, net subscriber changes, and watch time from March 3, 2026 through the current date. It requires YouTube Analytics API access for the channel owner account. Configure these variables on the backend host (never in frontend `VITE_` variables):

  - `YOUTUBE_OAUTH_CLIENT_ID`
  - `YOUTUBE_OAUTH_CLIENT_SECRET`
  - `YOUTUBE_OAUTH_REFRESH_TOKEN`

  The refresh token must be authorized for the `https://www.googleapis.com/auth/yt-analytics.readonly` scope. Redeploy the backend after setting the variables.

  For local development, optionally set `VITE_YOUTUBE_BACKEND_URL` to the backend origin (for example, `http://localhost:3001`).
  