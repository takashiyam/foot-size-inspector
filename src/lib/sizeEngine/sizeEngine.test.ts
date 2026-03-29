import { describe, it, expect } from 'vitest';
import { roundToHalfCm, calculateRecommendations } from './index';

describe('roundToHalfCm', () => {
  it('rounds 22.4 down to 22.5', () => {
    expect(roundToHalfCm(22.4)).toBe(22.5);
  });

  it('rounds 22.5 to 22.5', () => {
    expect(roundToHalfCm(22.5)).toBe(22.5);
  });

  it('rounds 22.6 to 22.5', () => {
    expect(roundToHalfCm(22.6)).toBe(22.5);
  });

  it('rounds 22.74 down to 22.5', () => {
    expect(roundToHalfCm(22.74)).toBe(22.5);
  });

  it('rounds 22.75 up to 23.0', () => {
    expect(roundToHalfCm(22.75)).toBe(23.0);
  });

  it('rounds 22.76 up to 23.0', () => {
    expect(roundToHalfCm(22.76)).toBe(23.0);
  });

  it('rounds 25.0 to 25.0', () => {
    expect(roundToHalfCm(25.0)).toBe(25.0);
  });

  it('rounds 25.2 to 25.0', () => {
    expect(roundToHalfCm(25.2)).toBe(25.0);
  });

  it('rounds 25.3 to 25.5', () => {
    expect(roundToHalfCm(25.3)).toBe(25.5);
  });
});

describe('calculateRecommendations', () => {
  describe('基本推奨サイズの算出', () => {
    it('標準フィットで足長25.2cmの場合、基本推奨サイズは25.5cm', () => {
      const result = calculateRecommendations(25.2, 'standard', 'standard');
      // 25.2 + 0.5 = 25.7 → round to 25.5
      expect(result.baseRecommendedSizeCm).toBe(25.5);
    });

    it('ぴったりフィットで足長25.2cmの場合、基本推奨サイズは25.5cm', () => {
      const result = calculateRecommendations(25.2, 'tight', 'standard');
      // 25.2 + 0.25 = 25.45 → round to 25.5
      expect(result.baseRecommendedSizeCm).toBe(25.5);
    });

    it('ゆったりフィットで足長25.2cmの場合、基本推奨サイズは26.0cm', () => {
      const result = calculateRecommendations(25.2, 'loose', 'standard');
      // 25.2 + 0.75 = 25.95 → round to 26.0
      expect(result.baseRecommendedSizeCm).toBe(26.0);
    });
  });

  describe('推定足長の丸め', () => {
    it('measuredFootLengthCmは0.5cm刻みに丸められる', () => {
      const result = calculateRecommendations(25.2, 'standard', 'standard');
      expect(result.measuredFootLengthCm).toBe(25.0);
    });

    it('25.3は25.5に丸められる', () => {
      const result = calculateRecommendations(25.3, 'standard', 'standard');
      expect(result.measuredFootLengthCm).toBe(25.5);
    });
  });

  describe('ブランド別推奨', () => {
    it('全ブランドの推奨が返される（フィルタなし）', () => {
      const result = calculateRecommendations(25.0, 'standard', 'standard');
      expect(result.recommendations.length).toBeGreaterThan(0);
      const brands = new Set(result.recommendations.map((r) => r.brand));
      expect(brands.has('Nike')).toBe(true);
      expect(brands.has('adidas')).toBe(true);
      expect(brands.has('New Balance')).toBe(true);
      expect(brands.has('Converse')).toBe(true);
    });

    it('ブランドフィルタが動作する', () => {
      const result = calculateRecommendations(25.0, 'standard', 'standard', ['Nike']);
      expect(result.recommendations.every((r) => r.brand === 'Nike')).toBe(true);
    });

    it('カテゴリフィルタが動作する', () => {
      const result = calculateRecommendations(25.0, 'standard', 'standard', undefined, 'running');
      expect(result.recommendations.every((r) => r.category === 'running')).toBe(true);
    });
  });

  describe('Converse Chuck Taylorの補正', () => {
    it('ハーフサイズ下げが適用される', () => {
      const result = calculateRecommendations(25.0, 'standard', 'standard', ['Converse']);
      const converse = result.recommendations.find((r) => r.brand === 'Converse');
      expect(converse).toBeDefined();
      // base: 25.0 + 0.5 = 25.5, adjustment: -0.5, result: 25.0
      expect(converse!.suggestedOrderSizeCm).toBe(25.0);
    });
  });

  describe('New Balanceのウイズ推奨', () => {
    it('幅広入力でウイズ2Eが推奨される', () => {
      const result = calculateRecommendations(25.0, 'standard', 'wide', ['New Balance']);
      const nb = result.recommendations.find((r) => r.brand === 'New Balance');
      expect(nb).toBeDefined();
      expect(nb!.widthOption).toBe('2E');
    });

    it('標準入力でウイズDが推奨される', () => {
      const result = calculateRecommendations(25.0, 'standard', 'standard', ['New Balance']);
      const nb = result.recommendations.find((r) => r.brand === 'New Balance');
      expect(nb).toBeDefined();
      expect(nb!.widthOption).toBe('D');
    });

    it('細め入力でウイズBが推奨される', () => {
      const result = calculateRecommendations(25.0, 'standard', 'narrow', ['New Balance']);
      const nb = result.recommendations.find((r) => r.brand === 'New Balance');
      expect(nb).toBeDefined();
      expect(nb!.widthOption).toBe('B');
    });
  });

  describe('Onの余裕推奨', () => {
    it('+0.5cmの余裕が適用される', () => {
      const result = calculateRecommendations(25.0, 'standard', 'standard', ['On']);
      const on = result.recommendations.find((r) => r.brand === 'On');
      expect(on).toBeDefined();
      // base: 25.5, adjustment: +0.5, result: 26.0
      expect(on!.suggestedOrderSizeCm).toBe(26.0);
    });
  });

  describe('HOKAの中間サイズ両候補', () => {
    it('中間サイズ時に両候補が表示される', () => {
      // 25.3 は中間サイズ（小数部 0.3 は 0.2-0.8 の範囲内）
      const result = calculateRecommendations(25.3, 'standard', 'standard', ['HOKA']);
      const hoka = result.recommendations.find((r) => r.brand === 'HOKA');
      expect(hoka).toBeDefined();
      expect(hoka!.suggestedOrderSizeCmAlt).toBeDefined();
    });

    it('ぴったりサイズ時は代替候補なし', () => {
      // 25.0 はぴったり（小数部 0.0）
      const result = calculateRecommendations(25.0, 'standard', 'standard', ['HOKA']);
      const hoka = result.recommendations.find((r) => r.brand === 'HOKA');
      expect(hoka).toBeDefined();
      expect(hoka!.suggestedOrderSizeCmAlt).toBeUndefined();
    });
  });

  describe('出力構造', () => {
    it('全必須フィールドが存在する', () => {
      const result = calculateRecommendations(25.0, 'standard', 'standard');
      expect(result.measuredFootLengthCm).toBeDefined();
      expect(result.baseRecommendedSizeCm).toBeDefined();
      expect(result.estimatedWidth).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);

      for (const rec of result.recommendations) {
        expect(rec.brand).toBeDefined();
        expect(rec.category).toBeDefined();
        expect(rec.suggestedOrderSizeCm).toBeDefined();
        expect(rec.rationale).toBeDefined();
        expect(rec.confidence).toBeDefined();
        expect(rec.disclaimer).toBeDefined();
        expect(['low', 'medium', 'high']).toContain(rec.confidence);
      }
    });

    it('disclaimerが正しいメッセージを含む', () => {
      const result = calculateRecommendations(25.0, 'standard', 'standard');
      for (const rec of result.recommendations) {
        expect(rec.disclaimer).toContain('参考値');
      }
    });
  });

  describe('境界値テスト', () => {
    it('足長22.0cm（小さいサイズ）でも正常動作', () => {
      const result = calculateRecommendations(22.0, 'standard', 'standard');
      expect(result.baseRecommendedSizeCm).toBe(22.5);
    });

    it('足長30.0cm（大きいサイズ）でも正常動作', () => {
      const result = calculateRecommendations(30.0, 'standard', 'standard');
      expect(result.baseRecommendedSizeCm).toBe(30.5);
    });

    it('足長0cmでもクラッシュしない', () => {
      const result = calculateRecommendations(0, 'standard', 'standard');
      expect(result.baseRecommendedSizeCm).toBe(0.5);
    });
  });
});
