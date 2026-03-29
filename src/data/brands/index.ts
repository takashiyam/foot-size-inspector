import type { BrandRule } from '../../types';

/**
 * ブランド別サイズ補正ルール
 *
 * adjustmentCm: 基本推奨サイズに対する補正値
 *   正の値 = サイズアップ推奨
 *   負の値 = サイズダウン推奨
 *
 * 将来的にはこのデータを JSON ファイルに外出しし、
 * API から取得する構成にも対応可能。
 */
export const brandRules: BrandRule[] = [
  // ── Nike ──
  {
    brand: 'Nike',
    line: 'エアフォース 1',
    category: 'sneaker',
    adjustmentCm: 0,
    widthAdvice: 'standard',
    confidence: 'medium',
    note: 'Nike box size differs from foot length. Order by the label size, not measured foot length.',
    noteJa: 'Nikeの箱表記サイズと足長は異なります。公式換算表での確認を推奨します。',
  },
  {
    brand: 'Nike',
    line: 'ランニング全般',
    category: 'running',
    adjustmentCm: 0,
    widthAdvice: 'standard',
    confidence: 'medium',
    note: 'Running shoes may need +0.5cm for toe room. Model differences exist.',
    noteJa: 'ランニングシューズはつま先の余裕が必要です。モデルにより差があります。',
  },

  // ── adidas ──
  {
    brand: 'adidas',
    line: 'スタンスミス',
    category: 'sneaker',
    adjustmentCm: 0,
    widthAdvice: 'standard',
    confidence: 'medium',
    note: 'Generally true to size.',
    noteJa: '標準的なサイズ感です。',
  },
  {
    brand: 'adidas',
    line: 'ランニング全般',
    category: 'running',
    adjustmentCm: 0,
    widthAdvice: 'standard',
    confidence: 'medium',
    note: 'Standard fit for most models.',
    noteJa: '多くのモデルで標準的なフィットです。',
  },

  // ── New Balance ──
  {
    brand: 'New Balance',
    line: '996 / 574 等',
    category: 'sneaker',
    adjustmentCm: 0,
    widthAdvice: 'width-focused',
    confidence: 'medium',
    note: 'Width (D/2E/4E) is critical. Wide feet should choose 2E or wider.',
    noteJa: 'ウイズ選択が重要です。幅広の方は2E以上を推奨します。',
    widthOptions: ['B', 'D', '2E', '4E', '6E'],
  },
  {
    brand: 'New Balance',
    line: 'ランニング全般',
    category: 'running',
    adjustmentCm: 0,
    widthAdvice: 'width-focused',
    confidence: 'medium',
    note: 'Width options available. Consider 2E for wide feet.',
    noteJa: 'ウイズ選択可能。幅広の方は2E以上を検討してください。',
    widthOptions: ['B', 'D', '2E', '4E'],
  },

  // ── ASICS ──
  {
    brand: 'ASICS',
    line: 'ランニング（通常ラスト）',
    category: 'running',
    adjustmentCm: 0,
    widthAdvice: 'standard',
    confidence: 'medium',
    note: 'Based on standard last. Racing last may differ.',
    noteJa: '通常ラスト基準です。レーシングラストでは異なる場合があります。',
  },
  {
    brand: 'ASICS',
    line: 'ウォーキング',
    category: 'walking',
    adjustmentCm: 0,
    widthAdvice: 'standard',
    confidence: 'medium',
    note: 'Walking models tend to be standard fit.',
    noteJa: 'ウォーキングモデルは標準的なフィットです。',
  },

  // ── Converse ──
  {
    brand: 'Converse',
    line: 'Chuck Taylor',
    category: 'sneaker',
    adjustmentCm: -0.5,
    widthAdvice: 'standard-to-narrow',
    confidence: 'medium',
    note: 'Runs large. Consider half size down per official guidance.',
    noteJa: '大きめの傾向があります。公式案内に従いハーフサイズ下げを推奨します。',
  },

  // ── Vans ──
  {
    brand: 'Vans',
    line: 'オールドスクール等',
    category: 'sneaker',
    adjustmentCm: 0,
    widthAdvice: 'standard',
    confidence: 'low',
    note: 'Varies by model and material. Do not rely solely on this estimate.',
    noteJa: 'モデルや素材で若干異なります。過信せず試着を推奨します。',
  },

  // ── On ──
  {
    brand: 'On',
    line: 'Cloud / Cloudmonster 等',
    category: 'running',
    adjustmentCm: 0.5,
    widthAdvice: 'standard',
    confidence: 'medium',
    note: 'On recommends some room for toe movement. Consider +0.5cm.',
    noteJa: 'On公式はつま先の余裕を推奨しています。+0.5cmを検討してください。',
  },

  // ── HOKA ──
  {
    brand: 'HOKA',
    line: 'クリフトン / ボンダイ 等',
    category: 'running',
    adjustmentCm: 0,
    widthAdvice: 'standard',
    confidence: 'medium',
    note: 'For in-between sizes, we show both options: snug fit and roomy fit.',
    noteJa: '中間サイズの場合、ぴったりめ・ゆったりめの両候補を表示します。',
    showBothForHalfSize: true,
  },
];

/**
 * ブランド名一覧を取得
 */
export function getAvailableBrands(): string[] {
  const brands = new Set(brandRules.map((r) => r.brand));
  return Array.from(brands);
}

/**
 * 指定ブランドのルール一覧を取得
 */
export function getRulesForBrand(brand: string): BrandRule[] {
  return brandRules.filter((r) => r.brand === brand);
}

/**
 * 指定カテゴリのルール一覧を取得
 */
export function getRulesForCategory(category: string): BrandRule[] {
  return brandRules.filter((r) => r.category === category);
}
