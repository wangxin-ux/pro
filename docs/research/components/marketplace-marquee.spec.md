# MarketplaceMarquee Specification

## Source Measurements

- Height: `50px`; width: full viewport.
- Background: `#ededed`; overflow: hidden; positioning: relative.
- Track: horizontal flex row animated with `translate3d`.
- Repeated item: `420px × 28px`, padding `0 12px`.
- Typography: `Inter Tight`, `14px/28px`; lead text weight `600`, supporting text weight `300`.

## Project Content and Motion

- Copy: `Creative Pass` / `Watch all courses, monthly for just $12`.
- Motion: seamless linear loop, one item width per cycle.
- The strip stays in normal document flow and scrolls away with the page.
- Reduced-motion mode keeps the copy visible and disables translation.
