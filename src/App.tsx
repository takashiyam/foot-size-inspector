import { useState, useCallback } from 'react';
import type { SizeResult, Gender, FitPreference, WidthPreference } from './types';
import { calculateRecommendations } from './lib/sizeEngine';
import { useStorage, generateId } from './hooks/useStorage';
import HomePage from './pages/HomePage';
import GuidePage from './pages/GuidePage';
import MeasurementPage from './pages/MeasurementPage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';

type Page = 'home' | 'guide' | 'measure' | 'result' | 'history';

interface MeasurementData {
  measuredFootLengthCm: number;
  thumbnailDataUrl: string;
  gender: Gender;
  fitPreference: FitPreference;
  widthPreference: WidthPreference;
}

function App() {
  const [page, setPage] = useState<Page>('home');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<SizeResult | null>(null);
  const [measurementData, setMeasurementData] = useState<MeasurementData | null>(null);
  const { records, addRecord, deleteRecord } = useStorage();

  const navigate = useCallback((p: string) => {
    setPage(p as Page);
    window.scrollTo(0, 0);
  }, []);

  const handleImageSelected = useCallback((file: File) => {
    setImageFile(file);
    setPage('measure');
  }, []);

  const handleMeasurementComplete = useCallback((data: MeasurementData) => {
    setMeasurementData(data);
    const sizeResult = calculateRecommendations(
      data.measuredFootLengthCm,
      data.fitPreference,
      data.widthPreference,
    );
    setResult(sizeResult);
    setPage('result');
  }, []);

  const handleSave = useCallback(() => {
    if (!result || !measurementData) return;
    addRecord({
      id: generateId(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
      measuredFootLengthCm: result.measuredFootLengthCm,
      baseRecommendedSizeCm: result.baseRecommendedSizeCm,
      widthPreference: measurementData.widthPreference,
      fitPreference: measurementData.fitPreference,
      gender: measurementData.gender,
      thumbnailDataUrl: measurementData.thumbnailDataUrl,
      recommendations: result.recommendations,
    });
  }, [result, measurementData, addRecord]);

  return (
    <div className="app">
      {page === 'home' && (
        <HomePage onNavigate={navigate} onImageSelected={handleImageSelected} />
      )}
      {page === 'guide' && <GuidePage onNavigate={navigate} />}
      {page === 'measure' && (
        <MeasurementPage
          imageFile={imageFile}
          onNavigate={navigate}
          onMeasurementComplete={handleMeasurementComplete}
        />
      )}
      {page === 'result' && (
        <ResultPage result={result} onNavigate={navigate} onSave={handleSave} />
      )}
      {page === 'history' && (
        <HistoryPage records={records} onDelete={deleteRecord} onNavigate={navigate} />
      )}
    </div>
  );
}

export default App;
