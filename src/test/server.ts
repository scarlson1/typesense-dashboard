import { setupServer } from 'msw/node';

// Shared MSW server. Phase 1 tests don't hit the network, so it starts with
// no handlers. Phase 2 (hook tests) will register Typesense request handlers
// here or per-test via `server.use(...)`.
export const server = setupServer();
