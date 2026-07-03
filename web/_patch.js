const fs = require('fs');
let c = fs.readFileSync('app/globals.css', 'utf8');
const marker = '/* Subtle shimmer animation for loading states */';
const idx = c.indexOf(marker);
const insert = '

    /* Premium Display Typography */
    .text-display-xl {
        font-family: var(--font-display);
        font-size: 2.5rem;
        line-height: 1.08;
        letter-spacing: -0.035em;
        font-weight: 650;
    }
    .text-display-lg {
        font-family: var(--font-display);
        font-size: 1.75rem;
        line-height: 1.15;
        letter-spacing: -0.025em;
        font-weight: 625;
    }
    .text-display-md {
        font-family: var(--font-display);
        font-size: 1.25rem;
        line-height: 1.2;
        letter-spacing: -0.02em;
        font-weight: 600;
    }
    .text-overline-sm {
        font-size: 0.625rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    /* Premium Depth Tokens */
    .depth-elevated {
        box-shadow: 0 1px 2px oklch(0 0 0 / 0.04), 0 4px 12px oklch(0 0 0 / 0.06), 0 12px 32px oklch(0 0 0 / 0.04);
    }
    .dark .depth-elevated {
        box-shadow: 0 1px 2px oklch(0 0 0 / 0.2), 0 4px 12px oklch(0 0 0 / 0.24), 0 12px 32px oklch(0 0 0 / 0.16);
    }
    .depth-float {
        box-shadow: 0 2px 4px oklch(0 0 0 / 0.03), 0 8px 24px oklch(0 0 0 / 0.08), 0 24px 48px oklch(0 0 0 / 0.06);
    }
    .dark .depth-float {
        box-shadow: 0 2px 4px oklch(0 0 0 / 0.2), 0 8px 24px oklch(0 0 0 / 0.28), 0 24px 48px oklch(0 0 0 / 0.2);
    }

    /* Premium Glow Effects */
    .glow-primary {
        box-shadow: 0 0 20px var(--primary-soft), 0 0 60px color-mix(in oklch, var(--primary) 8%, transparent);
    }
    .glow-success {
        box-shadow: 0 0 16px var(--success-soft);
    }

    /* Premium Section Divider */
    .section-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, color-mix(in oklch, var(--border) 60%, transparent) 15%, color-mix(in oklch, var(--border) 60%, transparent) 85%, transparent);
        margin: 0;
    }

    /* Bento Grid Helper */
    .bento-hero {
        grid-column: span 2;
        grid-row: span 2;
    }
    @media (max-width: 640px) {
        .bento-hero {
            grid-column: span 1;
            grid-row: span 1;
        }
    }

    ';
c = c.slice(0, idx) + insert + c.slice(idx);
fs.writeFileSync('app/globals.css', c);
console.log('globals.css patched');
