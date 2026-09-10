"use client";

import { useEffect, useRef } from "react";
import "./welcome-screen.css";

export default function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;
    const pointer = { x: 0.62, y: 0.54 };

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const handlePointer = (event: PointerEvent) => {
      pointer.x = event.clientX / Math.max(width, 1);
      pointer.y = event.clientY / Math.max(height, 1);
    };

    const draw = (time: number) => {
      const seconds = time * 0.00018;
      context.clearRect(0, 0, width, height);

      context.fillStyle = "rgba(85,85,85,.18)";
      for (let y = 8; y < height; y += 22) {
        for (let x = 8; x < width; x += 22) {
          const shimmer = 0.35 + 0.65 * Math.sin(x * 0.035 + y * 0.023 + seconds * 7);
          const distance = Math.hypot(x / width - pointer.x, y / height - pointer.y);
          context.globalAlpha = Math.max(0.14, shimmer * 0.4 + Math.max(0, 0.15 - distance) * 2.5);
          context.fillRect(x, y, 1.4, 1.4);
        }
      }
      context.globalAlpha = 1;

      const bands = [
        { y: 0.78, amp: 70, width: 170, alpha: 0.16, phase: 0 },
        { y: 0.68, amp: 105, width: 110, alpha: 0.12, phase: 1.7 },
        { y: 0.92, amp: 48, width: 210, alpha: 0.1, phase: 3.2 },
      ];
      for (const band of bands) {
        context.beginPath();
        for (let x = -40; x <= width + 40; x += 18) {
          const center = height * band.y + Math.sin(x * 0.004 + seconds * 4 + band.phase) * band.amp;
          if (x === -40) context.moveTo(x, center);
          else context.lineTo(x, center);
        }
        context.strokeStyle = `rgba(35,35,35,${band.alpha})`;
        context.lineWidth = band.width;
        context.lineCap = "round";
        context.filter = `blur(${Math.round(band.width * 0.32)}px)`;
        context.stroke();
      }
      context.filter = "none";
      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointer, { passive: true });
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  return (
    <main className="welcome-screen">
      <canvas className="welcome-canvas" ref={canvasRef} aria-hidden="true" />
      <header className="welcome-header">
        <a className="welcome-brand" href="#welcome" aria-label="React Bits home">
          <svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="5"/><ellipse cx="32" cy="32" rx="27" ry="10"/><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(120 32 32)"/></svg>
          <strong>React Bits</strong>
        </a>
        <span className="welcome-slash">/</span>
        <nav className="welcome-nav" aria-label="Welcome navigation">
          <a href="#docs">Docs</a><a href="#tools">Tools</a><a href="#pro">Pro</a><a href="#sponsors">Sponsors</a>
        </nav>
        <div className="welcome-header-actions">
          <button className="welcome-icon-button" type="button" aria-label="Switch theme">☼</button>
          <a className="welcome-star" href="https://github.com/DavidHDev/react-bits" target="_blank" rel="noreferrer"><span>◉</span> 47K</a>
          <a className="welcome-pro" href="#pro">Get React Bits Pro</a>
        </div>
      </header>

      <section className="welcome-hero" id="welcome">
        <div className="welcome-copy">
          <div className="welcome-pill"><b>NEW BACKGROUND</b><span>AERO SHARDS</span><i>→</i></div>
          <h1 className="welcome-title">React components for<br/><span className="welcome-accent">creative developers</span></h1>
          <p className="welcome-description">Highly customizable animated components &amp; backgrounds that<br/>drop into your project and instantly make it stand out</p>
          <div className="welcome-ctas">
            <button className="welcome-primary" type="button" onClick={onEnter}>Browse Components <span>→</span></button>
            <a className="welcome-secondary" href="https://github.com/DavidHDev/react-bits" target="_blank" rel="noreferrer">Star on GitHub <small>47K</small></a>
          </div>
          <div className="welcome-meta"><span>170+ COMPONENTS</span><i>·</i><span>FREE FOREVER</span></div>
        </div>

        <div className="welcome-code-card" aria-label="ColorBends code example">
          <div className="welcome-code-head"><div className="welcome-code-dots"><i/><i/><i/></div><button type="button">ColorBends⌄</button></div>
          <div className="welcome-code-body">
            <p>import {'{'} <em>ColorBends</em> {'}'} from '@components/ColorBends';</p>
            <p>function App() {'{'}</p>
            <p className="indent">return (</p>
            <p className="indent2">&lt;ColorBends</p>
            <p className="indent3">color=<mark>"#555555"</mark></p>
            <p className="indent3">speed={'{'}<mark>0.2</mark>{'}'}</p>
            <p className="indent3">frequency={'{'}<mark>1.0</mark>{'}'}</p>
            <p className="indent3">noise={'{'}<mark>0.15</mark>{'}'}</p>
            <p className="indent3">bandWidth={'{'}<mark>0.14</mark>{'}'}</p>
            <p className="indent3">rotation={'{'}<mark>90</mark>{'}'}</p>
            <p className="indent3">fadeTop={'{'}<mark>0.75</mark>{'}'}</p>
            <p className="indent3">iterations={'{'}<mark>1</mark>{'}'}</p>
            <p className="indent3">intensity={'{'}<mark>1.3</mark>{'}'}</p>
            <p className="indent2">/&gt;</p><p className="indent">)</p><p>{'}'}</p>
          </div>
          <div className="welcome-code-footer"><div><b>Nebula</b><span>Aurora</span><span>Ember</span><span>Ice</span></div><small>↔ Every value is editable</small></div>
        </div>
      </section>
    </main>
  );
}
