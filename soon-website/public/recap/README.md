# Recap carousel photos

Drop past-event photos here, then reference them from the tile lists in
[`src/components/section-recap.tsx`](../../src/components/section-recap.tsx):

```ts
const TOP_TILES: MarqueeTile[] = [
  { src: "/recap/campfire.jpg", alt: "Hackers around a campfire", aspect: 1.5 },
  // ...
];
```

- `src` is the public path (`/recap/<file>`). Omit `src` for a gray placeholder.
- `aspect` is width ÷ height (controls tile width at the row's fixed height).
- Tiles loop seamlessly, so ~6 per row reads well; both rows can share or differ.
