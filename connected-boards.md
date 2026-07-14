# Connected Asana Boards

Use these Asana boards as the current source scope for error-state research in this repo.

| Board | Workspace / Org GID | Project GID | Board GID | URL | Access Check |
| --- | --- | --- | --- | --- | --- |
| Board 1 | `1210495714634447` | `1214215045871819` | `1214223102291097` | https://app.asana.com/1/1210495714634447/project/1214215045871819/board/1214223102291097 | Read verified 2026-07-14 |
| Board 2 | `1210495714634447` | `1214163061817187` | `1214165934399247` | https://app.asana.com/1/1210495714634447/project/1214163061817187/board/1214165934399247 | Read verified 2026-07-14 |

## Usage Notes

- Treat both boards as read-first sources unless the user explicitly requests an Asana write action.
- Keep Asana MCP/API usage below 60 requests per minute.
- Cache extracted findings locally in Markdown before expanding the search.
- Include Asana source links for every error-state finding.
