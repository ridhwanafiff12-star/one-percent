# Kaizen

Four small, evidence-based tasks a day — Health, Ibadah, Knowledge, Finance — and a running score of getting 1% better.

**App:** https://ridhwanafiff12-star.github.io/one-percent/

## Install on Android
1. Open the link above in Chrome.
2. Tap ⋮ → **Add to Home screen** (or **Install app**).
3. Open Kaizen from your home screen. It works offline after the first visit.

Your data stays on your phone (no account, no server). Use **History → Export backup** now and then.

## Develop
No build step and no dependencies.

```bash
npm test          # unit tests (node --test)
npm run e2e       # Playwright end-to-end smoke test
npm run serve     # http://localhost:8080
```

When releasing a change, bump the version in `src/version.js`, `package.json` and `CACHE` in `sw.js` (a test enforces they match).
