# Shared form components (step 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared form controls (one shared control style, `Input` with a trailing slot, `Select`, `Textarea`, new `Checkbox`, `Radio` and `Field`, a focus outline on `Button`) plus a dev-only page to look at them. No form is migrated yet.

**Architecture:** React components in `src/components/shared/`, each styled with CSS modules. `FormControl.module.css` holds the look shared by `Input`, `Select` and `Textarea`, imported explicitly by each. `Field` wraps one control with its label and error text and links them for screen readers.

**Tech Stack:** Astro 7, React 19, CSS modules, TypeScript. No test framework: checks are `astro check` and small render scripts bundled with the repo's esbuild.

**Spec:** `docs/superpowers/specs/2026-11-24-shared-form-components-design.md` (step 1: the components).

## Global Constraints

- Styles only in `.module.css` files; no global element selectors (`input { … }`), no `composes:`.
- Colours from the variables in `src/layouts/Layout.module.css` (`--color-primary`, `--color-danger`, …); transparent variants with `color-mix(in srgb, var(--color-primary) 35%, transparent)`, never hard-coded `rgba(100, 53, 152, …)`.
- Keep the current look of `Input`/`Select`/`Textarea`: 2px border at 35% primary, `border-radius: 8px`, `padding: 0.3rem 0.5rem`, primary border on hover/focus, `0 0 0 3px` focus ring at 15% primary.
- Labels and copy in Dutch, like the rest of the site.
- No new dependencies.

## Review Focus

- A control rendered without `className` gets no literal `undefined` class.
- A control inside `Field` that already has its own `id` keeps it, and the label still points at it.
- `Field` with an error: the control gets `aria-invalid="true"` and `aria-describedby` pointing at the error; without an error, neither.
- The showcase page answers 404 in a production build.
- Text typed into an `Input` with a trailing element never runs under that element.

## Verification helper (used by several tasks)

Render checks are one-off `.tsx` scripts outside the repo, bundled and run like this (from the repo root):

```bash
E=node_modules/.pnpm/esbuild@0.28.2/node_modules/esbuild/bin/esbuild
NODE_PATH="$PWD/node_modules" $E check.tsx --bundle --platform=node --format=esm --jsx=automatic \
  --alias:@=./src --loader:.css=local-css --outfile=check.mjs --log-level=error \
  --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
node check.mjs
```

Each script imports the component, renders it with `renderToStaticMarkup` from `react-dom/server`, and `assert`s on the markup; it prints `ok` when every assertion passes.

---

### Task 1: Shared control style, `Input` (with trailing slot), `Select`, `Textarea`

**Files:**
- Create: `src/components/shared/FormControl.module.css`
- Modify: `src/components/shared/Input.tsx`, `src/components/shared/Select.tsx`, `src/components/shared/Textarea.tsx`
- Modify: `src/components/shared/Select.module.css` (keep only `cursor: pointer`), delete `src/components/shared/Input.module.css` and `src/components/shared/Textarea.module.css` if they end up empty
- Create: `src/components/shared/Input.module.css` only if the trailing slot needs its own rules (wrapper, `padding-inline-end`)

**Interfaces:**
- Produces: `FormControl.module.css` with class `.control` (the shared look) and `.invalid` (border in `--color-danger`, applied when `aria-invalid="true"` via `.control[aria-invalid="true"]`).
- Produces: `Input(props: InputHTMLAttributes<HTMLInputElement> & { trailing?: ReactNode })`, default export, unchanged for existing callers. With `trailing`, renders `<span class=wrapper><input …/><span class=trailing>{trailing}</span></span>` and the input gets enough `padding-inline-end` for the trailing element.
- Produces: `Select` and `Textarea`, default exports, same props as now.
- Produces: a small `cx(...classes: (string | false | null | undefined)[]): string` in `src/components/shared/cx.ts` that joins truthy class names; used by every shared component.

- [ ] **Step 1: Write the render check** `check-controls.tsx`: `Input` without `className` has no `undefined` in its class; `Input` with `className="x"` contains `x`; `Input` with `trailing={<button>👁</button>}` renders the button after the input inside one wrapper; `Select` with `placeholder` renders an empty-value first option; `Textarea` without `className` has no `undefined`.
- [ ] **Step 2: Run it** with the verification helper. Expected: FAIL on the `undefined` class assertions (current code joins `[styles.input, undefined]`).
- [ ] **Step 3: Implement** `cx`, `FormControl.module.css` and the three components as in Interfaces, keeping the current look from Global Constraints.
- [ ] **Step 4: Run the render check and `npx astro check`.** Expected: `ok`, and `- 0 errors`.
- [ ] **Step 5: Commit** `feat: give the form controls one shared style, and a trailing slot on Input`

### Task 2: `Checkbox` and `Radio`

**Files:**
- Create: `src/components/shared/Checkbox.tsx`, `src/components/shared/Radio.tsx`, `src/components/shared/Choice.module.css` (shared by both)

**Interfaces:**
- Consumes: `cx` from Task 1.
- Produces: `Checkbox(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: ReactNode })` and `Radio(...)` with the same props, default exports. Each renders `<label class=choice><input type=checkbox|radio …/><span>{label}</span></label>`; the native input stays (keyboard and screen reader behaviour), styled with `accent-color: var(--color-primary)`, at least 1.25rem, and a visible `:focus-visible` outline.

- [ ] **Step 1: Write the render check** `check-choice.tsx`: `Checkbox label="Betaald" checked readOnly` renders `<input type="checkbox"` with `checked` inside a `<label>` that also contains "Betaald"; `Radio name="levering" value="pickup" label="Afhalen"` renders `type="radio"` with that `name` and `value`; passing `disabled` reaches the input.
- [ ] **Step 2: Run it.** Expected: FAIL, modules don't exist.
- [ ] **Step 3: Implement** both components and `Choice.module.css` as in Interfaces.
- [ ] **Step 4: Run the render check and `npx astro check`.** Expected: `ok`, `- 0 errors`.
- [ ] **Step 5: Commit** `feat: add shared Checkbox and Radio components`

### Task 3: `Field`

**Files:**
- Create: `src/components/shared/Field.tsx`, `src/components/shared/Field.module.css`

**Interfaces:**
- Consumes: `cx` from Task 1; `FormControl.module.css`'s `[aria-invalid="true"]` styling.
- Produces: `Field(props: { label: ReactNode; error?: ReactNode; hint?: ReactNode; className?: string; children: ReactElement })`, default export. It renders a `<label htmlFor={id}>`, the child, then the hint and the error (`role="alert"`, colour `--color-danger`). The id is the child's own `id` prop if it has one, else `useId()`. It passes `id`, and only when relevant `aria-describedby` (ids of hint and error) and `aria-invalid="true"` (when `error` is given), to its single child with `cloneElement`.

- [ ] **Step 1: Write the render check** `check-field.tsx`: `<Field label="E-mail"><Input /></Field>` gives the label a `for` equal to the input's `id`; `<Field label="E-mail"><Input id="email" /></Field>` uses `email` for both; with `error="Ongeldig"` the input has `aria-invalid="true"` and an `aria-describedby` equal to the error element's `id`, and the error has `role="alert"`; without `error` the input has neither attribute.
- [ ] **Step 2: Run it.** Expected: FAIL, module doesn't exist.
- [ ] **Step 3: Implement** `Field` as in Interfaces.
- [ ] **Step 4: Run the render check and `npx astro check`.** Expected: `ok`, `- 0 errors`.
- [ ] **Step 5: Commit** `feat: add a shared Field for a label, a control and its error`

### Task 4: `Button` focus outline, and removing dead components

**Files:**
- Modify: `src/components/shared/Button.module.css`
- Delete: `src/components/shared/Dialog.tsx` (empty), `src/components/krambambouli/dashboard/checkbox/` (unused; check with `grep -rn "dashboard/checkbox" src` that nothing imports it)

**Interfaces:**
- Produces: `.button:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` (no change for mouse users).

- [ ] **Step 1: Check nothing imports the files to delete:** `grep -rn "dashboard/checkbox\|shared/Dialog" src` Expected: no output.
- [ ] **Step 2: Add the focus rule and delete the files.**
- [ ] **Step 3: Run `npx astro check`.** Expected: `- 0 errors`.
- [ ] **Step 4: Commit** `fix: show which button has keyboard focus, and remove unused components`

### Task 5: A dev-only page to look at the components

**Files:**
- Create: `src/pages/dev/components.astro`, `src/components/dev/ComponentsShowcase.tsx`

**Interfaces:**
- Consumes: every component from Tasks 1 to 4, and `Button`'s variants (`primary`, `secondary`, `tertiary`, `danger`, `stepper`).
- Produces: `/dev/components`, which answers `new Response(null, { status: 404 })` when `!import.meta.env.DEV`, and otherwise renders the showcase inside the site's `Layout` with `client:load` (so focus, hover and the show/hide password toggle can be tried).

The showcase shows, each in default, disabled and (where it applies) error state: `Input` (text, e-mail, number), `Input` with a trailing show/hide password button that toggles `type`, `Select` with a placeholder, `Textarea`, `Checkbox` checked and unchecked, a group of three `Radio`s, `Field` with a hint and with an error, and every `Button` variant.

- [ ] **Step 1: Implement** the page and the showcase.
- [ ] **Step 2: Run `npx astro check`.** Expected: `- 0 errors`.
- [ ] **Step 3: Check it in the dev server:** `pnpm astro dev --port 4400`, then `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4400/dev/components` Expected: `200`.
- [ ] **Step 4: Check it's hidden in production:** build the Docker image and request `/dev/components`. Expected: `404`.
- [ ] **Step 5: Commit** `feat: add a dev-only page showing the shared form components`
