# Branches, commits and releases

## Model

Trunk-based with short-lived branches. `main` is always deployable: it has passed typecheck,
unit tests, build and the end-to-end suite. Anything longer than a day gets its own branch.

```
main
 ├─ feature/core-reader      (merged, v0.1.0)
 ├─ feature/content-pipeline (merged)
 ├─ feature/reader-design    (PR #3)
 └─ feature/tooling-ci       (this branch)
```

## Naming

- `feature/<area>` for new behaviour
- `fix/<area>` for a bug
- `perf/<area>`, `docs/<area>`, `chore/<area>` for everything else

Keep the area short and concrete: `fix/offline-cache`, not `fix/stuff`.

## Commits

Conventional Commits, one logical change per commit, present tense, no full stop:

```
feat(reader): show the chapter title before the paragraph chunk loads
fix(sw): read cached assets with ignoreVary
docs: add the release runbook
```

A commit should build on its own. If a commit needs a sentence of explanation, put it in the body
and say why, not what.

## Pull requests

One pull request per logical change. The body answers:

1. What changed and why.
2. What you ran, with the real output (`npm test`, `npm run test:e2e`, `npm run lighthouse`).
3. What you did not check.
4. For content: which edition, who reviewed it, and whether references are verified.

Squash merge. The pull request title becomes the commit subject, so write it as one.

## Releases

Annotated tags on `main`: `v0.1.0`, `v0.2.0`. Bump `package.json`, add the changelog entry, rebuild
and tag. The version is shown in Settings and comes from `__APP_VERSION__`.

## Reviews

Every pull request needs one review. Content changes need a subject expert as well; their name
goes in the pull request and in the paragraph's `review_note`. See `content/REVIEW.md`.
