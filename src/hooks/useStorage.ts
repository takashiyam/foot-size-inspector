import { useState, useEffect, useCallback } from 'react';
import type { MeasurementRecord } from '../types';

const STORAGE_KEY = 'footsizer_measurements';

/**
 * 測定履歴の永続化フック
 * localStorage を使用してオフラインでも過去結果を閲覧可能にする
 */
export function useStorage() {
  const [records, setRecords] = useState<MeasurementRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 起動時にローカルストレージから読み込み
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setRecords(JSON.parse(data));
      }
    } catch {
      console.warn('測定履歴の読み込みに失敗しました');
    }
    setLoaded(true);
  }, []);

  // records 変更時に保存
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      } catch {
        console.warn('測定履歴の保存に失敗しました');
      }
    }
  }, [records, loaded]);

  const addRecord = useCallback((record: MeasurementRecord) => {
    setRecords((prev) => [record, ...prev]);
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setRecords([]);
  }, []);

  return { records, loaded, addRecord, deleteRecord, clearAll };
}

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
