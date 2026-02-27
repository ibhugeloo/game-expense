import { useState, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { parseCsvText, autoDetectColumns, applyMapping } from '../utils/csvParser';
import { validateTransaction } from '../utils/importValidation';

/**
 * Hook managing the full import lifecycle:
 *   Step 1: Upload (CSV file or AI text)
 *   Step 2: Preview validated rows
 *   Step 3: Result after bulk insert
 */
export function useImport(userId) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('csv'); // 'csv' | 'ai'
  const [parsedRows, setParsedRows] = useState([]); // { data, warnings, errors }[]
  const [unmappedColumns, setUnmappedColumns] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { success: number, errors: number }
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const importableRows = useMemo(
    () => parsedRows.filter(r => r.errors.length === 0),
    [parsedRows]
  );

  const handleCsvParsed = useCallback((text) => {
    const allRows = parseCsvText(text);
    if (allRows.length < 2) {
      setParsedRows([]);
      setStep(2);
      return;
    }

    const headers = allRows[0];
    const dataRows = allRows.slice(1);
    const { mapping, unmapped } = autoDetectColumns(headers);
    setUnmappedColumns(unmapped);

    const rawObjects = applyMapping(dataRows, mapping);
    const validated = rawObjects.map(row => validateTransaction(row));
    setParsedRows(validated);
    setStep(2);
  }, []);

  const handleAiParse = useCallback(async (text, language) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const { data, error } = await supabase.functions.invoke('parse-transactions', {
        body: { text, language },
      });

      if (error) throw error;

      const transactions = data?.transactions;
      if (!transactions || transactions.length === 0) {
        setAiError('empty');
        setAiLoading(false);
        return;
      }

      const validated = transactions.map(row => validateTransaction(row));
      setParsedRows(validated);
      setUnmappedColumns([]);
      setStep(2);
    } catch (err) {
      console.error('AI parse error:', err);
      setAiError('error');
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleDeleteRow = useCallback((index) => {
    setParsedRows(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (importableRows.length === 0) return;

    setImporting(true);
    try {
      const rows = importableRows.map(r => ({
        user_id: userId,
        title: r.data.title,
        type: r.data.type,
        price: r.data.price,
        currency: r.data.currency,
        platform: r.data.platform,
        genre: r.data.genre,
        store: r.data.store,
        status: r.data.status,
        purchase_date: r.data.purchase_date,
        notes: r.data.notes,
      }));

      const { error } = await supabase
        .from('transactions')
        .insert(rows)
        .select();

      if (error) throw error;

      const errorCount = parsedRows.length - importableRows.length;
      setImportResult({ success: importableRows.length, errors: errorCount });
      setStep(3);
    } catch (err) {
      console.error('Import error:', err);
      setImportResult({ success: 0, errors: parsedRows.length });
      setStep(3);
    } finally {
      setImporting(false);
    }
  }, [importableRows, parsedRows, userId]);

  const reset = useCallback(() => {
    setStep(1);
    setParsedRows([]);
    setUnmappedColumns([]);
    setImportResult(null);
    setAiError(null);
  }, []);

  return {
    step,
    mode,
    setMode,
    parsedRows,
    unmappedColumns,
    importableRows,
    importing,
    importResult,
    aiLoading,
    aiError,
    handleCsvParsed,
    handleAiParse,
    handleDeleteRow,
    handleConfirmImport,
    reset,
    setStep,
  };
}
