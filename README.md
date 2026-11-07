# REST Countries API with Color Theme Switcher (Project-2)

A responsive Single Page Application (SPA) built using React, TypeScript, and Vite. This application allows users to explore world countries, search in real-time, filter by geographical region, view comprehensive detailed information on individual nation profile pages with dynamic routing, and seamlessly toggle between Light and Dark mode.

## Project Links
* live Netlify URL : https://fantastic-praline-6f4570.netlify.app



## 📋 Features Implemented

- **Global Country Catalog:** Displays the full dataset of ~250 countries in a clean, responsive card grid.
- **Instant Search:** Dynamic filter input allowing users to search countries by common, native, or official names without page reloads.
- **Filter by Region:** Continent dropdown menu (Africa, Americas, Asia, Europe, Oceania) to quickly narrow down nations.
- **Dynamic Routing & Country Detail Pages:** 
  - Dedicated routes (`/country/:countryCode`) powered by React Router DOM.
  - Displays native names, population counts, regions, sub-regions, capitals, top-level domains, currencies, and languages.
  - Interactive border country tags that link directly to neighboring nation profiles.
- **Theme Switcher:** Custom Light/Dark mode state management built with React Context API and CSS custom properties, persisted across browser refreshes via `localStorage`.
- **Defensive Data Handling & Multi-Tier Service:** Implemented an intelligent service pipeline that attempts live API authentication and safely falls back to local data and FlagCDN if endpoints are rate-limited, paginated, or encounter CORS constraints.


## Project Reflections & Key Takeaways
1. What was the most challenging part of this project, and how did you overcome it?
The most challenging aspect was managing unpredictable API response structures and strict third-party rate limits/pagination. During development, switching between open endpoints and authenticated v5 endpoints revealed that data structures differed significantly:

v5 nested the records inside data.objects and only sent 25 records per request by default.

Fields like languages, currencies, and capitals varied between arrays, string primitives, and key-value dictionary objects (such as { abk: "Abkhazian", rus: "Russian" }), which caused React to throw Objects are not valid as a React child errors.

To solve this, I decoupled data fetching from UI presentation by creating a centralized countryService.ts. I wrote defensive normalization mappers that unwrap nested objects, validate data types, extract flag URLs cleanly, and fall back to local datasets if the live API limits the response to fewer than 100 countries. This guaranteed that the UI consistently received clean, predictable models without breaking.

2. How did you handle dark/light theme switching?
I implemented a ThemeContext using React's Context API to manage the theme globally without prop-drilling. The theme state is synchronized with localStorage so a user's choice is remembered when they revisit or reload the application. In CSS, I defined standard custom variables (--bg-color, --element-color, --text-color, and --box-shadow) on body[data-theme='light'] and body[data-theme='dark']. This made theme switching smooth, instant, and maintainable.

3. What did you learn about client-side routing and deployment?
Working with dynamic parameters in React Router DOM (/country/:countryCode) gave me practical experience in parsing route params with useParams and decoding URL strings safely. I also learned that Single Page Applications on hosts like Netlify require a public/_redirects file (/* /index.html 200) so that reloading deep dynamic routes doesn't trigger 404 errors on the server.

4. What would you improve or add in future iterations?
Pagination or Virtualized Scrolling: While all ~250 countries load smoothly, adding virtual scrolling (e.g., using react-window) could optimize initial DOM node rendering on low-power mobile devices.

Search Debouncing: Adding a lightweight debounce hook to the search input would optimize state updates on rapid keystrokes.

Favorites & Bookmarks: Adding a local storage bookmarking system so users can save favorite travel destinations.