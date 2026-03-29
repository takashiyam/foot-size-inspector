import React, { useRef } from "react";

interface HomePageProps {
  onNavigate: (page: string) => void;
  onImageSelected: (file: File) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onImageSelected }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelected(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1 className="home-title">FootSizer</h1>
        <p className="home-subtitle">足のサイズ測定アプリ</p>
      </header>

      <div className="home-actions">
        <button
          className="home-action-button home-action-camera"
          onClick={() => cameraInputRef.current?.click()}
        >
          <span className="home-action-icon">📷</span>
          <span className="home-action-label">写真を撮る</span>
        </button>

        <button
          className="home-action-button home-action-gallery"
          onClick={() => galleryInputRef.current?.click()}
        >
          <span className="home-action-icon">🖼</span>
          <span className="home-action-label">写真を選ぶ</span>
        </button>

        <button
          className="home-action-button home-action-guide"
          onClick={() => onNavigate("guide")}
        >
          <span className="home-action-icon">📖</span>
          <span className="home-action-label">使い方を見る</span>
        </button>

        <button
          className="home-action-button home-action-history"
          onClick={() => onNavigate("history")}
        >
          <span className="home-action-icon">📋</span>
          <span className="home-action-label">過去の測定結果</span>
        </button>
      </div>

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

      <footer className="home-disclaimer">
        <p>本アプリの測定結果は参考値です。医療用途には使用できません。</p>
      </footer>
    </div>
  );
};

export default HomePage;
