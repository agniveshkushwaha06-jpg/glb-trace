export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppLink(phone: string, message: string) {
  const number = digitsOnly(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoLink(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function contactMessage(title: string) {
  return `Hi, I saw your "${title}" post on GLB Trace. I think it may be mine / I may have found it.`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function isEmailDomainAllowed(email: string | undefined | null) {
  const enforce = process.env.NEXT_PUBLIC_ENFORCE_EMAIL_DOMAIN === "true";
  if (!enforce) return true;
  const domain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN;
  if (!domain) return true;
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${domain.toLowerCase()}`);
}
