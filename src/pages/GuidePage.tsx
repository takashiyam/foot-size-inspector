import React from "react";

interface GuidePageProps {
  onNavigate: (page: string) => void;
}

const steps = [
  {
    number: 1,
    text: "白い紙の上に足を置く",
  },
  {
    number: 2,
    text: "定規を足の横にまっすぐ置く",
    detail: "目盛りがはっきり見えるもの",
  },
  {
    number: 3,
    text: "できるだけ真上から撮影する",
  },
  {
    number: 4,
    text: "かかとから最長のつま先までが見えるようにする",
  },
  {
    number: 5,
    text: "片足ずつ撮影",
    detail: "初期版は片足測定が基本",
  },
];

const badExamples = [
  "斜めから撮影",
  "暗い場所",
  "影が強い",
  "定規が曲がっている",
];

const GuidePage: React.FC<GuidePageProps> = ({ onNavigate }) => {
  return (
    <div className="guide-page">
      <header className="guide-header">
        <button
          className="guide-back-button"
          onClick={() => onNavigate("home")}
        >
          ← 戻る
        </button>
        <h1 className="guide-title">使い方ガイド</h1>
      </header>

      <section className="guide-steps">
        <h2 className="guide-section-title">撮影の手順</h2>
        <ol className="guide-step-list">
          {steps.map((step) => (
            <li key={step.number} className="guide-step-item">
              <span className="guide-step-number">{step.number}</span>
              <div className="guide-step-content">
                <p className="guide-step-text">{step.text}</p>
                {step.detail && (
                  <p className="guide-step-detail">（{step.detail}）</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="guide-tips">
        <h2 className="guide-section-title">撮影のコツ</h2>

        <div className="guide-tips-good">
          <h3 className="guide-tips-heading guide-tips-heading-good">
            ✅ 良い例
          </h3>
          <ul className="guide-tips-list">
            <li>明るい場所で撮影する</li>
            <li>定規がまっすぐ置かれている</li>
            <li>真上から撮影している</li>
            <li>足全体が写っている</li>
          </ul>
        </div>

        <div className="guide-tips-bad">
          <h3 className="guide-tips-heading guide-tips-heading-bad">
            ❌ 悪い例
          </h3>
          <ul className="guide-tips-list">
            {badExamples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default GuidePage;
