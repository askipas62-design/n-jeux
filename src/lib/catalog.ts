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

export const getCategoryFallbackImage = (category: string) => {
  switch (category) {
    case "baby-foot":
      return "/images/categories/baby-foot.jpg";
    case "ping-pong":
      return "/images/categories/tennis-de-table.jpg";
    case "billard":
      return "/images/categories/billard.jpg";
    case "trampoline":
      return "/images/categories/trampoline.jpg";
    case "accessoires":
      return "/images/categories/accessoires.jpg";
    case "consoles":
      return "/images/categories/consoles.jpg";
    default:
      return "/images/hero-bg.jpg";
  }
};

export const getProductImageSrc = (image: string | undefined, category: string) => {
  if (!image) return getCategoryFallbackImage(category);
  if (image.startsWith("http")) return image;
  return image.startsWith("/") ? image : `/${image}`;
};
