import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const ImportDropZone = ({ onFileLoaded }) => {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    setError(null);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError(t('import.invalidFileType'));
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(t('import.fileTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onFileLoaded(e.target.result);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onClick = () => {
    inputRef.current?.click();
  };

  const onInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div
      className={`import-dropzone ${dragging ? 'dragging' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={onInputChange}
        style={{ display: 'none' }}
      />
      <Upload size={32} style={{ color: 'var(--color-primary)', marginBottom: '0.75rem' }} />
      <p className="import-dropzone-title">{t('import.dropzoneDrag')}</p>
      <p className="import-dropzone-or">{t('import.dropzoneOr')}</p>
      <span className="import-dropzone-browse">{t('import.dropzoneBrowse')}</span>
      <p className="import-dropzone-hint">{t('import.dropzoneHint')}</p>
      {error && <p className="import-dropzone-error">{error}</p>}
    </div>
  );
};

export default ImportDropZone;
