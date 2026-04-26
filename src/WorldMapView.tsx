import { ChevronLeft, Lock, MapPin, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { i18n } from "./i18n";

declare global {
  interface Window {
    L?: any;
  }
}

type RecipeLite = {
  id: string;
  name: string;
  badgeEmoji: string;
  country: string;
};

type WorldMapViewProps = {
  recipes: RecipeLite[];
  unlockedRecipeIds: Set<string>;
  unlockedCountries: Set<string>;
  onBack: () => void;
  onStartCooking: () => void;
  onOpenCountryRecipe: (recipeId: string) => void;
};

type MapCountry = {
  country: string;
  flag: string;
  accent: string;
  lat: number;
  lng: number;
};

const mapCountries: MapCountry[] = [
  { country: "China", flag: "🇨🇳", accent: "#DE2910", lat: 35.86, lng: 104.19 },
  { country: "United States of America", flag: "🇺🇸", accent: "#3C3B6E", lat: 37.09, lng: -95.71 },
  { country: "Indonesia", flag: "🇮🇩", accent: "#CE1126", lat: -0.79, lng: 113.92 },
  { country: "India", flag: "🇮🇳", accent: "#FF9933", lat: 20.59, lng: 78.96 }
];

export function WorldMapView({
  recipes,
  unlockedRecipeIds,
  unlockedCountries,
  onBack,
  onStartCooking,
  onOpenCountryRecipe
}: WorldMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selected, setSelected] = useState<MapCountry | null>(null);
  const [leafletReady, setLeafletReady] = useState(typeof window !== "undefined" && !!window.L);

  const recipesByCountry = useMemo(() => {
    const map = new Map<string, RecipeLite[]>();
    recipes.forEach((recipe) => {
      const list = map.get(recipe.country) ?? [];
      list.push(recipe);
      map.set(recipe.country, list);
    });
    return map;
  }, [recipes]);

  useEffect(() => {
    if (leafletReady) return;
    let cancelled = false;
    const interval = window.setInterval(() => {
      if (window.L) {
        if (!cancelled) setLeafletReady(true);
        window.clearInterval(interval);
      }
    }, 80);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [leafletReady]);

  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapRef.current) return;
    const L = window.L;
    if (!L) return;

    const container = mapContainerRef.current;
    const map = L.map(container, {
      center: [20, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 6,
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: true,
      preferCanvas: false
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      crossOrigin: true
    }).addTo(map);

    mapRef.current = map;

    // Tiles fail to load if the container has 0 dimensions during init.
    // Recompute size after the next paint and on every container resize.
    const invalidate = () => map.invalidateSize();
    requestAnimationFrame(invalidate);
    const resizeTimeout = window.setTimeout(invalidate, 250);

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(invalidate) : null;
    resizeObserver?.observe(container);
    window.addEventListener("resize", invalidate);

    return () => {
      window.clearTimeout(resizeTimeout);
      window.removeEventListener("resize", invalidate);
      resizeObserver?.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [leafletReady]);

  useEffect(() => {
    const map = mapRef.current;
    const L = window.L;
    if (!map || !L) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    mapCountries.forEach((country) => {
      const visited = unlockedCountries.has(country.country);
      const cookedCount =
        recipesByCountry.get(country.country)?.filter((recipe) => unlockedRecipeIds.has(recipe.id)).length ?? 0;

      const html = visited
        ? `<div class="map-pin map-pin-visited" style="--accent:${country.accent}">
             <div class="map-pin-ring"></div>
             <div class="map-pin-core">${country.flag}</div>
             ${cookedCount > 0 ? `<div class="map-pin-badge">${cookedCount}</div>` : ""}
           </div>`
        : `<div class="map-pin map-pin-locked"><div class="map-pin-core">🔒</div></div>`;

      const icon = L.divIcon({
        className: "map-pin-wrap",
        html,
        iconSize: [56, 56],
        iconAnchor: [28, 28]
      });

      const marker = L.marker([country.lat, country.lng], { icon, riseOnHover: true })
        .addTo(map)
        .on("click", () => setSelected(country));

      markersRef.current.push(marker);
    });
  }, [leafletReady, recipesByCountry, unlockedCountries, unlockedRecipeIds]);

  const exploredCount = unlockedCountries.size;
  const selectedRecipes = selected ? recipesByCountry.get(selected.country) ?? [] : [];
  const selectedUnlocked = selected
    ? selectedRecipes.filter((recipe) => unlockedRecipeIds.has(recipe.id))
    : [];
  const selectedVisited = selected ? unlockedCountries.has(selected.country) : false;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#aad3df] text-stone-800">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      <header className="absolute inset-x-0 top-0 z-[1000] flex h-14 items-center justify-between bg-white/85 px-4 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-stone-900/5 text-stone-700 transition hover:bg-stone-900/10"
          aria-label={i18n.t("common.back")}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="text-base font-bold text-stone-800">{i18n.t("map.title")}</h1>
        <span className="h-10 w-10" aria-hidden="true" />
      </header>

      {selected && (
        <CountrySheet
          country={selected}
          allRecipes={selectedRecipes}
          unlockedRecipes={selectedUnlocked}
          visited={selectedVisited}
          onClose={() => setSelected(null)}
          onStartCooking={() => {
            setSelected(null);
            onStartCooking();
          }}
          onSelectRecipe={(recipe) => {
            setSelected(null);
            onOpenCountryRecipe(recipe.id);
          }}
        />
      )}

      <div
        className="absolute inset-x-0 bottom-0 z-[1000] bg-white/90 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 text-center backdrop-blur"
      >
        <p className="text-sm font-bold text-stone-800">{i18n.t("map.explored", { count: exploredCount })}</p>
        <p className="mt-1 text-xs text-stone-600">{i18n.t("map.dishes_cooked", { count: unlockedRecipeIds.size })}</p>
        <div className="mt-3 flex items-center justify-center gap-3 text-2xl">
          {mapCountries.map((country) => {
            const visited = unlockedCountries.has(country.country);
            return (
              <span
                key={country.country}
                className={visited ? "drop-shadow-[0_0_10px_rgba(0,0,0,0.18)]" : "opacity-30 grayscale"}
              >
                {country.flag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CountrySheet({
  country,
  allRecipes,
  unlockedRecipes,
  visited,
  onClose,
  onStartCooking,
  onSelectRecipe
}: {
  country: MapCountry;
  allRecipes: RecipeLite[];
  unlockedRecipes: RecipeLite[];
  visited: boolean;
  onClose: () => void;
  onStartCooking: () => void;
  onSelectRecipe: (recipe: RecipeLite) => void;
}) {
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[1100] flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)]"
      role="dialog"
      aria-modal="true"
    >
      <article
        className="w-full max-w-md animate-[scale-in_200ms_ease-out] overflow-hidden rounded-3xl bg-[#FFFBF4] text-stone-800 shadow-[0_16px_48px_rgba(0,0,0,0.28)]"
        style={{ borderTop: `5px solid ${country.accent}` }}
      >
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <p className="text-lg font-bold">{i18n.t(`country.${country.country}`)}</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                {country.country}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
            aria-label={i18n.t("common.close")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="h-px bg-stone-200" />

        <div className="max-h-[42vh] overflow-y-auto px-5 py-4">
          {visited ? (
            <>
              <p className="text-sm font-bold" style={{ color: country.accent }}>
                🍽️ {i18n.t("map.dishes_cooked", { count: unlockedRecipes.length })}
              </p>
              {unlockedRecipes.length > 0 ? (
                <ul className="mt-3 grid gap-2">
                  {unlockedRecipes.map((recipe) => (
                    <li key={recipe.id}>
                      <button
                        type="button"
                        onClick={() => onSelectRecipe(recipe)}
                        className="focus-ring flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-left shadow-sm transition hover:bg-amber-50"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-stone-100 text-2xl">
                          {recipe.badgeEmoji}
                        </span>
                        <span className="flex-1 text-sm font-bold text-stone-800">{recipe.name}</span>
                        <span className="text-xs font-semibold text-stone-400">→</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-stone-500">{i18n.t("map.unvisited_title")}</p>
              )}

              {allRecipes.length > unlockedRecipes.length && (
                <p className="mt-3 text-xs font-semibold text-stone-500">
                  +{allRecipes.length - unlockedRecipes.length} more to discover
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm font-bold text-stone-600">
                <Lock size={16} aria-hidden="true" />
                <span>{i18n.t("map.unvisited_title")}</span>
              </div>
              <button
                type="button"
                onClick={onStartCooking}
                className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold text-white transition hover:opacity-90"
                style={{ backgroundColor: country.accent }}
              >
                <MapPin size={16} aria-hidden="true" />
                {i18n.t("map.go_cook")}
              </button>
            </>
          )}
        </div>
      </article>
    </div>
  );
}
