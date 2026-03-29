import React, { useState } from "react";

interface GuidePageProps {
  onNavigate: (page: string) => void;
  onImageSelected?: (file: File) => void;
}

interface GuideStep {
  title: string;
  description: string;
  illustration: string;
  tip?: string;
  bad?: string;
}

const steps: GuideStep[] = [
  {
    title: "白い紙を敷く",
    description:
      "床に白い紙（A3以上が理想）を敷いてください。コントラストがはっきりし、足の輪郭が見えやすくなります。",
    illustration: "📄",
    tip: "無地の白い紙がベストです",
  },
  {
    title: "足を紙の上に置く",
    description:
      "靴下を脱ぎ、片足を紙の上にまっすぐ置いてください。体重をかけて自然に立った状態がベストです。",
    illustration: "🦶",
    tip: "体重をしっかりかけてください",
  },
  {
    title: "定規を足の横に置く",
    description:
      "目盛りがはっきり見える定規を、足の横にまっすぐ置いてください。かかとの高さに0cmが来るように合わせます。",
    illustration: "📏",
    tip: "30cm定規がおすすめです",
    bad: "定規が曲がっていると正確に測れません",
  },
  {
    title: "真上から撮影する",
    description:
      "スマホをできるだけ真上に構え、足全体と定規が画面に収まるように撮影してください。",
    illustration: "📱",
    tip: "腕をまっすぐ伸ばして真上から",
    bad: "斜めからの撮影は誤差が大きくなります",
  },
  {
    title: "全体が写っているか確認",
    description:
      "かかとから最長のつま先まで、足全体と定規の目盛りがしっかり写っていることを確認してください。",
    illustration: "✅",
    tip: "暗すぎる場合は明るい場所で撮り直してください",
    bad: "足先やかかとが切れていると測定できません",
  },
];

const GuidePage: React.FC<GuidePageProps> = ({ onNavigate, onImageSelected }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelected) {
      onImageSelected(file);
    }
    e.target.value = "";
  };

  return (
    <div className="guide-walkthrough">
      {/* Header */}
      <header className="guide-wt-header">
        <button
          className="guide-wt-close"
          onClick={() => onNavigate("home")}
        >
          ✕
        </button>
        {/* Progress bar */}
        <div className="guide-wt-progress">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`guide-wt-progress-dot ${
                i === currentStep
                  ? "guide-wt-progress-dot--active"
                  : i < currentStep
                    ? "guide-wt-progress-dot--done"
                    : ""
              }`}
            />
          ))}
        </div>
        <div className="guide-wt-step-count">
          {currentStep + 1} / {steps.length}
        </div>
      </header>

      {/* Step content */}
      <div className="guide-wt-content" key={currentStep}>
        <div className="guide-wt-illustration">{step.illustration}</div>
        <h2 className="guide-wt-title">{step.title}</h2>
        <p className="guide-wt-description">{step.description}</p>

        {step.tip && (
          <div className="guide-wt-tip">
            <span className="guide-wt-tip-icon">💡</span>
            <span>{step.tip}</span>
          </div>
        )}

        {step.bad && (
          <div className="guide-wt-bad">
            <span className="guide-wt-bad-icon">⚠️</span>
            <span>{step.bad}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="guide-wt-nav">
        {!isFirst ? (
          <button
            className="guide-wt-nav-btn guide-wt-nav-btn--prev"
            onClick={() => setCurrentStep((s) => s - 1)}
          >
            ← 前へ
          </button>
        ) : (
          <div />
        )}

        {!isLast ? (
          <button
            className="guide-wt-nav-btn guide-wt-nav-btn--next"
            onClick={() => setCurrentStep((s) => s + 1)}
          >
            次へ →
          </button>
        ) : (
          <div className="guide-wt-final-actions">
            <button
              className="guide-wt-nav-btn guide-wt-nav-btn--start"
              onClick={() => cameraInputRef.current?.click()}
            >
              📷 撮影する
            </button>
            <button
              className="guide-wt-nav-btn guide-wt-nav-btn--start-alt"
              onClick={() => galleryInputRef.current?.click()}
            >
              🖼 写真を選ぶ
            </button>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="home-hidden-input"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="home-hidden-input"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default GuidePage;
