"""Leadsmith CLI.

    python main.py "mid-sized e-commerce brands in the US with weak SEO"
    python main.py "..." --target-leads 8 --min-score 50 --outreach --out leads.json
    python main.py "https://rustbox.orkait.com/"   # product mode: find its buyers
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.tree import Tree

from leadsmith.config import Settings
from leadsmith.models import RunReport
from leadsmith.pipeline import find

console = Console()


def _add_trace_nodes(parent: Tree, node: dict) -> None:
    label = f"[cyan]{node['name']}[/cyan] [dim]{node['ms']}ms[/dim]"
    attrs = node.get("attrs") or {}
    if attrs:
        label += " [dim]" + " ".join(f"{k}={v}" for k, v in attrs.items()) + "[/dim]"
    branch = parent.add(label)
    for child in node.get("children", []):
        _add_trace_nodes(branch, child)


def _render_trace(report: RunReport) -> None:
    if not report.trace:
        return
    tree = Tree("[bold]Trace[/bold] (agent graph timings)")
    for child in report.trace.get("children", []):
        _add_trace_nodes(tree, child)
    console.print(tree)


def _empty_result_message(report: RunReport, min_score: int) -> str:
    """Explain *why* there are no leads, instead of always blaming the request."""
    reason = report.no_leads_reason()
    if reason == "no_candidates":
        return (
            "No companies were discovered for this profile. Try rephrasing or "
            "broadening the request."
        )
    if reason == "all_known":
        return (
            f"All {report.candidates_found} candidate(s) were already researched "
            "in a previous run and skipped. Try a different request, or clear the "
            "memory store to re-research them."
        )
    if reason == "errors":
        return (
            f"All {report.candidates_found} scanned compan"
            f"{'y' if report.candidates_found == 1 else 'ies'} failed to process — "
            "this is almost always the LLM API rate-limiting or erroring (e.g. "
            "OpenRouter's free-tier daily cap of 50 requests). Add credits, wait "
            "for the daily reset, or check the backend logs, then retry."
        )
    scanned = report.candidates_found - report.candidates_skipped
    return (
        f"Scanned {scanned} new compan{'y' if scanned == 1 else 'ies'}; none "
        f"reached the score gate. Lower --min-score (currently {min_score}) or "
        "broaden the request."
    )


def _render(report: RunReport, show_outreach: bool, min_score: int) -> None:
    icp = report.icp
    console.print()
    console.print(
        Panel(
            f"[bold]{icp.industry}[/bold] | {icp.company_size} | {icp.geography}\n"
            f"Pain points: {', '.join(icp.pain_points) or 'n/a'}\n"
            f"Buying signals: {', '.join(icp.buying_signals) or 'n/a'}",
            title="Ideal Customer Profile",
        )
    )

    if not report.leads:
        console.print(f"[yellow]{_empty_result_message(report, min_score)}[/yellow]")
    else:
        table = Table(title="Qualified Leads", show_lines=True)
        table.add_column("Score", justify="right", style="green")
        table.add_column("Conf", justify="right")
        table.add_column("Company")
        table.add_column("Top contact")
        table.add_column("Outreach angle", max_width=44)
        for lead in report.leads:
            c = lead.contacts[0] if lead.contacts else None
            contact_str = "—"
            if c:
                email = (
                    f"\n[dim]{c.email} ({c.email_confidence})[/dim]" if c.email else ""
                )
                contact_str = f"{c.name}\n[dim]{c.role}[/dim]{email}"
            flags = (
                "\n[yellow]" + ", ".join(lead.flags) + "[/yellow]" if lead.flags else ""
            )
            table.add_row(
                str(lead.overall_score),
                f"{lead.confidence:.2f}",
                f"{lead.company.name}\n[dim]{lead.company.website}[/dim]{flags}",
                contact_str,
                lead.qualification.outreach_angle,
            )
        console.print(table)

        if show_outreach:
            for lead in report.leads:
                if lead.outreach:
                    console.print(
                        Panel(
                            f"[bold]Subject:[/bold] {lead.outreach.subject}\n\n"
                            f"{lead.outreach.body}",
                            title=f"Draft → {lead.company.name}",
                        )
                    )

    m = report.metrics
    console.print(
        f"\n[dim]{report.duration_seconds}s · "
        f"{m.get('waves', 0)} wave(s) · {m.get('total_scanned', 0)} scanned · "
        f"{m.get('llm_calls', 0)} LLM calls · {m.get('embed_calls', 0)} embeds · "
        f"{m.get('cache_hits', 0)} cache hits · {m.get('total_tokens', 0)} tokens · "
        f"~${m.get('estimated_cost_usd', 0)} (free tier: $0)[/dim]"
    )


async def _run(args: argparse.Namespace) -> int:
    request = (args.request or "").strip()
    if not request:
        console.print(
            "[red]Please provide a non-empty request describing who to find.[/red]"
        )
        return 1
    if args.target_leads < 1:
        console.print("[red]--target-leads must be at least 1.[/red]")
        return 1
    if not 0 <= args.min_score <= 100:
        console.print("[red]--min-score must be between 0 and 100.[/red]")
        return 1

    try:
        cfg = Settings().validated()
    except RuntimeError as exc:
        console.print(f"[red]{exc}[/red]")
        return 1

    # Pre-flight the output path before the (expensive) run, so a bad --out can't
    # discard a completed report. Parent directories are created if needed.
    if args.out:
        out_dir = os.path.dirname(os.path.abspath(args.out)) or "."
        try:
            os.makedirs(out_dir, exist_ok=True)
        except OSError as exc:
            console.print(f"[red]Cannot use --out path '{args.out}': {exc}[/red]")
            return 1

    report = await find(
        request,
        cfg=cfg,
        target_leads=args.target_leads,
        mode=args.mode,
        min_score=args.min_score,
        generate_outreach=args.outreach,
        generate_critique=args.critic,
        on_progress=lambda msg: console.print(f"[dim]{msg}[/dim]"),
    )
    _render(report, args.outreach, args.min_score)
    if args.trace:
        _render_trace(report)

    if args.out:
        try:
            with open(args.out, "w", encoding="utf-8") as fh:
                json.dump(report.model_dump(), fh, indent=2, ensure_ascii=False)
        except OSError as exc:
            console.print(f"[red]Failed to write report to {args.out}: {exc}[/red]")
            return 1
        console.print(f"[green]Saved full report to {args.out}[/green]")
    return 0


def main() -> int:
    # Windows consoles default to a legacy codepage (cp1252) that can't encode
    # characters the model emits (em dashes, arrows, …). Make stdout/stderr
    # UTF-8-tolerant so rendering a report never crashes after a completed run.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[union-attr]
        except (AttributeError, ValueError):
            pass

    parser = argparse.ArgumentParser(description="Leadsmith — free AI lead discovery")
    parser.add_argument(
        "request",
        help="Who you want to find, in plain English — or a product URL to find "
        "that product's buyers.",
    )
    parser.add_argument(
        "--target-leads",
        "--max",
        dest="target_leads",
        type=int,
        default=5,
        help="How many qualified leads to find. The pipeline discovers in waves "
        "until it has this many or hits the free-tier scan cap. (--max is a "
        "backward-compatible alias.)",
    )
    parser.add_argument(
        "--mode",
        choices=["auto", "product", "customer"],
        default="auto",
        help="auto: detect a product URL and find its buyers; product: force that; "
        "customer: always treat the request as a customer description.",
    )
    parser.add_argument(
        "--min-score", type=int, default=40, help="Drop leads below this fit score."
    )
    parser.add_argument(
        "--outreach", action="store_true", help="Draft an outreach email per lead."
    )
    parser.add_argument(
        "--critic",
        action="store_true",
        help="Run the Reflexion critic on qualified leads (filters hallucinated fits).",
    )
    parser.add_argument(
        "--trace", action="store_true", help="Print the agent-graph trace tree."
    )
    parser.add_argument("--out", help="Write the full JSON report to this file.")
    args = parser.parse_args()
    return asyncio.run(_run(args))


if __name__ == "__main__":
    sys.exit(main())
