# Marketplace Search Overlay Specification

## Reference
- User screenshot: 1790 x 635 Awwwards-style expanded search interface.
- Interaction model: opens when the main search input receives focus; closes with Escape or the close control.

## Layout
- Fixed overlay filling the viewport, above the marketplace header and cards.
- Background is light gray with a thin dark outer border and 10px corner radius.
- Top row: compact `W.` mark, long white search field, Login/Register text controls, dark Pro control, outlined directory control.
- Body uses a 250px left navigation rail and a flexible results area.
- Left navigation has five stacked icon/text buttons; first is white and active. These may be non-functional.

## Results
- Use real Skill data and semantic search results.
- Empty query shows an initial selection of available Skills.
- Each result shows cover image, Skill name, compact tags, and summary/description.
- Results must remain visually scannable and scroll within the overlay when needed.

## Styling
- Preserve current monochrome palette and typography.
- Control heights, padding, spacing and border shapes follow the supplied screenshot.
- Hover states are quiet gray changes; cards lift no more than 2px.
- Desktop favors a three-column results grid; tablet two columns; mobile one column and hides the left rail.

## Behavior
- Focusing either search field keeps the overlay open.
- Pressing Enter uses the existing search submission flow.
- Clicking a result opens the existing Skill detail and closes the overlay.
- Escape closes the overlay.
