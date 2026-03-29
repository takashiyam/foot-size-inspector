import { describe, it, expect } from 'vitest';
import {
  distancePx,
  calcPixelsPerCm,
  calculateFootLength,
  checkSkew,
  validatePoints,
} from './index';
import type { MeasurementPoints } from '../../types';

describe('distancePx', () => {
  it('水平距離を正しく計算', () => {
    expect(distancePx({ x: 0, y: 0 }, { x: 100, y: 0 })).toBe(100);
  });

  it('垂直距離を正しく計算', () => {
    expect(distancePx({ x: 0, y: 0 }, { x: 0, y: 100 })).toBe(100);
  });

  it('斜め距離を正しく計算', () => {
    expect(distancePx({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('同一点は距離0', () => {
    expect(distancePx({ x: 50, y: 50 }, { x: 50, y: 50 })).toBe(0);
  });
});

describe('calcPixelsPerCm', () => {
  it('10cmの定規で100pxならば10px/cm', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 0, y: 0 },
      rulerEnd: { x: 100, y: 0 },
      rulerLengthCm: 10,
      heelPoint: { x: 0, y: 0 },
      toePoint: { x: 0, y: 0 },
    };
    expect(calcPixelsPerCm(points)).toBe(10);
  });
});

describe('calculateFootLength', () => {
  it('足長を正しく計算', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 0, y: 0 },
      rulerEnd: { x: 100, y: 0 },
      rulerLengthCm: 10,
      heelPoint: { x: 50, y: 100 },
      toePoint: { x: 50, y: 350 },
    };
    // 10 px/cm, foot distance = 250px → 25.0cm
    expect(calculateFootLength(points)).toBe(25);
  });

  it('定規のスケールが無効の場合にエラー', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 50, y: 50 },
      rulerEnd: { x: 50, y: 50 }, // 同一点
      rulerLengthCm: 10,
      heelPoint: { x: 0, y: 0 },
      toePoint: { x: 100, y: 0 },
    };
    expect(() => calculateFootLength(points)).toThrow();
  });
});

describe('checkSkew', () => {
  it('水平な定規は傾いていない', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 0, y: 100 },
      rulerEnd: { x: 200, y: 100 },
      rulerLengthCm: 10,
      heelPoint: { x: 0, y: 0 },
      toePoint: { x: 0, y: 0 },
    };
    const result = checkSkew(points);
    expect(result.isSkewed).toBe(false);
    expect(result.angleDeg).toBe(0);
  });

  it('垂直な定規は傾いていない', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 100, y: 0 },
      rulerEnd: { x: 100, y: 200 },
      rulerLengthCm: 10,
      heelPoint: { x: 0, y: 0 },
      toePoint: { x: 0, y: 0 },
    };
    const result = checkSkew(points);
    expect(result.isSkewed).toBe(false);
  });

  it('45度の傾きは警告', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 0, y: 0 },
      rulerEnd: { x: 100, y: 100 },
      rulerLengthCm: 10,
      heelPoint: { x: 0, y: 0 },
      toePoint: { x: 0, y: 0 },
    };
    const result = checkSkew(points);
    expect(result.isSkewed).toBe(true);
  });
});

describe('validatePoints', () => {
  it('正常なポイントはバリデーション通過', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 10, y: 10 },
      rulerEnd: { x: 200, y: 10 },
      rulerLengthCm: 10,
      heelPoint: { x: 100, y: 50 },
      toePoint: { x: 100, y: 350 },
    };
    const result = validatePoints(points, 400, 400);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('範囲外のポイントでエラー', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: -10, y: 10 },
      rulerEnd: { x: 200, y: 10 },
      rulerLengthCm: 10,
      heelPoint: { x: 100, y: 50 },
      toePoint: { x: 100, y: 350 },
    };
    const result = validatePoints(points, 400, 400);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('定規の2点が近すぎるとエラー', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 100, y: 100 },
      rulerEnd: { x: 105, y: 100 },
      rulerLengthCm: 10,
      heelPoint: { x: 100, y: 50 },
      toePoint: { x: 100, y: 350 },
    };
    const result = validatePoints(points, 400, 400);
    expect(result.valid).toBe(false);
  });

  it('足のポイントが近すぎるとエラー', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 10, y: 10 },
      rulerEnd: { x: 200, y: 10 },
      rulerLengthCm: 10,
      heelPoint: { x: 100, y: 100 },
      toePoint: { x: 105, y: 100 },
    };
    const result = validatePoints(points, 400, 400);
    expect(result.valid).toBe(false);
  });

  it('定規長さが0以下でエラー', () => {
    const points: MeasurementPoints = {
      rulerStart: { x: 10, y: 10 },
      rulerEnd: { x: 200, y: 10 },
      rulerLengthCm: 0,
      heelPoint: { x: 100, y: 50 },
      toePoint: { x: 100, y: 350 },
    };
    const result = validatePoints(points, 400, 400);
    expect(result.valid).toBe(false);
  });
});
