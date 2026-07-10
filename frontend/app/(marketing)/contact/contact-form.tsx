"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, Check, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPICS = ["Question", "Demo", "Feedback", "Partnership"] as const;
type Topic = (typeof TOPICS)[number];

type FieldKey = "name" | "email" | "message";
type Errors = Partial<Record<FieldKey, string>>;
type Status = "idle" | "submitting" | "done";

type FormState = {
  name: string;
  email: string;
  company: string;
  topic: Topic;
  message: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  company: "",
  topic: "Question",
  message: "",
};

function validateField(key: FieldKey, value: string): string | undefined {
  const v = value.trim();
  if (key === "name") {
    return v ? undefined : "Tell us your name.";
  }
  if (key === "email") {
    if (!v) return "We need an email to reply.";
    return EMAIL_RE.test(v) ? undefined : "Enter a valid email address.";
  }
  // message
  return v ? undefined : "Add a short message so we can help.";
}

/**
 * Contact form: top-aligned labels, blur validation (required + email), inline
 * humane errors wired via aria-invalid/aria-describedby, a no-layout-shift submit
 * button, and an inline success panel plus a sonner toast. Input is preserved on
 * error and the request is simulated — no backend is wired up yet.
 */
export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleBlur(key: FieldKey) {
    const message = validateField(key, form[key]);
    setErrors((prev) => ({ ...prev, [key]: message }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const next: Errors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      message: validateField("message", form.message),
    };
    setErrors(next);

    const firstInvalid = (["name", "email", "message"] as FieldKey[]).find(
      (k) => next[k],
    );
    if (firstInvalid) {
      // Move focus to the first field that needs attention.
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("submitting");

    // Simulate an async request — no backend wired up yet. Input is preserved.
    await new Promise((resolve) => setTimeout(resolve, 900));

    setStatus("done");
    toast.success("Thanks — message sent.", {
      description: "We'll be in touch within 1–2 business days.",
    });
  }

  function reset() {
    setForm(EMPTY);
    setErrors({});
    setStatus("idle");
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-start justify-center rounded-2xl border border-border bg-surface p-8 sm:p-10"
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-success-soft text-success [&_svg]:size-6">
          <Check aria-hidden />
        </span>
        <h2 className="mt-5 text-balance text-[clamp(1.25rem,2vw,1.5rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-foreground">
          Thanks — we&rsquo;ll be in touch.
        </h2>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Your message is on its way. We usually reply within 1&ndash;2 business
          days.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={reset}
          className="mt-7"
        >
          Send another
        </Button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-surface p-6 sm:p-8"
    >
      <div className="flex flex-col gap-5">
        {/* Full name */}
        <Field
          id="contact-name"
          label="Full name"
          required
          error={errors.name}
        >
          <Input
            id="contact-name"
            name="name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={form.name}
            disabled={submitting}
            aria-required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            onChange={(e) => {
              setField("name", e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
            onBlur={() => handleBlur("name")}
          />
        </Field>

        {/* Work email */}
        <Field
          id="contact-email"
          label="Work email"
          required
          error={errors.email}
        >
          <Input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={form.email}
            disabled={submitting}
            aria-required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            onChange={(e) => {
              setField("email", e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
            onBlur={() => handleBlur("email")}
          />
        </Field>

        {/* Company (optional) */}
        <Field id="contact-company" label="Company" optional>
          <Input
            id="contact-company"
            name="company"
            autoComplete="organization"
            placeholder="Acme Inc."
            value={form.company}
            disabled={submitting}
            onChange={(e) => setField("company", e.target.value)}
          />
        </Field>

        {/* Topic */}
        <Field id="contact-topic" label="Topic">
          <select
            id="contact-topic"
            name="topic"
            value={form.topic}
            disabled={submitting}
            onChange={(e) => setField("topic", e.target.value as Topic)}
            className="h-11 w-full rounded-md border border-input bg-surface px-3 text-sm text-foreground transition-[box-shadow,border-color] duration-150 focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        {/* Message */}
        <Field
          id="contact-message"
          label="Message"
          required
          error={errors.message}
        >
          <Textarea
            id="contact-message"
            name="message"
            rows={5}
            placeholder="What can we help with?"
            value={form.message}
            disabled={submitting}
            aria-required
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
            onChange={(e) => {
              setField("message", e.target.value);
              if (errors.message)
                setErrors((p) => ({ ...p, message: undefined }));
            }}
            onBlur={() => handleBlur("message")}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="mt-1 w-full"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Sending
            </>
          ) : (
            <>
              <Send aria-hidden />
              Send message
            </>
          )}
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          We&rsquo;ll only use your details to reply. No marketing list, no
          sharing.
        </p>
      </div>
    </form>
  );
}

/** A labeled field wrapper: top label, optional/required marker, inline error. */
function Field({
  id,
  label,
  required,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="justify-between">
        <span>
          {label}
          {required ? (
            <span aria-hidden className="ml-1 text-danger">
              *
            </span>
          ) : null}
        </span>
        {optional ? (
          <span className="text-xs font-normal text-muted-foreground">
            Optional
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className={cn(
            "flex items-center gap-1.5 text-sm text-danger [&_svg]:size-4 [&_svg]:shrink-0",
          )}
        >
          <AlertCircle aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
