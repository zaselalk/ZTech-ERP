export const formatCurrency = (amount) => {
  return `Rs. ${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
};
