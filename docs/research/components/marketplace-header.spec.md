# MarketplaceHeader Specification

## Overview

- Target files: `app/page.tsx`, `app/globals.css`
- Reference: Awwwards Games & Entertainment desktop header
- Interaction model: normal-flow navigation, hover links, click filters

## DOM Structure

- Header
  - 50px marquee row
  - 8px inter-row gap
  - 54px main row: logo, navigation, search, account/actions
  - 8px inter-row gap
  - 68px filter rail: category, filter, count, view icons

## Computed Styles

- Desktop content x: `52px`; width: `1798px` at a `1902px` viewport.
- Marquee height: `50px`; background: `#ededed`.
- Main row height: `54px`.
- Navigation font: `14px`, weight `500`, line-height `28px`.
- Navigation list width: `383px`.
- Search x: `555px`; width: `906px`; height: `42px`.
- Search left margin from navigation: `24px` in the reference DOM.
- Primary action: height `42px`, horizontal padding `20px`, radius `8px`.
- Action group gap: `12px`.
- Main container: relative positioning, not sticky or fixed.

## States & Behaviors

- Link hover: underline/color transition, `0.3s`.
- Main button hover: foreground/background/border transition, `0.3s`.
- Scroll: header moves with document; no persistent state.
- Filter open: summary turns dark; menu fades and translates into place.

## Text Content

- 探索、下载、个人、联系、更多
- 搜索技能
- 登录、注册、上传、历史记录
- 类别、筛选

## Responsive Behavior

- Desktop: one 54px row with four columns.
- Tablet: navigation and secondary account labels collapse.
- Mobile: logo/upload row, search row, then filter rail.
