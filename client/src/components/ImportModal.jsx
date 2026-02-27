import React, { useState } from 'react';
import { X, FileText, Sparkles, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useImport } from '../hooks/useImport';
import ImportDropZone from './ImportDropZone';
import ImportPreviewTable from './ImportPreviewTable';

const ImportModal = ({ onClose, userId }) => {
  const { t, i18n } = useTranslation();
  const {
    step, mode, setMode,
    parsedRows, unmappedColumns, importableRows,
    importing, importResult,
    aiLoading, aiError,
    handleCsvParsed, handleAiParse, handleDeleteRow, handleConfirmImport,
    reset, setStep,
  } = useImport(userId);

  const [aiText, setAiText] = useState('');

  const handleClose = () => {
    onClose();
  };

  const handleBack = () => {
    if (step === 2) {
      reset();
    }
  };

  const handleTabChange = (newMode) => {
    if (step === 1) {
      setMode(newMode);
    }
  };

  const handleAiExtract = () => {
    if (!aiText.trim()) return;
    const language = i18n.language?.startsWith('fr') ? 'fr' : 'en';
    handleAiParse(aiText.trim(), language);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="glass-modal" style={{ maxWidth: '700px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2>{t('import.title')}</h2>
          <button onClick={handleClose} className="btn-icon-only modal-close">
            <X size={24} />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="onboarding-steps">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`onboarding-step-dot ${s === step ? 'active' : s < step ? 'completed' : ''}`}
            />
          ))}
        </div>

        {/* Tabs — only on step 1 */}
        {step === 1 && (
          <div className="settings-tabs">
            <button
              className={`settings-tab ${mode === 'csv' ? 'active' : ''}`}
              onClick={() => handleTabChange('csv')}
            >
              <FileText size={16} />
              {t('import.tabCsv')}
            </button>
            <button
              className={`settings-tab ${mode === 'ai' ? 'active' : ''}`}
              onClick={() => handleTabChange('ai')}
            >
              <Sparkles size={16} />
              {t('import.tabAi')}
            </button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && mode === 'csv' && (
          <ImportDropZone onFileLoaded={handleCsvParsed} />
        )}

        {step === 1 && mode === 'ai' && (
          <div>
            <textarea
              className="import-ai-textarea"
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              placeholder={t('import.aiPlaceholder')}
              maxLength={5000}
            />
            <div className="import-actions" style={{ justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary"
                onClick={handleAiExtract}
                disabled={aiLoading || !aiText.trim()}
              >
                {aiLoading ? (
                  <>
                    <Loader size={16} className="spinning" />
                    {t('import.aiExtracting')}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {t('import.aiExtract')}
                  </>
                )}
              </button>
            </div>
            {aiError === 'error' && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                {t('import.aiError')}
              </p>
            )}
            {aiError === 'empty' && (
              <p style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '0.75rem' }}>
                {t('import.aiEmpty')}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div>
            {unmappedColumns.length > 0 && (
              <div className="import-unmapped">
                {t('import.unmappedColumns', { columns: unmappedColumns.join(', ') })}
              </div>
            )}

            {parsedRows.length > 0 ? (
              <ImportPreviewTable rows={parsedRows} onDeleteRow={handleDeleteRow} />
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>
                {t('import.aiEmpty')}
              </p>
            )}

            <div className="import-actions">
              <button className="btn btn-secondary" onClick={handleBack}>
                {t('import.back')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmImport}
                disabled={importing || importableRows.length === 0}
              >
                {importing
                  ? t('import.importing')
                  : t('import.import', { count: importableRows.length })
                }
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Result */}
        {step === 3 && importResult && (
          <div className="import-result">
            <div className="import-result-icon">
              {importResult.success > 0 ? '🎉' : '😕'}
            </div>
            <h3>{t('import.resultSuccess')}</h3>
            <p>{t('import.resultCount', { count: importResult.success })}</p>
            {importResult.errors > 0 && (
              <p className="import-result-errors">
                {t('import.resultErrors', { count: importResult.errors })}
              </p>
            )}
            <div className="import-actions" style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={handleClose}>
                {t('import.done')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
