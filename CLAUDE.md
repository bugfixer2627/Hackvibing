# The Passport Pantry (任意门食盒)

Offline HTML5 Canvas interactive app for the Douyin AI Innovators 2026 hackathon (Ningbo). Users select 2–3 Chinese fridge ingredients and see how 4 countries (China, America, Indonesia, India) would cook them. Stamps are collected in a digital passport and shared to WeChat Moments.

## Tech Stack
- **Language**: Vanilla JavaScript (ES6+), no frameworks
- **Rendering**: HTML5 Canvas 2D API
- **Persistence**: localStorage only
- **Delivery**: Single index.html (built from multi-file src/ via build.sh)
- **Target**: Douyin in-app WebView, portrait mobile, 320–430px width

## Project Structure
```
src/
├── index.html              # HTML shell (Engineer A)
├── core/                   # App infrastructure (Engineer A)
│   ├── main.js             # Canvas init, render loop, global error handler
│   ├── screenManager.js    # Screen state machine
│   ├── inputHandler.js     # Touch → normalized events
│   └── storage.js          # localStorage wrapper
├── data/                   # Content & logic (Engineer B)
│   ├── ingredients.js      # 15 ingredient definitions
│   ├── destinations.js     # 4 country metadata objects
│   ├── recipes_china.js    # Chinese recipes
│   ├── recipes_america.js  # American recipes
│   ├── recipes_indonesia.js
│   ├── recipes_india.js
│   └── recipeEngine.js     # Ingredient→recipe mapping
├── screens/                # UI screens (Engineer C)
│   ├── homeScreen.js
│   ├── ingredientScreen.js
│   ├── travelScreen.js
│   ├── recipeScreen.js
│   ├── passportScreen.js
│   └── shareScreen.js
└── render/                 # Drawing helpers (Engineer C)
    ├── drawUtils.js
    ├── foodArt.js
    └── stampArt.js
```

## Build & Test
- Build: `bash build.sh` → outputs `dist/index.html`
- Test: open `dist/index.html` on phone or in Chrome DevTools mobile mode
- Final zip: `cd dist && zip -r passport-pantry.zip index.html` (must be < 8MB)

## Critical Constraints (NEVER violate)
- Zero network requests (no fetch, XHR, WebSocket, CDN, external resources)
- No external links or redirects (no `<a>`, no `window.location`)
- No npm dependencies in the output — everything is vanilla JS inlined into one HTML file
- Portrait orientation only, responsive 320–430px, no horizontal scroll
- All assets drawn via Canvas or inline SVG — no image files
- Global try-catch around render loop; show "哎呀，出错了，请重启试试吧~" on error
- No copyrighted IP, no content harmful to minors

## Code Style
- Use `const` / `let`, never `var`
- All modules communicate through the global `APP` state object
- Each screen exports an object with `{ enter, update, render, handleInput }` methods
- Canvas coordinates are always in logical pixels (DPR scaling handled in main.js)
- Use Chinese + English bilingual text for all user-facing content

## File Ownership (avoid merge conflicts)
- **Engineer A** owns: `src/core/*`, `src/index.html`, `build.sh`
- **Engineer B** owns: `src/data/*`
- **Engineer C** owns: `src/screens/*`, `src/render/*`
- Do NOT edit files outside your ownership without coordinating
