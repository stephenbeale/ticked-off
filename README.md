# Packlist

Reusable checklists for travel, packing, and routines. Save once, run any time.

A mobile-first PWA — installable to your home screen and works offline. All data lives in your browser's `localStorage`; no account, no server.

## Features

- Create reusable checklists (e.g. *Holiday packing*, *Leaving the house*)
- Tap to check items; progress persists between visits
- Reorder, rename, and delete items
- Duplicate a list to spin up a fresh run while keeping the original
- Reset all checks to start the list over
- Export/share without a database:
  - **Email to myself** — opens your mail app with the list pre-filled
  - **Copy as text** — plain text with `[ ]` / `[x]` markers
  - **Download JSON** (single list) or **Download all** (full backup)
  - **Download CSV**
  - **Import JSON** to restore or merge a backup

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS (mobile-first)
- PWA: web manifest + custom service worker (cache-first for the app shell)
- Storage: `localStorage` (versioned schema)

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

The build is fully static — drop `dist/` on any static host (GitHub Pages, SiteGround, Netlify, etc.).

## Accessibility

- Semantic landmarks (`<header>`, `<main>`)
- ARIA on dialogs/menus, `aria-live` for transient toasts
- Visible focus rings (`:focus-visible`)
- All interactive elements reachable by keyboard
- Respects `prefers-color-scheme`
