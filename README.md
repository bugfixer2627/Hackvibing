# 任意门食盒 · The Passport Pantry

Offline HTML5 Canvas app for the Douyin AI Innovators 2026 hackathon (Ningbo). Pick 2–3 fridge ingredients, see how 4 countries (China, America, Indonesia, India) would cook them, collect stamps in a digital passport, share to WeChat Moments.

## Build

    bash build.sh

Outputs `dist/index.html` — a single self-contained file. No network, no dependencies, no external assets.

## Test

Open `dist/index.html` directly in a mobile browser, or in Chrome DevTools mobile mode (320–430 px portrait).

## File ownership (3-engineer split)

- **Engineer A** — `src/core/*`, `src/index.html`, `build.sh`
- **Engineer B** — `src/data/*`
- **Engineer C** — `src/screens/*`, `src/render/*`

See [CLAUDE.md](./CLAUDE.md) for full project context, constraints, and code style.
