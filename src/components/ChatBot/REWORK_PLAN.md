# ChatBot API Rework — Implementation Plan

Status: **plan only, no code changed yet**. Review and confirm before I implement.

## 1. Where the chatbot sits today

`ChatBot` (`index.tsx`) is mounted once inside `NavbarLayout`, which itself is a
layout route (`LoggedInNavbarLayout` in `AppRoutes.tsx`) wrapping most
authenticated pages via `<Outlet />`. So it mounts once per session (it
survives client-side route changes) — but that one mount currently does a lot
of eager work before the user has shown any intent to open the widget.

## 2. Unnecessary / redundant API calls found

### 2.1 Eager session init on mount (`index.tsx:96-98`)
```ts
React.useEffect(() => {
  initChatbotSession()
}, [])
```
This fires the instant `NavbarLayout` mounts — i.e. on login / first
authenticated page load — regardless of whether the user ever clicks the
floating chat button. `initChatbotSession()` alone can issue **up to 4
sequential requests**:
1. `getSession(cachedId)` — only if a session id is cached
2. `listSessions()` — always, to populate the history list
3. `createSession()` — only if no sessions exist at all
4. `listSessions()` again — only after creating a new session
5. `getSession(activeSessionId)` — only if step 1 didn't already fetch it

Every logged-in user pays for #2 (`listSessions`) on every session, even if
they never open the chat. Steps 3-5 are conditional but still avoidable until
the widget is actually opened.

### 2.2 `handleOpen()` refetches sessions every time (`index.tsx:100-109`)
```ts
const handleOpen = () => {
  setIsOpen(true)
  if (!sessionId) {
    initChatbotSession()
  } else {
    handleLoadSessions()   // <- listSessions() again
  }
}
```
Every single click on the floating button re-fetches the full session list,
even though the user hasn't asked to see history — they just opened the chat
window to see the current conversation.

### 2.3 `handleToggleHistory()` also refetches sessions (`ChatWindow.tsx:52-60`)
Opening the History panel calls `onLoadSessions()` unconditionally, so if the
user opened the chat (2.2 already refetched) and then opens history a few
seconds later, that's a third `listSessions()` call for the same data.

### 2.4 Session list refetched after every single message (`index.tsx:227-229`)
```ts
(payload) => {
  ...
  setIsLoading(false)
  void handleLoadSessions()   // <- listSessions() after EVERY message
}
```
This exists only to pick up the backend's auto-generated title on the first
message of a new conversation. It refetches the entire session list after
*every* message in *every* conversation, not just the first one.

## 3. The SSE stream is under-used

`sendMessageStream` (`chatbotService.ts:72-136`) already speaks proper
Server-Sent Events over `fetch` + `ReadableStream`, but the parser only
reacts to two event types:
```ts
if (parsed.type === 'content') onChunk(parsed.delta)
else if (parsed.type === 'structured') onStructured(parsed.payload)
```
Any other `type` the backend might send (e.g. a session-title-updated event,
a `done`/`error` sentinel, token-usage metadata) is silently dropped. This is
almost certainly *why* 2.4 exists as a workaround — the frontend has no way
to learn "the title changed" from the stream itself, so it falls back to a
full REST re-fetch of every session just to notice a title change on one
session.

**Action item before implementing:** confirm with backend whether
`SEND_MESSAGE`'s SSE stream already emits (or could emit) a
`{"type": "session", "title": "..."}` (or similar) event on first-message
auto-naming. If yes, item 4 below (surgical title update) applies. If the
backend doesn't support this yet, we fall back to a lighter fix (only
refetch when the session's current title is still the default placeholder).

## 4. Proposed rework

| # | Change | Removes |
|---|--------|---------|
| A | Move session init from mount-`useEffect` to first `handleOpen()` call (`isInitializing` ref already exists, reuse it as the "never initialized yet" guard) | `getSession`/`listSessions`/`createSession` chain on every page load for users who never open the chat |
| B | `handleOpen()`: only call `handleLoadSessions()` if the sessions list has never been loaded (track via ref/flag), not on every open | 1 `listSessions()` call per re-open |
| C | `handleToggleHistory()`: accept a "already loaded" signal from parent, or have parent own a `sessionsLoaded` flag and only pass a fetcher that's a no-op if fresh (< e.g. 30s old) | duplicate `listSessions()` calls when open → history happens back-to-back |
| D | Replace blanket `handleLoadSessions()` after every send with: only refetch the session list if the *active* session's title is still the default (`'New Conversation'`) — i.e. this was the first message. Once a session has a real title we never refetch again for it. | `listSessions()` call after every subsequent message in an existing conversation |
| E | (Depends on backend) If SSE can emit a title-update event, handle a new `type === 'session'` branch in `sendMessageStream`'s parser and patch the single session in local state directly — no REST call at all for the rename case. | Removes item D's REST call entirely, not just reduces its frequency |

## 5. Net effect

- Opening the app: 0 chatbot API calls (was up to 4).
- First time opening the widget: same calls as today (still needed), but only once, not on every mount.
- Re-opening the widget later in the same session: 0 calls (was 1 `listSessions`).
- Opening History right after opening the widget: 0 extra calls (was 1 more `listSessions`).
- Sending messages in an existing (already-titled) conversation: 0 extra `listSessions` calls (was 1 per message).
- Sending the first message of a brand-new conversation: 1 `listSessions` call (unchanged) unless E is adopted, in which case 0.

## 6. Open questions before I start implementing

1. Can you confirm whether the backend's `SEND_MESSAGE` SSE stream can be
   extended to emit a title-update event (item E)? If it's out of scope
   right now, I'll implement A–D only and leave E as a documented follow-up.
2. Is `ChatBot` expected to preserve currently-open state across a full page
   reload (not just client-side nav)? Today `sessionId` is cached in
   `localStorage`, so a reload always re-runs the eager path once — that's
   fine and unavoidable, just confirming that's acceptable under the new
   lazy-init model too.
