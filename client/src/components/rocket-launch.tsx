import { useState, useEffect, useRef } from "react";

interface RocketLaunchProps {
  onComplete: () => void;
}

export default function RocketLaunch({ onComplete }: RocketLaunchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({ ry: 0, phase: "launch", frame: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    stateRef.current.ry = H * 0.72;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      r: number;
      hot: boolean;
    }

    const particles: Particle[] = [];
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.6,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random(),
    }));

    function draw() {
      const s = stateRef.current;
      s.frame++;
      s.ry -= s.phase === "boost" ? 7 : 3.2;

      if (!ctx || !canvas) return;

      ctx.fillStyle =
        s.ry < H * 0.3
          ? `rgba(5,8,20,${s.ry < H * 0.1 ? 0.06 : 0.12})`
          : "rgba(250,248,244,0.14)";
      ctx.fillRect(0, 0, W, H);

      // Stars fade in
      if (s.ry < H * 0.5) {
        stars.forEach((st) => {
          const alpha = Math.min(1, (H * 0.5 - s.ry) / (H * 0.4)) * st.a;
          ctx.beginPath();
          ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220,230,255,${alpha})`;
          ctx.fill();
        });
      }

      // Exhaust particles
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: W / 2 + (Math.random() - 0.5) * 14,
          y: s.ry + 48,
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 5 + 2,
          life: 1,
          r: Math.random() * 7 + 3,
          hot: Math.random() > 0.4,
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.028;
        p.r *= 0.96;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hot
          ? `rgba(255,120,20,${p.life * 0.9})`
          : `rgba(255,200,60,${p.life * 0.6})`;
        ctx.fill();
      }

      // Rocket
      const rx = W / 2,
        ry = s.ry;
      ctx.save();
      ctx.translate(rx, ry);

      // Body
      ctx.fillStyle = "#F0F4F8";
      ctx.beginPath();
      // RoundRect shim or native
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(-10, -36, 20, 52, [2, 2, 0, 0]);
      } else {
        ctx.rect(-10, -36, 20, 52);
      }
      ctx.fill();

      // Nose
      ctx.fillStyle = "#D0D8E4";
      ctx.beginPath();
      ctx.moveTo(-10, -36);
      ctx.lineTo(0, -62);
      ctx.lineTo(10, -36);
      ctx.closePath();
      ctx.fill();

      // Stripe
      ctx.fillStyle = "#1A3F7A";
      ctx.fillRect(-10, -10, 20, 7);

      // Window
      ctx.beginPath();
      ctx.arc(0, -22, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#0A1628";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-2, -24, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#3B82F6";
      ctx.fill();

      // Fins
      ctx.fillStyle = "#1A3F7A";
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.lineTo(-24, 28);
      ctx.lineTo(-10, 20);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, 10);
      ctx.lineTo(24, 28);
      ctx.lineTo(10, 20);
      ctx.closePath();
      ctx.fill();

      // Engine bell
      ctx.fillStyle = "#9CA3AF";
      ctx.beginPath();
      ctx.moveTo(-7, 16);
      ctx.lineTo(-9, 26);
      ctx.lineTo(9, 26);
      ctx.lineTo(7, 16);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Phase transitions
      if (s.ry < H * 0.45 && s.phase === "launch") s.phase = "boost";
      if (s.ry < -80) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        onComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(draw);
    }

    // Short countdown then launch
    const t = setTimeout(() => {
      rafRef.current = requestAnimationFrame(draw);
    }, 600);

    return () => {
      clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#FAF8F4",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          letterSpacing: "0.25em",
          color: "#9CA3AF",
        }}
      >
        MESSAGE TRANSMITTED
      </div>
    </div>
  );
}
