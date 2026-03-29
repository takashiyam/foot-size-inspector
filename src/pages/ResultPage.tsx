import React from "react";
import type { SizeResult, WidthPreference, Confidence } from "../types";

interface ResultPageProps {
  result: SizeResult | null;
  onNavigate: (page: string) => void;
  onSave: () => void;
}

const widthLabel: Record<WidthPreference, string> = {
  narrow: "細め",
  standard: "標準",
  wide: "幅広",
};

const confidenceColor: Record<Confidence, string> = {
  high: "#22c55e",
  medium: "#eab308",
  low: "#ef4444",
};

const confidenceLabel: Record<Confidence, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const ResultPage: React.FC<ResultPageProps> = ({
  result,
  onNavigate,
  onSave,
}) => {
  if (!result) {
    return (
      <div className="result-page result-page--empty">
        <p className="result-empty-message">
          表示できる測定結果がありません。
        </p>
        <button
          className="result-button result-button--secondary"
          onClick={() => onNavigate("home")}
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    const text = [
      `推定足長: ${result.measuredFootLengthCm} cm`,
      `基本推奨サイズ: ${result.baseRecommendedSizeCm} cm`,
      `足幅傾向: ${widthLabel[result.estimatedWidth]}`,
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "FootSizer 測定結果",
          text,
        });
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("結果をクリップボードにコピーしました");
      } catch {
        alert("共有機能がご利用いただけません");
      }
    }
  };

  return (
    <div className="result-page">
      {/* Key numbers */}
      <section className="result-summary">
        <h1 className="result-heading">測定結果</h1>

        <div className="result-key-numbers">
          <div className="result-key-item">
            <span className="result-key-label">推定足長</span>
            <span className="result-key-value">
              {result.measuredFootLengthCm}
              <span className="result-key-unit">cm</span>
            </span>
          </div>

          <div className="result-key-item">
            <span className="result-key-label">基本推奨サイズ</span>
            <span className="result-key-value">
              {result.baseRecommendedSizeCm}
              <span className="result-key-unit">cm</span>
            </span>
          </div>

          <div className="result-key-item">
            <span className="result-key-label">足幅傾向</span>
            <span className="result-key-value result-key-value--text">
              {widthLabel[result.estimatedWidth]}
            </span>
          </div>
        </div>
      </section>

      {/* Brand comparison table */}
      <section className="result-brands">
        <h2 className="result-section-heading">ブランド別推奨サイズ</h2>

        <div className="result-table-wrapper">
          <table className="result-table">
            <thead>
              <tr>
                <th className="result-th">ブランド</th>
                <th className="result-th">ライン</th>
                <th className="result-th">推奨サイズ</th>
                <th className="result-th">ウイズ</th>
                <th className="result-th">理由</th>
                <th className="result-th">信頼度</th>
              </tr>
            </thead>
            <tbody>
              {result.recommendations.map((rec, idx) => (
                <tr key={idx} className="result-tr">
                  <td className="result-td result-td--brand">{rec.brand}</td>
                  <td className="result-td">{rec.line}</td>
                  <td className="result-td result-td--size">
                    <span>{rec.suggestedOrderSizeCm} cm</span>
                    {rec.suggestedOrderSizeCmAlt != null && (
                      <span className="result-size-alt">
                        {" "}
                        / {rec.suggestedOrderSizeCmAlt} cm
                      </span>
                    )}
                  </td>
                  <td className="result-td">
                    {rec.widthOption ? rec.widthOption : "—"}
                  </td>
                  <td className="result-td result-td--rationale">
                    {rec.rationale}
                  </td>
                  <td className="result-td">
                    <span
                      className="result-confidence-badge"
                      style={{
                        backgroundColor: confidenceColor[rec.confidence],
                      }}
                    >
                      {confidenceLabel[rec.confidence]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="result-disclaimer">
        <h3 className="result-disclaimer-heading">ご注意</h3>
        <ul className="result-disclaimer-list">
          <li>この結果は参考値です</li>
          <li>最終判断はブランド公式サイズ表をご確認ください</li>
          <li>返品・交換条件を購入前に確認することを推奨します</li>
        </ul>
      </section>

      {/* Action buttons */}
      <section className="result-actions">
        <button
          className="result-button result-button--primary"
          onClick={onSave}
        >
          結果を保存
        </button>
        <button
          className="result-button result-button--secondary"
          onClick={handleShare}
        >
          共有
        </button>
        <button
          className="result-button result-button--secondary"
          onClick={() => onNavigate("home")}
        >
          もう一度測定
        </button>
        <button
          className="result-button result-button--secondary"
          onClick={() => onNavigate("home")}
        >
          ホームに戻る
        </button>
      </section>
    </div>
  );
};

export default ResultPage;
