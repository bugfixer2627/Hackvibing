import { ChevronLeft, Lock, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { i18n } from "./i18n";

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
  onOpenCountryRecipe: (country: string) => void;
};

type MapCountry = {
  country: string;
  flag: string;
  accent: string;
  x: number;
  y: number;
};

type PopupState = {
  country: MapCountry;
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

const mapCountries: MapCountry[] = [
  { country: "China", flag: "🇨🇳", accent: "#DE2910", x: 0.78, y: 0.36 },
  { country: "United States of America", flag: "🇺🇸", accent: "#3C3B6E", x: 0.18, y: 0.36 },
  { country: "Indonesia", flag: "🇮🇩", accent: "#CE1126", x: 0.8, y: 0.57 },
  { country: "India", flag: "🇮🇳", accent: "#FF9933", x: 0.67, y: 0.44 }
];

const continentShapes: Array<Array<[number, number]>> = [
  [[8, 15], [18, 12], [28, 14], [32, 18], [34, 24], [30, 28], [28, 35], [24, 40], [20, 46], [16, 48], [12, 44], [8, 38], [6, 28], [7, 20]],
  [[24, 40], [22, 44], [20, 50], [22, 52], [24, 50], [26, 46]],
  [[22, 52], [26, 52], [32, 54], [36, 56], [36, 62], [34, 70], [30, 76], [26, 80], [22, 78], [20, 72], [20, 64], [20, 56]],
  [[44, 14], [50, 12], [56, 14], [58, 18], [56, 22], [52, 24], [48, 26], [44, 24], [42, 20]],
  [[46, 28], [52, 26], [58, 28], [62, 32], [64, 38], [64, 46], [62, 54], [58, 62], [54, 68], [50, 70], [46, 66], [44, 58], [44, 50], [44, 40], [44, 32]],
  [[58, 14], [68, 12], [78, 14], [86, 16], [90, 20], [88, 26], [84, 30], [86, 36], [84, 40], [80, 38], [76, 36], [72, 34], [68, 36], [64, 38], [62, 32], [60, 26], [58, 20]],
  [[64, 38], [68, 36], [72, 38], [74, 42], [72, 48], [68, 52], [64, 48], [62, 44]],
  [[76, 36], [80, 38], [82, 42], [80, 46], [76, 44], [74, 42], [72, 38]],
  [[72, 52], [76, 50], [80, 52], [80, 56], [76, 58], [72, 56]],
  [[76, 57], [80, 56], [86, 57], [88, 59], [86, 61], [80, 60], [76, 59]],
  [[80, 50], [84, 48], [88, 50], [90, 54], [88, 58], [84, 58], [80, 56]],
  [[80, 64], [88, 62], [94, 64], [96, 70], [94, 76], [88, 80], [82, 80], [78, 76], [76, 70], [78, 64]]
];

const regionLabels = [
  ["NORTH AMERICA", 0.16, 0.28],
  ["SOUTH AMERICA", 0.26, 0.64],
  ["EUROPE", 0.49, 0.2],
  ["AFRICA", 0.52, 0.48],
  ["ASIA", 0.75, 0.26],
  ["AUSTRALIA", 0.84, 0.7]
] as const;

const oceanLabels = [
  ["PACIFIC OCEAN", 0.08, 0.56],
  ["ATLANTIC OCEAN", 0.36, 0.5],
  ["INDIAN OCEAN", 0.62, 0.62]
] as const;

function drawPolygon(ctx: CanvasRenderingContext2D, width: number, height: number, points: Array<[number, number]>) {
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    const px = (x / 100) * width;
    const py = (y / 100) * height;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function WorldMapView({
  recipes,
  unlockedRecipeIds,
  unlockedCountries,
  onBack,
  onStartCooking,
  onOpenCountryRecipe
}: WorldMapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  const cookedByCountry = useMemo(() => {
    const map = new Map<string, RecipeLite[]>();
    recipes.forEach((recipe) => {
      if (!unlockedRecipeIds.has(recipe.id)) return;
      const list = map.get(recipe.country) ?? [];
      list.push(recipe);
      map.set(recipe.country, list);
    });
    return map;
  }, [recipes, unlockedRecipeIds]);

  useEffect(() => {
    function syncSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    syncSize();
    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    function frame() {
      const now = Date.now();
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.fillStyle = "#1B3A52";
      ctx.fillRect(0, 0, size.width, size.height);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.5;
      [0.17, 0.33, 0.5, 0.67, 0.83].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(size.width * x, 0);
        ctx.lineTo(size.width * x, size.height);
        ctx.stroke();
      });
      [0.17, 0.33, 0.5, 0.67, 0.83].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(0, size.height * y);
        ctx.lineTo(size.width, size.height * y);
        ctx.stroke();
      });

      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, size.height * 0.56);
      ctx.lineTo(size.width, size.height * 0.56);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "600 9px sans-serif";
      ctx.fillText("E Q U A T O R", size.width * 0.02, size.height * 0.55);
      ctx.restore();

      ctx.fillStyle = "#C8B89A";
      ctx.strokeStyle = "#A89070";
      ctx.lineWidth = 1;
      continentShapes.forEach((shape) => drawPolygon(ctx, size.width, size.height, shape));

      ctx.fillStyle = "#E8F0F4";
      ctx.fillRect(0, size.height * 0.92, size.width, size.height * 0.08);

      ctx.fillStyle = "rgba(80,60,40,0.45)";
      ctx.font = "700 8px sans-serif";
      regionLabels.forEach(([label, x, y]) => {
        ctx.fillText(label, size.width * x, size.height * y);
      });

      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.font = "italic 9px serif";
      oceanLabels.forEach(([label, x, y]) => {
        ctx.fillText(label, size.width * x, size.height * y);
      });

      mapCountries.forEach((country) => {
        const pinX = size.width * country.x;
        const pinY = size.height * country.y;
        const visited = unlockedCountries.has(country.country);
        const pulse = visited ? 1 + Math.sin(now / 500) * 0.08 : 1;

        ctx.save();
        ctx.translate(pinX, pinY);
        ctx.scale(pulse, pulse);
        ctx.translate(-pinX, -pinY);

        if (visited) {
          ctx.fillStyle = `${country.accent}40`;
          ctx.beginPath();
          ctx.arc(pinX, pinY, 22, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = country.accent;
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pinX, pinY, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = "18px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(country.flag, pinX, pinY + 1);

          const count = cookedByCountry.get(country.country)?.length ?? 0;
          ctx.fillStyle = "#E67E22";
          ctx.beginPath();
          ctx.arc(pinX + 16, pinY - 16, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "700 9px sans-serif";
          ctx.fillText(String(count), pinX + 16, pinY - 16);
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.strokeStyle = "rgba(255,255,255,0.5)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pinX, pinY, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.font = "14px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText("🔒", pinX, pinY + 1);
        }

        const label = i18n.t(`country.${country.country}`);
        ctx.font = "700 10px sans-serif";
        const labelWidth = ctx.measureText(label).width;
        const rectX = pinX - labelWidth / 2 - 6;
        const rectY = pinY + 20;
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        roundRect(ctx, rectX, rectY, labelWidth + 12, 18, 8);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, pinX, rectY + 9);
        ctx.restore();
      });

      rafRef.current = window.requestAnimationFrame(frame);
    }

    rafRef.current = window.requestAnimationFrame(frame);
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [cookedByCountry, size.height, size.width, unlockedCountries]);

  useEffect(() => {
    function handleOutside(event: PointerEvent) {
      if (!popup || !containerRef.current) return;
      const popupElement = containerRef.current.querySelector("[data-map-popup='true']");
      if (popupElement instanceof HTMLElement && popupElement.contains(event.target as Node)) return;
      setPopup(null);
    }

    window.addEventListener("pointerdown", handleOutside);
    return () => window.removeEventListener("pointerdown", handleOutside);
  }, [popup]);

  const exploredCount = unlockedCountries.size;

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden bg-[#1B3A52] text-white">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        onPointerDown={(event) => {
          pointerStartRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          const start = pointerStartRef.current;
          if (!start) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (Math.hypot(dx, dy) > 10) return;

          const hit = mapCountries.find((country) => {
            const pinX = size.width * country.x;
            const pinY = size.height * country.y;
            return Math.hypot(event.clientX - pinX, event.clientY - pinY) < 32;
          });

          if (!hit) {
            setPopup(null);
            return;
          }

          setPopup({ country: hit, x: size.width * hit.x, y: size.height * hit.y });
        }}
      />

      <header className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between bg-[rgba(27,58,82,0.9)] px-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label={i18n.t("common.back")}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="text-base font-bold">{i18n.t("map.title")}</h1>
        <span className="h-10 w-10" aria-hidden="true" />
      </header>

      {popup && (
        <CountryPopup
          popup={popup}
          size={size}
          recipes={cookedByCountry.get(popup.country.country) ?? []}
          visited={unlockedCountries.has(popup.country.country)}
          onClose={() => setPopup(null)}
          onStartCooking={() => {
            setPopup(null);
            onStartCooking();
          }}
          onViewRecipe={() => {
            setPopup(null);
            onOpenCountryRecipe(popup.country.country);
          }}
        />
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 bg-[rgba(27,58,82,0.92)] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 text-center backdrop-blur">
        <p className="text-sm font-bold">{i18n.t("map.explored", { count: exploredCount })}</p>
        <p className="mt-1 text-xs text-white/70">{i18n.t("map.dishes_cooked", { count: unlockedRecipeIds.size })}</p>
        <div className="mt-3 flex items-center justify-center gap-3 text-2xl">
          {mapCountries.map((country) => {
            const visited = unlockedCountries.has(country.country);
            return (
              <span
                key={country.country}
                className={visited ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.45)]" : "opacity-30 grayscale"}
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

function CountryPopup({
  popup,
  size,
  recipes,
  visited,
  onClose,
  onStartCooking,
  onViewRecipe
}: {
  popup: PopupState;
  size: Size;
  recipes: RecipeLite[];
  visited: boolean;
  onClose: () => void;
  onStartCooking: () => void;
  onViewRecipe: () => void;
}) {
  const width = 240;
  const estimatedHeight = visited ? 220 : 178;
  let left = popup.x - width / 2;
  let top = popup.y - estimatedHeight - 20;
  if (left < 10) left = 10;
  if (left + width > size.width - 10) left = size.width - width - 10;
  if (top < 72) top = popup.y + 20;

  return (
    <article
      data-map-popup="true"
      className="absolute z-30 w-[240px] animate-[scale-in_200ms_ease-out] rounded-2xl bg-[#FFFBF4] p-4 text-stone-800 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
      style={{ left, top, borderTop: `4px solid ${popup.country.accent}` }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{popup.country.flag}</span>
        <div>
          <p className="text-lg font-bold">{i18n.t(`country.${popup.country.country}`)}</p>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">{popup.country.country}</p>
        </div>
      </div>

      <div className="my-3 h-px bg-stone-200" />

      {visited ? (
        <>
          <p className="text-sm font-bold" style={{ color: popup.country.accent }}>
            🍽️ {i18n.t("map.dishes_cooked", { count: recipes.length })}
          </p>
          <div className="mt-3 flex gap-2">
            {recipes.slice(0, 3).map((recipe) => (
              <div key={recipe.id} className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
                <span className="text-xl">{recipe.badgeEmoji}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onViewRecipe}
              className="focus-ring rounded-xl px-3 py-3 text-sm font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: popup.country.accent }}
            >
              {i18n.t("map.view_recipe")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-xl bg-stone-100 px-3 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-200"
            >
              {i18n.t("common.close")}
            </button>
          </div>
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
            className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: popup.country.accent }}
          >
            <MapPin size={16} aria-hidden="true" />
            {i18n.t("map.go_cook")}
          </button>
        </>
      )}
    </article>
  );
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
