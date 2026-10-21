"use client";

import { useId, useState, type FormEvent } from "react";

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-[var(--sand-dim)] bg-white text-[13.5px] text-[var(--water-deep)] outline-none focus:border-[var(--mangrove-light)] transition-colors";

const labelClass =
  "ep-font-mono text-[10px] uppercase tracking-wide text-[rgba(11,35,32,0.5)] block mb-1.5";

export function ContactForm() {
  const uid = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: wire up a real submission endpoint.
    setSent(true);
  }

  function handleReset() {
    setName("");
    setEmail("");
    setMessage("");
    setSent(false);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-[var(--sand-dim)] bg-white p-6 text-center shadow-[var(--shadow-sm)] sm:p-8">
        <h2 className="ep-font-display mb-1.5 text-[20px] font-semibold text-[var(--water-deep)]">
          Message ready
        </h2>
        <p className="mb-6 text-[13px] leading-[1.55] text-[rgba(11,35,32,0.6)]">
          Thanks, {name.trim() || "friend"}. This form isn&apos;t connected to a
          mail service yet, so nothing has been sent.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-[var(--sand-dim)] px-4 py-2.5 text-[13.5px] font-semibold text-[var(--water-deep)] transition-colors hover:bg-[rgba(11,35,32,0.05)]"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-[var(--sand-dim)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-8"
    >
      <div>
        <label htmlFor={`${uid}-name`} className={labelClass}>
          Name
        </label>
        <input
          id={`${uid}-name`}
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor={`${uid}-email`} className={labelClass}>
          Email
        </label>
        <input
          id={`${uid}-email`}
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor={`${uid}-message`} className={labelClass}>
          Message
        </label>
        <textarea
          id={`${uid}-message`}
          rows={5}
          className={`${inputClass} resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="mt-1 rounded-lg bg-[var(--coral)] px-4 py-3 text-[14px] font-semibold text-[var(--sand)] transition-colors hover:bg-[var(--coral-dim)]"
      >
        Send message
      </button>
    </form>
  );
}