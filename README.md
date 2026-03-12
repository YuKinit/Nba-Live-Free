# NBA Live Free (Web)

Web version of the NBA Live Free app — today's games, schedule, live scores, game details in Philippine Time (PHT), and links to free NBA streams.

## Setup

```bash
npm install
```

Optional: copy `.env.example` to `.env` and add your Supabase URL and anon key to enable the "X online" presence counter. Without it, the app works normally; the badge just won’t show.

## Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output is in `dist/`. Serve with any static host.

## Features

- **Home** — Today’s games with live/final filters
- **Schedule** — Upcoming games, link to playoff bracket
- **Streams** — Today/tomorrow games with “Watch now” (opens stream in-app or new tab)
- **Reels** — Link and embed to YouTube Shorts
- **About** — App info and PHCorner profile link
- **Game detail** — Score, standings, box score when final
- **Team leaders** — Last game top scorers for scheduled matchup

Created by Yuki. Not affiliated with the NBA.
