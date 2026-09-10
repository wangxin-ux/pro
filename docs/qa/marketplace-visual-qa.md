# Marketplace Visual QA

## Reference

- Viewport: `1906px` desktop reference.
- Header left/right edges: `59px / 1820px`.
- First filter: `x=67px`, width `111px`, height `54px`.
- Card row: first x approximately `65px`, top `297px`; three equal columns with approximately `25px` gaps.

## Iteration Results

1. Baseline: navigation text, filters and cards were substantially oversized and structurally different.
2. First correction: restored the source text and seven-filter structure; card shape changed to the source 4:3 visual with a compact title row.
3. Second correction: header edges aligned to `59px / 1820px`, search starts at `578px`, filter widths normalized, grid gaps reduced to `25px`.
4. Motion check: the marquee has a negative start offset and its track position changes continuously through a linear CSS animation; reduced-motion no longer disables this requested motion.

Build gate: `npm run build` passes. Deployment is permitted only after this comparison loop.
