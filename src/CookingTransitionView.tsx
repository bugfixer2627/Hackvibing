import { useEffect, useMemo, useRef } from "react";
import { getRandomFact } from "./core/factSelector";
import { i18n } from "./i18n";

type RecipeLite = {
  id: string;
  name: string;
  country: string;
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

      drawDishReveal(ctx, size.width, size.height, recipe, elapsed);
      drawRevealText(ctx, size.width, size.height, recipe.country, elapsed);

      if (recipe.country === "United States of America" && elapsed >= 1.5 && elapsed <= 1.78) {
        const flash = 1 - clamp((elapsed - 1.5) / 0.28, 0, 1);
        ctx.fillStyle = `rgba(255,255,255,${flash})`;
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

  return <canvas ref={canvasRef} className="fixed inset-0 h-full w-full bg-[#111]" aria-hidden="true" />;
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
  card.style.color = "#2C3E50";

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
  const fade = clamp(elapsed / 0.3, 0, 1);
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const from = country === "China"
    ? ["#8B0000", "#2C0000"]
    : country === "Indonesia"
      ? ["#8B4500", "#4A1500"]
      : country === "India"
        ? ["#8B4500", "#2A0A00"]
        : ["#1C1C1C", "#090909"];
  gradient.addColorStop(0, mixColor("#FDF6EC", from[0], fade));
  gradient.addColorStop(1, mixColor("#FDF6EC", from[1], fade));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (country === "United States of America") {
    for (let x = 0; x < width * 0.15; x += 8) {
      ctx.fillStyle = x % 16 === 0 ? "rgba(204,0,0,0.3)" : "rgba(255,255,255,0.3)";
      ctx.fillRect(x, 0, 8, height);
      ctx.fillRect(width - width * 0.15 + x, 0, 8, height);
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
  if (country === "China") {
    [width * 0.14, width * 0.86].forEach((x) => {
      ctx.save();
      ctx.translate(x, height * 0.12);
      ctx.rotate((Math.sin(elapsed * 1.5) * 8 * Math.PI) / 180);
      ctx.strokeStyle = "#111";
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.lineTo(0, -16);
      ctx.stroke();
      ctx.fillStyle = "#CC0000";
      ctx.beginPath();
      ctx.ellipse(0, 8, 16, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FF6666";
      ctx.fillRect(-4, -12, 8, 40);
      ctx.restore();
    });
  } else if (country === "Indonesia") {
    ctx.strokeStyle = "rgba(200,120,50,0.28)";
    ctx.lineWidth = 1.5;
    for (let x = 20; x < width - 20; x += 24) {
      for (let y = 20; y < height - 20; y += 24) {
        if ((x + y) % 48 === 0) {
          ctx.beginPath();
          ctx.moveTo(x, y - 8);
          ctx.lineTo(x + 8, y);
          ctx.lineTo(x, y + 8);
          ctx.lineTo(x - 8, y);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
  } else if (country === "India") {
    const burst = clamp((elapsed - 1.5) / 0.55, 0, 1);
    if (burst > 0) {
      const cx = width * 0.5;
      const cy = height * 0.54;
      for (let ring = 0; ring < 8; ring += 1) {
        const delay = ring * 0.05;
        const ringProgress = clamp((burst - delay) / 0.75, 0, 1);
        if (ringProgress <= 0) continue;
        const radius = 50 + ringProgress * (150 - ring * 8);
        ctx.strokeStyle = `rgba(255,150,0,${1 - ringProgress})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        ctx.strokeStyle = `rgba(255,150,0,${1 - burst})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 120, cy + Math.sin(angle) * 120);
        ctx.stroke();
      }
    }
  } else {
    const flicker = Math.sin(elapsed * 8) * 0.3 + 0.7;
    const x = width * 0.25;
    const y = height * 0.16;
    const w = width * 0.5;
    ctx.save();
    ctx.globalAlpha = flicker;
    ["rgba(255,107,0,0.1)", "rgba(255,107,0,0.3)", "rgba(255,107,0,0.5)"].forEach((color, index) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 6 + index * 2, y - 6 + index * 2, w + 12 - index * 4, 40 + 12 - index * 4);
    });
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x, y, w, 40);
    ctx.strokeStyle = "#FF6B00";
    ctx.strokeRect(x, y, w, 40);
    ctx.fillStyle = "#FF6B00";
    ctx.font = "700 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DINER", x + w / 2, y + 27);
    ctx.restore();
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
  elapsed: number
) {
  const progress = clamp((elapsed - 2.5) / 1, 0, 1);
  if (progress <= 0) return;
  const centerX = width * 0.5;
  const centerY = height * 0.45;
  const glow = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 120);
  glow.addColorStop(0, `rgba(255,244,180,${0.45 * progress})`);
  glow.addColorStop(1, "rgba(255,244,180,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalAlpha = progress;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.beginPath();
  ctx.arc(centerX, centerY, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2D2926";
  ctx.font = "700 44px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(recipe.name.slice(0, 1), centerX, centerY + 2);
  ctx.restore();
}

function drawRevealText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  country: string,
  elapsed: number
) {
  const progress = clamp((elapsed - 2.5) / 0.3, 0, 1);
  if (progress <= 0) return;
  const text = countryBurstText[country] ?? "Ready!";
  const subtitle = countrySubtitles[country] ?? "";
  const chars = text.slice(0, Math.max(1, Math.floor((elapsed - 2.5) / 0.05)));
  const scale = country === "China" || country === "United States of America" ? easeOutElastic(progress) : easeOutBack(progress);

  ctx.save();
  ctx.translate(width * 0.5, height * 0.22);
  ctx.scale(scale, scale);
  if (country === "United States of America") {
    ctx.font = "900 80px sans-serif";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#111";
    ctx.strokeText(chars, 0, 0);
    ctx.fillStyle = "#FF6B00";
    ctx.shadowColor = "#CC3300";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 6;
    ctx.shadowOffsetY = 6;
    ctx.fillText(chars, 0, 0);
  } else if (country === "China") {
    ctx.font = "700 80px serif";
    ctx.fillStyle = "#FFD700";
    ctx.shadowColor = "rgba(0,0,0,0.8)";
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText(chars, 0, 0);
  } else if (country === "India") {
    ctx.font = "700 52px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(chars, 0, 0);
  } else {
    ctx.font = "700 64px sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(chars, 0, 0);
  }
  ctx.restore();

  if (subtitle) {
    ctx.save();
    ctx.globalAlpha = progress;
    ctx.fillStyle = country === "Indonesia" ? "#FFB830" : "#FFFFFF";
    ctx.font = country === "India" ? "700 24px sans-serif" : "700 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(subtitle, width * 0.5, height * 0.29);
    ctx.restore();
  }
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
