export function getLocale(language) {
  return language === 'fr' ? 'fr-FR' : 'en-US';
}

export function formatCurrency(amount, language = 'fr') {
  return amount.toLocaleString(getLocale(language), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateString, language = 'fr') {
  return new Date(dateString).toLocaleDateString(getLocale(language));
}

export function formatMonth(date, language = 'fr') {
  return new Date(date).toLocaleString(getLocale(language), {
    month: 'long',
    year: 'numeric',
  });
}

export function formatMonthShort(date, language = 'fr') {
  return new Date(date).toLocaleString(getLocale(language), {
    month: 'short',
    year: '2-digit',
  });
}
