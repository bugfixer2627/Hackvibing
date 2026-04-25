import {
  Award,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Download,
  Flame,
  ImagePlus,
  Lock,
  Map as MapIcon,
  RefreshCcw,
  Search,
  Share2,
  Sparkles,
  Stamp,
  Trophy,
  Utensils,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ChangeEvent, ReactNode } from "react";
import pantryData from "./data.json";
import chinaStamp from "./assets/stamps/china.svg";
import indiaStamp from "./assets/stamps/india.svg";
import indonesiaStamp from "./assets/stamps/indonesia.svg";
import usaStamp from "./assets/stamps/usa.svg";

type IngredientCategories = Record<string, string[]>;

type RecipeComment = {
  user: string;
  text: string;
};

type Recipe = {
  id: string;
  name: string;
  country: string;
  chineseName: string;
  badgeEmoji: string;
  countryStamp: string;
  description: string;
  prepTime: string;
  requiredIngredients: string[];
  steps: string[];
  history: string;
  flavorProfile: string;
  comments: RecipeComment[];
};

type PantryData = {
  ingredients: IngredientCategories;
  recipes: Recipe[];
};

type StoredPassport = {
  foodBadges: string[];
  countryStamps: string[];
  photos: Record<string, string>;
};

type AppView = "pantry" | "suggestion" | "cooking" | "passport";

const data = pantryData as PantryData;
const STORAGE_KEY = "passport-pantry-state-v1";

const defaultPassport: StoredPassport = {
  foodBadges: [],
  countryStamps: [],
  photos: {}
};

const countryPalette: Record<string, string> = {
  China: "from-red-600 to-amber-500",
  Indonesia: "from-rose-600 to-white",
  "United States of America": "from-sky-700 to-rose-500",
  India: "from-orange-500 to-emerald-600"
};

const countryStampAssets: Record<string, string> = {
  China: chinaStamp,
  Indonesia: indonesiaStamp,
  "United States of America": usaStamp,
  India: indiaStamp
};

const ingredientEmojiMap: Record<string, string> = {
  Apple: "🍎",
  Bacon: "🥓",
  "Basmati rice": "🍚",
  "Bean sprout": "🌱",
  Beef: "🥩",
  Bun: "🍞",
  Butter: "🧈",
  "Cheddar cheese": "🧀",
  Chicken: "🍗",
  Chili: "🌶️",
  "Chili powder": "🌶️",
  "Cold water": "🧊",
  "Coconut milk": "🥥",
  "Cooked rice (day-old)": "🍚",
  "Cooking wine": "🍷",
  "Coriander leaves": "🌿",
  Cucumber: "🥒",
  "Desiccated coconut": "🥥",
  "Dried shrimp": "🦐",
  Egg: "🥚",
  "Elbow macaroni": "🍝",
  Garlic: "🧄",
  "Garlic powder": "🧄",
  Ghee: "🧈",
  Ginger: "🫚",
  "Green onion": "🌿",
  "Green peas": "🫛",
  "Ground beef": "🥩",
  "Hard-boiled egg": "🥚",
  Lettuce: "🥬",
  "Lemon juice": "🍋",
  Lime: "🍋‍🟩",
  "Lime juice": "🍋‍🟩",
  Milk: "🥛",
  Mint: "🌿",
  Noodles: "🍜",
  Onion: "🧅",
  "Onion powder": "🧅",
  Paneer: "🧀",
  Paprika: "🌶️",
  "Peanut butter": "🥜",
  "Peanut sauce": "🥜",
  Pickle: "🥒",
  Pork: "🥩",
  "Pork ribs": "🍖",
  Potato: "🥔",
  "Red lentils": "🫘",
  "Rice vermicelli": "🍜",
  Salt: "🧂",
  Scallion: "🌿",
  "Sea bass": "🐟",
  Shallot: "🧅",
  Spinach: "🥬",
  Thyme: "🌿",
  Tomato: "🍅",
  Water: "💧"
};

function getStampAsset(country: string) {
  return countryStampAssets[country] ?? usaStamp;
}

function loadPassport(): StoredPassport {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPassport;
    const parsed = JSON.parse(raw) as Partial<StoredPassport>;
    return {
      foodBadges: Array.isArray(parsed.foodBadges) ? parsed.foodBadges : [],
      countryStamps: Array.isArray(parsed.countryStamps) ? parsed.countryStamps : [],
      photos: parsed.photos && typeof parsed.photos === "object" ? parsed.photos : {}
    };
  } catch {
    return defaultPassport;
  }
}

function scoreRecipe(recipe: Recipe, selected: string[]) {
  const required = new Set(recipe.requiredIngredients);
  const directMatches = selected.filter((ingredient) => required.has(ingredient)).length;
  const coverage = directMatches / recipe.requiredIngredients.length;
  const selectedCoverage = directMatches / Math.max(selected.length, 1);
  return directMatches * 10 + coverage * 4 + selectedCoverage * 3 + decisionTreeBonus(recipe, selected);
}

function decisionTreeBonus(recipe: Recipe, selected: string[]) {
  const selectedText = selected.join(" ").toLowerCase();
  const hasAny = (...needles: string[]) => needles.some((needle) => selectedText.includes(needle.toLowerCase()));

  if (hasAny("soy sauce", "noodles", "scallion", "sea bass", "pork") && recipe.country === "China") {
    return 5;
  }

  if (hasAny("kecap manis", "peanut", "coconut", "lemongrass", "turmeric") && recipe.country === "Indonesia") {
    return 5;
  }

  if (hasAny("bbq", "macaroni", "cheddar", "bun", "apple", "clam") && recipe.country === "United States of America") {
    return 5;
  }

  if (hasAny("garam masala", "turmeric", "cumin", "lentils", "paneer", "basmati") && recipe.country === "India") {
    return 5;
  }

  return 0;
}

function matchingRecipes(selected: string[], recipes: Recipe[]) {
  return [...recipes].sort((a, b) => scoreRecipe(b, selected) - scoreRecipe(a, selected));
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [view, setView] = useState<AppView>("pantry");
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [communityRecipeId, setCommunityRecipeId] = useState<string | null>(null);
  const [shareCardDataUrl, setShareCardDataUrl] = useState<string | null>(null);
  const [passport, setPassport] = useState<StoredPassport>(() => loadPassport());
  const [pantryFridgeOpen, setPantryFridgeOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passport));
  }, [passport]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [view]);

  useEffect(() => {
    if (selectedIngredients.length > 0) {
      setPantryFridgeOpen(true);
    }
  }, [selectedIngredients.length]);

  const orderedMatches = useMemo(
    () => matchingRecipes(selectedIngredients, data.recipes),
    [selectedIngredients]
  );

  const suggestion = orderedMatches[suggestionIndex % orderedMatches.length];
  const activeRecipe =
    data.recipes.find((recipe) => recipe.id === activeRecipeId) ?? suggestion ?? data.recipes[0];
  const communityRecipe = communityRecipeId
    ? data.recipes.find((recipe) => recipe.id === communityRecipeId) ?? null
    : null;
  const unlockedCountries = new Set(passport.countryStamps);
  const unlockedBadges = new Set(passport.foodBadges);
  const showAppChrome = view !== "pantry";

  function toggleIngredient(ingredient: string) {
    setSelectedIngredients((current) => {
      if (current.includes(ingredient)) {
        return current.filter((item) => item !== ingredient);
      }
      if (current.length >= 4) {
        return current;
      }
      return [...current, ingredient];
    });
  }

  function findRecipe() {
    if (selectedIngredients.length < 2) return;
    setSuggestionIndex(0);
    setView("suggestion");
  }

  function rerollRecipe() {
    setSuggestionIndex((index) => (index + 1) % orderedMatches.length);
  }

  function cookRecipe(recipe: Recipe) {
    setActiveRecipeId(recipe.id);
    setShareCardDataUrl(null);
    setView("cooking");
  }

  function finishRecipe(recipe: Recipe) {
    setPassport((current) => ({
      foodBadges: Array.from(new Set([...current.foodBadges, recipe.id])),
      countryStamps: Array.from(new Set([...current.countryStamps, recipe.country])),
      photos: current.photos
    }));
    setShowCelebration(true);
    window.setTimeout(() => setShowCelebration(false), 2200);
  }

  function openCommunity(recipeId: string) {
    setShareCardDataUrl(null);
    setCommunityRecipeId(recipeId);
  }

  function handlePhotoUpload(recipe: Recipe, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      setPassport((current) => ({
        ...current,
        photos: {
          ...current.photos,
          [recipe.id]: result
        }
      }));
      setShareCardDataUrl(null);
    };
    reader.readAsDataURL(file);
  }

  async function generateShareCard(recipe: Recipe) {
    const photo = passport.photos[recipe.id];
    if (!photo) return;

    const canvas = canvasRef.current ?? document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isNarrow = window.innerWidth < 640;
    canvas.width = isNarrow ? 800 : 1200;
    canvas.height = isNarrow ? 1200 : 800;

    const gap = isNarrow ? 34 : 36;
    const margin = isNarrow ? 34 : 42;
    const postcardWidth = isNarrow ? canvas.width - margin * 2 : (canvas.width - margin * 2 - gap) / 2;
    const postcardHeight = isNarrow ? (canvas.height - margin * 2 - gap) / 2 : canvas.height - margin * 2;
    const front = { x: margin, y: margin, width: postcardWidth, height: postcardHeight };
    const back = isNarrow
      ? { x: margin, y: margin + postcardHeight + gap, width: postcardWidth, height: postcardHeight }
      : { x: margin + postcardWidth + gap, y: margin, width: postcardWidth, height: postcardHeight };

    ctx.fillStyle = "#eadfce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPaperTexture(ctx, 0, 0, canvas.width, canvas.height, "rgba(45, 41, 38, 0.05)");

    const image = await loadImage(photo);
    drawPostcardFront(ctx, image, front);

    const stampImage = await loadImage(getStampAsset(recipe.country));
    const badgeImage = await loadImage(createFoodBadgeSvg(recipe));
    drawPostcardBack(ctx, recipe, stampImage, badgeImage, back);

    const dataUrl = canvas.toDataURL("image/png");
    setShareCardDataUrl(dataUrl);
  }

  return (
    <main className="app-safe-shell paper-texture min-h-screen overflow-x-hidden text-pantry-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-3 py-3 sm:max-w-2xl sm:px-5 sm:py-5 lg:max-w-7xl lg:px-8">
        {showAppChrome && <Header view={view} setView={setView} earnedCount={passport.foodBadges.length} />}
        {showAppChrome && <MobileBottomNav view={view} setView={setView} earnedCount={passport.foodBadges.length} />}

        {view === "pantry" ? (
          <div className="min-w-0 flex-1">
            <PantryView
              ingredients={data.ingredients}
              selectedIngredients={selectedIngredients}
              onToggle={toggleIngredient}
              onFind={findRecipe}
              fridgeOpen={pantryFridgeOpen}
              onFridgeOpenChange={setPantryFridgeOpen}
            />
          </div>
        ) : (
          <section className="grid flex-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="hidden rounded-[2rem] border border-stone-900/10 bg-white/60 p-5 shadow-soft backdrop-blur lg:block">
              <ProgressPanel
                selectedIngredients={selectedIngredients}
                passport={passport}
                setView={setView}
              />
            </aside>

            <div className="min-w-0">
              {view === "suggestion" && suggestion && (
                <SuggestionView
                  selectedIngredients={selectedIngredients}
                  recipe={suggestion}
                  matchScore={scoreRecipe(suggestion, selectedIngredients)}
                  onCook={() => cookRecipe(suggestion)}
                  onReroll={rerollRecipe}
                  onBack={() => setView("pantry")}
                />
              )}
              {view === "cooking" && (
                <CookingView
                  recipe={activeRecipe}
                  isEarned={unlockedBadges.has(activeRecipe.id)}
                  onHistory={() => setShowHistory(true)}
                  onFinish={() => finishRecipe(activeRecipe)}
                  onPassport={() => setView("passport")}
                />
              )}
              {view === "passport" && (
                <PassportView
                  recipes={data.recipes}
                  passport={passport}
                  unlockedCountries={unlockedCountries}
                  unlockedBadges={unlockedBadges}
                  onBadgeClick={openCommunity}
                  onCookAgain={(recipe) => cookRecipe(recipe)}
                />
              )}
            </div>
          </section>
        )}
      </div>

      {showHistory && (
        <HistoryModal recipe={activeRecipe} onClose={() => setShowHistory(false)} />
      )}

      {communityRecipe && (
        <CommunityModal
          recipe={communityRecipe}
          isUnlocked={unlockedBadges.has(communityRecipe.id)}
          photo={passport.photos[communityRecipe.id]}
          shareCardDataUrl={shareCardDataUrl}
          onUpload={(event) => handlePhotoUpload(communityRecipe, event)}
          onGenerate={() => generateShareCard(communityRecipe)}
          onClose={() => setCommunityRecipeId(null)}
        />
      )}

      {showCelebration && <Celebration recipe={activeRecipe} />}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </main>
  );
}

function Header({
  view,
  setView,
  earnedCount
}: {
  view: AppView;
  setView: (view: AppView) => void;
  earnedCount: number;
}) {
  return (
    <header
      className="sticky z-20 mb-4 flex flex-col gap-3 rounded-[1.7rem] border border-stone-900/10 bg-white/80 p-3 shadow-soft backdrop-blur md:mb-6 md:flex-row md:items-center md:justify-between md:p-4"
      style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)" }}
    >
      <button
        type="button"
        onClick={() => setView("pantry")}
        className="focus-ring flex items-center gap-3 rounded-2xl text-left"
      >
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pantry-mint text-white shadow-stamp">
          <ChefHat aria-hidden="true" />
        </span>
        <span>
          <span className="block font-display text-xl font-bold leading-tight md:text-3xl">
            The Passport Pantry
          </span>
          <span className="text-sm font-medium text-stone-600">
            Pick ingredients. Cook the world. Stamp your plate.
          </span>
        </span>
      </button>

      <nav className="hidden grid-cols-2 gap-2 sm:flex" aria-label="Primary navigation">
        <NavButton
          active={view === "pantry"}
          icon={<Utensils aria-hidden="true" size={18} />}
          label="Pantry"
          onClick={() => setView("pantry")}
        />
        <NavButton
          active={view === "passport"}
          icon={<MapIcon aria-hidden="true" size={18} />}
          label={`Passport ${earnedCount ? `(${earnedCount})` : ""}`}
          onClick={() => setView("passport")}
        />
      </nav>
    </header>
  );
}

function MobileBottomNav({
  view,
  setView,
  earnedCount
}: {
  view: AppView;
  setView: (view: AppView) => void;
  earnedCount: number;
}) {
  return (
    <nav
      className="fixed inset-x-3 z-30 grid grid-cols-2 gap-2 rounded-[1.6rem] border border-stone-900/10 bg-white/90 p-2 shadow-soft backdrop-blur sm:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      aria-label="Mobile navigation"
    >
      <NavButton
        active={view === "pantry"}
        icon={<Utensils aria-hidden="true" size={18} />}
        label="Pantry"
        onClick={() => setView("pantry")}
      />
      <NavButton
        active={view === "passport"}
        icon={<MapIcon aria-hidden="true" size={18} />}
        label={`Passport ${earnedCount ? `(${earnedCount})` : ""}`}
        onClick={() => setView("passport")}
      />
    </nav>
  );
}

function StampImage({
  country,
  className,
  style
}: {
  country: string;
  className?: string;
  style?: CSSProperties;
}) {
  return <img src={getStampAsset(country)} alt={`${country} passport stamp`} className={className} style={style} />;
}

function NavButton({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition",
        active ? "bg-pantry-ink text-white shadow-soft" : "bg-white text-stone-700 hover:bg-amber-50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ProgressPanel({
  selectedIngredients,
  passport,
  setView
}: {
  selectedIngredients: string[];
  passport: StoredPassport;
  setView: (view: AppView) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-5">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.24em] text-pantry-mint">Today</p>
        <h2 className="mt-2 font-display text-3xl font-bold">Your cooking route</h2>
      </div>

      <div className="rounded-3xl bg-pantry-paper p-4">
        <p className="text-sm font-bold text-stone-500">Selected ingredients</p>
        <div className="mt-3 flex min-h-24 flex-wrap content-start gap-2">
          {selectedIngredients.length ? (
            selectedIngredients.map((ingredient) => (
              <span key={ingredient} className="rounded-full bg-white px-3 py-2 text-sm font-bold shadow-sm">
                {ingredient}
              </span>
            ))
          ) : (
            <p className="text-sm text-stone-500">Choose 2 to 4 pantry items to begin.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Award />} label="Food Badges" value={passport.foodBadges.length} />
        <StatCard icon={<Stamp />} label="Stamps" value={passport.countryStamps.length} />
      </div>

      <button
        type="button"
        onClick={() => setView("passport")}
        className="focus-ring mt-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-pantry-berry px-4 py-3 font-bold text-white shadow-soft transition hover:-translate-y-0.5"
      >
        <Trophy size={18} aria-hidden="true" />
        Open Libraries
      </button>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-3 text-pantry-saffron">{icon}</div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{label}</p>
    </div>
  );
}

function PantryView({
  ingredients,
  selectedIngredients,
  onToggle,
  onFind,
  fridgeOpen,
  onFridgeOpenChange
}: {
  ingredients: IngredientCategories;
  selectedIngredients: string[];
  onToggle: (ingredient: string) => void;
  onFind: () => void;
  fridgeOpen: boolean;
  onFridgeOpenChange: (open: boolean) => void;
}) {
  const visibleIngredients = Object.entries(ingredients).reduce<IngredientCategories>((categories, [category, items]) => {
    const visibleItems = items.filter(hasIngredientEmoji);
    if (visibleItems.length > 0) {
      categories[category] = visibleItems;
    }
    return categories;
  }, {});
  const canFind = selectedIngredients.length >= 2 && selectedIngredients.length <= 4;

  useEffect(() => {
    if (selectedIngredients.length > 0 && !fridgeOpen) {
      onFridgeOpenChange(true);
    }
  }, [fridgeOpen, onFridgeOpenChange, selectedIngredients.length]);

  return (
    <div className="animate-pop">
      <section className={cx("fridge-landing", fridgeOpen && "fridge-landing-open") }>
        {fridgeOpen && (
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-pantry-berry">The Pantry</p>
              <h1 className="mt-2 max-w-3xl font-display text-3xl font-black leading-tight md:text-6xl">
                Open the fridge. Pick your route.
              </h1>
            </div>
            <div className="self-start rounded-2xl bg-white/85 px-4 py-3 text-sm font-bold text-stone-600 shadow-sm">
              {selectedIngredients.length}/4 selected
            </div>
          </div>
        )}

        <div className={cx("fridge-stage", !fridgeOpen && "fridge-stage-landing", fridgeOpen && "fridge-stage-open")}>
          <div className="fridge-aura" aria-hidden="true" />
          <div className="fridge-shell">
            <div className={cx("fridge-interior", !fridgeOpen && "pointer-events-none")} aria-hidden={!fridgeOpen}>
              <div className="fridge-light" aria-hidden="true" />
              <div className="relative z-10 mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-pantry-mint">Fresh picks</p>
                  <h2 className="font-display text-3xl font-black text-pantry-ink">Choose 2 to 4 ingredients</h2>
                </div>
                <p className="rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-stone-500 shadow-sm">
                  Fridge open
                </p>
              </div>

              <div className="fridge-shelves">
                {Object.entries(visibleIngredients).map(([category, items]) => (
                  <section key={category} className="fridge-shelf">
                    <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
                      <Sparkles size={18} className="text-pantry-saffron" aria-hidden="true" />
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                      {items.map((ingredient) => {
                        const active = selectedIngredients.includes(ingredient);
                        const disabled = !active && selectedIngredients.length >= 4;
                        return (
                          <button
                            key={ingredient}
                            type="button"
                            disabled={disabled}
                            onClick={() => onToggle(ingredient)}
                            className={cx(
                              "focus-ring fridge-ingredient",
                              active ? "fridge-ingredient-active" : "",
                              disabled && "cursor-not-allowed opacity-40"
                            )}
                            aria-pressed={active}
                          >
                            <span className="block text-2xl">{ingredientEmoji(ingredient)}</span>
                            <span className="block text-sm font-black leading-snug">{ingredient}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>

              <div className="fridge-drawer">
                <button
                  type="button"
                  disabled={!canFind}
                  onClick={onFind}
                  className={cx(
                    "focus-ring flex w-full items-center justify-center gap-3 rounded-3xl px-6 py-5 text-lg font-black transition",
                    canFind
                      ? "bg-pantry-ink text-white hover:-translate-y-0.5"
                      : "cursor-not-allowed bg-stone-200 text-stone-500"
                  )}
                >
                  <Search aria-hidden="true" />
                  Find Recipe
                </button>
              </div>
            </div>

            <div className="fridge-door fridge-door-left" aria-hidden="true">
              <span className="fridge-handle fridge-handle-left" />
              <span className="fridge-magnet fridge-magnet-three" />
              <span className="fridge-magnet fridge-magnet-four" />
            </div>
            <div className="fridge-door fridge-door-right" aria-hidden="true">
              <span className="fridge-handle fridge-handle-right" />
              <span className="fridge-magnet fridge-magnet-one" />
              <span className="fridge-magnet fridge-magnet-two" />
            </div>
          </div>

          {!fridgeOpen && (
            <div className="fridge-open-panel">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-pantry-mint">Ready to cook?</p>
              <button
                type="button"
                onClick={() => onFridgeOpenChange(true)}
                className="focus-ring mt-3 inline-flex items-center justify-center rounded-3xl bg-pantry-berry px-7 py-4 text-lg font-black text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Open Fridge
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SuggestionView({
  selectedIngredients,
  recipe,
  matchScore,
  onCook,
  onReroll,
  onBack
}: {
  selectedIngredients: string[];
  recipe: Recipe;
  matchScore: number;
  onCook: () => void;
  onReroll: () => void;
  onBack: () => void;
}) {
  const matched = recipe.requiredIngredients.filter((ingredient) => selectedIngredients.includes(ingredient));

  return (
    <div className="animate-pop">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-pantry-mint">Suggestion</p>
          <h1 className="mt-2 font-display text-4xl font-black md:text-5xl">Your closest match</h1>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="focus-ring rounded-2xl bg-white px-4 py-3 text-sm font-bold shadow-sm transition hover:bg-amber-50"
        >
          Edit Pantry
        </button>
      </div>

      <article className="relative overflow-hidden rounded-[2rem] border-2 border-dashed border-stone-900/20 bg-[#fffaf0] p-4 shadow-soft sm:p-6">
        <div className={cx("absolute inset-x-0 top-0 h-2 bg-gradient-to-r", countryPalette[recipe.country] ?? "from-amber-500 to-teal-700")} />
        <div className="absolute right-4 top-5 rotate-6 rounded-2xl bg-white/70 p-1 shadow-sm">
          <StampImage country={recipe.country} className="h-20 w-20 object-contain sm:h-28 sm:w-28" />
        </div>
        <div className="pointer-events-none absolute bottom-5 right-5 hidden w-40 space-y-3 opacity-25 sm:block">
          <span className="block border-t border-stone-700" />
          <span className="block border-t border-stone-700" />
          <span className="block border-t border-stone-700" />
        </div>
        <div className="pt-16 sm:pt-20">
          <div className="mb-5 pr-20 sm:pr-28">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-pantry-berry">{recipe.country}</p>
            <h2 className="mt-2 font-display text-4xl font-black leading-tight md:text-6xl">{recipe.name}</h2>
            <p className="mt-1 text-lg font-bold text-pantry-mint">{recipe.chineseName}</p>
          </div>

          <p className="max-w-2xl text-lg font-medium leading-8 text-stone-600">{recipe.description}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="rounded-3xl bg-pantry-paper p-5">
              <h3 className="mb-3 font-display text-2xl font-bold">Required ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.requiredIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className={cx(
                      "rounded-full px-3 py-2 text-sm font-black",
                      selectedIngredients.includes(ingredient)
                        ? "bg-pantry-mint text-white"
                        : "bg-white text-stone-600"
                    )}
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-3xl bg-pantry-ink p-5 text-white">
              <Flame aria-hidden="true" />
              <p className="mt-4 text-3xl font-black">{recipe.prepTime}</p>
              <p className="text-sm font-bold text-white/70">
                {matched.length} pantry match{matched.length === 1 ? "" : "es"} · score {Math.round(matchScore)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCook}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-3xl bg-pantry-mint px-6 py-5 text-lg font-black text-white shadow-stamp transition hover:-translate-y-0.5"
            >
              <Check aria-hidden="true" />
              Cook This
            </button>
            <button
              type="button"
              onClick={onReroll}
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-3xl bg-white px-6 py-5 text-lg font-black text-pantry-ink ring-1 ring-stone-900/10 transition hover:-translate-y-0.5 hover:bg-amber-50"
            >
              <RefreshCcw aria-hidden="true" />
              Change Food
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function CookingView({
  recipe,
  isEarned,
  onHistory,
  onFinish,
  onPassport
}: {
  recipe: Recipe;
  isEarned: boolean;
  onHistory: () => void;
  onFinish: () => void;
  onPassport: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showStepMode, setShowStepMode] = useState(false);
  const stepModeRef = useRef<HTMLDivElement | null>(null);
  const totalSteps = recipe.steps.length;
  const stepProgress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 100;

  function goToStep(nextStep: number) {
    const clamped = Math.min(totalSteps - 1, Math.max(0, nextStep));
    setCurrentStep(clamped);
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }

  useEffect(() => {
    setCurrentStep(0);
    setShowStepMode(false);
  }, [recipe.id]);

  useEffect(() => {
    if (showStepMode) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      stepModeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, showStepMode]);

  return (
    <div className="animate-pop">
      <div className="overflow-hidden rounded-[2.5rem] border border-stone-900/10 bg-white shadow-soft">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_260px] md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-pantry-berry">Cooking</p>
            <h1 className="mt-2 font-display text-4xl font-black leading-tight md:text-6xl">
              {recipe.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">{recipe.description}</p>
          </div>
          <div className="rounded-[2rem] bg-pantry-paper p-5">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-stone-500">Badge</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-6xl">{recipe.badgeEmoji}</span>
              <div>
                <p className="font-display text-2xl font-bold">{recipe.countryStamp}</p>
                <p className="text-sm font-bold text-stone-500">{recipe.prepTime}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 border-t border-stone-900/10 p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-8">
          <section>
            <div className="md:hidden">
              <div className="rounded-[2rem] border border-stone-900/10 bg-pantry-paper p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-pantry-mint">
                  Step {currentStep + 1} of {totalSteps}
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold">Cook Mode</h2>
                <p className="mt-3 font-semibold leading-7 text-stone-700">{recipe.steps[currentStep]}</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white" aria-hidden="true">
                  <div className="h-full rounded-full bg-pantry-mint transition-all duration-500" style={{ width: `${stepProgress}%` }} />
                </div>
                <button
                  type="button"
                  onClick={() => setShowStepMode(true)}
                  className="focus-ring mt-4 flex w-full items-center justify-center rounded-3xl bg-pantry-ink px-5 py-4 text-base font-black text-white transition hover:-translate-y-0.5"
                >
                  Open Step-by-Step Mode
                </button>
              </div>

              {showStepMode && (
                <div className="fixed inset-0 z-40 grid place-items-center bg-stone-950/40 p-4 backdrop-blur-sm">
                  <div ref={stepModeRef} className="w-full max-w-sm rounded-[2rem] border border-stone-900/10 bg-white p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-pantry-mint">
                          Step {currentStep + 1} of {totalSteps}
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold">Step-by-step</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowStepMode(false)}
                        className="focus-ring grid h-11 w-11 place-items-center rounded-2xl bg-pantry-paper text-pantry-ink"
                        aria-label="Close step mode"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-100" aria-hidden="true">
                      <div className="h-full rounded-full bg-pantry-mint transition-all duration-500" style={{ width: `${stepProgress}%` }} />
                    </div>
                    <article className="mt-4 rounded-[1.75rem] border border-pantry-mint bg-emerald-50 p-5 shadow-stamp">
                      <div className="flex gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pantry-mint font-black text-white">
                          {currentStep + 1}
                        </span>
                        <p className="pt-1 text-lg font-semibold leading-8 text-pantry-ink">{recipe.steps[currentStep]}</p>
                      </div>
                    </article>
                    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <button
                        type="button"
                        disabled={currentStep === 0}
                        onClick={() => goToStep(currentStep - 1)}
                        className="focus-ring rounded-2xl bg-white px-4 py-3 text-sm font-black text-pantry-ink ring-1 ring-stone-900/10 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Back
                      </button>
                      <span className="text-center text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                        {currentStep + 1}/{totalSteps}
                      </span>
                      <button
                        type="button"
                        disabled={currentStep === totalSteps - 1}
                        onClick={() => goToStep(currentStep + 1)}
                        className="focus-ring rounded-2xl bg-pantry-ink px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 disabled:hover:translate-y-0"
                      >
                        Next Step
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:block">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-pantry-mint">
                    Step {currentStep + 1} of {totalSteps}
                  </p>
                  <h2 className="font-display text-3xl font-bold">Step-by-step</h2>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-stone-100 sm:w-48" aria-hidden="true">
                  <div className="h-full rounded-full bg-pantry-mint transition-all duration-500" style={{ width: `${stepProgress}%` }} />
                </div>
              </div>

              <ol className="grid gap-3">
                {recipe.steps.map((step, index) => {
                  const active = index === currentStep;
                  const completed = index < currentStep;
                  return (
                    <li key={step}>
                      <button
                        type="button"
                        onClick={() => goToStep(index)}
                        aria-current={active ? "step" : undefined}
                        className={cx(
                          "focus-ring flex w-full gap-4 rounded-3xl border p-4 text-left transition",
                          active
                            ? "border-pantry-mint bg-emerald-50 shadow-stamp"
                            : completed
                              ? "border-pantry-mint/30 bg-white"
                              : "border-stone-900/10 bg-pantry-paper hover:bg-amber-50"
                        )}
                      >
                        <span
                          className={cx(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-full font-black transition",
                            active || completed ? "bg-pantry-mint text-white" : "bg-white text-pantry-ink"
                          )}
                        >
                          {completed ? <Check size={18} aria-hidden="true" /> : index + 1}
                        </span>
                        <span className={cx("pt-1 font-semibold leading-7", active ? "text-pantry-ink" : "text-stone-700")}>{step}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="sticky bottom-4 z-10 mt-4 rounded-[2rem] border border-stone-900/10 bg-white/90 p-3 shadow-soft backdrop-blur md:static md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <button
                    type="button"
                    disabled={currentStep === 0}
                    onClick={() => goToStep(currentStep - 1)}
                    className="focus-ring rounded-2xl bg-white px-4 py-3 text-sm font-black text-pantry-ink ring-1 ring-stone-900/10 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Back
                  </button>
                  <span className="text-center text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                    {currentStep + 1}/{totalSteps}
                  </span>
                  <button
                    type="button"
                    disabled={currentStep === totalSteps - 1}
                    onClick={() => goToStep(currentStep + 1)}
                    className="focus-ring rounded-2xl bg-pantry-ink px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 disabled:hover:translate-y-0"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-3 md:sticky md:top-28 md:self-start">
            <button
              type="button"
              onClick={onHistory}
              className="focus-ring flex min-h-[76px] w-full items-center justify-center gap-3 rounded-3xl bg-white px-5 py-4 text-lg font-black text-pantry-ink ring-1 ring-stone-900/10 transition hover:bg-amber-50"
            >
              <BookOpen aria-hidden="true" />
              Cultural History
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="focus-ring flex min-h-[76px] w-full items-center justify-center gap-3 rounded-3xl bg-pantry-berry px-5 py-4 text-lg font-black text-white shadow-soft transition hover:-translate-y-0.5"
            >
              <Award aria-hidden="true" />
              {isEarned ? "Cook Again" : "I Finished Cooking!"}
            </button>
            <button
              type="button"
              onClick={onPassport}
              className="focus-ring flex min-h-[76px] w-full items-center justify-center gap-3 rounded-3xl bg-pantry-mint px-5 py-4 text-lg font-black text-white shadow-stamp transition hover:-translate-y-0.5"
            >
              <MapIcon aria-hidden="true" />
              Food Passport & Badges
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PassportView({
  recipes,
  passport,
  unlockedCountries: _unlockedCountries,
  unlockedBadges,
  onBadgeClick,
  onCookAgain
}: {
  recipes: Recipe[];
  passport: StoredPassport;
  unlockedCountries: Set<string>;
  unlockedBadges: Set<string>;
  onBadgeClick: (recipeId: string) => void;
  onCookAgain: (recipe: Recipe) => void;
}) {
  void _unlockedCountries;
  const countryRecipeMap = useMemo(() => new Map(recipes.map((recipe) => [recipe.country, recipe])), [recipes]);
  const unlockedCountryRecipes = useMemo(
    () => passport.countryStamps.map((country) => countryRecipeMap.get(country)).filter((recipe): recipe is Recipe => Boolean(recipe)),
    [countryRecipeMap, passport.countryStamps]
  );
  const stampPages = useMemo(() => {
    const pages = chunkItems(unlockedCountryRecipes, 4);
    return pages.length >= 2 ? pages : [pages[0] ?? [], []];
  }, [unlockedCountryRecipes]);
  const sortedRecipes = useMemo(() => {
    const unlockedOrder = new Map(passport.foodBadges.map((recipeId, index) => [recipeId, index]));
    return recipes
      .map((recipe, index) => ({ recipe, index }))
      .sort((a, b) => {
        const aOrder = unlockedOrder.get(a.recipe.id);
        const bOrder = unlockedOrder.get(b.recipe.id);
        const aUnlocked = aOrder !== undefined;
        const bUnlocked = bOrder !== undefined;

        if (aUnlocked && bUnlocked) return aOrder - bOrder;
        if (aUnlocked) return -1;
        if (bUnlocked) return 1;
        return a.index - b.index;
      })
      .map(({ recipe }) => recipe);
  }, [passport.foodBadges, recipes]);
  const [pageIndex, setPageIndex] = useState(0);
  const [turnDirection, setTurnDirection] = useState<"next" | "previous" | null>(null);

  useEffect(() => {
    setPageIndex((index) => Math.min(index, Math.max(stampPages.length - 1, 0)));
  }, [stampPages.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pageIndex]);

  function turnPage(direction: "next" | "previous") {
    const nextIndex = direction === "next" ? pageIndex + 1 : pageIndex - 1;
    if (nextIndex < 0 || nextIndex >= stampPages.length) return;
    setTurnDirection(direction);
    setPageIndex(nextIndex);
    window.setTimeout(() => setTurnDirection(null), 560);
  }

  const currentPage = stampPages[pageIndex] ?? [];
  const facingPage = stampPages[pageIndex + 1] ?? [];
  const canTurnBack = pageIndex > 0;
  const canTurnForward = pageIndex < stampPages.length - 1;

  return (
    <div className="animate-pop">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-pantry-mint">Libraries</p>
        <h1 className="mt-2 font-display text-4xl font-black leading-tight md:text-6xl">
          Food Passport
        </h1>
      </div>

      <section className="mb-6 rounded-[2rem] border border-stone-900/10 bg-white/75 p-4 shadow-soft md:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex items-center gap-2 font-display text-3xl font-bold">
            <Stamp className="text-pantry-berry" aria-hidden="true" />
            Country Stamps
          </h2>
          <div className="flex items-center gap-2 self-start rounded-3xl bg-white/85 p-2 shadow-sm sm:self-auto">
            <button
              type="button"
              onClick={() => turnPage("previous")}
              disabled={!canTurnBack}
              aria-label="Turn to previous passport page"
              className="focus-ring grid h-11 w-11 place-items-center rounded-2xl bg-pantry-paper text-pantry-ink transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <span className="w-20 text-center text-sm font-black text-stone-600">
              {pageIndex + 1}/{stampPages.length}
            </span>
            <button
              type="button"
              onClick={() => turnPage("next")}
              disabled={!canTurnForward}
              aria-label="Turn to next passport page"
              className="focus-ring grid h-11 w-11 place-items-center rounded-2xl bg-pantry-paper text-pantry-ink transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="passport-book-shell">
          <div className={cx("passport-book", turnDirection === "next" && "passport-book-turn-next", turnDirection === "previous" && "passport-book-turn-previous")}>
            <PassportStampPage
              label={`Page ${pageIndex + 1}`}
              recipes={currentPage}
            />
            <div className="hidden md:block">
              <PassportStampPage
                label={facingPage.length ? `Page ${pageIndex + 2}` : "Notes"}
                recipes={facingPage}
                isFacing
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-900/10 bg-white/75 p-5 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 font-display text-3xl font-bold">
          <Award className="text-pantry-saffron" aria-hidden="true" />
          Food Badges
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedRecipes.map((recipe) => {
            const unlocked = unlockedBadges.has(recipe.id);
            return (
              <article
                key={recipe.id}
                className={cx(
                  "rounded-[2rem] border p-4 transition",
                  unlocked
                    ? "border-stone-900/10 bg-white shadow-soft"
                    : "border-stone-200 bg-stone-100 text-stone-400 grayscale"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-5xl">{unlocked ? recipe.badgeEmoji : "🔒"}</div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-pantry-paper px-3 py-1 text-xs font-black">
                    <StampImage country={recipe.country} className="h-8 w-8 object-contain" /> {recipe.countryStamp}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold leading-tight">{recipe.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-stone-600">{recipe.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!unlocked}
                    onClick={() => onBadgeClick(recipe.id)}
                    className={cx(
                      "focus-ring grid h-12 place-items-center rounded-2xl px-2 text-center text-sm font-black leading-none transition",
                      unlocked
                        ? "bg-pantry-mint text-white hover:-translate-y-0.5"
                        : "cursor-not-allowed bg-stone-200 text-stone-500"
                    )}
                  >
                    <span className="block w-full text-center">Community</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onCookAgain(recipe)}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-black text-pantry-ink ring-1 ring-stone-900/10 transition hover:bg-amber-50"
                  >
                    <ChefHat size={16} aria-hidden="true" />
                    Cook
                  </button>
                </div>
                {passport.photos[recipe.id] && (
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-pantry-berry">
                    Photo shared
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PassportStampPage({
  label,
  recipes,
  isFacing = false
}: {
  label: string;
  recipes: Recipe[];
  isFacing?: boolean;
}) {
  const slots = [...recipes, ...Array<null>(Math.max(0, 4 - recipes.length)).fill(null)];

  return (
    <article className={cx("passport-page", isFacing && "passport-page-facing")}>
      <div className="passport-page-face">
        <div className="mb-4 flex items-center justify-between border-b border-stone-900/10 pb-3">
          <p className="font-display text-2xl font-black text-pantry-ink">{label}</p>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-pantry-berry">Visa Stamps</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {slots.map((recipe, index) => {
            if (!recipe) {
              return (
                <div key={`empty-${index}`} className="passport-stamp-slot border-stone-900/10 bg-white/35 text-stone-400">
                  <span className="text-xs font-black uppercase tracking-[0.18em]">Blank Page</span>
                </div>
              );
            }

            return (
              <div
                key={recipe.country}
                className="passport-stamp-slot stamp-edge border-dashed border-pantry-mint bg-emerald-50 text-pantry-ink"
              >
                <StampImage
                  country={recipe.country}
                  className="mx-auto h-20 w-20 object-contain"
                />
                <div className="mt-3">
                  <p className="font-display text-xl font-black leading-tight">{recipe.countryStamp}</p>
                  <p className="text-xs font-bold leading-snug">{recipe.country}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function HistoryModal({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} labelledBy="history-title">
      <div className="max-w-xl rounded-[2rem] bg-white p-6 shadow-soft">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-pantry-berry">
              {recipe.country}
            </p>
            <h2 id="history-title" className="mt-2 font-display text-4xl font-black">
              Cultural History
            </h2>
          </div>
          <IconButton label="Close history" onClick={onClose} icon={<X aria-hidden="true" />} />
        </div>
        <p className="text-lg font-medium leading-8 text-stone-700">{recipe.history}</p>
      </div>
    </ModalShell>
  );
}

function CommunityModal({
  recipe,
  isUnlocked,
  photo,
  shareCardDataUrl,
  onUpload,
  onGenerate,
  onClose
}: {
  recipe: Recipe;
  isUnlocked: boolean;
  photo?: string;
  shareCardDataUrl: string | null;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell onClose={onClose} labelledBy="community-title">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-[2rem] bg-white shadow-soft">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-stone-900/10 bg-white/95 p-5 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-pantry-mint">
              Community View
            </p>
            <h2 id="community-title" className="mt-1 font-display text-3xl font-black">
              {recipe.badgeEmoji} {recipe.name}
            </h2>
          </div>
          <IconButton label="Close community" onClick={onClose} icon={<X aria-hidden="true" />} />
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] bg-pantry-paper p-5">
            <div className="mb-4 grid h-40 place-items-center rounded-3xl bg-white text-7xl shadow-sm">
              {isUnlocked ? recipe.badgeEmoji : <Lock aria-hidden="true" />}
            </div>
            <div className="mb-3 rounded-2xl bg-white/70 p-2"><StampImage country={recipe.country} className="mx-auto h-28 w-28 object-contain" /></div>
            <p className="font-display text-2xl font-bold">{recipe.country}</p>
            <p className="mt-2 text-sm font-bold text-stone-600">{recipe.flavorProfile}</p>

            <label className="focus-within:ring-4 focus-within:ring-amber-500/30 mt-5 flex cursor-pointer items-center justify-center gap-2 rounded-3xl bg-pantry-mint px-4 py-4 text-center font-black text-white shadow-stamp transition hover:-translate-y-0.5">
              <ImagePlus aria-hidden="true" />
              Share Your Result
              <input type="file" accept="image/*" onChange={onUpload} className="sr-only" />
            </label>

            {photo && (
              <button
                type="button"
                onClick={onGenerate}
                className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-pantry-berry px-4 py-4 font-black text-white shadow-soft transition hover:-translate-y-0.5"
              >
                <Share2 aria-hidden="true" />
                Generate Share Card
                <span className="text-white/80">生成分享海报</span>
              </button>
            )}

            {shareCardDataUrl && (
              <a
                href={shareCardDataUrl}
                download={`${recipe.id}-passport-pantry.png`}
                className="focus-ring mt-3 inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-pantry-ink px-4 py-4 font-black text-white transition hover:-translate-y-0.5"
              >
                <Download aria-hidden="true" />
                Download PNG
              </a>
            )}
          </aside>

          <section>
            {photo && (
              <article className="mb-4 rounded-[2rem] border border-pantry-mint/30 bg-emerald-50 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-pantry-mint font-black text-white">
                    You
                  </div>
                  <div>
                    <p className="font-black">You shared a cooking photo</p>
                    <p className="text-sm font-semibold text-stone-500">Just now · live in your pantry</p>
                  </div>
                </div>
                <img
                  src={photo}
                  alt={`Your cooked ${recipe.name}`}
                  className="max-h-[420px] w-full rounded-3xl object-cover"
                />
              </article>
            )}

            {shareCardDataUrl && (
              <article className="mb-4 rounded-[2rem] border border-stone-900/10 bg-white p-4 shadow-sm">
                <p className="mb-3 font-black">Share card preview</p>
                <img
                  src={shareCardDataUrl}
                  alt={`Generated share card for ${recipe.name}`}
                  className="mx-auto max-h-[520px] rounded-3xl border border-stone-900/10"
                />
              </article>
            )}

            <div className="space-y-3">
              {recipe.comments.map((comment) => (
                <article key={`${comment.user}-${comment.text}`} className="rounded-[2rem] bg-pantry-paper p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-white font-black text-pantry-berry shadow-sm">
                      {comment.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black">{comment.user}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Cooked this</p>
                    </div>
                  </div>
                  <p className="mt-3 font-medium leading-7 text-stone-700">{comment.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </ModalShell>
  );
}

function Celebration({ recipe }: { recipe: Recipe }) {
  const pieces = Array.from({ length: 36 }, (_, index) => index);
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-live="polite">
      <div className="celebration-card">
        <div className="celebration-badge">
          <span>{recipe.badgeEmoji}</span>
        </div>
        <p className="mt-3 font-display text-3xl font-black">Badge earned!</p>
        <p className="font-bold text-pantry-mint">{recipe.countryStamp} stamp added</p>
      </div>
      {pieces.map((piece) => (
        <span
          key={piece}
          className="celebration-confetti"
          style={{
            left: `${(piece * 29) % 100}%`,
            animationDelay: `${piece * 28}ms`,
            backgroundColor: ["#d97706", "#0f766e", "#9f1239", "#4338ca", "#f8f3ea"][piece % 5]
          }}
        />
      ))}
    </div>
  );
}

function ModalShell({
  children,
  onClose,
  labelledBy
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy: string;
}) {
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-stone-950/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

function IconButton({
  label,
  icon,
  onClick
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pantry-paper text-pantry-ink transition hover:bg-amber-100"
    >
      {icon}
    </button>
  );
}

function hasIngredientEmoji(ingredient: string) {
  return ingredient in ingredientEmojiMap;
}

function ingredientEmoji(ingredient: string) {
  return ingredientEmojiMap[ingredient] ?? null;
}


type CanvasBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks.length ? chunks : [[]];
}

function createFoodBadgeSvg(recipe: Recipe) {
  const safeName = escapeSvgText(recipe.name);
  const safeCountry = escapeSvgText(recipe.countryStamp);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#2d2926" flood-opacity="0.18"/>
      </filter>
    </defs>
    <circle cx="130" cy="130" r="108" fill="#fffaf0" stroke="#9f1239" stroke-width="10" filter="url(#shadow)"/>
    <circle cx="130" cy="130" r="88" fill="none" stroke="#0f766e" stroke-width="4" stroke-dasharray="8 8"/>
    <text x="130" y="122" text-anchor="middle" font-size="70" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${recipe.badgeEmoji}</text>
    <text x="130" y="172" text-anchor="middle" font-size="20" font-weight="800" font-family="Arial, sans-serif" fill="#2d2926">${safeName}</text>
    <text x="130" y="202" text-anchor="middle" font-size="18" font-weight="800" font-family="Arial, sans-serif" fill="#9f1239">${safeCountry} BADGE</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeSvgText(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function drawPaperTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  for (let dotX = x + 10; dotX < x + width; dotX += 18) {
    for (let dotY = y + 10; dotY < y + height; dotY += 18) {
      if ((Math.floor(dotX + dotY) / 18) % 2 < 1) {
        ctx.fillRect(dotX, dotY, 1.5, 1.5);
      }
    }
  }
  ctx.restore();
}

function drawPostcardFront(ctx: CanvasRenderingContext2D, image: HTMLImageElement, box: CanvasBox) {
  ctx.save();
  ctx.fillStyle = "#fffaf0";
  roundRect(ctx, box.x, box.y, box.width, box.height, 24);
  ctx.fill();
  ctx.shadowColor = "rgba(45, 41, 38, 0.22)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.strokeStyle = "rgba(45, 41, 38, 0.15)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  const inset = 22;
  ctx.save();
  roundRect(ctx, box.x + inset, box.y + inset, box.width - inset * 2, box.height - inset * 2, 18);
  ctx.clip();
  drawCoverImage(ctx, image, box.x + inset, box.y + inset, box.width - inset * 2, box.height - inset * 2);
  ctx.restore();

  const logoText = "The Passport Pantry";
  const logoX = box.x + 34;
  const logoY = box.y + box.height - 84;
  const logoWidth = Math.min(230, box.width - 68);

  ctx.save();
  ctx.fillStyle = "rgba(255, 250, 240, 0.88)";
  roundRect(ctx, logoX, logoY, logoWidth, 48, 16);
  ctx.fill();
  ctx.fillStyle = "#2d2926";
  ctx.font = fitCanvasFont(ctx, logoText, logoWidth - 28, "700", 22, 14, "Georgia, serif");
  ctx.fillText(logoText, logoX + 14, box.y + box.height - 53, logoWidth - 28);
  ctx.restore();
}

function drawPostcardBack(
  ctx: CanvasRenderingContext2D,
  recipe: Recipe,
  stampImage: HTMLImageElement,
  badgeImage: HTMLImageElement,
  box: CanvasBox
) {
  ctx.save();
  ctx.fillStyle = "#fffaf0";
  roundRect(ctx, box.x, box.y, box.width, box.height, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(45, 41, 38, 0.15)";
  ctx.lineWidth = 3;
  ctx.stroke();
  drawPaperTexture(ctx, box.x, box.y, box.width, box.height, "rgba(45, 41, 38, 0.055)");
  ctx.restore();

  const dividerX = box.x + box.width * 0.53;
  ctx.strokeStyle = "rgba(45, 41, 38, 0.35)";
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(dividerX, box.y + 52);
  ctx.lineTo(dividerX, box.y + box.height - 52);
  ctx.stroke();
  ctx.setLineDash([]);

  const leftX = box.x + 42;
  const topY = box.y + 62;
  ctx.drawImage(badgeImage, leftX, topY, 132, 132);

  ctx.fillStyle = "#2d2926";
  ctx.font = "700 34px Georgia, serif";
  wrapCanvasText(ctx, recipe.name, leftX, topY + 174, dividerX - leftX - 28, 38);
  ctx.fillStyle = "#0f766e";
  ctx.font = "700 20px system-ui, sans-serif";
  ctx.fillText("Flavor Profile", leftX, topY + 260);
  ctx.fillStyle = "#2d2926";
  ctx.font = "500 22px system-ui, sans-serif";
  wrapCanvasText(ctx, recipe.flavorProfile, leftX, topY + 294, dividerX - leftX - 28, 30);
  const watermarkText = "Cooked with The Passport Pantry";
  ctx.fillStyle = "rgba(45, 41, 38, 0.55)";
  ctx.font = fitCanvasFont(ctx, watermarkText, dividerX - leftX - 28, "700", 17, 12, "system-ui, sans-serif");
  ctx.fillText(watermarkText, leftX, box.y + box.height - 50, dividerX - leftX - 28);

  const rightX = dividerX + 42;
  const stampSize = Math.min(118, box.width * 0.22);
  ctx.save();
  ctx.translate(box.x + box.width - stampSize - 42, box.y + 42);
  ctx.rotate(0.08);
  ctx.fillStyle = "#fff";
  roundRect(ctx, -8, -8, stampSize + 16, stampSize + 16, 12);
  ctx.fill();
  ctx.drawImage(stampImage, 0, 0, stampSize, stampSize);
  ctx.restore();

  ctx.strokeStyle = "rgba(45, 41, 38, 0.42)";
  ctx.lineWidth = 2;
  for (let index = 0; index < 4; index += 1) {
    const y = box.y + box.height * 0.48 + index * 42;
    ctx.beginPath();
    ctx.moveTo(rightX, y);
    ctx.lineTo(box.x + box.width - 48, y);
    ctx.stroke();
  }

  const countryLabel = `${recipe.countryStamp} / ${recipe.country}`;
  const countryMaxWidth = box.x + box.width - rightX - 52;
  ctx.fillStyle = "rgba(159, 18, 57, 0.82)";
  ctx.font = fitCanvasFont(ctx, countryLabel, countryMaxWidth, "800", 20, 12, "system-ui, sans-serif");
  ctx.fillText(countryLabel, rightX, box.y + box.height - 72, countryMaxWidth);
}

function fitCanvasFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: string,
  maxSize: number,
  minSize: number,
  family: string
) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const font = `${weight} ${size}px ${family}`;
    ctx.font = font;
    if (ctx.measureText(text).width <= maxWidth) return font;
  }

  return `${weight} ${minSize}px ${family}`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const offsetX = x + (width - scaledWidth) / 2;
  const offsetY = y + (height - scaledHeight) / 2;
  ctx.drawImage(image, offsetX, offsetY, scaledWidth, scaledHeight);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word, index) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = test;
    }

    if (index === words.length - 1 && line) {
      ctx.fillText(line, x, currentY);
    }
  });
}

export default App;
