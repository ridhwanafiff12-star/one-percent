# Kaizen — Design Spec (v1)

Agreed with the owner through a grill-me interview on 2026-11-22.

## Purpose

A personal PWA that gives the owner **4 small, evidence-based random tasks per day** — one each in Health, Ibadah, Knowledge and Finance — and shows the compounding effect of getting 1% better every day.

## Product decisions

| # | Decision |
|---|---|
| Audience | Owner only. No accounts, no server. |
| Platform | PWA, installable via "Add to Home Screen". Primary device: **Android**. |
| Hosting | GitHub Pages, new public repo `ridhwanafiff12-star/one-percent` → `https://ridhwanafiff12-star.github.io/one-percent/` |
| App name | **Kaizen** |
| UI language | English |
| Day boundary | Local time, **00:00 → 00:00** next day |
| Tasks per day | 4 — one per category: `health`, `ibadah`, `knowledge`, `finance` |
| Task size | Small, fixed difficulty, 2–10 minutes. No progression in v1. |
| Reroll | 1 per category per day |
| Completion | Tick, plus an optional one-line note (max 140 chars) |
| Task source | Bundled, curated library, ~30–40 tasks per category |
| Evidence | Health/Knowledge/Finance: "Why it works" + a research or reputable-institution source. Ibadah: Islamic, with a Qur'an (surah:ayah) or hadith (collection + number) reference. |
| Finance context | Mostly general; some Malaysia-specific (KWSP/EPF, ASB, zakat, Tabung Haji) |
| No repeats | Shuffle bag per category: no task repeats until every task in that category has appeared once |
| Score | Each day: multiplier ×(1 + 0.01 × done/4). 4/4 = ×1.01, 2/4 = ×1.005. A missed day = ×1 (no penalty). Score starts at ×1.00 on the first day the app is used. |
| Streak | Consecutive days with ≥1 task done. A missed day resets it. Today not-yet-done does not break it. |
| Notifications | None in v1 |
| Visual style | "Warm journal": paper feel, serif type, follows system dark mode |

## Screens (bottom tab bar)

1. **Today** — 4 task cards. Each: category, title, minutes, ✓ done, 🎲 reroll (disabled once used or done), "Why it works" expander with source, optional note field once done.
2. **Progress** — big number (`×1.27 better`), compound curve (SVG), 12-week heatmap (level 0–4 = tasks done), current and best streak.
3. **History & Settings** — past days newest first (tasks, done state, notes); Export backup; Import backup; app version.

## Data ("database")

Single JSON document in `localStorage` under key `kaizen.state`, versioned with `schemaVersion`. Chosen over IndexedDB because data is tiny (≈ 1 KB/day → < 0.5 MB/year), access is synchronous and trivial to test. The app calls `navigator.storage.persist()` so Android does not evict it.

```jsonc
{
  "schemaVersion": 1,
  "firstDay": "2026-11-22",
  "bags": { "health": ["h07", "h12"], "ibadah": [], "knowledge": [], "finance": [] },
  "bestStreak": 0,
  "lastBackupAt": null,
  "days": {
    "2026-11-22": {
      "health":    { "id": "h03", "done": true,  "doneAt": "2026-11-22T08:14:00.000Z", "note": "Felt good", "rerolled": false },
      "ibadah":    { "id": "i11", "done": false, "doneAt": null, "note": "", "rerolled": true },
      "knowledge": { "...": "..." },
      "finance":   { "...": "..." }
    }
  }
}
```

Task library entries (code, not storage): `{ id, category, title, minutes, why, source: { label, url? } }`. Ids are stable forever (`h01`, `i01`, `k01`, `f01`…); storage only holds ids.

## Security & privacy

No backend, so the threat surface is: the page itself, the backup file, and local storage.

1. **XSS via notes or imported data** — all user/imported text rendered with `textContent`; `innerHTML` is banned in `src/` (enforced by a test).
2. **Content Security Policy** (meta tag): `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`. No inline scripts, no CDNs, fonts self-hosted.
3. **Malicious/malformed backup import** — max 1 MB; strict schema validation; state is rebuilt field-by-field into fresh objects (prevents `__proto__` / prototype pollution); invalid file is rejected and existing data is untouched; import asks for confirmation before replacing.
4. **Data loss** — `storage.persist()`; corrupt stored JSON is never overwritten silently (raw copy kept under `kaizen.state.corrupt`); export reminder if no backup in 30 days.
5. **Privacy** — nothing leaves the device; no analytics; the public repo contains code and task library only. Backup files contain notes — Settings warns the user to keep them private.
6. **Transport** — GitHub Pages serves HTTPS only; service worker caches only same-origin app files.
