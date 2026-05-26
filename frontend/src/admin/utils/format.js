export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function formatDate(dateString, locale = 'zh-CN') {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString(locale);
}

export function formatNumber(num) {
  if (num === null || num === undefined) return 0;
  return Number(num).toLocaleString();
}
