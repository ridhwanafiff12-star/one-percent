---
name: app-workflow
description: Use when the user asks to build a new app or a big new feature "the same way as Kaizen", "guna method yang sama", or names app-workflow. Runs the owner's end-to-end method — grill-me interview, superpowers spec and plan, design approval before build, TDD, fresh final review, gitleaks + semgrep, push to GitHub only when green.
---

# App workflow (the Kaizen method)

The owner chose this method for every new app. Follow the steps in order. Talk to the owner in Bahasa Melayu unless they write in English. Each step names the skill to invoke; if a skill is missing, run `scripts/install-skills.sh` from the `ridhwanafiff12-star/one-percent` repo first (or clone it) — never improvise without it.

## 1. Interview — `grill-me` (→ `grilling`)
Grill the owner in rounds until the design tree is empty: audience, platform, core loop, data, language, name, hosting, look. Recommend an answer for every question. Do not build until the owner confirms the summary.

## 2. Spec and plan — superpowers `writing-plans`
Write `docs/superpowers/specs/<date>-<app>-design.md` (decisions table, screens, data model, security & privacy section) and `docs/superpowers/plans/<date>-<app>.md`. Ask the owner to review, and to choose Native or Subagent-driven execution (recommend one with a reason).

## 3. Design first — `frontend-design`
Before building any UI beyond a throwaway mock: write the token plan (palette, type, layout, the one bold element), render the main screens, and **send the owner screenshots (light and dark, phone width 360px). Wait for approval.** Skipping this was the one mistake on Kaizen.

## 4. Build — superpowers `executing-plans` or `subagent-driven-development` + `test-driven-development`
Every behaviour gets a failing test first, watched failing, then the code. Unit tests for pure logic; Playwright e2e for flows, security (XSS as literal text), offline, and edge cases. Keep a ledger of rulings.

## 5. Final review — fresh reviewer subagent on the most capable model
Give it the diff package, spec, plan, Review Focus and rulings. Re-grade by effect on the person using it. Fix Critical/Important with RED→GREEN tests; report deferred minors.

## 6. Secrets and scans — before every push
- API keys live only in `.env` (gitignored, plus `.env.*`). Never commit, log or hard-code a key. Prefer apps that need no key.
- `gitleaks git . --redact` — must report "no leaks found".
- `semgrep scan` — if `semgrep.dev` is blocked, clone `https://github.com/semgrep/semgrep-rules` and run `--config <rules>/javascript --config <rules>/generic/secrets` (plus the language's folder). Fix real findings with tests; mark intentional ones with `// nosemgrep: <rule> — reason`.

## 7. Push — only when everything is green
Unit + e2e + scans pass → commit → push to `main` on the app's own GitHub repo (the owner creates the empty repo; ask them). For static PWAs, GitHub Pages from `main` / root, then rerun e2e against the live URL. Bump the app version on every release so installed PWAs update.

## Owner's defaults (from Kaizen)
- Android phone; installable PWA preferred, offline-first, data on device, export/import backup.
- Evidence matters: every claim or task in content needs a real, checkable source — never invent citations.
- Explain installs and settings step by step in simple Malay.
