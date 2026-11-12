# Search assistant on the employer dashboard

## What employers get
- A "Ask the assistant" chat panel on the Find a Nanny page (opens from a button in the corner).
- Employers type a request in their own words, e.g. "verified nanny in Singapore with infant care under $1,000".
- The assistant answers only from askmynanny's own nanny profiles. It never invents nannies, uses outside sources, or answers off-topic questions; it politely steers back to finding a nanny.
- Each answer lists matching nannies as small cards (photo, name, location, verified badge, why she matches) with a "View profile" button that opens her profile page, where employers make contact.
- If nothing matches, it says so and suggests loosening a filter.
- A few starter suggestions are shown when the chat is empty.

## How it stays limited to your site
- The assistant only receives the list of profiles on the site and is told to recommend only from it.
- Every nanny it recommends is checked against your profiles before showing; unknown names are dropped.
- Private details (ID documents, phone, email) are never sent to the assistant.

## Notes
- Uses the built-in AI service, which uses AI credits per question.
- Profiles still come from the current sample data; when real nanny sign-ups are saved, the assistant will search those instead.

## Technical details
- Server function calls the AI gateway with the public nanny fields and the conversation, using a tool call that returns `{ reply, matches: [{ id, reason }] }`.
- Server filters `matches` to known profile ids; client renders cards linking to `/nanny/$id`.
- Chat panel component on `/find`; history kept in memory for the session.
