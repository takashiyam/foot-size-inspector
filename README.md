# FootSizer PWA

足のサイズ測定 PWA アプリ。写真から足長を推定し、ブランド別の推奨サイズを表示します。

## 機能

- 写真撮影またはアップロードによる足サイズ測定
- 手動補助ポイントによる正確な計測（定規基準）
- 8ブランド対応のサイズ推奨エンジン（Nike, adidas, New Balance, ASICS, Converse, Vans, On, HOKA）
- フィット好み・足幅傾向に応じた推奨
- 測定履歴のローカル保存（オフライン対応）
- PWA としてホーム画面に追加可能
- iPhone Safari 最適化

## 技術スタック

- Vite + React + TypeScript
- ブラウザ内画像処理（Canvas API）
- PWA（Service Worker + manifest.json）
- localStorage による永続化
- Vitest によるユニットテスト

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

## テスト

```bash
npx vitest run
```

## ディレクトリ構成

```
src/
├── components/          # 共通コンポーネント（将来用）
├── pages/               # ページコンポーネント
│   ├── HomePage.tsx      # ホーム画面
│   ├── GuidePage.tsx     # 使い方ガイド
│   ├── MeasurementPage.tsx # 計測画面（メイン）
│   ├── ResultPage.tsx    # 結果表示
│   └── HistoryPage.tsx   # 測定履歴
├── hooks/
│   └── useStorage.ts     # localStorage 永続化フック
├── lib/
│   ├── imageAnalysis/    # 画像解析ロジック
│   │   ├── index.ts
│   │   └── imageAnalysis.test.ts
│   └── sizeEngine/       # サイズ推奨エンジン
│       ├── index.ts
│       └── sizeEngine.test.ts
├── data/
│   └── brands/
│       └── index.ts      # ブランド別ルール定義
├── types/
│   └── index.ts          # 型定義
├── App.tsx               # メインアプリ（ルーティング）
├── main.tsx              # エントリポイント
└── index.css             # グローバルスタイル

public/
├── manifest.json         # PWA マニフェスト
├── sw.js                 # Service Worker
├── favicon.svg
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## 画像解析の仕組み

1. ユーザーが足と定規が写った写真をアップロード
2. 画像を Canvas 上に表示
3. ユーザーが4つの補助ポイントをタップで配置:
   - 定規の 0cm 点
   - 定規の既知の点（デフォルト 10cm）
   - かかと位置
   - 最長つま先位置
4. 定規の2点間のピクセル距離から px/cm 変換係数を算出
5. かかと〜つま先のピクセル距離を cm に変換
6. 射影ゆがみや暗さの簡易チェックを実行

## サイズ推奨エンジン

### ロジック

1. 実測足長を 0.5cm 刻みに丸める
2. フィット好みに応じた余裕を加算:
   - ぴったり: +0.25cm
   - 標準: +0.5cm
   - ゆったり: +0.75cm
3. ブランド別ルールを適用:
   - Converse Chuck Taylor: -0.5cm（大きめ傾向）
   - On: +0.5cm（余裕推奨）
   - HOKA: 中間サイズ時に両候補を表示
   - New Balance: ウイズオプション（B/D/2E/4E/6E）を提示
4. 各推奨に信頼度（低/中/高）と注意事項を付与

### ブランドルールの追加方法

`src/data/brands/index.ts` の `brandRules` 配列に新しいルールを追加:

```typescript
{
  brand: 'BrandName',
  line: 'モデル名',
  category: 'sneaker',
  adjustmentCm: 0,
  widthAdvice: 'standard',
  confidence: 'medium',
  note: 'English note',
  noteJa: '日本語の注意事項',
}
```

## 注意事項

- 本アプリの測定結果は参考値です
- 医療用途には使用できません
- 最終判断はブランド公式サイズ表をご確認ください
- 返品・交換条件を購入前に確認することを推奨します

## 今後の改善案

### Phase 2
- 半自動の足/定規検出（エッジ検出、Hough変換）
- 足幅推定の強化（足の輪郭検出）
- 左右差対応
- ブランド・モデルの追加
- カメラのライブガイドオーバーレイ

### 将来的な拡張
- バックエンドAPI化（画像解析の精度向上）
- ユーザーフィードバックによるルール改善
- 多言語対応
- ダークモード
- 足の3Dスキャン対応
