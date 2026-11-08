export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `${symbol}${safeAmount.toFixed(2)}`;
};

export const formatDate = (dateString?: string): string => {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime = (dateString?: string): string => {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export const formatDateTime = (dateString?: string): string => {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

let orderSeq = 101;
export const generateOrderNumber = (): string => {
  const now = new Date();
  const timeCode = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
  const seq = (orderSeq++).toString().padStart(3, '0');
  return `ORD-${timeCode}-${seq}`;
};

