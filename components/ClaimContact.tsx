"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Contact = { role: string; name: string; roll_no: string | null; year: string | null; section: string | null; email: string | null; phone: string | null };

export function ClaimContact({ itemId }: { itemId: string }) {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    createClient().rpc("get_claim_contact", { p_item_id: itemId }).then(({ data, error: contactError }) => {
      if (contactError) setError(contactError.message);
      else setContacts((data ?? []) as Contact[]);
    });
  }, [itemId]);
  if (error) return <p className="text-sm text-red-700">Could not load handover details.</p>;
  if (!contacts) return <p className="text-sm text-slate-500">Loading approved handover details…</p>;
  return <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
    <h2 className="font-semibold text-emerald-950">Claim approved · arrange the handover</h2>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {contacts.map((contact) => <div key={contact.role} className="rounded-xl bg-white p-3 text-sm">
        <p className="font-semibold">{contact.role}: {contact.name}</p>
        <p className="mt-1 text-slate-600">{[contact.roll_no, contact.year, contact.section].filter(Boolean).join(" · ")}</p>
        {contact.email ? <a className="mt-1 block text-accent underline" href={`mailto:${contact.email}`}>{contact.email}</a> : null}
        {contact.phone ? <a className="mt-1 block text-accent underline" href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}>Message on WhatsApp</a> : null}
      </div>)}
    </div>
  </section>;
}
