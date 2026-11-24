# Migrate the forms to the shared components (step 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every form control on the site goes through `src/components/shared/`: no raw `<input>`, `<button>`, `<select>`, `<textarea>` or hand-built `<label>` + control pairs outside it.

**Architecture:** Forms keep their `@tanstack/react-form` logic and only change their markup: `Field` + `Input`/`Select`/`Textarea` for labelled controls, `Radio` and `Checkbox` for choices, `Button` for buttons. Each form's own CSS keeps its layout rules and loses the rules that styled controls.

**Tech Stack:** Astro 7, React 19, CSS modules, `@tanstack/react-form` 1.33. Checks: `astro check`, render scripts (esbuild), and the dev server.

**Spec:** `docs/superpowers/specs/2026-11-24-shared-form-components-design.md` (step 2: migration). Step 1's components are on this branch.

## Global Constraints

- Styles stay in CSS modules; no global element selectors. Remove a form's control styling only where a shared component now provides it; keep its layout (rows, columns, spacing).
- Keep every form's behaviour: field names, values, validation, submit handling, `autoComplete`, `required`, ids that other code relies on.
- Copy stays as it is, except visible labels added where a form had only placeholders (in Dutch, like the site).
- No new dependencies.

## Review Focus

- A form submits the same data as before (names and values unchanged).
- Login and reset password: the show/hide toggle still switches the field's `type`, and is reachable with the keyboard.
- The order form's radio groups: choosing pickup or delivery still shows the right follow-up fields.
- The order dashboard's paid/received checkboxes still have an accessible name per order.
- No leftover form CSS overrides the shared look (e.g. `.formContainer input …`).

---

### Task 1: `Checkbox` with a hidden label, and `firstError`

**Files:**
- Modify: `src/components/shared/Checkbox.tsx`, `src/components/shared/Choice.module.css`
- Create: `src/components/shared/firstError.ts`

**Interfaces:**
- Produces: `Checkbox` gains `hideLabel?: boolean`: the label text stays in the markup for screen readers, visually hidden (`.visuallyHidden`).
- Produces: `firstError(errors: unknown[]): string | undefined`: the first error as text; handles strings and objects with a `message`; `undefined` for an empty list or only falsy entries.

- [ ] Write a render check: `Checkbox label="Betaald" hideLabel` renders "Betaald" inside an element with the visually-hidden class; without `hideLabel`, no such class. `firstError([])` → `undefined`; `firstError(["Verplicht"])` → `"Verplicht"`; `firstError([{ message: "Ongeldig" }])` → `"Ongeldig"`; `firstError([undefined, "B"])` → `"B"`.
- [ ] Run it. Expected: FAIL (no `hideLabel`, no `firstError`).
- [ ] Implement both.
- [ ] Run the check and `npx astro check`. Expected: `ok`, `- 0 errors`.
- [ ] Commit `feat: let Checkbox hide its label, and add firstError for form errors`

### Task 2: Login, forgot password and reset password

**Files:**
- Modify: `src/components/web/login/LoginForm.tsx` + `.module.css`, `src/components/web/password/ForgotPasswordForm.tsx` + `.module.css`, `src/components/web/password/ResetPasswordForm.tsx` + `.module.css`

Each field becomes `Field` (labels: "E-mailadres", "Wachtwoord", "Bevestig wachtwoord") + `Input`, keeping `type`, `name`, `id`, `autoComplete`, `required`, placeholder and handlers. The mail icon becomes `Input`'s `trailing` (decorative, `aria-hidden`). The show/hide button becomes a `Button variant="tertiary" type="button"` in `trailing`, with an `aria-label` ("Toon wachtwoord" / "Verberg wachtwoord"). Form-level messages (wrong credentials, server errors) stay where they are. Remove `inputContainer`/`inputIcon`/`container` control styling from the three modules.

- [ ] Run the raw-element check (Task 6's script) on these three files. Expected: FAIL (raw `<input>`/`<button>`).
- [ ] Migrate the three forms and their CSS.
- [ ] `npx astro check` and the dev server: `/login`, `/forgot-password`, `/reset-password` answer 200 and contain the new labels. Expected: `- 0 errors`, 200, labels present.
- [ ] Commit `refactor: build the login and password forms from the shared components`

### Task 3: Contact form

**Files:** Modify `src/components/web/contact/ContactFormPage.tsx` + `.module.css`

The four `<label>`-wrapped controls become `Field` + `Input`/`Textarea`, with the same labels and props; `Field` error from `firstError(field.state.meta.errors)`.

- [ ] Raw-element check on the file. Expected: FAIL (hand-built labels).
- [ ] Migrate it.
- [ ] `npx astro check`; `/contact` answers 200 and contains the four labels.
- [ ] Commit `refactor: build the contact form from the shared components`

### Task 4: Krambambouli order form

**Files:** Modify `src/components/web/krambambouli/KrambambouliForm.tsx` + `.module.css`

- Text fields (first name, last name, e-mail, street, number, bus, postal code, city) → `Field` + `Input`, same props, `Field` error from `firstError`.
- Quantity: the raw number `<input>` → `Input` (keeps `name={`${product.id}-quantity`}`, `type="number"`, handler) with an `aria-label` naming the product; the `Button variant="stepper"`s stay.
- Radio groups (delivery option, pickup location, delivery zone) → `<fieldset>` + `<legend>` (replacing the `<h4>`s) with one `Radio` per option, same `name`, `value`, `checked`, `onChange`, `required`.
- Remove control styling from the module (`.input`, `.radioButton`, `.productInput`, `.formContainer input…`); keep layout.

- [ ] Raw-element check on the file. Expected: FAIL.
- [ ] Migrate it.
- [ ] `npx astro check`; `/krambambouli` answers 200 and contains the labels and radios (with the form enabled in the local database, or by rendering `KrambambouliForm` with sample props in a render check).
- [ ] Commit `refactor: build the krambambouli order form from the shared components`

### Task 5: Order dashboard checkboxes, popup and the 403 page

**Files:** Modify `src/components/app/krambambouli/KrambambouliOrderItem.tsx`, `src/components/popup/Popup.tsx`, `src/pages/403.astro`

- `StatusCheckbox` renders `Checkbox` with `hideLabel` and `label` = its current `aria-label` text.
- Popup's close `<button>` → `Button variant="secondary"`.
- 403's `<button onclick="history.back()">` keeps being a plain `<button>` (Astro, inline handler) with `Button.module.css`'s `button` + `secondary` classes.

- [ ] Raw-element check on the two `.tsx` files. Expected: FAIL.
- [ ] Migrate them and the 403 page.
- [ ] `npx astro check`. Expected: `- 0 errors`.
- [ ] Commit `refactor: use the shared components for the dashboard checkboxes, popup and 403 page`

### Task 6: Nothing raw left

**Files:** a check script outside the repo (the workspace).

The check lists raw `<input`, `<button`, `<select`, `<textarea` and `<label` in `src/**/*.{tsx,astro}` outside `src/components/shared/` and `src/components/dev/`, ignoring 403's `<button` (uses the shared classes, see Task 5). Expected: none.

- [ ] Run it on the whole of `src/`. Expected: no output.
- [ ] `npx astro check` and the dev server: every changed page answers 200.
