# Task: Integration Testing & Build Verification

You are Engineer A. Engineers B and C have pushed their code. Run integration testing and fix any issues.

## Step 1: Pull & Build
```bash
git pull origin main
bash build.sh
```
Check that `dist/index.html` exists and note the file size. Must be well under 8MB.

## Step 2: Verify Build Output
Open `dist/index.html` and check:
- [ ] File starts with `<!DOCTYPE html>` and has all the CSS
- [ ] All JS modules are present inside a single `<script>` tag
- [ ] Dependency order is correct (storage before screens, data before recipeEngine, etc.)
- [ ] File ends with `</script></body></html>`
- [ ] No syntax errors in the browser console

## Step 3: Functional Test Checklist

### Core Infrastructure (your code)
- [ ] App boots to home screen, no errors
- [ ] Canvas fills the viewport, cream background renders
- [ ] No horizontal scrollbar at any screen size (test 320px, 375px, 430px)
- [ ] Touching the screen does NOT scroll the page
- [ ] Resizing the window re-scales the canvas
- [ ] Error overlay is hidden during normal operation

### Screen Flow (Engineer C's code, using Engineer B's data)
- [ ] Home screen renders with title, start button
- [ ] Tapping "打开食盒" navigates to ingredient selection
- [ ] Ingredient grid renders with 15 items from INGREDIENTS data
- [ ] Can select 2-3 ingredients (tap to toggle)
- [ ] Cannot select more than 3
- [ ] "开始烹饪!" button appears when 2+ selected
- [ ] Confirming triggers travel animation → recipe card
- [ ] Recipe card shows bilingual content for first destination
- [ ] Swiping left/right switches between 4 destinations
- [ ] "我要试试!" button earns a stamp (check localStorage)
- [ ] Passport screen shows earned stamp(s)
- [ ] Share card generates an image

### Data Integrity (Engineer B's code)
- [ ] `getRecipes(['egg', 'tomato'])` returns 4 recipes (one per country)
- [ ] `getRecipes(['potato', 'onion'])` returns 4 recipes
- [ ] `getRecipes(['tofu', 'mushroom'])` returns 4 recipes (test fuzzy fallback)
- [ ] All recipes have complete bilingual text
- [ ] No undefined or null fields in recipe objects

### Persistence
- [ ] Earn a stamp → refresh page → stamp still appears in passport
- [ ] Enter a name → refresh → name persists on passport cover
- [ ] Reset option clears all data

### Edge Cases
- [ ] Double-tap ingredient rapidly — no double-selection bug
- [ ] Tap stamp button twice — no duplicate stamp
- [ ] Open with no localStorage (private browsing) — app works, just doesn't save
- [ ] Navigate: home → ingredients → recipe → passport → home — no crash

## Step 4: Fix Integration Issues

Common issues to look for:
1. **Undefined globals**: A screen references a function that hasn't loaded yet. Fix by adjusting load order in build.sh.
2. **Missing data fields**: Engineer C renders a field that Engineer B named differently. Align the field names.
3. **Coordinate mismatch**: Touch coordinates don't match visual positions. Check DPR scaling.
4. **Canvas state leaks**: One screen's ctx.save()/restore() is unbalanced, affecting the next screen.
5. **Animation not stopping**: A screen's update() keeps running after exit(). Use a flag or cancel timers in exit().

## Step 5: Final Packaging
```bash
cd dist
zip -r ../passport-pantry.zip index.html
ls -la ../passport-pantry.zip
# MUST be under 8MB (8,388,608 bytes)
```

Test the zip:
```bash
mkdir /tmp/test-deploy && cd /tmp/test-deploy
unzip path/to/passport-pantry.zip
open index.html  # or python3 -m http.server 8080
```

## Step 6: Douyin Upload
1. Go to 抖音虚拟创作平台 interactive space management
2. Create new work → upload zip
3. Scan QR code with Douyin app (v3.8.20+) to test
4. Verify full flow works in Douyin's WebView
