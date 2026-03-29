// ========================================
// FootSizer PWA - 型定義
// ========================================

/** 足の左右 */
export type FootSide = 'left' | 'right';

/** フィット好み */
export type FitPreference = 'tight' | 'standard' | 'loose';

/** 足幅傾向 */
export type WidthPreference = 'narrow' | 'standard' | 'wide';

/** 性別（任意） */
export type Gender = 'male' | 'female' | 'unspecified';

/** 靴カテゴリ */
export type ShoeCategory = 'running' | 'sneaker' | 'walking' | 'basketball' | 'leather-like';

/** ブランド名 */
export type BrandName =
  | 'Nike'
  | 'adidas'
  | 'New Balance'
  | 'ASICS'
  | 'Converse'
  | 'Vans'
  | 'On'
  | 'HOKA';

/** 信頼度 */
export type Confidence = 'low' | 'medium' | 'high';

/** ウイズオプション */
export type WidthOption = 'B' | 'D' | '2E' | '4E' | '6E';

/** 画像上の座標 */
export interface Point {
  x: number;
  y: number;
}

/** 計測用の補助ポイント */
export interface MeasurementPoints {
  rulerStart: Point;    // 定規の0cm点
  rulerEnd: Point;      // 定規の既知の点（例: 10cm）
  rulerLengthCm: number; // rulerEnd が何cmか
  heelPoint: Point;     // かかと位置
  toePoint: Point;      // 最長つま先位置
}

/** 足の計測結果（片足） */
export interface FootMeasurement {
  side: FootSide;
  footLengthCm: number;
  footWidthCm?: number;
  timestamp: number;
}

/** ユーザー入力パラメータ */
export interface UserInput {
  gender: Gender;
  fitPreference: FitPreference;
  widthPreference: WidthPreference;
}

/** ブランドルール定義 */
export interface BrandRule {
  brand: BrandName;
  line: string;
  category: ShoeCategory;
  adjustmentCm: number;
  widthAdvice: string;
  confidence: Confidence;
  note: string;
  noteJa: string;
  widthOptions?: WidthOption[];
  /** 中間サイズ時に両候補を出すか */
  showBothForHalfSize?: boolean;
}

/** ブランド別推奨結果 */
export interface BrandRecommendation {
  brand: string;
  line: string;
  category: string;
  suggestedOrderSizeCm: number;
  suggestedOrderSizeCmAlt?: number; // 中間サイズ時の代替
  widthOption?: string;
  rationale: string;
  confidence: Confidence;
  disclaimer: string;
}

/** サイズ推奨エンジンの出力 */
export interface SizeResult {
  measuredFootLengthCm: number;
  baseRecommendedSizeCm: number;
  estimatedWidth: WidthPreference;
  recommendations: BrandRecommendation[];
}

/** 保存用の測定履歴 */
export interface MeasurementRecord {
  id: string;
  date: string;
  timestamp: number;
  measuredFootLengthCm: number;
  baseRecommendedSizeCm: number;
  widthPreference: WidthPreference;
  fitPreference: FitPreference;
  gender: Gender;
  thumbnailDataUrl?: string;
  recommendations: BrandRecommendation[];
}

/** 画像解析の状態 */
export type AnalysisStep =
  | 'idle'
  | 'image-loaded'
  | 'adjusting-points'
  | 'calculating'
  | 'done'
  | 'error';

/** 画像解析のエラー種別 */
export type AnalysisError =
  | 'ruler-not-found'
  | 'foot-cut-off'
  | 'too-dark'
  | 'too-skewed'
  | 'invalid-points'
  | 'unknown';
