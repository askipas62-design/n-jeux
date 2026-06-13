import type { Product } from "../data/products";

const ACCENT_REGEX = /[\u0300-\u036f]/g;

export const normalizeCatalogText = (value: string) =>
  value
    .normalize("NFD")
    .replace(ACCENT_REGEX, "")
    .toLowerCase()
    .trim();

export const getProductBrand = (product: Pick<Product, "brand">) => {
  const brand = product.brand?.trim();
  return brand ? brand : null;
};

export const isSameBrand = (left?: string | null, right?: string | null) => {
  if (!left || !right) return false;
  return normalizeCatalogText(left) === normalizeCatalogText(right);
};




