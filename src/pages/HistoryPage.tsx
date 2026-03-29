import React, { useState } from "react";
import type {
  MeasurementRecord,
  WidthPreference,
  FitPreference,
} from "../types";

interface HistoryPageProps {
  records: MeasurementRecord[];
  onDelete: (id: string) => void;
  onNavigate: (page: string) => void;
}

const widthLabel: Record<WidthPreference, string> = {
  narrow: "細め",
  standard: "標準",
  wide: "幅広",
};

const fitLabel: Record<FitPreference, string> = {
  tight: "タイト",
  standard: "標準",
  loose: "ゆったり",
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const HistoryPage: React.FC<HistoryPageProps> = ({
  records,
  onDelete,
  onNavigate,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sortedRecords = [...records].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  const handleDeleteClick = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = (id: string) => {
    onDelete(id);
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div className="history-page">
      <header className="history-header">
        <button
          className="history-back-button"
          onClick={() => onNavigate("home")}
        >
          ← 戻る
        </button>
        <h1 className="history-heading">測定履歴</h1>
      </header>

      {sortedRecords.length === 0 ? (
        <div className="history-empty">
          <p className="history-empty-message">
            まだ測定履歴がありません
          </p>
        </div>
      ) : (
        <ul className="history-list">
          {sortedRecords.map((record) => (
            <li key={record.id} className="history-card">
              <div className="history-card-content">
                {record.thumbnailDataUrl && (
                  <img
                    className="history-card-thumbnail"
                    src={record.thumbnailDataUrl}
                    alt="測定画像"
                  />
                )}

                <div className="history-card-details">
                  <p className="history-card-date">
                    {formatDate(record.timestamp)}
                  </p>
                  <p className="history-card-stat">
                    <span className="history-card-label">推定足長:</span>{" "}
                    {record.measuredFootLengthCm} cm
                  </p>
                  <p className="history-card-stat">
                    <span className="history-card-label">基本推奨サイズ:</span>{" "}
                    {record.baseRecommendedSizeCm} cm
                  </p>
                  <p className="history-card-stat">
                    <span className="history-card-label">フィット:</span>{" "}
                    {fitLabel[record.fitPreference]}
                  </p>
                  <p className="history-card-stat">
                    <span className="history-card-label">足幅:</span>{" "}
                    {widthLabel[record.widthPreference]}
                  </p>
                </div>
              </div>

              <div className="history-card-actions">
                {confirmDeleteId === record.id ? (
                  <div className="history-confirm-delete">
                    <span className="history-confirm-text">
                      削除しますか？
                    </span>
                    <button
                      className="history-button history-button--danger"
                      onClick={() => handleConfirmDelete(record.id)}
                    >
                      削除する
                    </button>
                    <button
                      className="history-button history-button--cancel"
                      onClick={handleCancelDelete}
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    className="history-button history-button--delete"
                    onClick={() => handleDeleteClick(record.id)}
                  >
                    削除
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;
