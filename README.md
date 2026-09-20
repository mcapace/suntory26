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

Plain static HTML, CSS and vanilla JS. No build step. Open `index.html` directly or serve the folder
with any static host (Vercel, Netlify, S3, or dropped into the WA CMS).

```
python3 -m http.server 8080   # then open http://localhost:8080
```

## Homepage structure

1. Hero (the supplied `SGS-Dig-Header.jpg` art; on phones the title is rendered as live text over a crop of the bottles).
2. "How We Experience the Moment" intro copy with the four-up collage.
3. Three trend sections: 6 Is The New 8, The Reason We Go Out, Drink Less Drink Better.
4. Grid of three article cards linking to the article pages.
5. "Drinks for Every Moment": 16 product cards. Hover (desktop) or tap (touch) reveals the copy and Shop link.
6. "Meeting the Moment" footer with SGS and Whisky Advocate logos.

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

Fonts are Google Fonts: Josefin Sans (display) and Jost (body), chosen to sit with the geometric
type in the header art. Palette is sampled from the header: blush `#faede5`, burgundy `#7e3132`, ink `#282424`.
