export const formatCurrency = (amount: number | string): string => {
  let num: number;
  if (typeof amount === "number") {
    num = amount;
  } else {
    num = parseFloat(amount) || 0;
  }
  return `Rs. ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (amount: number | string): string => {
  let num: number;
  if (typeof amount === "number") {
    num = amount;
  } else {
    num = parseFloat(amount) || 0;
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
