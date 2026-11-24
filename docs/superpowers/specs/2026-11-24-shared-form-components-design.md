# Shared form components

## Why

The site should have one uniform look and behaviour for its forms. Today that depends on each
page doing it right: 20 raw `<input>`s, 4 raw `<button>`s and 16 hand-written `<label>`s live
outside `src/components/shared/`, each with its own styling and error handling. A change in
one place doesn't reach the others, and every new form can end up slightly different. That's
the brittleness this removes.

## Goals

- Every form control on the site goes through `src/components/shared/`.
- One place to change the look of the form controls.
- Labels and error messages are built the same way everywhere.

## Non-goals

- A new look. The current look stays; once everything goes through the shared components, a
  restyle (and the navigation redesign) is a change in one place.
- Changing what the forms do or validate.

## Anti-goals

- Global element styles (`input { … }`): styles stay in CSS modules, so nothing clashes.
- Hidden links between styles (`composes:`): each component imports what it uses.

## Approaches

- **A. One shared module, imported explicitly (chosen).** `FormControl.module.css` holds the
  shared look (border, padding, hover, focus); `Input`, `Select` and `Textarea` import it, plus
  their own module for anything specific. Explicit, and a restyle is one file.
- **B. `composes:` in each module.** Works with Vite, but the link is hidden in the CSS.
- **C. Three modules sharing only variables.** Least change, but every new rule is added three
  times.

## Design

**Components** (`src/components/shared/`, React, CSS modules):

- `FormControl.module.css`: the shared control style, using the colour variables instead of
  the hard-coded `rgba(100, 53, 152, …)`.
- `Input`, `Select`, `Textarea`: use it. `Input` gets an optional `trailing` slot for something
  inside the end of the field (the show/hide password button on login and the password forms).
- `Checkbox` and `Radio` (new): a control with its label next to it.
- `Field` (new): a label, the control, and an error text; links them for screen readers
  (`htmlFor`/`id`, `aria-describedby`, `aria-invalid`). Used like:

  ```tsx
  <Field label="E-mailadres" error={errorText}>
    <Input type="email" name="email" />
  </Field>
  ```

- `Button`: a visible focus outline (`:focus-visible`).

**Fixes along the way:** no more literal `undefined` class when `className` isn't passed
(`Input`, `Textarea`); delete the unused `krambambouli/dashboard/checkbox/Checkbox.tsx` and the
empty `Dialog.tsx`.

**In two steps.** First the components themselves (above, including the fixes), so they can
be looked at before anything moves to them. Then, once they're approved, the migration below.

**Migration (second step):** the login form, forgot and reset password, the krambambouli order form
(including its radio buttons and quantity steppers), the contact form, the popup, the order
dashboard's checkboxes and the filters already on `Input`/`Select`. `403.astro` is plain Astro
with an `onclick`, so it uses `Button.module.css`'s classes on its own `<button>` instead of the
React component.

## Left to the builder

- Exact markup and class names inside the components.
- How `Field` gets the control's `id` (passed in, or generated with `useId`).
- Small visual differences between forms today: pick the most common one as the shared look,
  and list any page whose look noticeably changes.
