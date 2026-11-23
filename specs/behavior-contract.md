# Shared functional contract

## Product schema
`specs/products.json` is the canonical 8-item fixture and default data source. Fields: `id`, `name`, `categoryId`, `kind` (`test`/`course`), `creator`, `ageRange` (test only, otherwise `null`), `startDate` (course only, ISO `YYYY-MM-DD`, otherwise `null`), `format` (`Digitale`, `Cartaceo`, `Corso online`, `In presenza`), `originalPriceCents`, `discountPriceCents`, `image`, `description`. Preserve source order and serialize these same fields from either server-side repository. Local mode runs without credentials or network access. The future Supabase adapter provides the same dataset and contract to the page. See [catalog architecture](catalog-architecture.md).

## Search and filtering
- Initial results 8 and `Tutti` active.
- Categories: `Tutti`, `Clinica e Neuropsicologia`, `Scuola ed Età evolutiva`, `Lavoro e Organizzazioni`, `Formazione`.
- Search product `name` only, using trim + Unicode normalization, casefold/lowercase + remove combining accents; allow partial substring.
- Query and selected category must BOTH match; ordering stable as source JSON.
- Selecting `Tutti` resets category only; clear search resets query only; `Cancella filtri` resets both.
- Show result count, live-region-friendly announcement and empty state in Italian. All without page reload.

## Cards and prices
- Show image with meaningful alt, category, full name, creator label ('Autore/Autrice' vs 'Docente'), age for tests and localized start date for courses, format badge, price before/after, 'Scopri di più'.
- Format EUR using locale `it-IT`, e.g. `1.250,00 €`. Source cents prevent floating-point price errors.
- `Scopri di più` opens the demo product details. A separate icon button adds the product to the demo cart without opening it.

## Demo cart

- The header badge counts all units, including repeated additions. Show an Italian confirmation when a card adds a unit. The header button alone opens the right-hand drawer.
- Store an ordered array of `{ id, quantity }` under `giunti.cart.v1` in origin-local storage. Use canonical IDs and integer quantities from 1 to 99. Ignore invalid rows, unknown IDs and duplicate occurrences after the first valid row. Handle unavailable storage in memory.
- Add and increase by one up to the limit, decrease by one, remove at zero, explicitly remove a line, and clear the entire cart. Disable increases at the limit. Resolve images, names, formats and discount prices from the canonical catalog. Present unit price, quantity, line amount and subtotal in Italian EUR. Perform monetary arithmetic in integer cents.
- Use an accessible modal with the title `Il tuo carrello`, quantity announcements, initial focus inside, contained keyboard navigation and locked background scrolling. Escape, close button, backdrop and `Continua a esplorare` close it and return focus to its trigger. The empty state shows `Il tuo carrello è vuoto` and `Esplora il catalogo e aggiungi i prodotti che ti interessano.` Its `Esplora il catalogo` button closes the modal and moves focus to the catalog.
- Show `Carrello dimostrativo. Gli acquisti non sono disponibili in questa versione.` The drawer simulates selection and quantity management. It has no checkout, payments, shipping or taxes.

## Contact form
- Required trimmed Nome >=2 Unicode characters; valid email; required trimmed Messaggio >=10 Unicode characters.
- Inline errors in Italian, visible, associated with inputs and first invalid input focused on submit.
- On valid submit prevent network submission and show a truthful simulated success state, e.g. `Richiesta simulata correttamente. Nessun messaggio è stato inviato.`
- Keep accessibility and messaging equivalent between the stacks.
- Enable submission only when the client handler is ready. The simulated form keeps values in memory only and has no endpoint or database writes.

## Navigation
Navigation links must target real sections or implemented views (or a clearly labeled placeholder demo without misleading behavior). `Accedi` may be visually non-functional per exercise, but must not masquerade as a working authentication flow.

## Appearance

- Use a native radio group named `Aspetto` with sun, moon and monitor icons and accessible labels `Chiaro`, `Scuro` and `Sistema`. The stored values are `light`, `dark` and `system`. Default to `system` if no valid preference is available. An explicit choice overrides the operating system. `system` follows `matchMedia('(prefers-color-scheme: dark)')` at startup and on changes while the page is open.
- Store the preference, rather than the resolved theme, under `giunti.appearance.v1` in `localStorage`. Each origin remembers its own preference. Both apps use the same key and behavior. Sync open same-origin tabs through `storage`, treating a deleted or invalid value as `system`. If storage is blocked or a write fails, keep the choice in memory for the current page. CSS follows the operating system if JS is unavailable.
- Use the same synchronous inline bootstrap in `<head>` before first paint. Guard storage reads and set `document.documentElement.dataset.theme` to the resolved `light` or `dark`. Expose the chosen preference as `data-theme-preference` on the root for the interactive selector. Keep server markup independent of client preference and initialize the selector from the same preference state without a hydration warning, duplicate control or layout shift. The resolved CSS and native controls match from first paint, including a reload with saved Dark on a Light system. If a Content Security Policy is configured, allow the exact bootstrap via its hash or a nonce.
- After any change, update the root immediately, preserve focus and existing query, filters and form state, and set the selector value to the selected preference. Changes to the operating system have no visual effect while `light` or `dark` is explicit. Keep the selector keyboard operable with a visible focus indicator in both themes. See [design contract](design-contract.md).
