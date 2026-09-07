import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ChatBubbleIcon } from "../components/icons";

const CONTACT_EMAIL = "rohitinu15@gmail.com";

interface FormState {
  name: string;
  mobile: string;
  email: string;
  message: string;
}

const EMPTY: FormState = { name: "", mobile: "", email: "", message: "" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\d{10}$/;

function buildMailto(form: FormState): string {
  const subject = `TaxCompare — message from ${form.name || "a website visitor"}`;
  const body = [
    `Name: ${form.name}`,
    `Mobile: ${form.mobile}`,
    `Email: ${form.email}`,
    "",
    form.message,
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (form.name.trim().length < 2) errors.name = "Tell us your name.";
  if (!MOBILE_PATTERN.test(form.mobile.trim())) errors.mobile = "Enter a 10-digit mobile number.";
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (form.message.trim().length < 10) errors.message = "Say a little more — at least 10 characters.";
  return errors;
}

const inputClass =
  "w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent)]";

export default function Contact() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);

  function field<K extends keyof FormState>(key: K) {
    return (value: string) => setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSent(false);
      return;
    }
    // No server involved — this just opens the visitor's own email app,
    // addressed to us, with the message pre-filled.
    window.location.href = buildMailto(form);
    setSent(true);
  }

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-6 px-6 py-12">
      <ChatBubbleIcon width={32} height={32} className="text-[var(--accent)]" />

      <div>
        <h1 className="text-[32px] font-semibold">Get in touch</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Found a bug, have a question, or want a feature added? Send a message below — it opens
          your own email app addressed to us, nothing is sent through a server.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.3)] md:p-8"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="contact-name" className="text-sm font-medium">
            Name<span className="text-[var(--error)]"> *</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={form.name}
            onChange={(e) => field("name")(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby="contact-name-error"
            className={inputClass}
          />
          <p id="contact-name-error" className="text-xs text-[var(--error)]" aria-live="polite">
            {errors.name ?? ""}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="contact-mobile" className="text-sm font-medium">
            Mobile number<span className="text-[var(--error)]"> *</span>
          </label>
          <input
            id="contact-mobile"
            type="tel"
            inputMode="numeric"
            value={form.mobile}
            onChange={(e) => field("mobile")(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
            aria-invalid={Boolean(errors.mobile)}
            aria-describedby="contact-mobile-error"
            className={inputClass}
          />
          <p id="contact-mobile-error" className="text-xs text-[var(--error)]" aria-live="polite">
            {errors.mobile ?? ""}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email<span className="text-[var(--error)]"> *</span>
          </label>
          <input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(e) => field("email")(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="contact-email-error"
            className={inputClass}
          />
          <p id="contact-email-error" className="text-xs text-[var(--error)]" aria-live="polite">
            {errors.email ?? ""}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="contact-message" className="text-sm font-medium">
            Message<span className="text-[var(--error)]"> *</span>
          </label>
          <textarea
            id="contact-message"
            rows={5}
            value={form.message}
            onChange={(e) => field("message")(e.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby="contact-message-error"
            className={inputClass}
          />
          <p id="contact-message-error" className="text-xs text-[var(--error)]" aria-live="polite">
            {errors.message ?? ""}
          </p>
        </div>

        <button
          type="submit"
          className="mt-2 min-h-[44px] rounded-[var(--radius-button)] bg-[var(--accent)] px-6 py-2.5 font-medium text-white hover:opacity-90"
        >
          Send message
        </button>

        {sent ? (
          <p role="status" aria-live="polite" className="text-sm text-[var(--accent-text)]">
            Opening your email app with this message filled in…
          </p>
        ) : null}
      </form>

      <Link to="/" className="text-sm font-medium text-[var(--accent-text)] hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
