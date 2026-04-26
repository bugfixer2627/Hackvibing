import { useEffect, useMemo, useRef, useState } from "react";
import { i18n, useI18nLanguage } from "./i18n";
import type { LanguageCode } from "./i18n";
import { getIngredientFunFact, getIngredientMeta, getIngredientName, getIngredientOriginStory } from "./ingredients";

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawIngredientIllustration(ctx: CanvasRenderingContext2D, id: string, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;

  ctx.fillStyle = "rgba(253, 246, 236, 1)";
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(cx, cy);

  if (id === "tomato") {
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(0, 12, Math.min(w, h) * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(-18, -8);
    ctx.lineTo(18, -8);
    ctx.closePath();
    ctx.fill();
  } else if (id.includes("garlic")) {
    ctx.fillStyle = "#f5f5f4";
    ctx.strokeStyle = "rgba(45, 41, 38, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-18, 16, 34, 44, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(18, 10, 30, 40, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#a16207";
    ctx.beginPath();
    roundRectPath(ctx, -8, -42, 16, 22, 8);
    ctx.fill();
  } else if (id.includes("egg")) {
    ctx.fillStyle = "#fef3c7";
    ctx.strokeStyle = "rgba(45, 41, 38, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 8, 44, 58, 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (id.includes("rice")) {
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.strokeStyle = "rgba(45, 41, 38, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    roundRectPath(ctx, -74, 4, 148, 68, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(15, 118, 110, 0.2)";
    ctx.beginPath();
    roundRectPath(ctx, -62, 14, 124, 42, 18);
    ctx.fill();
    ctx.fillStyle = "rgba(45, 41, 38, 0.16)";
    for (let i = 0; i < 28; i += 1) {
      const x = -52 + (i % 7) * 18;
      const y = 20 + Math.floor(i / 7) * 10;
      ctx.fillRect(x, y, 10, 4);
    }
  } else if (id.includes("chili")) {
    ctx.fillStyle = "#ef4444";
    ctx.strokeStyle = "rgba(45, 41, 38, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 10, 60, 22, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#16a34a";
    ctx.beginPath();
    roundRectPath(ctx, -42, -24, 18, 18, 8);
    ctx.fill();
  } else if (id.includes("onion") || id.includes("shallot")) {
    ctx.fillStyle = "#f5f5f4";
    ctx.strokeStyle = "rgba(45, 41, 38, 0.18)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 18, 54, 60, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#a16207";
    ctx.beginPath();
    roundRectPath(ctx, -8, -42, 16, 18, 8);
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(15, 118, 110, 0.22)";
    ctx.beginPath();
    ctx.arc(0, 16, Math.min(w, h) * 0.26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(45, 41, 38, 0.82)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 18px system-ui, sans-serif";
    ctx.fillText(id.replace(/_/g, " ").slice(0, 12), 0, 16);
  }

  ctx.restore();
}

export function IngredientOriginSheet({
  ingredient,
  onClose
}: {
  ingredient: string;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const meta = useMemo(() => getIngredientMeta(ingredient), [ingredient]);
  const language = useI18nLanguage() as LanguageCode;

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 10);
    return () => window.clearTimeout(t);
  }, [ingredient]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !meta) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    const w = 360;
    const h = 170;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawIngredientIllustration(ctx, meta.id, w, h);
  }, [ingredient, meta]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const nameAll = meta
    ? `${meta.name_zh} / ${meta.name_en} / ${meta.name_id} / ${meta.name_hi}`
    : ingredient;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={ingredient}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      style={{
        backgroundColor: open ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0)",
        transition: "background-color 300ms ease-out"
      }}
    >
      <div
        ref={sheetRef}
        className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-t-[2rem] bg-white shadow-soft"
        style={{
          transform: open ? "translateY(0)" : "translateY(110%)",
          transition: "transform 300ms ease-out"
        }}
      >
        <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-stone-200" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-pantry-mint">{i18n.t("origin.header")}</p>
              <h2 className="mt-2 font-display text-3xl font-black leading-tight">
                {meta ? getIngredientName(meta, language) : ingredient}
              </h2>
              <p className="mt-2 text-sm font-bold text-stone-500">{nameAll}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-2xl bg-pantry-paper px-4 py-3 text-sm font-bold text-pantry-ink transition hover:bg-amber-100"
            >
              {i18n.t("common.close")}
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-stone-900/10 bg-pantry-paper">
            <canvas ref={canvasRef} aria-hidden="true" className="block w-full" />
          </div>

          {meta ? (
            <>
              <div className="mt-5 rounded-3xl bg-pantry-paper p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">{i18n.t("origin.from")}</p>
                <p className="mt-2 text-lg font-black text-pantry-ink">{meta.originCountry}</p>
                <p className="mt-3 text-sm font-medium leading-7 text-stone-700">
                  {getIngredientOriginStory(meta, language)}
                </p>
              </div>
              <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">{i18n.t("origin.fun_fact")}</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-stone-700">
                  {getIngredientFunFact(meta, language)}
                </p>
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-3xl bg-pantry-paper p-5">
              <p className="text-sm font-semibold text-stone-600">{i18n.t("origin.missing")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

