import type {
  FitPreference,
  WidthPreference,
  BrandRule,
  BrandRecommendation,
  SizeResult,
} from '../../types';
import { brandRules } from '../../data/brands';

/**
 * 0.5cm 刻みに丸める
 */
export function roundToHalfCm(value: number): number {
  return Math.round(value * 2) / 2;
}

/**
 * フィット好みに応じた余裕を計算
 */
function getFitAllowance(fitPreference: FitPreference): number {
  switch (fitPreference) {
    case 'tight':
      return 0.25; // +0.0〜0.5の中間
    case 'standard':
      return 0.5;
    case 'loose':
      return 0.75; // +0.5〜1.0の中間
  }
}

/**
 * 足幅に基づく New Balance のウイズ推奨
 */
function getWidthOption(widthPreference: WidthPreference): string | undefined {
  switch (widthPreference) {
    case 'narrow':
      return 'B';
    case 'standard':
      return 'D';
    case 'wide':
      return '2E';
  }
}

/**
 * 中間サイズかどうかを判定（x.25〜x.75 の範囲）
 */
function isInBetweenSize(sizeCm: number): boolean {
  const decimal = sizeCm % 1;
  return decimal >= 0.2 && decimal <= 0.8;
}

/**
 * ブランドルールを適用して推奨サイズを算出
 */
function applyBrandRule(
  baseSize: number,
  rule: BrandRule,
  widthPreference: WidthPreference,
  measuredFootLengthCm: number,
): BrandRecommendation {
  let suggestedSize = roundToHalfCm(baseSize + rule.adjustmentCm);
  let suggestedSizeAlt: number | undefined;

  // HOKA: 中間サイズ時は両候補を表示
  if (rule.showBothForHalfSize && isInBetweenSize(measuredFootLengthCm)) {
    const lower = roundToHalfCm(baseSize + rule.adjustmentCm - 0.25);
    const upper = roundToHalfCm(baseSize + rule.adjustmentCm + 0.25);
    suggestedSize = lower;
    suggestedSizeAlt = upper;
  }

  // New Balance: ウイズ重視
  let widthOption: string | undefined;
  if (rule.widthOptions && rule.widthOptions.length > 0) {
    widthOption = getWidthOption(widthPreference);
  }

  // 幅広ユーザーに NB を候補表示しやすくする
  let rationale = rule.noteJa;
  if (widthPreference === 'wide' && rule.brand === 'New Balance') {
    rationale = '幅広入力のためウイズ重視で提案。' + rationale;
  }
  if (rule.adjustmentCm < 0) {
    rationale = `大きめ傾向のためハーフサイズ下げを提案。` + rationale;
  } else if (rule.adjustmentCm > 0) {
    rationale = `余裕を持たせたサイズを提案。` + rationale;
  }

  return {
    brand: rule.brand,
    line: rule.line,
    category: rule.category,
    suggestedOrderSizeCm: suggestedSize,
    suggestedOrderSizeCmAlt: suggestedSizeAlt,
    widthOption,
    rationale,
    confidence: rule.confidence,
    disclaimer:
      'この推奨はあくまで参考値です。ブランド公式サイズ表や返品・交換条件を必ずご確認ください。',
  };
}

/**
 * サイズ推奨エンジン本体
 *
 * @param measuredFootLengthCm - 画像から推定した足長 (cm)
 * @param fitPreference - フィット好み
 * @param widthPreference - 足幅傾向
 * @param selectedBrands - 表示するブランド（未指定時は全ブランド）
 * @param selectedCategory - 絞り込むカテゴリ（未指定時は全カテゴリ）
 */
export function calculateRecommendations(
  measuredFootLengthCm: number,
  fitPreference: FitPreference,
  widthPreference: WidthPreference,
  selectedBrands?: string[],
  selectedCategory?: string,
): SizeResult {
  // 基本推奨サイズ: 実測足長 + フィット余裕を 0.5cm 刻みに丸める
  const allowance = getFitAllowance(fitPreference);
  const baseRecommendedSizeCm = roundToHalfCm(measuredFootLengthCm + allowance);

  // ルールのフィルタリング
  let rules = brandRules;
  if (selectedBrands && selectedBrands.length > 0) {
    rules = rules.filter((r) => selectedBrands.includes(r.brand));
  }
  if (selectedCategory) {
    rules = rules.filter((r) => r.category === selectedCategory);
  }

  // 各ルールに基本推奨サイズを適用
  const recommendations = rules.map((rule) =>
    applyBrandRule(baseRecommendedSizeCm, rule, widthPreference, measuredFootLengthCm),
  );

  return {
    measuredFootLengthCm: roundToHalfCm(measuredFootLengthCm),
    baseRecommendedSizeCm,
    estimatedWidth: widthPreference,
    recommendations,
  };
}
