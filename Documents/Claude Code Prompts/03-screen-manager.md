# Task: Screen State Machine

You are Engineer A building the screen manager in `src/core/screenManager.js`.

## Context
Read CLAUDE.md. This module manages which screen is active and calls the correct lifecycle methods. It sits between main.js (which calls update/render each frame) and the individual screen files (built by Engineer C).

## What to build

### Screen Lifecycle
Each screen is an object with 4 optional methods:
```javascript
{
  enter(APP)  { },          // Called once when screen becomes active
  exit(APP)   { },          // Called once when leaving this screen
  update(APP) { },          // Called every frame for logic/animation
  render(APP) { },          // Called every frame for drawing
  handleInput(APP, event) { },  // Called on touch events
}
```

### ScreenManager Implementation

```javascript
const ScreenManager = {
  screens: {},

  register(name, screenObj) {
    this.screens[name] = screenObj;
  },

  goto(name, data) {
    // 1. Exit current screen (if any)
    const prevScreen = this.screens[APP.currentScreen];
    if (prevScreen && typeof prevScreen.exit === 'function') {
      prevScreen.exit(APP);
    }

    // 2. Update state
    APP.previousScreen = APP.currentScreen;
    APP.currentScreen = name;

    // 3. Enter new screen
    const nextScreen = this.screens[name];
    if (nextScreen && typeof nextScreen.enter === 'function') {
      nextScreen.enter(APP, data);
    } else if (!nextScreen) {
      console.warn(`Screen "${name}" not registered`);
    }
  },

  update() {
    const s = this.screens[APP.currentScreen];
    if (s && typeof s.update === 'function') s.update(APP);
  },

  render() {
    const s = this.screens[APP.currentScreen];
    if (s && typeof s.render === 'function') {
      s.render(APP);
    } else {
      // Fallback: render "screen not ready" text
      const ctx = APP.ctx;
      ctx.fillStyle = '#999';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Screen "${APP.currentScreen}" loading...`,
        APP.width / 2, APP.height / 2
      );
    }
  },

  handleInput(event) {
    const s = this.screens[APP.currentScreen];
    if (s && typeof s.handleInput === 'function') {
      s.handleInput(APP, event);
    }
  },

  // Convenience: go back to previous screen
  goBack() {
    if (APP.previousScreen) {
      this.goto(APP.previousScreen);
    }
  },
};
```

### Key design decisions
- The `data` parameter in `goto(name, data)` lets screens pass context (e.g., which recipe to show). Engineer C can use `data` in `enter()`.
- All method calls are guarded with typeof checks — if Engineer C hasn't implemented a method, nothing crashes.
- The fallback render ensures the app never shows a blank screen.

## Verification
- App boots and shows "Screen 'home' loading..." text (since HomeScreen isn't implemented yet)
- Calling `ScreenManager.goto('ingredients')` in the console switches the displayed text
- No errors when transitioning between unregistered screens (just a console warning)
- `ScreenManager.goBack()` returns to the previous screen
