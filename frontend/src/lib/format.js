export const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatPrice = (price) => (price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Free');
