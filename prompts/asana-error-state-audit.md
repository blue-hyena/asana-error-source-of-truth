# Asana Error State Audit Prompt

Use this prompt when starting an Asana MCP pass for the centralized error source of truth.

```text
Use Asana MCP read-only to compile error states and user-facing error messages into a centralized source of truth.

Goal:
Standardize product error handling by mapping all error states mentioned in Asana stories, acceptance criteria, comments, and related notes.

Rate limit:
Keep Asana MCP/API reads below 60 requests per minute. Use targeted searches, batch work, and local notes. Do not poll or crawl broadly.

Search approach:
Start with targeted searches using keywords like:
- error
- error state
- validation
- invalid
- required
- failed
- unable
- cannot
- permission
- timeout
- retry
- not found
- empty state
- loading

For each relevant finding, capture:
- Error ID
- Category
- Product Area
- Error Scenario
- Trigger / Condition
- User-Facing Message
- Display Type
- Applied To
- Source Story
- Source Location
- Status
- Notes

Definitions:
- Category: validation, permission, authentication, network, server, empty state, loading, data conflict, unavailable feature, or unknown.
- Display Type: toast, inline message, modal, banner, empty state, field validation, blocking page, tooltip, or unknown.
- Source Location: description, acceptance criteria, comment, attachment, design note, or implementation note.

Rules:
- Do not write to Asana unless explicitly approved.
- Do not invent user-facing copy. Use "Not specified" when missing.
- Preserve source links for every row.
- Normalize duplicates only when scenario and message clearly match.
- Keep conflicting messages as variants until reviewed.
- If better categories or columns emerge, propose them in the report notes.

Output:
Create or update a Markdown report with a table and a short summary of coverage, gaps, conflicts, and recommended standardization actions.
```
