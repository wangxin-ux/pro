# Kage Start Page Specification

## Source
- Verified renderer: `@designcodeio/threeui@1.2.0`.
- Authored document: `/landing-pages/kage.html`.
- Required local assets: bundled fonts, Three.js runtime, four generated WebP scenes, and ten foreground WebP layers.

## Integration
- Kage fills the complete viewport before the marketplace is entered.
- Preserve the authored HTML, WebGL renderer, scrolling, pointer, keyboard, responsive behavior, and local asset paths.
- Host the renderer through the package's `KageLandingPage` component.
- Add one temporary fixed entry control above the authored document.
- Activating the entry control unmounts Kage and reveals the existing marketplace without changing marketplace behavior.

## Visual Rules
- Use the supplied Onest typography and vermilion `#e0231c` accent configuration.
- Do not add cards, explanatory copy, or a separate marketing layer.
- The temporary entry control should be compact, high contrast, and visually compatible with Kage.

## Verification
- Confirm all local assets return successfully.
- Confirm the WebGL canvas renders nonblank on desktop and mobile.
- Confirm the temporary entry control opens the marketplace.
- Confirm project build succeeds.
