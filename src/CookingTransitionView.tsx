import { useEffect, useMemo, useRef } from "react";
import { getRandomFact } from "./core/factSelector";
import { i18n } from "./i18n";

type RecipeLite = {
  id: string;
  name: string;
  country: string;
  badgeEmoji?: string;
};

type CookingTransitionViewProps = {
  recipe: RecipeLite;
  selectedIngredients: string[];
  onComplete: () => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  decay: number;
  gravity: number;
};

const countryAccent: Record<string, string> = {
  China: "#DE2910",
  Indonesia: "#CE1126",
  "United States of America": "#3C3B6E",
  India: "#FF9933"
};

const countryFlags: Record<string, string> = {
  China: "🇨🇳",
  Indonesia: "🇮🇩",
  "United States of America": "🇺🇸",
  India: "🇮🇳"
};

const countrySubtitles: Record<string, string> = {
  China: "Chinese Kitchen",
  Indonesia: "Indonesian Kitchen",
  "United States of America": "American Diner",
  India: "भारतीय रसोई"
};

const countryBurstText: Record<string, string> = {
  China: "哗!",
  Indonesia: "Sizzle!",
  "United States of America": "BOOM!",
  India: "Khana Taiyar Hai!"
};

export function CookingTransitionView({
  recipe,
  selectedIngredients,
  onComplete
}: CookingTransitionViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const fact = useMemo(
    () => getRandomFact(recipe.country, i18n.getLanguage()),
    [recipe.country]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;

    const particles: Particle[] = [];
    const ingredientCount = Math.min(selectedIngredients.length, 6);
    const ingredientChips = selectedIngredients.slice(0, ingredientCount).map((ingredient, index) => ({
      label: ingredient.slice(0, 1).toUpperCase(),
      emoji: firstEmoji(ingredient),
      xOffset: -120 + ((index + 1) / (ingredientCount + 1)) * 240,
      delay: 0.6 + index * 0.15
    }));

    const dpr = window.devicePixelRatio || 1;
    const size = { width: window.innerWidth, height: window.innerHeight };
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const startTime = Date.now();
    const factCard = createFactCard(recipe.country, fact);

    function cleanupCard() {
      if (factCard.parentNode) {
        factCard.parentNode.removeChild(factCard);
      }
    }

    timeoutsRef.current.push(
      window.setTimeout(() => {
        document.body.appendChild(factCard);
        window.requestAnimationFrame(() => {
          factCard.style.transition = "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)";
          factCard.style.transform = "translateX(-50%) translateY(0%)";
        });
      }, 800)
    );

    timeoutsRef.current.push(
      window.setTimeout(() => {
        factCard.style.transition = "transform 300ms cubic-bezier(0.55, 0, 1, 0.45)";
        factCard.style.transform = "translateX(-50%) translateY(120%)";
      }, 3200)
    );

    timeoutsRef.current.push(
      window.setTimeout(() => {
        cleanupCard();
        onComplete();
      }, 4000)
    );

    function emit(x: number, y: number, options: Partial<Particle> = {}, count = 1) {
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x,
          y,
          vx: random(-1.5, 1.5),
          vy: random(-4, -1),
          color: "rgba(255,255,255,0.8)",
          size: random(2, 7),
          life: 1,
          decay: 0.03,
          gravity: 0.08,
          ...options
        });
      }
    }

    function drawFrame() {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / 4, 1);
      const vesselProgress = clamp((elapsed - 0.2) / 0.6, 0, 1);
      const outProgress = clamp((elapsed - 3.5) / 0.5, 0, 1);
      const centerX = size.width * 0.5;
      const vesselY = size.height * (recipe.country === "India" ? 0.54 : 0.58);

      ctx.clearRect(0, 0, size.width, size.height);
      drawBackground(ctx, size.width, size.height, recipe.country, elapsed);

      ctx.save();
      ctx.globalAlpha = 1 - outProgress;
      const scale = 1 + outProgress * 0.1;
      ctx.translate(centerX, size.height * 0.5);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -size.height * 0.5);

      drawDecorations(ctx, size.width, size.height, recipe.country, elapsed);
      drawVessel(ctx, size.width, size.height, recipe.country, vesselProgress, elapsed, vesselY);

      ingredientChips.forEach((chip, index) => {
        const fallProgress = clamp((elapsed - chip.delay) / 0.55, 0, 1);
        const eased = easeOutCubic(fallProgress);
        const chipX = centerX + chip.xOffset;
        const chipTargetY = vesselY - 24 + (index % 2) * 10;
        const chipY = -50 + (chipTargetY + 50) * eased;
        const landingProgress = clamp((elapsed - chip.delay - 0.55) / 0.14, 0, 1);
        const scaleX = landingProgress > 0 && landingProgress < 0.33 ? 1.3 : landingProgress < 0.66 ? 0.92 : 1;
        const scaleY = landingProgress > 0 && landingProgress < 0.33 ? 0.7 : landingProgress < 0.66 ? 1.08 : 1;

        if (fallProgress > 0 && fallProgress < 1 && Math.abs(fallProgress - 1) < 0.05) {
          emit(chipX, chipTargetY + 12, { color: "#FFFFFF", size: random(2, 5), decay: 0.08, gravity: 0.04 }, 1);
        }

        drawIngredientChip(ctx, chipX, fallProgress >= 1 ? chipTargetY : chipY, chip.emoji || chip.label, scaleX, scaleY);
        if (recipe.country === "United States of America" && fallProgress >= 1) {
          drawGrillMarks(ctx, chipX, chipTargetY, clamp((elapsed - chip.delay - 0.1) / 0.3, 0, 1));
        }
      });

      if (elapsed >= 0.8) {
        if (recipe.country === "China") {
          emit(centerX + random(-40, 40), vesselY + 68, { vy: random(-8, -4), color: pick(["#FF6B00", "#FF4500", "#FFD700", "#FF8C00"]), gravity: 0.1, decay: 0.035 }, 3);
          emit(centerX + random(-20, 20), vesselY - 20, { vy: random(-4, -2), color: "rgba(200,200,200,0.55)", size: random(8, 18), gravity: -0.02, decay: 0.015 }, 2);
        } else if (recipe.country === "Indonesia") {
          emit(centerX + random(-120, 120), vesselY + 14, { vx: random(-3, 3), vy: random(-8, -4), color: pick(["rgba(255,200,50,0.9)", "rgba(255,150,0,0.7)", "rgba(255,255,255,0.5)"]), size: random(2, 6), gravity: 0.2, decay: 0.06 }, 4);
          emit(centerX + random(-40, 40), vesselY - 10, { vy: random(-2, -1), color: "rgba(150,120,80,0.45)", size: random(14, 28), gravity: -0.02, decay: 0.02 }, 1);
        } else if (recipe.country === "India") {
          emit(centerX + random(-18, 18), vesselY - 100, { vy: random(-5, -2), color: "rgba(220,180,100,0.28)", size: random(18, 34), gravity: -0.02, decay: 0.012 }, 3);
          emit(centerX + random(-40, 40), vesselY + 18, { vy: random(-1.5, -0.5), color: "rgba(200,150,50,0.45)", size: random(4, 12), gravity: 0, decay: 0.02 }, 1);
        } else {
          emit(centerX + random(-150, 150), vesselY + 84, { vy: random(-16, -8), color: pick(["#FF4500", "#FF6A00", "#FFD700", "#FF8C00", "#FFFF00"]), size: random(6, 16), gravity: 0.15, decay: 0.04 }, 4);
          emit(centerX + random(-120, 120), vesselY - 10, { vx: random(0.2, 0.8), vy: random(-3, -1.5), color: "rgba(180,180,200,0.38)", size: random(18, 32), gravity: -0.02, decay: 0.02 }, 1);
          emit(centerX + random(-120, 120), vesselY + random(-12, 24), { vx: random(-2, 2), vy: random(-2, 2), color: pick(["#FFFFFF", "#FFFF80"]), size: random(1, 4), gravity: 0, decay: 0.12 }, 1);
        }
      }

      if (recipe.country === "India" && elapsed >= 0.5 && elapsed < 1.05) {
        const spiceColor = elapsed < 0.7 ? "#FFD700" : elapsed < 0.9 ? "#FF2200" : "#8B4513";
        emit(centerX + random(-140, 140), 0, { vy: random(3, 7), vx: random(-1, 1), color: spiceColor, size: random(2, 6), gravity: 0.02, decay: 0.03 }, 2);
      }

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity;
        particle.vx *= 0.98;
        particle.life -= particle.decay;
        if (particle.life <= 0) return;
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * Math.max(particle.life, 0.35), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        if (particles[index].life <= 0) {
          particles.splice(index, 1);
        }
      }

      drawDishReveal(ctx, size.width, size.height, recipe, elapsed, vesselY);
      drawRevealText(ctx, size.width, size.height, recipe, elapsed, vesselY);

      if (recipe.country === "United States of America" && elapsed >= 1.5 && elapsed <= 1.78) {
        const flash = (1 - clamp((elapsed - 1.5) / 0.28, 0, 1)) * 0.6;
        ctx.fillStyle = `rgba(255, 244, 220, ${flash})`;
        ctx.fillRect(0, 0, size.width, size.height);
      }

      ctx.restore();

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(drawFrame);
      }
    }

    rafRef.current = window.requestAnimationFrame(drawFrame);

    return () => {
      timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
      timeoutsRef.current = [];
      cleanupCard();
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [fact, onComplete, recipe, selectedIngredients]);

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full bg-pantry-paper" aria-hidden="true" />;
}

function createFactCard(country: string, fact: string) {
  const card = document.createElement("div");
  card.setAttribute("role", "status");
  card.setAttribute("aria-live", "polite");
  card.setAttribute("aria-label", "Cultural food fact");
  card.style.position = "fixed";
  card.style.left = "50%";
  card.style.bottom = "0";
  card.style.zIndex = "100";
  card.style.width = "min(calc(100vw - 32px), 480px)";
  card.style.maxHeight = "160px";
  card.style.transform = "translateX(-50%) translateY(120%)";
  card.style.background = "#FFFBF4";
  card.style.borderRadius = "20px 20px 0 0";
  card.style.padding = "20px 20px calc(28px + env(safe-area-inset-bottom)) 20px";
  card.style.boxShadow = "0 -8px 32px rgba(0,0,0,0.15), 0 -2px 8px rgba(0,0,0,0.08)";
  card.style.borderTop = `3px solid ${countryAccent[country] ?? "#DE2910"}`;
  card.style.color = "#2d2926";
  card.style.fontFamily = "Inter, ui-sans-serif, system-ui, sans-serif";

  const title = document.createElement("div");
  title.style.display = "flex";
  title.style.alignItems = "center";
  title.style.justifyContent = "space-between";
  title.style.gap = "12px";
  title.style.fontSize = "15px";
  title.style.fontWeight = "700";
  title.innerHTML = `<span>${i18n.t("dyk.header")}</span><span style="font-size:20px">${countryFlags[country] ?? "🍽️"}</span>`;

  const body = document.createElement("p");
  body.style.margin = "12px 0 0";
  body.style.fontSize = "15px";
  body.style.lineHeight = "1.5";
  body.style.fontWeight = "600";
  body.textContent = fact;

  card.append(title, body);
  return card;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  country: string,
  elapsed: number
) {
  const fade = clamp(elapsed / 0.4, 0, 1);
  const accent = countryAccent[country] ?? "#d97706";

  // Cream paper base — matches the app's pantry-paper (#f8f3ea) tone.
  ctx.fillStyle = "#f8f3ea";
  ctx.fillRect(0, 0, width, height);

  // Soft radial accent wash from the vessel area, tinted by country.
  const cx = width * 0.5;
  const cy = height * 0.62;
  const wash = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(width, height) * 0.7);
  wash.addColorStop(0, hexToRgba(accent, 0.22 * fade));
  wash.addColorStop(0.55, hexToRgba(accent, 0.08 * fade));
  wash.addColorStop(1, "rgba(248,243,234,0)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  // Subtle paper grain — tiny dots at low opacity, like the .paper-texture CSS.
  ctx.fillStyle = "rgba(45, 41, 38, 0.05)";
  const grainStep = 18;
  for (let y = 0; y < height; y += grainStep) {
    for (let x = (y / grainStep) % 2 === 0 ? 0 : grainStep / 2; x < width; x += grainStep) {
      ctx.beginPath();
      ctx.arc(x, y, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  country: string,
  elapsed: number
) {
  // Very light, on-paper cultural flourishes — tuned to the warm cream palette.
  const accent = countryAccent[country] ?? "#d97706";

  if (country === "India") {
    const burst = clamp((elapsed - 1.5) / 0.6, 0, 1);
    if (burst > 0) {
      const cx = width * 0.5;
      const cy = height * 0.54;
      for (let ring = 0; ring < 6; ring += 1) {
        const delay = ring * 0.06;
        const ringProgress = clamp((burst - delay) / 0.8, 0, 1);
        if (ringProgress <= 0) continue;
        const radius = 60 + ringProgress * (140 - ring * 8);
        ctx.strokeStyle = hexToRgba(accent, (1 - ringProgress) * 0.35);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    return;
  }

  if (country === "Indonesia") {
    ctx.strokeStyle = hexToRgba(accent, 0.18);
    ctx.lineWidth = 1.2;
    for (let x = 24; x < width - 24; x += 30) {
      for (let y = 24; y < height - 24; y += 30) {
        if ((x + y) % 60 === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y - 6);
          ctx.lineTo(x + 6, y);
          ctx.lineTo(x, y + 6);
          ctx.lineTo(x - 6, y);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
    return;
  }

  if (country === "China") {
    [width * 0.14, width * 0.86].forEach((x) => {
      ctx.save();
      ctx.translate(x, height * 0.16);
      ctx.rotate((Math.sin(elapsed * 1.2) * 5 * Math.PI) / 180);
      ctx.strokeStyle = "rgba(45, 41, 38, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(0, -14);
      ctx.stroke();
      ctx.fillStyle = hexToRgba(accent, 0.85);
      ctx.beginPath();
      ctx.ellipse(0, 6, 13, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hexToRgba("#7c1d1d", 0.55);
      ctx.fillRect(-2.5, -10, 5, 30);
      ctx.restore();
    });
    return;
  }

  // United States — subtle bunting stripes along the top, paper-friendly.
  const stripeAlpha = 0.18;
  const stripeY = height * 0.08;
  const stripeHeight = 5;
  for (let i = 0; i < 12; i += 1) {
    const x = (i / 12) * width;
    ctx.fillStyle =
      i % 2 === 0 ? hexToRgba(accent, stripeAlpha) : "rgba(45, 41, 38, 0.08)";
    ctx.fillRect(x, stripeY, width / 12 - 4, stripeHeight);
  }
}

function drawVessel(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  country: string,
  enterProgress: number,
  elapsed: number,
  vesselY: number
) {
  const centerX = width * 0.5;

  if (country === "China") {
    const y = height + 200 + (vesselY - (height + 200)) * easeOutBack(enterProgress);
    const rockProgress = clamp((elapsed - 1.5) / 0.5, 0, 1);
    const rock = Math.sin(rockProgress * Math.PI * 4) * 20 * (1 - rockProgress);
    ctx.save();
    ctx.translate(centerX, y);
    ctx.rotate((-5 * (1 - enterProgress) + rock) * Math.PI / 180);
    drawWok(ctx, 0, 0, width * 0.45, height * 0.22);
    ctx.restore();
    return;
  }

  if (country === "Indonesia") {
    const y = height + 180 + (vesselY - (height + 180)) * easeOutBack(enterProgress);
    ctx.save();
    ctx.translate(centerX, y);
    ctx.scale(1, 0.85);
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.ellipse(0, 60, width * 0.15, height * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6C3310";
    for (let line = -1; line <= 1; line += 1) {
      ctx.beginPath();
      ctx.moveTo(-width * 0.12, 60 + line * 10);
      ctx.lineTo(width * 0.12, 60 + line * 10);
      ctx.stroke();
    }
    drawWok(ctx, 0, 18, width * 0.55, height * 0.15, "#1A1A1A", "#222222");
    drawSataySkewers(ctx, elapsed, width);
    drawHeatShimmer(ctx, elapsed);
    ctx.restore();
    return;
  }

  if (country === "India") {
    const drop = easeOutBounce(enterProgress);
    const y = -height * 0.3 + (vesselY - (-height * 0.3)) * drop;
    ctx.save();
    ctx.translate(centerX, y);
    drawIndianPot(ctx, width, height);
    drawSaffronThreads(ctx, elapsed, width, height);
    ctx.restore();
    return;
  }

  const y = height + 200 + (vesselY - (height + 200)) * easeOutBack(enterProgress);
  ctx.save();
  ctx.translate(centerX, y);
  drawGrill(ctx, width, height);
  ctx.restore();
}

function drawWok(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  bodyColor = "#2A2A2A",
  interiorColor = "#3A3A3A"
) {
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  const interior = ctx.createRadialGradient(x, y - 10, 20, x, y, width / 2);
  interior.addColorStop(0, interiorColor);
  interior.addColorStop(1, "#1A1A1A");
  ctx.fillStyle = interior;
  ctx.beginPath();
  ctx.ellipse(x, y - 8, width * 0.42, height * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4A4A4A";
  ctx.fillRect(x - width * 0.35 - 30, y - 8, 30, 10);
  ctx.fillRect(x + width * 0.35, y - 8, 30, 10);
  ctx.beginPath();
  ctx.arc(x - width * 0.35 - 30, y - 3, 6, 0, Math.PI * 2);
  ctx.arc(x + width * 0.35 + 30, y - 3, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - height * 0.1, width * 0.42, height * 0.18, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
}

function drawSataySkewers(ctx: CanvasRenderingContext2D, elapsed: number, width: number) {
  for (let index = 0; index < 4; index += 1) {
    const progress = easeOutCubic(clamp((elapsed - 1.2 - index * 0.1) / 0.4, 0, 1));
    if (progress <= 0) continue;
    const startX = -width * 0.5;
    const endX = -width * 0.3 + index * 24;
    const x = startX + (endX - startX) * progress;
    const y = -8 + index * 12;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.32);
    ctx.fillStyle = "#8B6914";
    ctx.fillRect(0, 0, width * 0.45, 4);
    [0.2, 0.45, 0.68].forEach((offset, meatIndex) => {
      ctx.fillStyle = meatIndex % 2 === 0 ? "#C0643A" : "#8B3A1A";
      roundRectPath(ctx, width * 0.45 * offset, -8, 24, 20, 8);
      ctx.fill();
    });
    ctx.restore();
  }
}

function drawHeatShimmer(ctx: CanvasRenderingContext2D, elapsed: number) {
  ctx.strokeStyle = "rgba(255,200,100,0.15)";
  ctx.lineWidth = 2;
  for (let index = 0; index < 5; index += 1) {
    const y = -60 - index * 14;
    ctx.beginPath();
    ctx.moveTo(-120, y);
    ctx.bezierCurveTo(
      Math.sin(elapsed * 8 + index) * 20,
      y - 10,
      Math.cos(elapsed * 6 + index) * 15,
      y + 10,
      120,
      y
    );
    ctx.stroke();
  }
}

function drawIndianPot(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const potWidth = width * 0.35;
  const potHeight = height * 0.35;
  const gradient = ctx.createLinearGradient(-potWidth * 0.4, 0, potWidth * 0.4, 0);
  gradient.addColorStop(0, "rgba(255,215,0,0.45)");
  gradient.addColorStop(0.4, "#B8860B");
  gradient.addColorStop(1, "#8A650A");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-potWidth * 0.42, -potHeight * 0.3);
  ctx.bezierCurveTo(-potWidth * 0.48, 0, -potWidth * 0.4, potHeight * 0.34, -potWidth * 0.3, potHeight * 0.4);
  ctx.lineTo(potWidth * 0.3, potHeight * 0.4);
  ctx.bezierCurveTo(potWidth * 0.4, potHeight * 0.34, potWidth * 0.48, 0, potWidth * 0.42, -potHeight * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#DAA520";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, -potHeight * 0.3, potWidth * 0.42, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, potHeight * 0.42, potWidth * 0.34, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSaffronThreads(ctx: CanvasRenderingContext2D, elapsed: number, width: number, height: number) {
  const progress = clamp((elapsed - 1) / 1, 0, 1);
  if (progress <= 0 || progress >= 1) return;
  ctx.strokeStyle = `rgba(255,140,0,${Math.sin(progress * Math.PI)})`;
  ctx.lineWidth = 1;
  for (let index = 0; index < 6; index += 1) {
    const x = -80 + index * 32;
    ctx.beginPath();
    ctx.moveTo(x, -height * 0.22);
    ctx.quadraticCurveTo(x + 8, -height * 0.12, x - 6, -height * 0.02);
    ctx.stroke();
  }
  void width;
}

function drawGrill(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const grillWidth = width * 0.7;
  const grillHeight = height * 0.4;
  roundRectPath(ctx, -grillWidth / 2, -grillHeight / 2, grillWidth, grillHeight, 8);
  ctx.fillStyle = "#555555";
  ctx.fill();
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let index = 0; index < 8; index += 1) {
    const y = -grillHeight / 2 + 26 + index * 24;
    ctx.fillStyle = "#444444";
    ctx.fillRect(-grillWidth * 0.42, y, grillWidth * 0.84, 8);
    ctx.strokeStyle = "#777777";
    ctx.beginPath();
    ctx.moveTo(-grillWidth * 0.42, y);
    ctx.lineTo(grillWidth * 0.42, y);
    ctx.stroke();
    ctx.strokeStyle = "#222222";
    ctx.beginPath();
    ctx.moveTo(-grillWidth * 0.42, y + 8);
    ctx.lineTo(grillWidth * 0.42, y + 8);
    ctx.stroke();
  }
}

function drawIngredientChip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  scaleX = 1,
  scaleY = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, scaleY);
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#2D2926";
  ctx.font = "24px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 1);
  ctx.restore();
}

function drawGrillMarks(ctx: CanvasRenderingContext2D, x: number, y: number, progress: number) {
  if (progress <= 0) return;
  const length = 22 * progress;
  ctx.strokeStyle = "#1A1A1A";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - length / 2, y - 7);
  ctx.lineTo(x + length / 2, y + 7);
  ctx.moveTo(x - length / 2, y + 7);
  ctx.lineTo(x + length / 2, y - 7);
  ctx.stroke();
}

function drawDishReveal(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  recipe: RecipeLite,
  elapsed: number,
  vesselY: number
) {
  const progress = clamp((elapsed - 2.4) / 0.9, 0, 1);
  if (progress <= 0) return;
  const eased = easeOutBack(progress);
  const centerX = width * 0.5;
  const centerY = vesselY;

  const glowRadius = 150;
  const glow = ctx.createRadialGradient(centerX, centerY, 12, centerX, centerY, glowRadius);
  glow.addColorStop(0, `rgba(255,238,170,${0.55 * progress})`);
  glow.addColorStop(0.6, `rgba(255,210,140,${0.18 * progress})`);
  glow.addColorStop(1, "rgba(255,210,140,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.translate(centerX, centerY);
  ctx.scale(eased, eased);
  ctx.shadowColor = "rgba(0,0,0,0.25)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.arc(0, 0, 64, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(getRecipeBadge(recipe), 0, 4);
  ctx.restore();
}

function drawRevealText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  recipe: RecipeLite,
  elapsed: number,
  vesselY: number
) {
  const country = recipe.country;
  const progress = clamp((elapsed - 2.5) / 0.4, 0, 1);
  if (progress <= 0) return;

  const burstText = countryBurstText[country] ?? "Ready!";
  const subtitle = countrySubtitles[country] ?? "";
  const burstChars = burstText.slice(0, Math.max(1, Math.floor((elapsed - 2.5) / 0.05)));
  const burstScale =
    country === "China" || country === "United States of America" ? easeOutElastic(progress) : easeOutBack(progress);

  const burstY = Math.max(80, vesselY - 200);

  const accent = countryAccent[country] ?? "#d97706";

  ctx.save();
  ctx.translate(width * 0.5, burstY);
  ctx.scale(burstScale, burstScale);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 64px Fraunces, Georgia, serif";
  ctx.shadowColor = hexToRgba(accent, 0.35);
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#2d2926";
  ctx.fillText(burstChars, 0, 0);
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetY = 0;
  // Accent underscore — a paper-stamp feel matching the rest of the app.
  const underlineWidth = ctx.measureText(burstChars).width;
  ctx.fillStyle = hexToRgba(accent, 0.55);
  ctx.fillRect(-underlineWidth / 2, 38, underlineWidth, 4);
  ctx.restore();

  if (subtitle) {
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.fillStyle = hexToRgba(accent, 0.85);
    ctx.font = "600 18px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(subtitle.toUpperCase(), width * 0.5, burstY + 64);
    ctx.restore();
  }

  // Recipe name reveal — centered horizontally and aligned just under the cooked dish.
  const nameProgress = clamp((elapsed - 2.7) / 0.5, 0, 1);
  if (nameProgress > 0) {
    const nameY = Math.min(height - 60, vesselY + 130);
    const nameOffset = (1 - easeOutCubic(nameProgress)) * 18;
    ctx.save();
    ctx.globalAlpha = nameProgress;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const padding = 18;
    ctx.font = "800 30px sans-serif";
    const textWidth = ctx.measureText(recipe.name).width;
    const pillWidth = textWidth + padding * 2;
    const pillHeight = 50;
    const pillX = width * 0.5 - pillWidth / 2;
    const pillY = nameY - pillHeight / 2 + nameOffset;

    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    roundRectPath(ctx, pillX, pillY, pillWidth, pillHeight, 999);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = "#2D2926";
    ctx.fillText(recipe.name, width * 0.5, nameY + nameOffset + 1);
    ctx.restore();
  }
  void height;
}

function getRecipeBadge(recipe: RecipeLite): string {
  if (recipe.badgeEmoji) return recipe.badgeEmoji;
  const match = recipe.name.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u);
  return match?.[0] ?? recipe.name.slice(0, 1).toUpperCase();
}

function roundRectPath(
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function random(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function firstEmoji(ingredient: string) {
  const match = ingredient.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u);
  return match?.[0] ?? "";
}

function mixColor(from: string, to: string, progress: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const r = Math.round(a.r + (b.r - a.r) * progress);
  const g = Math.round(a.g + (b.g - a.g) * progress);
  const bValue = Math.round(a.b + (b.b - a.b) * progress);
  return `rgb(${r}, ${g}, ${bValue})`;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutElastic(t: number) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutBounce(t: number) {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t - 1.5 / 2.75) * (t - 1.5 / 2.75) + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t - 2.25 / 2.75) * (t - 2.25 / 2.75) + 0.9375;
  return 7.5625 * (t - 2.625 / 2.75) * (t - 2.625 / 2.75) + 0.984375;
}
