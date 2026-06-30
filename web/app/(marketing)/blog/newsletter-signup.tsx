"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Honest newsletter capture for the blog index: one email field, blur-friendly
 * validation, a simulated async submit, then an inline success state plus a
 * sonner toast. No dark patterns — the copy is upfront about cadence.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setStatus("submitting");

    // Simulate an async request — no backend wired up yet.
    await new Promise((resolve) => setTimeout(resolve, 800));

    setStatus("done");
    toast.success("You're on the list.", {
      description: "We'll send the occasional note — nothing more.",
    });
  }

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 sm:px-12 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-dot-grid opacity-50"
        style={{
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 30%, var(--foreground) 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 30%, var(--foreground) 0%, transparent 75%)",
        }}
      />

      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary [&_svg]:size-5">
          <Mail aria-hidden />
        </span>
        <h2 className="mt-5 text-balance text-[clamp(1.5rem,2.5vw,2rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
          Field notes, now and then.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Occasional notes on prospecting, AI agents, and building a pipeline
          that shows its work. No spam.
        </p>

        {status === "done" ? (
          <div
            role="status"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-transparent bg-success-soft px-4 py-2 text-sm font-medium text-success"
          >
            <Check className="size-4" aria-hidden />
            You&rsquo;re on the list.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-7 flex w-full flex-col items-stretch gap-3 sm:flex-row"
          >
            <div className="flex-1 text-left">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                disabled={status === "submitting"}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "newsletter-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
              {error ? (
                <p
                  id="newsletter-error"
                  className="mt-2 flex items-center gap-1.5 text-sm text-danger"
                >
                  {error}
                </p>
              ) : null}
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={status === "submitting"}
              className="shrink-0 sm:w-auto"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Subscribing
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight aria-hidden />
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
