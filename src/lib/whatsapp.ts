export function getWhatsAppUrl(number: string | null | undefined, message: string) {
  const cleaned = number?.replace(/\D/g, "");
  return cleaned ? `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}` : "/contact";
}
