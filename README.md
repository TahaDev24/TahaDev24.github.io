# Taha Hesaraki — Personal Website

Personal portfolio and workspace of Taha Hesaraki, published with GitHub Pages.

## Structure

- `index.html` — Persian-first personal portfolio and project directory.
- `assets/css/site.css` — responsive visual system, typography, layout and reduced-motion support.
- `assets/js/site.js` — navigation, scroll progress and reveal interactions.
- `assets/js/silver-field.js` — lightweight Canvas particle field with depth, metallic highlights and visibility-aware rendering.
- `tools/index.html` — existing local-first workspace application (kept separate from the portfolio redesign).
- `sitemap.xml` — public portfolio and workspace URLs.

## Development

This is a static site and has no build step or package installation requirement. Open `index.html` through a local static HTTP server to test root-relative asset paths and the `/tools/` route.

The particle layer adapts its particle count and pixel ratio for smaller/touch devices, pauses when the page is hidden, and respects `prefers-reduced-motion`.

## Publishing

GitHub Pages serves the root of the `main` branch. Changes merged into `main` are published automatically by GitHub Pages.
