---
name: commit-workflow
description: Guides agents when preparing commits, splitting changes by feature or logical purpose, staging safely, and writing Conventional Commits 1.0.0 messages. Use when reviewing a worktree before commit, grouping independent features, or creating commit messages.
---

# Commit Workflow

Use this skill when preparing changes for commit in this repository. The goal is to produce small, reviewable commits that each have one coherent purpose and follow Conventional Commits 1.0.0. This skill does not add dependencies, hooks, branches, or commits automatically.

## Core Principles

1. Inspect the worktree before changing staging state:
   - Run `git status --short`.
   - Review both the unstaged and staged diffs with `git diff` and `git diff --cached`.
   - Treat the pre-existing worktree state as user-owned unless the user explicitly says otherwise.
2. Each commit contains one feature, fix, documentation update, test change, build change, or other coherent logical purpose.
3. Split independent groups when they can stand alone, including `feat`, `fix`, `docs`, `test`, `refactor`, `build`, `ci`, `chore`, `style`, and `perf` changes.
4. Do not combine unrelated features or maintenance work merely because it is ready at the same time.
5. Never include changes that were already present in the worktree when the workflow started unless the user explicitly requests them.
6. Keep a commit buildable and reviewable where practical. If a dependency, generated file, or lockfile is required for the same change, keep it with that change.

## Staging Workflow

1. Record the initial `git status --short` and inspect the complete diff before staging anything.
2. Group files and hunks by feature or logical purpose. Use `git add -- <file>` for whole files or `git add --patch` for selected hunks.
3. Review the proposed staged content with `git diff --cached` and confirm that every staged line belongs to the intended commit.
4. Run the appropriate checks for that group before committing, such as the focused test, typecheck, build, or lint command. For this TypeScript backend, use `npm run build` when the change affects compiled code and a narrower check when one exists.
5. Create one commit for the reviewed group, then repeat the status, diff, staging, validation, and commit-message review for the next group.
6. Leave unrelated or pre-existing changes unstaged. Do not use destructive Git commands, and do not amend or rebase commits without explicit user approval.

If a shared file contains changes for multiple groups, stage only the required hunks when possible. If the changes cannot be separated cleanly without creating an invalid or misleading commit, stop and tell the user why before committing. When one diff contains several change types, propose the separate commit groups and a message for each rather than silently combining them.

## Conventional Commit Format

Use this format from Conventional Commits 1.0.0:

```text
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

- `type` is a required, lowercase noun such as `feat` or `fix`.
- `scope` is optional. Use a concise, lowercase noun in parentheses to identify the affected area, for example `auth`, `product`, `routes`, or `db`. Omit it when no scope adds useful information.
- `!` is optional and goes immediately before the colon (`feat(api)!: ...`) to signal a breaking change. Use it only when the public API or behavior is incompatible.
- The description is required, short, clear, and imperative where practical. Start it immediately after `: `, keep it focused on the resulting change, and do not end it with a period.
- Separate a body from the description with one blank line. Use the body to explain motivation, important context, or migration detail; do not repeat the summary.
- Separate footers from the body with one blank line. Each footer is a Git trailer in the form `Token: value` or `Token #value`.
- Use `BREAKING CHANGE: <description>` as the breaking-change footer when migration detail is needed. It is case-sensitive, and it may be used alongside `!`.
- Keep other trailers, such as `Reviewed-by: Name` or `Refs: #123`, at the end after the body. Do not invent issue references or attribution.
- Do not use a breaking-change footer for a compatible change. A commit with no body or footer may contain only the single summary line.

## Type Selection

| Type | Use for | Backend example |
| --- | --- | --- |
| `feat` | A user-facing capability | `feat(product): add product creation endpoint` |
| `fix` | A backwards-compatible bug fix | `fix(auth): reject expired refresh tokens` |
| `docs` | Documentation only | `docs: document required database variables` |
| `test` | Adding or correcting tests | `test(access): cover API key permission failures` |
| `refactor` | Behavior-preserving code restructuring | `refactor(shop): move signup logic into service` |
| `build` | Build system or dependency changes | `build: emit compiled server to dist` |
| `ci` | Continuous integration configuration | `ci: run TypeScript build on pull requests` |
| `chore` | Other maintenance with no production behavior change | `chore: update repository metadata` |
| `style` | Formatting or whitespace only | `style: format route declarations` |
| `perf` | A performance improvement | `perf(product): add index for product lookup` |

Examples with a body and footer:

```text
feat(auth): rotate refresh tokens

Rotate the stored token after each successful refresh so a reused token
cannot establish another session.

Refs: #42
```

```text
feat(api)!: require shop identifiers in product requests

BREAKING CHANGE: clients must send `shopId` when creating a product.
```

## Final Review

Before each commit, verify:

- The staged diff contains only the intended feature or logical purpose.
- Pre-existing user changes remain untouched and unstaged unless explicitly included.
- Required generated files or lockfiles are included only when caused by the staged change.
- The message uses a valid lowercase type, an optional useful scope, a concise description, and correctly separated body and trailers.
- `git diff --check` passes, and the relevant project check passes.
- The next independent group has its own staged diff and its own proposed Conventional Commit message.
