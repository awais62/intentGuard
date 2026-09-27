# IntentSpec: intent-o1udkvwx
Status: **approved**

## Objective
Make API request failures easier to diagnose and less inconsistent. Today the dashboard's three API client modules each handle failure differently: frontend/src/lib/api.ts throws a typed BackendOfflineError for transport failure and a plain Error for non-2xx, frontend/src/lib/chat-client.ts throws plain Errors with hand-written messages, and frontend/src/lib/workspace-client.ts does the same with yet another message (it tells the developer to run `pnpm dev:app` while api.ts says `pnpm dev:server`). On the server side, backend/server/src/app.ts only logs unexpected errors ('Internal server error' at line 313) and logs nothing at all for 4xx/5xx responses raised by handlers, so a failing request leaves no trace. If nothing changes, every failure a developer or user hits is either silently swallowed or reported with a message that varies by call site.

## Outcomes
- All dashboard API failures go through one typed error that carries the HTTP status and the backend's error message, thrown consistently by frontend/src/lib/api.ts, chat-client.ts and workspace-client.ts
- A failure to reach the backend still throws the existing BackendOfflineError from api.ts so app/error.tsx keeps rendering the 'backend did not answer' page
- Every non-2xx API response is logged once on the server with method, path, status and message
- A non-JSON or empty error body no longer produces a message that is an object or undefined; the thrown message is always a non-empty string

## Scope
**In Scope:**
- frontend/src/lib/api.ts
- frontend/src/lib/chat-client.ts
- frontend/src/lib/workspace-client.ts
- backend/server/src/app.ts
- backend/server/test/**

**Out of Scope:**
- backend/core/src/llm/**
- backend/core/src/**
- backend/cli/**
- mcp/**
- frontend/src/app/**
- frontend/src/components/**
- utils/format.ts
- scripts/**

## Edge Cases
- **Backend unreachable (server not started)**: Unchanged behaviour: BackendOfflineError from api.ts so app/error.tsx renders the restart instructions; chat/workspace clients still surface an actionable 'cannot reach the backend' message
- **Non-2xx response whose body is empty, HTML, or JSON without an `error` string**: Thrown error still has a useful, non-empty message containing the status and request path; no 'undefined' or '[object Object]'
- **404 or 400 from api.ts GET (existing contract: treated as null)**: Still returns null rather than throwing, so 'not found' pages keep working
- **Client aborts a chat request via AbortSignal**: AbortError propagates unchanged and is not wrapped or logged as a failure
- **Server handler throws a plain Error (unexpected bug)**: Logged once with method, path, error message and stack, and the client still receives { error: 'Internal server error' } with status 500
- **Malformed JSON request body**: 400 { error: 'Request body must be JSON' } as today, with the log line showing the route and status
