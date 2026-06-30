import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";

import { Section } from "@/components/marketing/section";
import { SectionHeading } from "@/components/marketing/section-heading";
import { FinalCta } from "@/components/marketing/final-cta";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/brand";
import { getAllPosts, getFeaturedPost, blogCategories, type PostMeta } from "@/lib/blog";
import { cn } from "@/lib/utils";

import { NewsletterSignup } from "./newsletter-signup";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field notes on prospecting, AI agents, and building a pipeline that shows its work.",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Decorative card media — a faint dot-grid with the forge-spark centered. */
function PostMedia({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate aspect-video w-full overflow-hidden bg-muted",
        className,
      )}
    >
      <div aria-hidden className="absolute inset-0 bg-dot-grid opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background: "radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <BrandMark className="size-9 opacity-80" />
      </div>
    </div>
  );
}

function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface outline-none transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <PostMedia className="border-b border-border" />
      <div className="flex flex-1 flex-col p-6">
        <Badge variant="primary" className="self-start">
          {post.category}
        </Badge>
        <h3 className="mt-3 text-lg font-semibold leading-snug tracking-[-0.015em] text-foreground">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            {formatDate(post.date)}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            {post.readingTime}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogIndexPage() {
  const featured = getFeaturedPost();
  const rest = getAllPosts().filter((p) => p.slug !== featured.slug);

  return (
    <>
      {/* Header */}
      <Section className="pt-28 sm:pt-32" py="none">
        <Reveal>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="Resources"
            title="The Leadsmith AI blog."
            lead="Field notes on prospecting, AI agents, and building a pipeline that shows its work."
          />
        </Reveal>

        {/* Category chips — presentational; "All" reads as active. */}
        <Reveal delay={0.05}>
          <div
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
            aria-label="Post categories"
          >
            {blogCategories.map((category, i) => (
              <span
                key={category}
                className={cn(
                  "inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                  i === 0
                    ? "border-transparent bg-primary-soft text-primary"
                    : "border-border bg-surface text-muted-foreground",
                )}
              >
                {category}
              </span>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* Featured post */}
      <Section py="sm">
        <Reveal>
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid overflow-hidden rounded-2xl border border-border bg-surface outline-none transition-[border-color] duration-200 hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:grid-cols-2"
          >
            <PostMedia className="border-b border-border lg:border-b-0 lg:border-r" />
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="flex items-center gap-2">
                <Badge variant="primary">{featured.category}</Badge>
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  Featured
                </span>
              </div>
              <h2 className="mt-4 text-balance text-[clamp(1.5rem,2.6vw,2.125rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground">
                {featured.title}
              </h2>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{featured.author.name}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(featured.date)}</span>
                <span aria-hidden>·</span>
                <span>{featured.readingTime}</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-link">
                Read the post
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </div>
          </Link>
        </Reveal>
      </Section>

      {/* Post grid */}
      <Section py="sm">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <StaggerItem key={post.slug} className="h-full">
              <PostCard post={post} />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Newsletter capture */}
      <Section py="sm">
        <Reveal>
          <NewsletterSignup />
        </Reveal>
      </Section>

      {/* Final CTA */}
      <FinalCta />
    </>
  );
}
