# A New Suntory Time — Whisky Advocate digital special feature

Sponsored digital feature for Suntory Global Spirits, produced by Shanken Creative Group.
A QR code in the November issue of Wine Spectator drives to this page.

## Pages

| Page | File |
| --- | --- |
| Homepage | `index.html` |
| No Effort No Compromise: The Rise of Ready to Serve | `articles/no-effort-no-compromise.html` |
| Where Craft Lives: Where the Bar Sets the Standard | `articles/where-craft-lives.html` |
| Bringing Craft Home: How the Bar Experience Travels | `articles/bringing-craft-home.html` |

Plain static HTML, CSS and vanilla JS. No build step and no third-party runtime dependencies.
Open `index.html` directly or serve the folder with any static host (Vercel, Netlify, S3, or the WA CMS).

```
python3 -m http.server 8080   # then open http://localhost:8080
```

## Homepage structure (follows SGS Digital Design-V4)

1. Hero: contained header composition. The title lockup was lifted from the header art as a
   transparent PNG so Eleni's typography is exact, the bottles are a separate depth layer, and a WebGL
   shader (`assets/js/hero-gl.js`) drifts warm light behind both.
2. Brand marquee strip.
3. "How We Experience the Moment": collage with the burgundy caption box, copy on the right.
4. "Meeting the Moment Stories" eyebrow, then three full-bleed 50/50 rows with the title over the photo:
   6 is the New 8, The Reason We Go Out, Drink Less Drink Better.
5. Three article cards with arrows, linking to the article pages.
6. "Drinks for Every Moment": 16 products on white. Hover (desktop) or tap (touch) reveals the copy and
   Shop link. Cards tilt toward the pointer with a glare sweep.
7. Three-column burgundy footer: WA logo, Meeting the Moment copy, SGS logo.

## Motion layer

`assets/js/motion.js` handles the intro curtain, scroll progress bar, word-split heading reveals,
scroll parallax on media (`data-parallax`), clip-wipe image reveals (`.wipe`) and drink-card tilt.
`assets/js/main.js` handles the drink reveal toggles and generic fade-up reveals (`.reveal`).
Everything is disabled under `prefers-reduced-motion`, and the hero renders fully without JS.

Note for anyone editing the wipe reveal: a fully clipped element never intersects in Chrome's
IntersectionObserver, so the initial clip leaves a 1px sliver and the observer uses threshold 0.

## Shop links

Links go to the WA Store where the product exists. Products the copy doc flagged as
"needs to be added to WA Store" currently point at ReserveBar and carry `data-store="reservebar"`
on the `<a>` so they are easy to find and swap once the WA Store listings exist:

- Jim Beam & Lemonade
- Jim Beam Black & Soda
- Maker's Mark 46 Manhattan
- -196 Vodka Seltzer
- On The Rocks Cosmopolitan
- Hornitos Margarita

Two serves had no shop link in the copy doc and show copy only: Basil Hayden Bourbon Sparkling Sidecar
and Sipsmith FreeGlider Gin & Tonic.

## Assets

Source images live in the shared Drive folder "SGS Dig Images". `assets/img/` holds web-optimised
copies (WebP with JPG fallback, logos as PNG). The Whisky Advocate white logo was generated from the
black PNG since the supplied white version was EPS only.

Fonts are self-hosted Google Fonts: Marcellus for display (closest match to the lockup's letterforms)
and Jost for body and small-cap labels. Palette is sampled from the header art:
blush `#faede5`, burgundy `#7e3132`, ink `#282424`.
