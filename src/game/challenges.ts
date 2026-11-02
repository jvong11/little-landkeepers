export type ChallengeLevel = 'small' | 'expanded';
export interface PicnicRequest {
  id: string;
  portions: number[];
  prefilled: number[];
}
export const quantityLimit: Record<ChallengeLevel, number> = { small: 5, expanded: 10 };
export const openingPicnics: readonly PicnicRequest[] = [
  { id: 'pips-lunch', portions: [3], prefilled: [0] },
  { id: 'friends-visit', portions: [1, 1, 1], prefilled: [0, 0, 0] },
  { id: 'unfinished-picnic', portions: [2, 2], prefilled: [1, 0] },
];
export function validateRequest(request: PicnicRequest, level: ChallengeLevel): boolean {
  return request.portions.length > 0 && request.portions.length <= 3
    && request.portions.length === request.prefilled.length
    && request.portions.every((n) => Number.isSafeInteger(n) && n > 0)
    && request.prefilled.every((n, i) => Number.isSafeInteger(n) && n >= 0 && n <= request.portions[i])
    && request.portions.reduce((sum, n) => sum + n, 0) <= quantityLimit[level];
}
