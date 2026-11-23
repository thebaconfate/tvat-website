// TODO: remove after 2026-11-30, together with its entry in the middleware's
// PUBLIC_API_ROUTES. Old URL for creating an order, kept so order forms that were
// opened before the move to /api/krambambouli/orders can still be submitted.
export { POST } from "./orders/index";
