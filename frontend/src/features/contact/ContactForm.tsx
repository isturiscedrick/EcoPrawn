"use client";

import { useId, useState, type FormEvent } from "react";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const inputClass = `w-full rounded-xl border-2 border-[var(--ep-primary)] bg-white px-4 py-2.5 text-base text-[var(--ep-primary)] transition-colors duration-200 placeholder:text-[var(--ep-text-muted)] hover:border-[var(--ep-accent)] ${focusRing}`;

const labelClass = "mb-1.5 block text-sm font-semibold text-[var(--ep-primary)]";

const buttonMotion =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(11,46,51,0.6)] active:translate-y-0 active:shadow-none";

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
      <div
        role="status"
        className="rounded-2xl border-2 border-[var(--ep-primary)] bg-white p-6 text-center sm:p-8"
      >
        <h2 className="ep-font-display mb-2 text-2xl font-semibold">Message ready</h2>
        <p className="mb-6 text-base leading-relaxed text-[var(--ep-text-muted)]">
          Thanks, {name.trim() || "friend"}. This form isn&apos;t connected to a
          mail service yet, so nothing has been sent.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className={`inline-flex items-center justify-center rounded-xl border-2 border-[var(--ep-primary)] px-6 py-3 text-base font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] ${buttonMotion} ${focusRing}`}
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border-2 border-[var(--ep-primary)] bg-white p-6 sm:p-8"
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
          autoComplete="name"
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
          autoComplete="email"
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
        className={`inline-flex items-center justify-center rounded-xl border-2 border-[var(--ep-accent)] bg-[var(--ep-accent)] px-7 py-3.5 text-base font-semibold text-white hover:border-[var(--ep-accent-hover)] hover:bg-[var(--ep-accent-hover)] ${buttonMotion} ${focusRing}`}
      >
        Send message
      </button>
    </form>
  );
}