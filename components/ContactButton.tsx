import { Mail, MessageCircle } from "lucide-react";
import { buildMailtoLink, buildWhatsAppLink, contactMessage } from "@/lib/utils";

export function ContactButton({
  title,
  phone,
  email,
}: {
  title: string;
  phone: string | null;
  email: string | null;
}) {
  const message = contactMessage(title);
  const whatsapp = phone ? buildWhatsAppLink(phone, message) : null;
  const mailto = email
    ? buildMailtoLink(email, `GLB Trace: ${title}`, message)
    : null;

  if (!whatsapp && !mailto) {
    return (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
        This reporter has not added a phone number or email yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark"
        >
          <MessageCircle className="h-4 w-4" />
          Contact Reporter
        </a>
      ) : null}
      {mailto ? (
        <a
          href={mailto}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Mail className="h-4 w-4" />
          Email
        </a>
      ) : null}
    </div>
  );
}
