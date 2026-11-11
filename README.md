# REST Countries API with Color Theme Switcher (Project-2)

A responsive Single Page Application (SPA) built using React, TypeScript, and Vite. This application allows users to explore world countries, search in real-time, filter by geographical region, view comprehensive detailed information on individual nation profile pages with dynamic routing, and seamlessly toggle between Light and Dark mode.

## Project Links
* **Live Netlify URL:** https://rest-countries-react-project2.netlify.app


## 📋 Features Implemented

- **Global Country Catalog:** Displays the full dataset of ~250 countries in a clean, responsive card grid.
- **Instant Search:** Dynamic filter input allowing users to search countries by common, native, or official names without page reloads.
- **Filter by Region:** Continent dropdown menu (Africa, Americas, Asia, Europe, Oceania) to quickly narrow down nations.
- **Dynamic Routing & Country Detail Pages:** 
  - Dedicated routes (`/country/:countryCode`) powered by React Router DOM.
  - Displays native names, population counts, regions, sub-regions, capitals, top-level domains, currencies, and languages.
  - Interactive border country tags that link directly to neighboring nation profiles.
- **Theme Switcher:** Custom Light/Dark mode state management built with React Context API and CSS custom properties, persisted across browser refreshes via `localStorage`.
- **Live Paginated Data Pipeline & Resilient Caching:** Centralized data fetching through a dedicated service layer that queries the live REST Countries v5 API using `limit=100` and `offset` pagination. It uses an in-flight singleton lock and request pacing to prevent duplicate fetches or rate-limit blocks, caches the entire ~250 country catalog in `sessionStorage` (reducing reloads to 0 API calls), and enforces a multi-tier fallback chain for flag assets.

## Deployment & Security Configuration

- **Hosting & Build Pipeline:** Built with Vite and TypeScript (`npm run build`), deploying the compiled `dist/` directory to Netlify.
- **SPA Routing Rule:** Configured a `public/_redirects` file containing `/* /index.html 200` so that refreshing or sharing direct deep URLs (such as `/country/USA` or `/country/FRA`) resolves to the React client router rather than triggering a server 404 error.
- **Allowed Origins & CORS Security:** In compliance with REST Countries v5 security policy, authorized hostnames (`localhost,127.0.0.1,rest-countries-react-project2.netlify.app`) were registered in the API dashboard's Allowed Origins list to prevent cross-origin preflight rejections (HTTP 403 Forbidden).
- **Environment Variables:** The API key is managed securely via `VITE_REST_COUNTRIES_API_KEY`, keeping sensitive credentials decoupled from the codebase.

## Project Reflections & Key Takeaways
1. What was the most challenging part of this project, and how did you overcome it?
The most demanding challenge was transitioning from the deprecated open v3/v3.1 endpoints to the authenticated REST Countries v5 API while adhering strictly to third-party rate limits, pagination, and data schemas:

- **The 25 vs 254 Country Pagination Problem:** 
  By default, the v5 API returned only 25 records per page inside `data.objects`. When attempting to rapidly loop through 11 pages in development mode, React 18's `StrictMode` mounted components twice, firing parallel request loops that instantly triggered `429 Too Many Requests` rate limits and missing CORS preflight headers on subsequent pages.
  
- **How I Solved It:**
  1. **Optimized Pagination with `limit=100`:** Following the API specifications, I shifted the query strategy to `limit=100&offset=...`. This allowed the application to retrieve the complete catalog of 254 countries in just 3 sequential requests (`offset=0`, `100`, `200`) instead of 11, tracking `data.meta.more` to terminate requests accurately.
  2. **Singleton In-Flight Request Lock & Pacing:** Implemented a module-level promise lock in `countryService.ts` alongside a 300ms inter-request pacing delay. This prevented React double-mounting from firing simultaneous requests.
  3. **Session Persistence:** Stored the normalized catalog into `sessionStorage`. Once loaded, page refreshes, search queries, and route transitions utilize 0 API calls for the remainder of the session, preserving quota limits.
  4. **Dynamic Data Normalization:** Built defensive parsers to standardize differing data shapes—unwrapping nested `names`, handling variable types for `currencies`, `languages`, and `capitals`, and safely mapping codes.

- **Missing Flag Edge Cases (Abkhazia, Northern Cyprus, South Ossetia):**
  Three entities in the v5 dataset lacked standard ISO 3166-1 alpha-2 codes and returned empty strings for flag URLs. Rather than hardcoding external image sources, I constructed a hierarchical fallback chain (`flag.url_svg` -> `flag.url_png` -> REST Countries Flag CDN via `codes.alpha_2` -> Accessible placeholder box). If no valid image exists, the UI renders an accessible, styled "No Flag Available" container with descriptive `role="img"` and `aria-label` tags, preventing layout shifts or broken image icons.

2. How did you handle dark/light theme switching?
I implemented a ThemeContext using React's Context API to manage the theme globally without prop-drilling. The theme state is synchronized with localStorage so a user's choice is remembered when they revisit or reload the application. In CSS, I defined standard custom variables (--bg-color, --element-color, --text-color, and --box-shadow) on body[data-theme='light'] and body[data-theme='dark']. This made theme switching smooth, instant, and maintainable.

3. What did you learn about client-side routing and deployment?
Working with dynamic parameters in React Router DOM (/country/:countryCode) gave me practical experience in parsing route params with useParams and decoding URL strings safely. I also learned that Single Page Applications on hosts like Netlify require a public/_redirects file (/* /index.html 200) so that reloading deep dynamic routes doesn't trigger 404 errors on the server.

4. What would you improve or add in future iterations?
Pagination or Virtualized Scrolling: While all ~250 countries load smoothly, adding virtual scrolling (e.g., using react-window) could optimize initial DOM node rendering on low-power mobile devices.

Search Debouncing: Adding a lightweight debounce hook to the search input would optimize state updates on rapid keystrokes.

Favorites & Bookmarks: Adding a local storage bookmarking system so users can save favorite travel destinations.