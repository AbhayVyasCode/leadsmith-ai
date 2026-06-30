import type { ReactNode } from "react";
import { Prose } from "@/components/marketing/prose";

/**
 * Article bodies for the blog. Keyed by the slugs in `lib/blog.ts` — keep both
 * in sync. Each entry returns a fully-written, on-voice article rendered inside
 * the shared <Prose> reading column (65ch, 18px, .prose-ls styles).
 */
export const postBodies: Record<string, () => ReactNode> = {
  "team-of-agents-not-one-prompt": () => (
    <Prose>
      <p>
        It is tempting to solve lead discovery with one enormous prompt. Hand a
        capable model your request, a few examples, and a long list of
        instructions, and it will hand back a tidy list of companies. The output
        looks confident. The formatting is perfect. And a good share of it is
        quietly wrong.
      </p>
      <p>
        That gap between how confident an answer sounds and how correct it
        actually is the reason we did not build Leadsmith AI as a single
        mega-prompt. We built it as a team of specialized agents that each do one
        job and check the others.
      </p>

      <h2>Why one prompt struggles</h2>
      <p>
        A single prompt has to do everything at once: interpret your intent,
        search the web, read pages, judge fit, find a contact, and write an
        opener. Each of those is a different skill, and asking one pass to hold
        all of them in its head has predictable failure modes.
      </p>
      <ul>
        <li>
          <strong>It blends steps.</strong> Discovery and judgment get mixed, so
          the model decides a company is a good fit at the same moment it
          invents the company. There is no clean point to check the work.
        </li>
        <li>
          <strong>It rewards confidence over evidence.</strong> A fluent
          paragraph reads as proof. Nothing in the loop is responsible for
          arguing that the paragraph might be wrong.
        </li>
        <li>
          <strong>It is hard to debug.</strong> When a bad lead slips through,
          you cannot tell which part of the reasoning failed. The whole thing is
          one opaque step.
        </li>
      </ul>
      <blockquote>
        A confident answer is not the same as a correct one. The whole point of
        splitting the work is to create places where we can check.
      </blockquote>

      <h2>What the team looks like</h2>
      <p>
        Leadsmith AI runs six agents under a supervisor. Each has a narrow job, a
        clear input, and a clear output the next agent can rely on.
      </p>
      <ul>
        <li>
          <strong>Intent</strong> turns your sentence into a structured
          ideal-customer profile — the dimensions that actually matter for this
          search.
        </li>
        <li>
          <strong>Discovery</strong> finds real candidate companies across the
          open web, not a resold broker list.
        </li>
        <li>
          <strong>Qualify</strong> scores every candidate from 0 to 100 across
          six confidence-weighted dimensions.
        </li>
        <li>
          <strong>Critic</strong> argues against the weak matches and rejects the
          ones whose evidence does not hold up.
        </li>
        <li>
          <strong>Enrich</strong> adds the right contact, role, and email — with
          a confidence rating, never a guess dressed up as a fact.
        </li>
        <li>
          <strong>Outreach</strong> drafts a first message grounded in the same
          evidence that qualified the lead.
        </li>
      </ul>

      <h3>One job each is the whole trick</h3>
      <p>
        When an agent only has to do one thing, you can give it a sharper prompt,
        narrower context, and a measurable output. The qualifier is not
        distracted by writing email copy. The critic is not invested in the
        leads it is reviewing, because it did not find them. That separation is
        what makes the criticism honest.
      </p>

      <h2>What the split actually buys you</h2>
      <p>
        Splitting the work costs more calls and a little more orchestration. Here
        is what you get back for that cost.
      </p>
      <ul>
        <li>
          <strong>A place to disagree.</strong> Because discovery and judgment
          are separate steps, the critic can reject a lead the discovery agent
          was happy with. A single prompt cannot meaningfully argue with itself.
        </li>
        <li>
          <strong>Evidence at every step.</strong> Each agent leaves a trail —
          the profile it built, the pages it read, the scores it assigned, the
          verdict it reached. That trail is what lets the product show its work.
        </li>
        <li>
          <strong>Failures you can see.</strong> When something goes wrong, the
          trace points at the step that failed instead of one inscrutable blob of
          output.
        </li>
      </ul>

      <h2>The honest trade-off</h2>
      <p>
        A team of agents is not free. It is slower than a single shot and there
        is real engineering in handing context cleanly from one agent to the
        next. We think it is worth it, because the alternative is a list you have
        to re-check by hand — which is the exact work you were trying to avoid.
      </p>
      <p>
        The goal was never the most impressive-sounding answer. It was an answer
        you can trust because you can see how it was reached. A team that checks
        itself gets there. One prompt, however large, does not.
      </p>
    </Prose>
  ),

  "plain-english-beats-boolean-icp": () => (
    <Prose>
      <p>
        Most prospecting tools ask you to define your ideal customer with
        filters: an industry dropdown, an employee-count slider, a stack of
        boolean AND/OR clauses. It feels precise. In practice it forces you to
        know the answer before you are allowed to ask the question.
      </p>
      <p>
        Describing your buyer in a plain sentence is faster, clearer, and — once
        you see why — more precise, not less.
      </p>

      <h2>The problem with boolean filters</h2>
      <p>
        Boolean search assumes the world is already neatly tagged, and that you
        know which tags to combine. Both assumptions break the moment your ICP is
        even slightly specific.
      </p>
      <ul>
        <li>
          <strong>It only filters what someone pre-labeled.</strong> If
          &ldquo;uses HubSpot&rdquo; or &ldquo;has no careers page&rdquo; is not a
          field in the database, you cannot filter on it — no matter how central
          it is to your fit.
        </li>
        <li>
          <strong>It hides the gap between intent and structure.</strong> You
          want &ldquo;early-stage fintechs starting to sell.&rdquo; The form makes
          you translate that into Industry = Financial Services, Headcount 11–50,
          and hope the mapping holds.
        </li>
        <li>
          <strong>It silently drops the long tail.</strong> A company that fits
          perfectly but is mis-tagged simply never appears, and you never know it
          was there.
        </li>
      </ul>

      <h2>Why a sentence is more precise</h2>
      <p>
        This is the part that sounds backwards. A sentence feels vague and a
        filter feels exact, so surely the filter wins. The catch is that the
        filter is only exact about the fields it has, and your real ICP almost
        always includes things those fields cannot express.
      </p>
      <blockquote>
        Boolean is precise about the wrong things. A sentence is precise about
        the things you actually care about.
      </blockquote>
      <p>
        When you write &ldquo;e-commerce brands in the EU with weak SEO,&rdquo;
        you are not asking for a tag. You are describing an observable condition.
        Leadsmith AI&rsquo;s intent agent reads that sentence and turns it into a
        structured profile — the dimensions to score, the signals to look for —
        then the discovery and qualify agents go and check those signals on real
        pages. The precision lives in the evaluation, not in a dropdown.
      </p>

      <h3>What a good sentence contains</h3>
      <p>
        You do not need to learn a query language, but a few habits make your
        description sharper.
      </p>
      <ul>
        <li>
          <strong>Name the type of company.</strong> &ldquo;B2B SaaS,&rdquo;
          &ldquo;agencies,&rdquo; &ldquo;e-commerce brands&rdquo; — the category
          anchors the search.
        </li>
        <li>
          <strong>Add the qualifier that matters most.</strong> A stage, a
          region, a tool, a missing thing. This is usually the signal a boolean
          form cannot hold.
        </li>
        <li>
          <strong>Describe a condition, not just an attribute.</strong>
          &ldquo;hiring their first sales rep&rdquo; or &ldquo;without a careers
          page&rdquo; tells the agents what evidence to go find.
        </li>
      </ul>

      <h2>Examples that translate well</h2>
      <ul>
        <li>&ldquo;Series A fintechs hiring their first sales rep&rdquo;</li>
        <li>&ldquo;agencies in Texas using HubSpot&rdquo;</li>
        <li>&ldquo;B2B SaaS companies without a careers page&rdquo;</li>
        <li>&ldquo;e-commerce brands in the EU with weak SEO&rdquo;</li>
      </ul>
      <p>
        None of those is a clean row of filters. Each is a clear instruction a
        person could act on — and that is exactly what the agents need.
      </p>

      <h2>When filters still help</h2>
      <p>
        Plain English is not magic, and we will not pretend it is. If your only
        constraint genuinely is &ldquo;US companies, 50–200 employees,&rdquo; a
        filter expresses that fine. The advantage shows up the moment your ICP
        depends on a behavior, a context, or an absence — the things that make a
        lead actually fit. Describe those in a sentence, and let the agents do the
        checking.
      </p>
    </Prose>
  ),

  "demand-the-evidence-behind-lead-scores": () => (
    <Prose>
      <p>
        A lead score of 87 looks authoritative. It is a precise number on a clean
        scale, and it invites you to act. But a number from 0 to 100 means
        nothing on its own. 87 out of what? Weighted how? Based on which
        evidence? If you cannot answer those, the score is decoration.
      </p>
      <p>
        You should expect any tool that scores your leads to show the work behind
        the number. Here is what that looks like, and why the missing pieces
        matter.
      </p>

      <h2>A number without reasoning is a guess in a suit</h2>
      <p>
        Black-box scores have one job: to feel trustworthy enough that you stop
        asking questions. The problem is that they collapse a messy judgment into
        a single digit and then hide everything that went into it.
      </p>
      <ul>
        <li>
          <strong>You cannot tell what it measured.</strong> Two leads scored 70
          might be 70 for completely different reasons — one on strong fit, one on
          a single weak signal padded out.
        </li>
        <li>
          <strong>You cannot tell how sure it is.</strong> A confident 70 and a
          shaky 70 look identical. Confidence is exactly the thing a bare number
          throws away.
        </li>
        <li>
          <strong>You cannot correct it.</strong> If a score is wrong and you
          cannot see why, you have no way to adjust your judgment for the next
          one.
        </li>
      </ul>

      <h2>What we show with every score</h2>
      <p>
        Leadsmith AI scores each lead across six dimensions, and every score
        arrives with the things that produced it.
      </p>
      <ul>
        <li>
          <strong>The six dimensions.</strong> The score is not one opaque
          number; it is a breakdown you can read, so you can see whether the fit
          is on the dimension you care about most.
        </li>
        <li>
          <strong>The evidence.</strong> The specific signals the agents found —
          the page, the phrase, the fact — that moved each dimension up or down.
        </li>
        <li>
          <strong>The confidence.</strong> How sure the qualifier is, separately
          from how high the score is. A high score with low confidence is a flag,
          not a green light.
        </li>
        <li>
          <strong>The critic&rsquo;s verdict.</strong> An adversarial agent that
          tried to argue the lead down, and what it concluded.
        </li>
      </ul>
      <blockquote>
        The score is the summary. The evidence is the argument. You should always
        be able to read the argument.
      </blockquote>

      <h3>Why confidence has to be separate</h3>
      <p>
        This is the piece most tools skip. A score answers &ldquo;how good is the
        fit?&rdquo; Confidence answers &ldquo;how much should you trust that
        answer?&rdquo; They are different questions, and merging them is how a
        thin guess ends up looking like a strong match. When confidence is shown
        on its own, a 90 built on one ambiguous signal stops impersonating a 90
        built on five clear ones.
      </p>

      <h2>How to read a score critically</h2>
      <p>
        Whatever tool you use, a few questions separate a real score from a
        decorative one.
      </p>
      <ul>
        <li>Can I see the dimensions that make it up?</li>
        <li>Can I see the evidence for each one?</li>
        <li>Is confidence reported separately from the score?</li>
        <li>Did anything actually challenge the result?</li>
      </ul>
      <p>
        If the answer to any of those is no, treat the number as a starting point,
        not a verdict.
      </p>

      <h2>The standard to hold</h2>
      <p>
        We are not arguing that scores are bad. A good score saves you real time.
        We are arguing that a score you cannot inspect is asking for trust it has
        not earned. Demand the evidence — the dimensions, the signals, the
        confidence, the critique. If a tool will not show you why, the number is
        the one thing you should not believe.
      </p>
    </Prose>
  ),

  "how-the-critic-agent-kills-bad-leads": () => (
    <Prose>
      <p>
        Most lead tools are built to maximize one thing: volume. More companies,
        bigger lists, larger numbers on the dashboard. That incentive has a quiet
        cost — nothing in the system is responsible for saying a lead is not good
        enough.
      </p>
      <p>
        So we added an agent whose only job is to disagree. The critic does not
        find leads or score them. It argues against them. Here is how it works and
        why it makes the list you see shorter and better.
      </p>

      <h2>The conflict of interest in most pipelines</h2>
      <p>
        When the same process that finds a lead also decides whether to keep it,
        you have a built-in bias toward keeping it. The model that just produced a
        confident-looking match is not the model you want grading that match. It
        has already committed.
      </p>
      <blockquote>
        You do not get honest criticism from the thing that produced the work.
        You get it from something that had no part in producing it.
      </blockquote>
      <p>
        That is the whole reason the critic is a separate agent. It did not run
        discovery and it did not assign the score. It has nothing invested in any
        particular lead surviving, which is exactly what makes its no worth
        something.
      </p>

      <h2>What the critic actually checks</h2>
      <p>
        The critic receives a qualified lead — its dimensions, its evidence, its
        confidence — and then tries to take it apart.
      </p>
      <ul>
        <li>
          <strong>Is the evidence real and relevant?</strong> A signal that
          sounds supportive but does not actually bear on fit gets discounted.
        </li>
        <li>
          <strong>Is the evidence thin?</strong> One ambiguous data point
          propping up a high score is a classic weak match, and the critic flags
          it.
        </li>
        <li>
          <strong>Does the confidence match the support?</strong> A confident
          claim resting on little gets challenged on exactly that gap.
        </li>
        <li>
          <strong>Is this the right company at all?</strong> Sometimes discovery
          surfaces a near-miss — right name, wrong business. The critic catches
          the mismatch.
        </li>
      </ul>

      <h3>Reject, flag, or pass</h3>
      <p>
        The critic does not only delete. It can reject a lead outright, flag one
        as weak so you see the caveat, or pass one through cleanly. The middle
        option matters: a borderline lead is not hidden from you, it is handed to
        you with the doubt attached, so you decide with the same information the
        critic had.
      </p>

      <h2>Why a shorter list is the point</h2>
      <p>
        It is easy to be impressed by a tool that returns hundreds of companies.
        It is much more useful to get a smaller set that already survived
        scrutiny. The math is simple: every weak lead the critic removes is time
        you do not spend manually disqualifying it yourself.
      </p>
      <ul>
        <li>
          <strong>Fewer false starts.</strong> You are not chasing companies that
          a second look would have ruled out.
        </li>
        <li>
          <strong>More trust per lead.</strong> When the list is curated, you can
          act on it instead of re-checking it.
        </li>
        <li>
          <strong>Honest caveats.</strong> The ones that are borderline say so,
          rather than hiding among the strong matches.
        </li>
      </ul>

      <h2>What the critic is not</h2>
      <p>
        The critic is not a guarantee, and we will not pretend it makes the list
        perfect. It cannot verify a fact that is not on the open web, and it will
        occasionally be too harsh or too lenient. What it does reliably is apply
        pressure that a volume-first pipeline never applies at all. The leads you
        see are the ones that survived an agent built to argue against them — and
        that is a meaningfully different starting point than a raw list.
      </p>
    </Prose>
  ),

  "cold-outreach-from-real-evidence": () => (
    <Prose>
      <p>
        Personalization at scale has a credibility problem. We have all received
        the message that drops in a company name and a vague compliment, and we
        all delete it in the same second. The &ldquo;personal&rdquo; part is fake,
        and the reader can tell.
      </p>
      <p>
        The fix is not better mail-merge tokens. It is drafting the message from
        the same evidence that qualified the lead in the first place — so the
        specifics are real.
      </p>

      <h2>Why generic personalization fails</h2>
      <p>
        Template personalization fills a blank with a name and calls it relevance.
        It fails because the recipient is not evaluating whether you know their
        company name. They are evaluating whether you understand their situation.
      </p>
      <ul>
        <li>
          <strong>It is interchangeable.</strong> Swap the company and the
          message still works, which is the tell that it was never about that
          company.
        </li>
        <li>
          <strong>It compliments instead of observing.</strong> &ldquo;I love
          what you&rsquo;re building&rdquo; says nothing. A specific observation
          says you looked.
        </li>
        <li>
          <strong>It asks before it earns.</strong> A request for time with no
          demonstrated relevance is just noise in a crowded inbox.
        </li>
      </ul>

      <h2>Drafting from the evidence that qualified the lead</h2>
      <p>
        By the time Leadsmith AI drafts an opener, it already knows a lot about
        why this company is a fit. The qualify and critic agents gathered specific
        evidence — a signal on a page, a condition that matched your ICP. The
        outreach agent writes from that same evidence instead of from a template.
      </p>
      <blockquote>
        The best first line is not a compliment. It is proof that you actually
        looked — the specific thing that made this company a match.
      </blockquote>
      <p>
        That grounding is what makes the difference. The reason the lead qualified
        and the reason to reach out are the same reason, so the message has a real
        hook instead of a generic one.
      </p>

      <h3>What &ldquo;grounded&rdquo; looks like in practice</h3>
      <p>
        A grounded opener references the actual condition that made the company
        fit your search — not a fact lifted from the homepage that any sender
        could have used. If the lead qualified because they are hiring their first
        sales rep, the message can speak to that moment. If it qualified on weak
        SEO, the message can be useful about that. The evidence becomes the angle.
      </p>

      <h2>The draft is a starting point, not a send button</h2>
      <p>
        We are deliberate about this. The outreach agent gives you a first
        message worth reading, but you are the one who knows your voice and your
        offer. The draft is meant to be copied, tweaked, and made yours.
      </p>
      <ul>
        <li>
          <strong>Keep the specific hook.</strong> The grounded observation is the
          part that earns the reply; do not sand it off.
        </li>
        <li>
          <strong>Match your own tone.</strong> Adjust the phrasing until it
          sounds like you, not like a tool.
        </li>
        <li>
          <strong>Make the ask small.</strong> A clear, low-friction next step
          beats a demand for a meeting.
        </li>
      </ul>

      <h2>What it will not do</h2>
      <p>
        Leadsmith AI drafts the opener; it does not send it, and it does not
        promise the reply. It is honest about being a discovery and qualification
        engine rather than a sending platform. What it removes is the blank page
        and the temptation to fake the personal part — because the genuinely
        personal part is already sitting in the evidence.
      </p>
    </Prose>
  ),
};
