# CasaConnect client

React single-page application built with Vite, Tailwind CSS and Redux Toolkit.

The full documentation for this project, covering setup, the API, data models,
authentication, the design system and known issues, lives in the
[repository root README](../README.md).

## Quick start

This package expects the API to be running on port 3000 first. From the
repository root:

```bash
npm install && npm run dev
```

Then, here:

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Vite proxies `/api` to port 3000, so use this URL
rather than hitting the API directly.

`client/.env` needs one variable for Google sign-in:

```
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot module replacement |
| `npm run build` | Production build into `dist` |
| `npm run preview` | Serve the built output locally |
| `npm run lint` | ESLint over `src` |

## Where things live

```
public/screenshots/   captures used by the README and the /showcase page
src/components/       header, footer, cards, gallery, command palette, forms
src/pages/            one file per route
src/lib/              formatting helpers, theme and saved-listing hooks
src/redux/            user slice and the persisted store
src/index.css         design tokens and component classes
tailwind.config.js    tokens surfaced to Tailwind
```

Design tokens are CSS custom properties in `src/index.css`. Light, dark and
system themes swap token values only, so there is no `dark:` utility anywhere in
this codebase. See the root README's design system section before adding colours.
