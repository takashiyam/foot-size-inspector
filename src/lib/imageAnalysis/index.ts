import type { MeasurementPoints, Point } from '../../types';

/**
 * 2点間の距離（ピクセル）
 */
export function distancePx(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * 定規の2点からピクセル→cmの変換係数を算出
 */
export function calcPixelsPerCm(points: MeasurementPoints): number {
  const rulerPx = distancePx(points.rulerStart, points.rulerEnd);
  return rulerPx / points.rulerLengthCm;
}

/**
 * 足長（cm）を計算
 *
 * かかと位置と最長つま先位置の距離を、
 * 定規のスケールを使ってcmに変換する。
 */
export function calculateFootLength(points: MeasurementPoints): number {
  const pixelsPerCm = calcPixelsPerCm(points);
  if (pixelsPerCm <= 0) {
    throw new Error('定規のスケールが無効です');
  }
  const footPx = distancePx(points.heelPoint, points.toePoint);
  return footPx / pixelsPerCm;
}

/**
 * 射影ゆがみの簡易チェック
 *
 * 定規の2点を結ぶ線が水平/垂直から大きくずれている場合に警告を返す。
 * 閾値は30度。
 */
export function checkSkew(points: MeasurementPoints): {
  isSkewed: boolean;
  angleDeg: number;
} {
  const dx = points.rulerEnd.x - points.rulerStart.x;
  const dy = points.rulerEnd.y - points.rulerStart.y;
  const angleRad = Math.atan2(Math.abs(dy), Math.abs(dx));
  const angleDeg = (angleRad * 180) / Math.PI;

  // 水平(0°)または垂直(90°)からの偏差
  const deviationFromHorizontal = angleDeg;
  const deviationFromVertical = Math.abs(90 - angleDeg);
  const minDeviation = Math.min(deviationFromHorizontal, deviationFromVertical);

  return {
    isSkewed: minDeviation > 30,
    angleDeg: minDeviation,
  };
}

/**
 * 補助ポイントの妥当性チェック
 */
export function validatePoints(
  points: MeasurementPoints,
  imageWidth: number,
  imageHeight: number,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const allPoints = [
    points.rulerStart,
    points.rulerEnd,
    points.heelPoint,
    points.toePoint,
  ];

  // 全ポイントが画像内にあるか
  for (const p of allPoints) {
    if (p.x < 0 || p.x > imageWidth || p.y < 0 || p.y > imageHeight) {
      errors.push('ポイントが画像の範囲外にあります');
      break;
    }
  }

  // 定規の2点が近すぎないか
  const rulerPx = distancePx(points.rulerStart, points.rulerEnd);
  if (rulerPx < 50) {
    errors.push('定規の2点が近すぎます。もう少し離してください。');
  }

  // 足の2点が近すぎないか
  const footPx = distancePx(points.heelPoint, points.toePoint);
  if (footPx < 30) {
    errors.push('かかとと足先の位置が近すぎます。');
  }

  // 定規長さが正の値か
  if (points.rulerLengthCm <= 0) {
    errors.push('定規の長さは正の値を入力してください。');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 画像の明るさチェック（簡易）
 *
 * Canvas から画像データを取得し、平均輝度を計算する。
 * 暗すぎる場合に警告を返す。
 */
export function checkBrightness(
  imageData: ImageData,
): { tooDark: boolean; avgBrightness: number } {
  const data = imageData.data;
  let totalBrightness = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    // 輝度 = 0.299R + 0.587G + 0.114B
    totalBrightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  const avgBrightness = totalBrightness / pixelCount;
  return {
    tooDark: avgBrightness < 60,
    avgBrightness,
  };
}

/**
 * 画像をリサイズして Canvas に描画するヘルパー
 * iPhone の高解像度画像を処理可能なサイズに縮小する
 */
export function resizeImage(
  img: HTMLImageElement,
  maxWidth = 1200,
  maxHeight = 1200,
): { canvas: HTMLCanvasElement; scale: number } {
  const canvas = document.createElement('canvas');
  let { width, height } = img;
  let scale = 1;

  if (width > maxWidth || height > maxHeight) {
    scale = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, scale };
}

/**
 * サムネイル用の小さい画像を生成
 */
export function createThumbnail(
  img: HTMLImageElement,
  size = 200,
): string {
  const canvas = document.createElement('canvas');
  const scale = Math.min(size / img.width, size / img.height);
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.6);
}
