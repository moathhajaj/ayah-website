# Ayah Website

Landing page for **Ayah**, a mobile app that shows a different verse of the Quran every day.

One ayah a day. A heart at rest.

## Pages

- [index.html](index.html) is the English page.
- [ar/index.html](ar/index.html) is the Arabic page, fully RTL with its own copy.

Each page links to the other through a switcher in the navigation and the footer.

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server
```

Fonts (Amiri, Amiri Quran, Cormorant Garamond, Tajawal) and icons (Lucide) load from CDNs, so the first view needs an internet connection. Everything else is self contained.

## Structure

```
index.html        English landing page
ar/index.html     Arabic landing page (RTL)
css/styles.css    Shared design system
css/styles-rtl.css RTL and Arabic typography overrides
js/main.js        Interactions: nav, gallery, FAQ, reveals, starfield
favicon.svg       Rub el Hizb mark in brand gold
```

## Deploy

The repo root is the site, so it works as is on GitHub Pages, Netlify, Vercel, or any static host. For GitHub Pages, enable Pages from the `main` branch root.
