# Asana Error Source Of Truth Instructions

## Purpose

This repo exists to build and maintain a centralized source of truth for product error states and user-facing error messages found in Asana stories, acceptance criteria, comments, and related implementation notes.

The goal is to standardize error handling across product areas by mapping each error state to its scenario, category, user-facing copy, display pattern, affected surface, and source story.

## Asana MCP Usage

Use Asana MCP as a read-first research source. Search Asana for relevant stories, tasks, subtasks, acceptance criteria, comments, and project references. Do not update, delete, move, or create Asana tasks unless the user explicitly asks for a write action.

Respect the team-noted Asana rate limit:

- Keep Asana MCP/API usage below 60 requests per minute.
- Batch searches by keyword and project instead of repeatedly polling tasks.
- Prefer targeted searches over broad crawling.
- Cache findings locally in Markdown before doing another Asana pass.
- When unsure whether more Asana reads are needed, summarize current coverage first and ask before expanding the search.

## Error-State Compilation Task

When asked to compile, audit, map, or standardize error states:

1. Search Asana first using targeted keywords such as `error`, `error state`, `validation`, `invalid`, `required`, `failed`, `unable`, `cannot`, `permission`, `timeout`, `retry`, `not found`, `empty state`, `loading`, and relevant product-area terms.
2. Extract only error-state and error-message evidence from the source material.
3. Record the Asana source link for every finding.
4. Normalize duplicates into a single canonical error where the scenario and message clearly match.
5. Preserve conflicting messages as separate variants until the user approves a standard.
6. Keep categories editable. If the current report columns are not enough, add a proposed column with a short reason.

## Standard Error Fields

Use these fields as the starting schema:

- `Error ID`: Stable local identifier, such as `ERR-AUTH-001`.
- `Category`: Broad type, such as validation, permission, authentication, network, server, empty state, loading, data conflict, unavailable feature, or unknown.
- `Product Area`: Product/module/surface affected.
- `Error Scenario`: What happened from the user's perspective.
- `Trigger / Condition`: Specific condition that causes the error.
- `User-Facing Message`: Exact or proposed copy shown to the user.
- `Display Type`: Toast, inline message, modal, banner, empty state, field validation, blocking page, tooltip, or unknown.
- `Applied To`: Screen, component, workflow, project, platform, or user role where it appears.
- `Source Story`: Asana task/story title and link.
- `Source Location`: Acceptance criteria, description, comment, attachment, design note, or implementation note.
- `Status`: Draft, needs review, standardized, implemented, deprecated, or conflict.
- `Notes`: Open questions, variants, or standardization rationale.

## Output Rules

Write findings in Markdown by default. Keep the report structured as a table plus short notes. Avoid inventing copy. If the source does not include a user-facing message, write `Not specified` and add a note describing the missing detail.

When the report grows too large, split it by product area and keep an index file linking to each area report.
