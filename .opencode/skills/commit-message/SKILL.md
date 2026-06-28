---
name: commit-message
description: Draft and validate git commit messages with a concise imperative subject, a wrapped what/why body, and correctly formatted co-author trailers. Use when writing or reviewing commit messages.
---

# Commit Messages

Use this skill when the task is to draft, rewrite, or validate a git
commit message.

This skill focuses on commit message text. It does not decide what to
stage, whether to create a commit, or whether a commit should be
pushed.

When this message is later passed to `git commit`, preserve real
newlines. Do not serialize paragraph breaks as literal `\n` sequences.

## What I do

- Draft commit messages from a diff summary or change description
- Rewrite vague or noisy messages into concise, specific ones
- Validate subject tone, commit conventions, body structure, and trailer formatting
- Add the current agent as a co-author using a stable no-reply address
- Prefer repo-local commit conventions when they are explicitly documented

## When to use me

Use this skill when the user asks things like:

- "Write a commit message for this"
- "Can you clean up this commit message?"
- "Does this commit message follow our guidelines?"
- "Summarize these changes as a commit"
- "Add a co-author trailer for the agent"

## Default stance

- Follow repository-local commit conventions first when they exist.
- Otherwise write a short, specific subject in imperative mood.
- Make the subject read naturally after:
  `If applied, this commit will ...`
- For non-trivial changes, include a body that explains what changed and
  why.
- Prefer direct active sentences. When possible, start body sentences
  with imperative verbs.
- Avoid listing files or mechanically narrating the diff.
- Separate body paragraphs with blank lines when needed.
- If there is no clear change context, ask for it instead of inventing
  details.
- If there are no actual changes, do not fabricate a final commit
  message for an empty commit.

## Commit conventions

- Keep the subject line at 50 characters or fewer.
- Leave a blank line after the subject.
- Wrap body paragraphs at 72 characters.
- Do not wrap trailer lines.

## Message workflow

1. Identify the main change and the reason it matters.
2. Write one concise subject that captures the primary intent.
3. Add a body for non-trivial changes that explains what changed and why.
4. Remove file lists, hunk-by-hunk narration, and filler.
5. Add the agent `Co-authored-by:` trailer.
6. Validate the final message against the checklist below.

## Passing Messages To Git

- Return the final commit message as plain multiline text with actual
  line breaks.
- Do not return commit messages with escaped newline sequences like
  `Subject\n\nBody`.
- Do not use `git commit -m "Subject\n\nBody"` because standard shell
  quoting passes literal `\n` characters instead of paragraph breaks.
- Prefer `git commit -F -` with a heredoc when the full message is
  available.
- If using `-m`, use separate `-m` flags for the subject and each
  additional paragraph instead of embedding escaped newlines.

Examples:

Good:

```sh
git commit -F - <<'EOF'
Add date range flags to the log command

Implement date-based filters so users can narrow log output to the
time period they care about.

Reduce manual scanning through long histories when reviewing recent
work.

Co-authored-by: OpenCode (gpt-5.4) <opencode.noreply@opencode.ai>
EOF
```

Also good:

```sh
git commit \
  -m "Add date range flags to the log command" \
  -m "Implement date-based filters so users can narrow log output to the
time period they care about.

Reduce manual scanning through long histories when reviewing recent
work.

Co-authored-by: OpenCode (gpt-5.4) <opencode.noreply@opencode.ai>"
```

Bad:

```sh
git commit -m "Add date range flags to the log command\n\nImplement
date-based filters so users can narrow log output to the time period
they care about.\n\nCo-authored-by: OpenCode (gpt-5.4)
<opencode.noreply@opencode.ai>"
```

## Co-author trailers

Always add the current agent as a `Co-authored-by:` trailer.

Use a stable per-agent no-reply email. Keep the model in the display
name when the model is available from the runtime context.

Format when the model is known:

`Co-authored-by: <Agent Name> (<Model>) <<agent-slug>.noreply@opencode.ai>`

Format when the model is not available:

`Co-authored-by: <Agent Name> <<agent-slug>.noreply@opencode.ai>`

Rules:

- Resolve `<Agent Name>` from the current runtime context, such as
  `OpenCode`, `GitHub Copilot`, or `Bob`.
- Resolve `<Model>` from the current runtime context when available.
- Do not invent a model name.
- Derive `<agent-slug>` from the agent name in lowercase kebab-case.
- Keep the email stable by agent. Do not include the model in the email.
- Preserve existing trailers and append the agent trailer once.
- Keep a blank line between the body and the trailer block.
- If there is no body, keep a blank line between the subject and the
  trailer block.
- Do not add blank lines between trailer lines.
- Do not wrap trailer lines to 72 characters.
- Do not use placeholder values in the final commit message.

Examples:

- `Co-authored-by: OpenCode (gpt-5.4) <opencode.noreply@opencode.ai>`
- `Co-authored-by: GitHub Copilot (gpt-5.4) <github-copilot.noreply@opencode.ai>`
- `Co-authored-by: Bob (claude-sonnet-4) <bob.noreply@opencode.ai>`
- `Co-authored-by: OpenCode <opencode.noreply@opencode.ai>`

## Validation checklist

- The subject is specific and 50 characters or fewer.
- The subject is imperative and reads naturally after
  `If applied, this commit will ...`
- The body explains what changed and why.
- The body avoids file lists and line-by-line narration.
- Body paragraphs are wrapped at 72 characters.
- The final message uses real line breaks, not literal `\n` sequences.
- There is a blank line before the trailer block.
- Existing trailers are preserved.
- The current agent trailer is present exactly once.
- Trailer lines are left unwrapped.

## Templates

For a standard commit:

```text
<Imperative subject under 50 chars>

<Explain what changed and why. Wrap at 72 characters.>

Co-authored-by: <Agent Name> (<Model>) <<agent-slug>.noreply@opencode.ai>
```

For a tiny obvious change when a body is unnecessary:

```text
<Imperative subject under 50 chars>

Co-authored-by: <Agent Name> (<Model>) <<agent-slug>.noreply@opencode.ai>
```

If the model is unavailable, omit it:

```text
Co-authored-by: <Agent Name> <<agent-slug>.noreply@opencode.ai>
```

## Examples

Good:

```text
Add filter by date functionality

Implement --since, --today, --week, and --month flags for the log
command to allow filtering entries by date range.

Allows users to quickly view accomplishments from specific time
periods without manually searching through all entries.

Co-authored-by: OpenCode (gpt-5.4) <opencode.noreply@opencode.ai>
```

Good:

```text
Refactor into internal package structure

Extract commands, models, and utilities from monolithic main.go
into a clean internal package structure following Go best
practices. Improves code organization, maintainability, and
separation of concerns.

The new structure makes it easier to test individual components,
add new commands, and maintain clear boundaries between different
parts of the application. Package naming uses domain-specific
terms (entries, models, commands) for better code readability.

Co-authored-by: OpenCode (gpt-5.4) <opencode.noreply@opencode.ai>
```

Rewrite vague subjects into specific ones:

- `Updated files` -> `Add filter by date functionality`
- `Refactored code` -> `Refactor into internal package structure`
- `Fixed bug` -> `Fix crash when log file is missing`

Prefer what/why over file narration.

Bad:

```text
Update CLI files

Change cmd/root.go and main.go. Add new flags. Update tests.

Co-authored-by: OpenCode (gpt-5.4) <opencode.noreply@opencode.ai>
```

Better:

```text
Add date range flags to the log command

Implement date-based filters so users can narrow log output to the
time period they care about.

Reduce manual scanning through long histories when reviewing recent
work.

Co-authored-by: OpenCode (gpt-5.4) <opencode.noreply@opencode.ai>
```

## Common mistakes

- Using past tense or gerunds instead of imperative mood
- Writing vague subjects like `Update stuff` or `Fix things`
- Writing subject lines longer than 50 characters
- Explaining the diff file-by-file instead of the change intent
- Leaving body lines unwrapped past 72 characters
- Omitting the blank line before trailers
- Wrapping trailer lines
- Adding the model to the email address instead of keeping a stable
  per-agent email
- Leaving placeholder agent values in the final message
