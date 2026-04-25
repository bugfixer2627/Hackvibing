# Task: Project Scaffold Setup

You are Engineer A setting up the project skeleton for "The Passport Pantry" (任意门食盒), an offline HTML5 Canvas app for a hackathon.

## What to do

1. Create the full folder structure:
```
passport-pantry/
├── src/
│   ├── index.html
│   ├── core/
│   │   ├── main.js
│   │   ├── screenManager.js
│   │   ├── inputHandler.js
│   │   └── storage.js
│   ├── data/
│   │   ├── ingredients.js
│   │   ├── destinations.js
│   │   ├── recipes_china.js
│   │   ├── recipes_america.js
│   │   ├── recipes_indonesia.js
│   │   ├── recipes_india.js
│   │   └── recipeEngine.js
│   ├── screens/
│   │   ├── homeScreen.js
│   │   ├── ingredientScreen.js
│   │   ├── travelScreen.js
│   │   ├── recipeScreen.js
│   │   ├── passportScreen.js
│   │   └── shareScreen.js
│   └── render/
│       ├── drawUtils.js
│       ├── foodArt.js
│       └── stampArt.js
├── build.sh
├── dist/
├── CLAUDE.md
├── .gitignore
└── README.md
```

2. Create `src/index.html` — the HTML shell with:
   - `<!DOCTYPE html>` with `lang="zh-CN"`
   - Viewport meta: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
   - CSS reset: `* { margin:0; padding:0; box-sizing:border-box; }`, body with `overflow:hidden; background:#FDF6EC; touch-action:none; user-select:none;`, canvas `display:block; width:100%; height:100%;`
   - A `<canvas id="gameCanvas"></canvas>`
   - An error overlay div (hidden by default): shows "哎呀，出错了，请重启试试吧~" with a 重试 button that reloads
   - NO `<script>` tags — those get injected by build.sh
   - End with `<!-- BUILD_SCRIPTS_HERE -->` comment marker (build.sh replaces this)

3. Create `build.sh`:
   - Takes src/index.html, replaces `<!-- BUILD_SCRIPTS_HERE -->` with all JS files concatenated in dependency order inside a `<script>` tag
   - Dependency order:
     1. core/storage.js, core/inputHandler.js
     2. render/drawUtils.js
     3. data/ingredients.js, data/destinations.js, data/recipes_*.js, data/recipeEngine.js
     4. render/foodArt.js, render/stampArt.js
     5. screens/*.js (home, ingredient, travel, recipe, passport, share)
     6. core/screenManager.js, core/main.js
   - Outputs to dist/index.html
   - Prints file size when done
   - Make it executable (chmod +x)

4. Create stub files for all `src/data/`, `src/screens/`, and `src/render/` files:
   - Each stub should be a comment like `// [filename] - Engineer B/C will implement`
   - This lets the build run immediately without errors

5. Create `.gitignore`:
   ```
   dist/
   .DS_Store
   node_modules/
   *.zip
   ```

6. Create a brief `README.md` with project name, build instructions, and the 3-engineer split

7. Copy the CLAUDE.md from the project root (I'll provide it)

## Verification
- Run `bash build.sh` and confirm it produces `dist/index.html` with no errors
- Open `dist/index.html` in a browser — it should show a cream-colored page with no console errors
- The error overlay should be hidden

## Constraints
- No npm, no node_modules, no dependencies
- Pure vanilla HTML/CSS/JS
- Everything must work when opened as a local file (file:// protocol)
