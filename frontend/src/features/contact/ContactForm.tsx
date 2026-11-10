import { useId, useState, type FormEvent } from "react";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ep-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ep-bg)]";

const inputClass = `w-full rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] px-4 py-3 text-base text-[var(--ep-text)] transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--ep-text-muted)] placeholder:opacity-70 hover:border-[var(--ep-accent)] focus:border-[var(--ep-accent)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--ep-accent)_18%,transparent)] ${focusRing}`;

const labelClass = "mb-1.5 block text-sm font-semibold text-[var(--ep-text)]";

const buttonMotion =
  "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0";

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
        className="h-full rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-6 text-center shadow-[0_16px_32px_-24px_rgba(11,46,51,0.55)] sm:gap-5 sm:p-8"
      >
        <h2 className="ep-font-display mb-2 text-2xl font-semibold text-[var(--ep-text)]">Review your message</h2>
        <p className="mb-6 text-base leading-relaxed text-[var(--ep-text-muted)]">
          This is a local preview only. Nothing has been sent.
        </p>
        <dl className="mb-6 space-y-4 rounded-xl border border-[var(--ep-line)] bg-[var(--ep-bg)] p-4 text-left">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">From</dt>
            <dd className="mt-1 break-words text-sm font-medium text-[var(--ep-text)]">{name.trim()}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">Email</dt>
            <dd className="mt-1 break-all text-sm font-medium text-[var(--ep-text)]">{email.trim()}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-text-muted)]">Message</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--ep-text)]">{message.trim()}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={handleReset}
          className={`ep-cta-control ep-cta-secondary inline-flex items-center justify-center rounded-xl border-2 border-[var(--ep-primary)] px-6 py-3 text-base font-semibold text-[var(--ep-primary)] hover:bg-[var(--ep-primary)] hover:text-[var(--ep-bg)] ${buttonMotion} ${focusRing}`}
        >
          Edit message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--ep-line)] bg-[var(--ep-surface)] p-4 shadow-[0_16px_32px_-24px_rgba(11,46,51,0.45)] sm:p-8"
    >
      <div className="mb-1">
        <h2 className="ep-font-display text-2xl font-semibold tracking-tight text-[var(--ep-text)]">
          Send us a message
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ep-text-muted)]">
          Fill in the details below. You can review your message before sending it once a mail service is connected.
        </p>
      </div>

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
          placeholder="Your full name"
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
          inputMode="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
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
          maxLength={2000}
          minLength={10}
          placeholder="Tell us how we can help…"
          className={`${inputClass} resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className={`ep-cta-control ep-cta-primary inline-flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-[var(--ep-accent)] bg-[var(--ep-accent)] px-7 py-3.5 sm:w-auto text-base font-semibold text-[var(--ep-on-accent)] hover:border-[var(--ep-accent-hover)] hover:bg-[var(--ep-accent-hover)] ${buttonMotion} ${focusRing}`}
      >
        Preview message
      </button>
    </form>
  );
}