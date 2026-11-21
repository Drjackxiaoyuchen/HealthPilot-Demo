# Symphony AI visual baseline

Status: **working proposal, awaiting the user's visual acceptance** (2026-11-19).

Keep one scheme across the product: warm ivory canvas, white surfaces, dark copper controls, warm neutral text and serif headings. Improve the detail within this direction. The user has the final say on UI acceptance; publishing a tested revision does not establish acceptance. Do not replace the visual direction or describe it as approved without explicit feedback.

## Shared tokens

The source of truth is `tailwind.config.ts`, with matching global CSS variables in `src/app/globals.css`.

| Purpose                  | Token / value                       |
| ------------------------ | ----------------------------------- |
| Canvas                   | cream / `#F6F1EB`                   |
| Surface                  | white / `#FFFFFF`                   |
| Border                   | cream-300 / `#E8E0D4`               |
| Primary controls         | copper / `#8A644B`                  |
| Primary text             | stone-800 / `#2D2A26`               |
| Secondary text           | stone-600 / `#5E5A55`               |
| Small text               | stone-400 / stone-500 / `#716C66`   |
| Body / labels / metadata | 16 / 14 / 12 px equivalents, in rem |
| Cards / controls         | 16 / 12 px radii                    |

Use copper for interactive emphasis and continuous audit scales. Muted sage/rose/amber are reserved for data semantics, not new section themes. Keep charts' units, denominators and missingness visible. Controls need a visible keyboard focus state; data inspection must be available by selection rather than hover alone. Tables and matrices may scroll inside their own region on narrow screens.

## First daily revision for review

- Shared typography and text/primary-control contrast refined across the app.
- Glucose workspace has section links, grouped controls, a day-by-hour audit with selectable cells and a detailed inspector, consistent export controls, and quieter method disclosure.
- UI acceptance: **pending user review**. Scientific methods and limitations are documented separately in [the CGM audit method](methods/cgm-quality-v1.md).

2026-11-20: Medical Records extends the same cards, fields, controls, typography and colors into a personal source register. No theme or global token change was made. UI acceptance remains pending.

2026-11-21: Genome Tracker uses the same scheme for a source register, neutral classification text, inspection flags, source chronology, responsive identity/source fields and portable evidence tools. No theme tokens changed; UI acceptance remains pending.

Next: collect visual feedback and continue the same scheme in Medicine Checker. Keep scientific validation independent from visual acceptance.
