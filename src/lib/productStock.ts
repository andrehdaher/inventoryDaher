export type ProductAlertFields = {
  alertQuantity?: number | string;
  lowStockLimit?: number | string;
  minQuantity?: number | string;
};

export const getProductAlertLimit = (product: ProductAlertFields) => {
  const explicitLimit =
    product.alertQuantity ?? product.lowStockLimit ?? product.minQuantity;
  const numericLimit = Number(explicitLimit);

  return Number.isFinite(numericLimit) && explicitLimit !== undefined
    ? numericLimit
    : 5;
};
