import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";

import { Section } from "@/components/marketing/section";
import { FinalCta } from "@/components/marketing/final-cta";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/brand";
import { posts, getPostBySlug, getAllPosts } from "@/lib/blog";
import { postBodies } from "@/content/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const Body = postBodies[slug];
  const related = getAllPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  return (
    <>
      <article>
        {/* Header */}
        <Section className="pt-28 sm:pt-32" py="none">
          <div className="mx-auto max-w-[65ch]">
            <Reveal>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back to blog
              </Link>

              <div className="mt-6">
                <Badge variant="primary">{post.category}</Badge>
              </div>

              <h1 className="mt-4 font-display text-balance text-[clamp(2.25rem,4.5vw,3.5rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-foreground">
                {post.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>

              {/* Meta row */}
              <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-border pt-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                  <BrandMark className="size-5" />
                </span>
                <div className="mr-2">
                  <p className="text-sm font-medium text-foreground">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">{post.author.role}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" aria-hidden />
                  {formatDate(post.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-4" aria-hidden />
                  {post.readingTime}
                </span>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Body */}
        <Section py="sm">
          <Reveal className="mx-auto max-w-[65ch]">
            {Body ? <Body /> : null}
          </Reveal>
        </Section>

        {/* Author bio */}
        <Section py="sm">
          <Reveal className="mx-auto max-w-[65ch]">
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                <BrandMark className="size-7" />
              </span>
              <div>
                <p className="text-base font-semibold text-foreground">{post.author.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  We&rsquo;re a small team building Leadsmith AI in the open — a
                  free, multi-agent lead-discovery engine that shows its work.
                  These are our notes from the build.
                </p>
              </div>
            </div>
          </Reveal>
        </Section>
      </article>

      {/* Related posts */}
      <Section py="sm">
        <Reveal>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2rem)] font-semibold tracking-[-0.02em] text-foreground">
            Related posts
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.05} className="h-full">
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 outline-none transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Badge variant="primary" className="self-start">
                  {p.category}
                </Badge>
                <h3 className="mt-3 text-base font-semibold leading-snug tracking-[-0.015em] text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {p.excerpt}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-link">
                  Read
                  <ArrowRight
                    className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
      <FinalCta />
    </>
  );
}
