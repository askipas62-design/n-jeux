export function getImageSrc(path: string | undefined | null): string {
  if (!path) return "/images/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
}
