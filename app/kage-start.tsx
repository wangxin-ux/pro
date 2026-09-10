"use client";

import "./kage-start.css";

type Props = { onEnter: () => void };

export default function KageStart({ onEnter }: Props) {
  return (
    <main className="kage-start">
      <iframe
        className="kage-frame"
        title="Kage — Where stillness reveals the unseen"
        src="/landing-pages/kage.html?v=20260909-original-black-red"
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
      />
      <button className="kage-enter" type="button" onClick={onEnter}>
        <span>进入主界面</span>
        <b aria-hidden="true">→</b>
      </button>
    </main>
  );
}
