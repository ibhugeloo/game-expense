import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WARNING_KEYS = {
  unknown_type: 'import.warningUnknownType',
  invalid_price: 'import.warningInvalidPrice',
  unknown_currency: 'import.warningUnknownCurrency',
  unknown_platform: 'import.warningUnknownPlatform',
  unknown_genre: 'import.warningUnknownGenre',
  unknown_status: 'import.warningUnknownStatus',
  invalid_date: 'import.warningInvalidDate',
};

const ERROR_KEYS = {
  title_required: 'import.warningTitleRequired',
};

const ImportPreviewTable = ({ rows, onDeleteRow }) => {
  const { t } = useTranslation();

  const validCount = rows.filter(r => r.errors.length === 0 && r.warnings.length === 0).length;
  const warningCount = rows.filter(r => r.warnings.length > 0 && r.errors.length === 0).length;
  const errorCount = rows.filter(r => r.errors.length > 0).length;

  return (
    <div className="import-preview-wrapper">
      <div className="import-preview-summary">
        <span style={{ color: 'var(--color-primary)' }}>
          {t('import.previewSummary', { valid: validCount, warnings: warningCount, errors: errorCount })}
        </span>
      </div>
      <div className="import-preview-scroll">
        <table className="import-preview-table">
          <thead>
            <tr>
              <th>{t('transactions.game')}</th>
              <th>{t('transactions.type')}</th>
              <th>{t('transactions.price')}</th>
              <th>{t('transactions.platform')}</th>
              <th>{t('transactions.date')}</th>
              <th>{t('transactions.status')}</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const hasError = row.errors.length > 0;
              const hasWarning = row.warnings.length > 0;
              const rowClass = hasError ? 'row-error' : hasWarning ? 'row-warning' : '';

              return (
                <tr key={i} className={rowClass}>
                  <td title={row.data.title}>{row.data.title || '—'}</td>
                  <td>{row.data.type}</td>
                  <td>{row.data.price} {row.data.currency}</td>
                  <td>{row.data.platform}</td>
                  <td>{row.data.purchase_date}</td>
                  <td>{row.data.status}</td>
                  <td>
                    <div className="import-row-badges">
                      {row.errors.map((e, j) => (
                        <span key={`e-${j}`} className="import-badge-error">
                          {t(ERROR_KEYS[e] || e)}
                        </span>
                      ))}
                      {row.warnings.map((w, j) => (
                        <span key={`w-${j}`} className="import-badge-warning">
                          {t(WARNING_KEYS[w] || w)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      className="import-row-delete"
                      onClick={() => onDeleteRow(i)}
                      title={t('import.deleteRow')}
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportPreviewTable;
