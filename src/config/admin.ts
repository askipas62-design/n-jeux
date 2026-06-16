export const ADMIN_EMAILS = [
  "askipas62@gmail.com",
  "zakaz@forumles.ru",
  "admin@appiotti.com",
  "herve@appiotti.com"
];

export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
};
