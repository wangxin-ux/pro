# Welcome Hero Specification

## Overview
- Target: `app/welcome-screen.tsx`
- Reference: user screenshot at 1908 x 915 plus live `https://www.reactbits.dev/` hero.
- Scope: first viewport only; no page scrolling or lower sections.
- Interaction model: time-driven animated background, hover-driven controls, click-driven entry to the existing library.

## Layout
- Full viewport, minimum 720px tall, overflow hidden.
- Header centered at about 84% viewport width and 96px high.
- Hero is a two-column grid: copy on the left, code preview on the right.
- Left column begins near 8% viewport width and around 19% viewport height.
- Right preview is approximately 34% viewport width and 73% viewport height.
- On tablet/mobile, hide the code preview and center the copy without enabling vertical page scrolling.

## Visual Language
- Customization overrides the source palette: white is dominant, supported by #f5f5f5, #dedede, #9a9a9a, #252525 and #090909.
- Background is a white/very-light-gray field with a fine gray dot grid.
- Animated grayscale light bands move slowly behind the content; no purple remains.
- Main heading is large, bold, tight, with the emphasized words rendered in dark gray.
- Glass panels use translucent white, 1px gray borders, 12-16px radii, and soft gray shadows.

## Header
- Left: atom-like logo, `React Bits`, slash, Docs, Tools, Pro, Sponsors.
- Right: theme icon button, GitHub star pill, `Get React Bits Pro` button.
- Controls brighten/lift slightly on hover.

## Hero Copy
- Announcement pill: `NEW BACKGROUND`, `AERO SHARDS`, arrow.
- Heading: `React components for` / `creative developers`.
- Supporting sentence and two CTA buttons match source text.
- `Browse Components` invokes the supplied `onEnter` callback.
- Metadata row: `170+ COMPONENTS` and `FREE FOREVER`.

## Code Preview
- Browser-like card with three dots and a `ColorBends` menu.
- Monospace code content mirrors the screenshot, with grayscale inline-value chips.
- Footer presets and editable-value note.
- Card has slow 5-7 second vertical floating motion.

## Background Motion
- Canvas covers the viewport behind all content.
- Draw a fixed dot field and multiple low-opacity grayscale wave bands.
- Animate continuously around 30-45fps using requestAnimationFrame.
- Pointer position subtly changes wave center and nearby particle brightness.

## Responsive
- Desktop >= 1100px: two-column composition.
- Tablet 700-1099px: copy occupies most width; preview is reduced or hidden.
- Mobile < 700px: compact header, hide secondary nav/actions and preview; heading scales via breakpoints, not viewport font scaling.
