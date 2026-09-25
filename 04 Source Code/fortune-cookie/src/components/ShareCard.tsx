import { useEffect, useState } from "react";
import type { DailyReading } from "../engine/reading";
import { downloadBlob, fmtLongDate, hostDownloads, inFrame } from "../lib";
import { Close, Copy, ImageIcon } from "./Icons";
import { CLIP_LEFT, CLIP_RIGHT, COOKIE_LAYERS, OUTLINE, PATHS, SLIP_LAYERS, type Layer } from "./Mark";

const W = 1080;
const H = 1350;
const NIGHT = "#1D1333";
const TONE_FILL: Record<string, [string, string]> = {
  flowing: ["#C9F0DD", "#135E40"],
  steady: ["#E4DCFB", "#45327D"],
  mixed: ["#FBE6B5", "#7A4A00"],
  gentle: ["#FFD8E4", "#9C2757"],
};
const EL_FILL: Record<string, [string, string]> = {
  Wood: ["#A5E0C4", "#17634A"],
  Fire: ["#FFAE9E", "#A33224"],
  Earth: ["#F7D27E", "#7D5406"],
  Metal: ["#C7CBE8", "#4D5270"],
  Water: ["#A9C4FF", "#1E4D9C"],
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > width && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function spark(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 7, s / 7);
  ctx.fillStyle = color;
  ctx.fill(new Path2D(PATHS.spark));
  ctx.restore();
}

function star5(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.25;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawLayers(ctx: CanvasRenderingContext2D, layers: Layer[]) {
  for (const l of layers) {
    ctx.save();
    if (l.transform) {
      const [tx, ty, rot, sc] = l.transform;
      ctx.translate(tx, ty);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(sc, sc);
    }
    ctx.globalAlpha = l.opacity ?? 1;
    const path = new Path2D(l.d);
    if (l.fill) {
      ctx.fillStyle = l.fill;
      ctx.fill(path);
    }
    if (l.stroke) {
      ctx.strokeStyle = l.stroke;
      ctx.lineWidth = l.width ?? 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(path);
    }
    ctx.restore();
  }
}

const polygon = (pts: string) => {
  const p = new Path2D();
  pts.split(" ").forEach((xy, i) => {
    const [x, y] = xy.split(",").map(Number);
    if (i === 0) p.moveTo(x, y);
    else p.lineTo(x, y);
  });
  p.closePath();
  return p;
};

/** The cookie in cookie units (120 box), whole or cracked open with the slip out. */
function drawCookie(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, open: boolean) {
  const piece = (pivotX: number, pivotY: number, angle: number, dx: number, dy: number, draw: () => void) => {
    ctx.save();
    ctx.translate(pivotX + dx, pivotY + dy);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-pivotX, -pivotY);
    draw();
    ctx.restore();
  };
  const half = (clip: string) => () => {
    ctx.save();
    ctx.clip(polygon(clip));
    drawLayers(ctx, COOKIE_LAYERS);
    drawLayers(ctx, [{ d: PATHS.crack, stroke: OUTLINE, width: 3.2 }]);
    ctx.restore();
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  if (!open) {
    drawLayers(ctx, SLIP_LAYERS);
    drawLayers(ctx, COOKIE_LAYERS);
  } else {
    piece(88, 98, -8, -16, -44, () => {
      ctx.translate(88, 98);
      ctx.scale(1.2, 1.2);
      ctx.translate(-88, -98);
      drawLayers(ctx, SLIP_LAYERS);
    });
    piece(90, 96, 19, 12, 6, half(CLIP_RIGHT));
    piece(50, 97, -17, -10, 6, half(CLIP_LEFT));
  }
  ctx.restore();
}

function chip(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, [bg, fg]: [string, string]): number {
  ctx.font = "800 30px Nunito, system-ui, sans-serif";
  const w = ctx.measureText(text).width + 48;
  roundRect(ctx, x, y, w, 58, 29);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 24, y + 30);
  return w;
}

/** Draws the shareable fortune card: night sky, open cookie, the slip, the wordmark. */
export async function renderShareImage(reading: DailyReading, name: string): Promise<Blob> {
  try {
    await Promise.all([document.fonts.load("500 60px Fraunces"), document.fonts.load("600 48px Fraunces"), document.fonts.load("800 30px Nunito")]);
  } catch {
    /* fall back to system fonts */
  }
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d") as CanvasRenderingContext2D;

  // sky
  ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#2B1F4A";
  ctx.beginPath();
  ctx.arc(540, 330, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.setLineDash([12, 14]);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(244,237,255,0.16)";
  ctx.beginPath();
  ctx.arc(540, 330, 350, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "#FF8DB0";
  ctx.beginPath();
  ctx.arc(190, 330, 12, 0, Math.PI * 2);
  ctx.fill();
  [
    [110, 100, 22],
    [960, 130, 16],
    [900, 500, 12],
    [140, 520, 14],
    [990, 330, 10],
    [330, 60, 9],
  ].forEach(([x, y, s]) => spark(ctx, x, y, s, "#FFF3D6"));
  [
    [240, 180, 14],
    [850, 70, 11],
    [1010, 560, 13],
  ].forEach(([x, y, r]) => star5(ctx, x, y, r, "rgba(187,167,244,0.55)"));

  drawCookie(ctx, 540 - 60 * 3, 320 - 60 * 3, 3, true);

  // slip
  const sx = 90;
  const sy = 600;
  const sw = 900;
  ctx.font = "500 60px Fraunces, Georgia, serif";
  let lines = wrap(ctx, reading.slip, 770);
  let size = 60;
  while (lines.length > 4 && size > 44) {
    size -= 4;
    ctx.font = `500 ${size}px Fraunces, Georgia, serif`;
    lines = wrap(ctx, reading.slip, 770);
  }
  const lh = size * 1.26;
  const sh = 150 + lines.length * lh + 118;
  ctx.save();
  ctx.translate(sx + sw / 2, sy + sh / 2);
  ctx.rotate((-1.2 * Math.PI) / 180);
  ctx.translate(-(sx + sw / 2), -(sy + sh / 2));
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  roundRect(ctx, sx, sy, sw, sh, 30);
  ctx.fillStyle = "#FFF8EC";
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = NIGHT;
  [sx, sx + sw].forEach((nx) => {
    ctx.beginPath();
    ctx.arc(nx, sy + sh / 2, 20, 0, Math.PI * 2);
    ctx.fill();
  });

  // tag sticker
  const tag = (name ? `${name}'s fortune` : "Your fortune").toUpperCase();
  ctx.font = "800 26px Nunito, system-ui, sans-serif";
  const tw = ctx.measureText(tag).width + 40;
  ctx.save();
  ctx.translate(sx + sw - tw - 40, sy - 16);
  ctx.rotate((4 * Math.PI) / 180);
  roundRect(ctx, 0, 0, tw, 52, 12);
  ctx.fillStyle = "#FF8DB0";
  ctx.fill();
  ctx.fillStyle = "#3A0F24";
  ctx.textBaseline = "middle";
  ctx.fillText(tag, 20, 27);
  ctx.restore();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#6B5D85";
  ctx.font = "800 28px Nunito, system-ui, sans-serif";
  ctx.fillText(fmtLongDate(reading.date).toUpperCase(), sx + 70, sy + 92);
  ctx.fillStyle = "#2A1C44";
  ctx.font = `500 ${size}px Fraunces, Georgia, serif`;
  lines.forEach((l, i) => ctx.fillText(l, sx + 70, sy + 150 + size * 0.8 + i * lh));
  const dy = sy + 150 + lines.length * lh + 26;
  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = "#E6D9C4";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sx + 70, dy);
  ctx.lineTo(sx + sw - 70, dy);
  ctx.stroke();
  ctx.setLineDash([]);
  const t = reading.today;
  const w1 = chip(ctx, sx + 70, dy + 24, `${t.yang ? "Yang" : "Yin"} ${t.element} ${t.animal} day`, EL_FILL[t.element]);
  chip(ctx, sx + 70 + w1 + 16, dy + 24, `• ${reading.overall.toneLabel}`, TONE_FILL[reading.overall.tone]);
  ctx.restore();

  // footer
  drawCookie(ctx, 92, 1224, 0.66, false);
  ctx.fillStyle = "#F4EDFF";
  ctx.textBaseline = "middle";
  ctx.font = "600 50px Fraunces, Georgia, serif";
  ctx.fillText("fortune cookie", 186, 1266);
  ctx.textAlign = "right";
  ctx.fillStyle = "#B9ACD9";
  ctx.font = "700 26px Nunito, system-ui, sans-serif";
  ctx.fillText("a daily fortune from your birth chart", 988, 1270);

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("No image"))), "image/png"));
}

export function ShareModal({ reading, name, onClose }: { reading: DailyReading; name: string; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [host, setHost] = useState<Awaited<ReturnType<typeof hostDownloads>>>(null);
  const framed = inFrame();

  useEffect(() => {
    if (framed) hostDownloads().then(setHost);
  }, [framed]);

  const download = async () => {
    if (!blob) return;
    const filename = `fortune-cookie-${reading.date}.png`;
    if (!framed) return downloadBlob(blob, filename);
    if (!host) return;
    try {
      await host.save({ filename, data: blob });
      setNote("Saved.");
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === "declined") setNote(null);
      else if (code === "rate_limited") setNote("One moment, then try again.");
      else setNote("Saving isn't available here. Right-click or long-press the card to save it.");
    }
  };

  useEffect(() => {
    let live = true;
    let made: string | null = null;
    renderShareImage(reading, name).then((b) => {
      if (!live) return;
      made = URL.createObjectURL(b);
      setBlob(b);
      setUrl(made);
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
      window.removeEventListener("keydown", onKey);
    };
  }, [reading, name, onClose]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(`${reading.slip}\n\nFortune Cookie, ${fmtLongDate(reading.date)}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard refused; the text is on screen to select */
    }
  };

  return (
    <div className="modal-back" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2 id="share-title">Share your fortune</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <Close />
          </button>
        </header>
        <div className="share-preview">{url ? <img src={url} alt={`Fortune card: ${reading.slip}`} /> : <p className="muted">Baking your card…</p>}</div>
        <div className="modal-actions">
          {!framed || host ? (
            <button type="button" className="btn btn-cookie" disabled={!blob} onClick={download}>
              <ImageIcon /> Download image
            </button>
          ) : (
            <p className="hint">Right-click or long-press the card to save it.</p>
          )}
          <button type="button" className="btn btn-quiet" onClick={copyText}>
            <Copy /> {copied ? "Copied" : "Copy text"}
          </button>
        </div>
        {note ? <p className="hint">{note}</p> : null}
      </div>
    </div>
  );
}
