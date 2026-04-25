# Task: Touch Input Handler

You are Engineer A building the input handler in `src/core/inputHandler.js`.

## Context
Read CLAUDE.md. This module captures raw touch events on the canvas and normalizes them into high-level gesture events that screen modules consume via `handleInput(APP, event)`.

## Normalized Event Format
Every gesture produces an event object like this:
```javascript
{
  type: 'tap',        // 'tap' | 'swipe_left' | 'swipe_right' | 'swipe_up' | 'swipe_down' | 'drag' | 'drag_end' | 'longpress'
  x: 150,             // Current x in Canvas logical pixels
  y: 300,             // Current y in Canvas logical pixels
  startX: 150,        // Where the touch started
  startY: 280,        // Where the touch started
  dx: 0,              // Total delta x from start
  dy: 20,             // Total delta y from start
  timestamp: 1234,    // Event timestamp
}
```

## What to build

### InputHandler object
```javascript
const InputHandler = {
  // Internal state
  _touching: false,
  _startX: 0,
  _startY: 0,
  _startTime: 0,
  _lastX: 0,
  _lastY: 0,
  _longPressTimer: null,
  _longPressFired: false,

  // Configuration
  TAP_MAX_DURATION: 250,    // ms
  TAP_MAX_DISTANCE: 15,     // px
  SWIPE_MIN_DISTANCE: 50,   // px
  LONG_PRESS_DURATION: 500, // ms

  init(canvas) {
    // Add touch event listeners
    canvas.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this._onTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this._onTouchEnd.bind(this), { passive: false });
    canvas.addEventListener('touchcancel', this._onTouchEnd.bind(this), { passive: false });

    // Also handle mouse for desktop testing
    canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
  },

  // Convert page coordinates to canvas logical pixels
  _toCanvasCoords(pageX, pageY) { ... },

  _onTouchStart(e) { ... },
  _onTouchMove(e) { ... },
  _onTouchEnd(e) { ... },

  // Mouse equivalents for desktop testing
  _onMouseDown(e) { ... },
  _onMouseMove(e) { ... },
  _onMouseUp(e) { ... },

  _emit(event) {
    ScreenManager.handleInput(event);
  },
};
```

### Coordinate conversion
```javascript
_toCanvasCoords(pageX, pageY) {
  const rect = APP.canvas.getBoundingClientRect();
  return {
    x: (pageX - rect.left) * (APP.width / rect.width),
    y: (pageY - rect.top) * (APP.height / rect.height),
  };
}
```

### Gesture detection logic

**touchstart / mousedown:**
1. Record startX, startY, startTime
2. Set `_touching = true`, `_longPressFired = false`
3. Start a long-press timer (500ms). If it fires and distance from start < TAP_MAX_DISTANCE, emit a `longpress` event.
4. `e.preventDefault()` to prevent scrolling

**touchmove / mousemove:**
1. If not touching, ignore
2. Calculate current position and delta from start
3. If delta > TAP_MAX_DISTANCE, cancel long-press timer
4. Emit a `drag` event with current position and deltas (screens can use this for real-time dragging)
5. `e.preventDefault()`

**touchend / mouseup:**
1. Clear long-press timer
2. If `_longPressFired`, do nothing (already handled)
3. Calculate total distance and duration
4. Detect gesture:
   - If distance < TAP_MAX_DISTANCE AND duration < TAP_MAX_DURATION → emit `tap`
   - If distance >= SWIPE_MIN_DISTANCE → determine direction:
     - |dx| > |dy| → `swipe_left` (dx < 0) or `swipe_right` (dx > 0)
     - |dy| > |dx| → `swipe_up` (dy < 0) or `swipe_down` (dy > 0)
   - Otherwise → emit `drag_end` (was dragging but not a clear swipe)
5. Reset state

### Important details
- Always call `e.preventDefault()` on touch events to prevent page scrolling/bouncing
- Use `e.touches[0]` for touch coordinates (only track first finger, ignore multi-touch)
- Mouse support is for desktop testing only — touch is primary
- All coordinates must be in Canvas logical pixels (not page pixels)

## Verification
- Open dist/index.html in Chrome DevTools mobile mode
- Tapping anywhere logs a `tap` event (add temporary console.log)
- Swiping left/right produces correct swipe events
- Long-pressing (500ms) produces a longpress event
- The page does NOT scroll, bounce, or show any browser chrome on touch
- Mouse clicks work on desktop for testing
- Coordinates match where you actually touched (test by drawing a dot at event.x, event.y)
