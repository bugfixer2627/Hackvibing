# Task: Canvas Initialization & Render Loop

You are Engineer A building the core Canvas infrastructure in `src/core/main.js`.

## Context
Read CLAUDE.md for project overview. This file is the app entry point — it runs last in the build order, after all other modules are loaded.

## What to build in `src/core/main.js`

### 1. Global APP State Object
Define the single source of truth that all modules read/write:

```javascript
const APP = {
  // Canvas refs
  canvas: null,
  ctx: null,
  width: 0,          // logical width in CSS pixels
  height: 0,         // logical height in CSS pixels
  dpr: 1,            // device pixel ratio

  // Screen state
  currentScreen: 'home',
  previousScreen: null,

  // User state
  userName: '',
  selectedIngredients: [],   // array of ingredient IDs
  currentRecipes: [],        // output of getRecipes()
  currentRecipeIndex: 0,     // which destination (0-3)
  earnedStamps: [],          // [{recipe_id, destination, earned_at}]

  // Timing
  time: 0,
  deltaTime: 0,
  lastFrameTime: 0,
};
```

### 2. initCanvas()
- Get the `#gameCanvas` element
- Get 2D context
- Read `window.devicePixelRatio` (default 1)
- Set canvas.width/height to `innerWidth * dpr` / `innerHeight * dpr`
- Scale context by dpr so all drawing uses logical CSS pixels
- Store canvas, ctx, width, height, dpr on APP
- Add `resize` event listener that re-runs this sizing logic
- On resize, also call the current screen's `enter()` to recalculate layouts

### 3. loadSavedState()
- Use `Storage.get()` (from storage.js) to load:
  - `pp_user_name` → APP.userName
  - `pp_stamps` → APP.earnedStamps (default [])
- Wrap in try-catch, use defaults on failure

### 4. Main Render Loop
```javascript
function gameLoop(timestamp) {
  try {
    APP.time = timestamp;
    APP.deltaTime = timestamp - APP.lastFrameTime;
    APP.lastFrameTime = timestamp;

    // Clear canvas
    APP.ctx.clearRect(0, 0, APP.width, APP.height);

    // Draw background
    APP.ctx.fillStyle = '#FDF6EC';
    APP.ctx.fillRect(0, 0, APP.width, APP.height);

    // Update & render current screen
    ScreenManager.update();
    ScreenManager.render();

    requestAnimationFrame(gameLoop);
  } catch (err) {
    console.error('Render error:', err);
    showError();
  }
}
```

### 5. showError()
- Show the `#error-overlay` div by adding class `visible`
- Stop the render loop (don't call requestAnimationFrame again)

### 6. init()
The bootstrap function, called on DOMContentLoaded:
```javascript
function init() {
  try {
    initCanvas();
    loadSavedState();

    // Register all screens (these globals are defined by Engineer C's files)
    ScreenManager.register('home', HomeScreen);
    ScreenManager.register('ingredients', IngredientScreen);
    ScreenManager.register('travel', TravelScreen);
    ScreenManager.register('recipe', RecipeScreen);
    ScreenManager.register('passport', PassportScreen);
    ScreenManager.register('share', ShareScreen);

    // Start input handling
    InputHandler.init(APP.canvas);

    // Start on home screen
    ScreenManager.goto('home');

    // Start render loop
    APP.lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
  } catch (err) {
    console.error('Init error:', err);
    showError();
  }
}

document.addEventListener('DOMContentLoaded', init);
```

### 7. Guard against missing screens
Since Engineer C's screen files may not be implemented yet, add safety checks:
- In ScreenManager calls, check if screen exists before calling methods
- Log warnings for missing screens but don't crash
- A stub screen that renders "Screen not implemented" text is acceptable as fallback

## Verification
- `bash build.sh && open dist/index.html`
- Browser shows cream background (#FDF6EC), no errors in console
- Canvas fills the full viewport
- Resizing the window updates canvas dimensions
- No scrollbars appear
- On mobile (or DevTools mobile mode), touch events don't cause page scrolling
