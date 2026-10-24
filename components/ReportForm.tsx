"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, LOCATIONS, MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { ItemType } from "@/types";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ReportForm() {
  const router = useRouter();
  const [type, setType] = useState<ItemType>("lost");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [location, setLocation] = useState<string>(LOCATIONS[0]);
  const [itemDate, setItemDate] = useState(todayIsoDate());
  const [description, setDescription] = useState("");
  const [verificationQuestion, setVerificationQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateImage(next: File | null) {
    if (!next) return true;
    if (!ALLOWED_IMAGE_TYPES.includes(next.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      return false;
    }
    if (next.size > MAX_IMAGE_BYTES) {
      setError("Image must be 3 MB or smaller.");
      return false;
    }
    return true;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }
    if (type === "found" && (!verificationQuestion.trim() || !secretAnswer.trim())) {
      setError("Add a private question and the correct answer for a found item.");
      return;
    }
    if (file && !validateImage(file)) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Please sign in to report an item.");
      }

      let imageUrl: string | null = null;
      if (file) {
        const safeName = file.name.replace(/[^\w.\-]+/g, "_");
        const path = `${user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw new Error(uploadError.message);
        const { data } = supabase.storage.from("item-images").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const { data, error: insertError } = await supabase
        .from("items")
        .insert({
          type,
          title: title.trim(),
          category,
          description: description.trim() || null,
          location,
          item_date: itemDate,
          image_url: imageUrl,
          status: "open",
          verification_question: type === "found" ? verificationQuestion.trim() : null,
          reported_by: user.id,
        })
        .select("id")
        .single();

      if (insertError) throw new Error(insertError.message);
      if (!data?.id) throw new Error("Could not save this report.");
      if (type === "found") {
        const { error: secretError } = await supabase.from("item_secrets").insert({ item_id: data.id, answer: secretAnswer.trim() });
        if (secretError) {
          await supabase.from("items").delete().eq("id", data.id);
          throw new Error(`The report could not save its private answer. ${secretError.message}`);
        }
      }
      router.push(`/items/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        {(["lost", "found"] as ItemType[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm font-medium",
              type === value
                ? value === "lost"
                  ? "bg-white text-orange-700 shadow-sm"
                  : "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500",
            )}
          >
            {value === "lost" ? "I lost something" : "I found something"}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium">
        Title
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Black wallet near the library"
          className={fieldClass}
        />
      </label>

      {type === "found" ? <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div><p className="font-semibold text-slate-900">Help verify the real owner</p><p className="mt-1 text-xs text-slate-600">Only the person who posted this item can see the correct answer.</p></div>
        <label className="block text-sm font-medium">Private question
          <input required value={verificationQuestion} onChange={(event) => setVerificationQuestion(event.target.value)} placeholder="What sticker is on the bottle?" className={fieldClass} />
        </label>
        <label className="block text-sm font-medium">Correct answer (hidden from everyone else)
          <input required value={secretAnswer} onChange={(event) => setSecretAnswer(event.target.value)} className={fieldClass} />
        </label>
      </div> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={fieldClass}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Location
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className={fieldClass}
          >
            {LOCATIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium">
        Date
        <input
          type="date"
          required
          value={itemDate}
          onChange={(event) => setItemDate(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium">
        Description
        <textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Colour, unique marks, where you last saw it..."
          className={fieldClass}
        />
      </label>

      <label className="block text-sm font-medium">
        Photo <span className="font-normal text-slate-500">(JPG, PNG or WEBP, max 3 MB)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const next = event.target.files?.[0] ?? null;
            setError(null);
            if (next && !validateImage(next)) {
              event.target.value = "";
              setFile(null);
              return;
            }
            setFile(next);
          }}
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-800"
        />
      </label>

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit report"}
      </button>
    </form>
  );
}
