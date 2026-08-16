export const getItemSpriteSource = (itemIndex: number) =>
  [64 * (itemIndex % 3) + 64, 0, 64, 64] as const;
