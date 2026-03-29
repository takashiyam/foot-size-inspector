import React, { useRef, useState, useEffect, useCallback } from "react";
import type {
  Point,
  MeasurementPoints,
  Gender,
  FitPreference,
  WidthPreference,
} from "../types";
import {
  calculateFootLength,
  checkSkew,
  validatePoints,
  resizeImage,
  createThumbnail,
} from "../lib/imageAnalysis";

interface MeasurementPageProps {
  imageFile: File | null;
  onNavigate: (page: string) => void;
  onMeasurementComplete: (data: {
    measuredFootLengthCm: number;
    thumbnailDataUrl: string;
    gender: Gender;
    fitPreference: FitPreference;
    widthPreference: WidthPreference;
  }) => void;
}

type PlacementStep = 1 | 2 | 3 | 4;

const POINT_RADIUS = 12;
const DRAG_THRESHOLD = 24;

const STEP_LABELS: Record<PlacementStep, string> = {
  1: "定規の0cm点をタップしてください",
  2: "定規の10cm点をタップしてください",
  3: "かかと位置をタップしてください",
  4: "最長つま先位置をタップしてください",
};

const POINT_COLORS = {
  rulerStart: "#2563eb",
  rulerEnd: "#2563eb",
  heelPoint: "#16a34a",
  toePoint: "#dc2626",
} as const;

const POINT_LABELS = {
  rulerStart: "0cm",
  rulerEnd: "端",
  heelPoint: "かかと",
  toePoint: "つま先",
} as const;

type PointKey = keyof typeof POINT_COLORS;

const MeasurementPage: React.FC<MeasurementPageProps> = ({
  imageFile,
  onNavigate,
  onMeasurementComplete,
}) => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [, setImageScale] = useState(1);
  const [, setDisplayScale] = useState(1);

  const [currentStep, setCurrentStep] = useState<PlacementStep>(1);
  const [points, setPoints] = useState<Partial<Record<PointKey, Point>>>({});
  const [rulerLengthCm, setRulerLengthCm] = useState(10);
  const [allPointsPlaced, setAllPointsPlaced] = useState(false);

  const [footLengthCm, setFootLengthCm] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [gender, setGender] = useState<Gender>("unspecified");
  const [fitPreference, setFitPreference] = useState<FitPreference>("standard");
  const [widthPreference, setWidthPreference] =
    useState<WidthPreference>("standard");

  const [draggingPoint, setDraggingPoint] = useState<PointKey | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load image from file
  useEffect(() => {
    if (!imageFile) {
      setLoadError("画像ファイルが選択されていません。");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;

      const { canvas: resizedCanvas, scale } = resizeImage(img, 1200, 1200);
      setImageScale(scale);

      const containerWidth = containerRef.current
        ? containerRef.current.clientWidth
        : Math.min(window.innerWidth, 600);

      const dScale = Math.min(1, containerWidth / resizedCanvas.width);
      setDisplayScale(dScale);

      const displayW = Math.round(resizedCanvas.width * dScale);
      const displayH = Math.round(resizedCanvas.height * dScale);
      setCanvasSize({ width: displayW, height: displayH });

      // Draw image onto the image canvas
      const imageCanvas = imageCanvasRef.current;
      if (imageCanvas) {
        imageCanvas.width = displayW;
        imageCanvas.height = displayH;
        const ctx = imageCanvas.getContext("2d")!;
        ctx.drawImage(resizedCanvas, 0, 0, displayW, displayH);
      }

      setImageLoaded(true);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setLoadError("画像の読み込みに失敗しました。");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [imageFile]);

  // Set overlay canvas size when canvasSize changes
  useEffect(() => {
    const overlay = overlayCanvasRef.current;
    if (overlay && canvasSize.width > 0) {
      overlay.width = canvasSize.width;
      overlay.height = canvasSize.height;
    }
  }, [canvasSize]);

  // Check if all points are placed
  useEffect(() => {
    const placed =
      !!points.rulerStart &&
      !!points.rulerEnd &&
      !!points.heelPoint &&
      !!points.toePoint;
    setAllPointsPlaced(placed);
  }, [points]);

  // Calculate foot length when all points are placed or ruler length changes
  useEffect(() => {
    if (!allPointsPlaced) {
      setFootLengthCm(null);
      setWarnings([]);
      return;
    }

    const mp: MeasurementPoints = {
      rulerStart: points.rulerStart!,
      rulerEnd: points.rulerEnd!,
      rulerLengthCm,
      heelPoint: points.heelPoint!,
      toePoint: points.toePoint!,
    };

    try {
      const length = calculateFootLength(mp);
      setFootLengthCm(Math.round(length * 10) / 10);

      const newWarnings: string[] = [];

      const skew = checkSkew(mp);
      if (skew.isSkewed) {
        newWarnings.push(
          `定規が大きく傾いています（${skew.angleDeg.toFixed(1)}°）。撮影角度を確認してください。`
        );
      }

      const validation = validatePoints(
        mp,
        canvasSize.width,
        canvasSize.height
      );
      if (!validation.valid) {
        newWarnings.push(...validation.errors);
      }

      setWarnings(newWarnings);
    } catch {
      setFootLengthCm(null);
      setWarnings(["計測エラーが発生しました。ポイントを確認してください。"]);
    }
  }, [allPointsPlaced, points, rulerLengthCm, canvasSize]);

  // Draw overlay
  const drawOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);

    const pointEntries = Object.entries(points) as [PointKey, Point][];

    // Draw lines between ruler points
    if (points.rulerStart && points.rulerEnd) {
      ctx.beginPath();
      ctx.moveTo(points.rulerStart.x, points.rulerStart.y);
      ctx.lineTo(points.rulerEnd.x, points.rulerEnd.y);
      ctx.strokeStyle = POINT_COLORS.rulerStart;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw line between heel and toe
    if (points.heelPoint && points.toePoint) {
      ctx.beginPath();
      ctx.moveTo(points.heelPoint.x, points.heelPoint.y);
      ctx.lineTo(points.toePoint.x, points.toePoint.y);
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw points
    for (const [key, point] of pointEntries) {
      const color = POINT_COLORS[key];
      const label = POINT_LABELS[key];

      // Outer circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = color + "44";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.font = "bold 12px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      const labelY = point.y - POINT_RADIUS - 6;
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = color + "cc";
      ctx.beginPath();
      ctx.roundRect(
        point.x - textWidth / 2 - 4,
        labelY - 10,
        textWidth + 8,
        16,
        3
      );
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, point.x, labelY);
    }
  }, [points]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // Convert page coordinates to canvas coordinates
  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): Point => {
      const overlay = overlayCanvasRef.current;
      if (!overlay) return { x: 0, y: 0 };
      const rect = overlay.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  // Find the nearest placed point within drag threshold
  const findNearestPoint = useCallback(
    (pos: Point): PointKey | null => {
      let nearest: PointKey | null = null;
      let minDist = DRAG_THRESHOLD;

      for (const [key, point] of Object.entries(points) as [
        PointKey,
        Point,
      ][]) {
        const dx = pos.x - point.x;
        const dy = pos.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = key;
        }
      }

      return nearest;
    },
    [points]
  );

  // Step key mapping
  const stepToKey = (step: PlacementStep): PointKey => {
    switch (step) {
      case 1:
        return "rulerStart";
      case 2:
        return "rulerEnd";
      case 3:
        return "heelPoint";
      case 4:
        return "toePoint";
    }
  };

  // Handle tap to place point
  const handlePointerDown = useCallback(
    (clientX: number, clientY: number) => {
      const pos = getCanvasPoint(clientX, clientY);

      // Check if tapping near an existing point to drag it
      const nearPoint = findNearestPoint(pos);
      if (nearPoint) {
        setDraggingPoint(nearPoint);
        return;
      }

      // Place point for current step
      if (!allPointsPlaced) {
        const key = stepToKey(currentStep);
        setPoints((prev) => ({ ...prev, [key]: pos }));
        if (currentStep < 4) {
          setCurrentStep((prev) => (prev + 1) as PlacementStep);
        }
      }
    },
    [getCanvasPoint, findNearestPoint, currentStep, allPointsPlaced]
  );

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingPoint) return;
      const pos = getCanvasPoint(clientX, clientY);
      // Clamp to canvas
      const clampedX = Math.max(0, Math.min(pos.x, canvasSize.width));
      const clampedY = Math.max(0, Math.min(pos.y, canvasSize.height));
      setPoints((prev) => ({
        ...prev,
        [draggingPoint]: { x: clampedX, y: clampedY },
      }));
    },
    [draggingPoint, getCanvasPoint, canvasSize]
  );

  const handlePointerUp = useCallback(() => {
    setDraggingPoint(null);
  }, []);

  // Mouse events
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handlePointerDown(e.clientX, e.clientY);
    },
    [handlePointerDown]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingPoint) {
        e.preventDefault();
        handlePointerMove(e.clientX, e.clientY);
      }
    },
    [draggingPoint, handlePointerMove]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handlePointerUp();
    },
    [handlePointerUp]
  );

  // Touch events
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        handlePointerDown(touch.clientX, touch.clientY);
      }
    },
    [handlePointerDown]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && draggingPoint) {
        e.preventDefault();
        const touch = e.touches[0];
        handlePointerMove(touch.clientX, touch.clientY);
      }
    },
    [draggingPoint, handlePointerMove]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      handlePointerUp();
    },
    [handlePointerUp]
  );

  // Reset a single point so the user can re-place it
  const handleResetPoint = (step: PlacementStep) => {
    const key = stepToKey(step);
    setPoints((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setCurrentStep(step);
  };

  // Handle submitting the result
  const handleSubmit = () => {
    if (footLengthCm === null || !imgRef.current) return;

    const thumbnailDataUrl = createThumbnail(imgRef.current, 200);

    onMeasurementComplete({
      measuredFootLengthCm: footLengthCm,
      thumbnailDataUrl,
      gender,
      fitPreference,
      widthPreference,
    });
  };

  if (loadError) {
    return (
      <div className="measurement-page">
        <div className="measurement-error">
          <p>{loadError}</p>
          <button
            className="measurement-back-button"
            onClick={() => onNavigate("home")}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="measurement-page">
      <header className="measurement-header">
        <button
          className="measurement-back-button"
          onClick={() => onNavigate("home")}
        >
          戻る
        </button>
        <h2 className="measurement-title">足サイズ測定</h2>
      </header>

      {/* Step instructions */}
      <div className="measurement-instructions">
        {!allPointsPlaced ? (
          <p className="measurement-step-label">
            <span className="measurement-step-number">
              ステップ {currentStep}/4
            </span>
            {STEP_LABELS[currentStep]}
          </p>
        ) : (
          <p className="measurement-step-label measurement-step-complete">
            全ポイント配置済み（ドラッグで調整可能）
          </p>
        )}
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="measurement-canvas-container"
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          position: "relative",
          touchAction: "none",
        }}
      >
        {!imageLoaded && (
          <div className="measurement-loading">画像を読み込み中...</div>
        )}
        <canvas
          ref={imageCanvasRef}
          className="measurement-canvas-image"
          style={{
            display: imageLoaded ? "block" : "none",
            width: canvasSize.width,
            height: canvasSize.height,
          }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="measurement-canvas-overlay"
          style={{
            display: imageLoaded ? "block" : "none",
            width: canvasSize.width,
            height: canvasSize.height,
            position: "absolute",
            top: 0,
            left: 0,
            cursor: draggingPoint ? "grabbing" : "crosshair",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </div>

      {/* Point reset buttons */}
      {imageLoaded && (
        <div className="measurement-point-controls">
          {([1, 2, 3, 4] as PlacementStep[]).map((step) => {
            const key = stepToKey(step);
            const placed = !!points[key];
            const color = POINT_COLORS[key];
            const label = POINT_LABELS[key];
            return (
              <button
                key={step}
                className={`measurement-point-chip ${placed ? "measurement-point-chip-active" : ""}`}
                style={{
                  borderColor: placed ? color : undefined,
                  color: placed ? color : undefined,
                }}
                onClick={() => handleResetPoint(step)}
                disabled={!placed}
                title={placed ? `${label}を再配置` : `${label}:未配置`}
              >
                <span
                  className="measurement-point-chip-dot"
                  style={{ backgroundColor: placed ? color : "#ccc" }}
                />
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Ruler length input */}
      {imageLoaded && (
        <div className="measurement-ruler-input">
          <label className="measurement-ruler-label">
            定規の長さ:
            <input
              type="number"
              className="measurement-ruler-field"
              value={rulerLengthCm}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v > 0) setRulerLengthCm(v);
              }}
              min={1}
              max={100}
              step={0.5}
            />
            <span className="measurement-ruler-unit">cm</span>
          </label>
        </div>
      )}

      {/* Measurement result */}
      {footLengthCm !== null && (
        <div className="measurement-result">
          <p className="measurement-result-label">計測結果（足長）</p>
          <p className="measurement-result-value">
            {footLengthCm.toFixed(1)}{" "}
            <span className="measurement-result-unit">cm</span>
          </p>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="measurement-warnings">
          {warnings.map((w, i) => (
            <p key={i} className="measurement-warning-item">
              {w}
            </p>
          ))}
        </div>
      )}

      {/* Preferences */}
      {imageLoaded && (
        <div className="measurement-preferences">
          {/* Gender */}
          <fieldset className="measurement-fieldset">
            <legend className="measurement-legend">性別</legend>
            <div className="measurement-radio-group">
              {(
                [
                  ["male", "男性"],
                  ["female", "女性"],
                  ["unspecified", "未指定"],
                ] as [Gender, string][]
              ).map(([value, label]) => (
                <label key={value} className="measurement-radio-label">
                  <input
                    type="radio"
                    name="gender"
                    className="measurement-radio-input"
                    value={value}
                    checked={gender === value}
                    onChange={() => setGender(value)}
                  />
                  <span className="measurement-radio-text">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Fit preference */}
          <fieldset className="measurement-fieldset">
            <legend className="measurement-legend">フィット</legend>
            <div className="measurement-radio-group">
              {(
                [
                  ["tight", "ぴったり"],
                  ["standard", "標準"],
                  ["loose", "ゆったり"],
                ] as [FitPreference, string][]
              ).map(([value, label]) => (
                <label key={value} className="measurement-radio-label">
                  <input
                    type="radio"
                    name="fit"
                    className="measurement-radio-input"
                    value={value}
                    checked={fitPreference === value}
                    onChange={() => setFitPreference(value)}
                  />
                  <span className="measurement-radio-text">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Width preference */}
          <fieldset className="measurement-fieldset">
            <legend className="measurement-legend">足幅</legend>
            <div className="measurement-radio-group">
              {(
                [
                  ["narrow", "細め"],
                  ["standard", "標準"],
                  ["wide", "幅広"],
                ] as [WidthPreference, string][]
              ).map(([value, label]) => (
                <label key={value} className="measurement-radio-label">
                  <input
                    type="radio"
                    name="width"
                    className="measurement-radio-input"
                    value={value}
                    checked={widthPreference === value}
                    onChange={() => setWidthPreference(value)}
                  />
                  <span className="measurement-radio-text">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Action buttons */}
      <div className="measurement-actions">
        <button
          className="measurement-submit-button"
          disabled={!allPointsPlaced || footLengthCm === null}
          onClick={handleSubmit}
        >
          結果を見る
        </button>
      </div>

      <footer className="measurement-footer">
        <p className="measurement-disclaimer">
          ポイントをドラッグして微調整できます。正確な測定のため、定規をまっすぐ置いてください。
        </p>
      </footer>
    </div>
  );
};

export default MeasurementPage;
