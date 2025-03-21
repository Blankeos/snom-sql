import '@/styles/app.css';

import { type FlowProps, createSignal } from 'solid-js';

export default function RootLayout(props: FlowProps) {
  return (
    <div class="h-screen overflow-hidden rounded-md">
      <div data-tauri-drag-region class="titlebar">
        {/* <div class="titlebar-button" id="titlebar-minimize">
          <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
        </div>
        <div class="titlebar-button" id="titlebar-maximize">
          <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize" />
        </div>
        <div class="titlebar-button" id="titlebar-close">
          <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
        </div> */}
      </div>

      {/* <nav class="flex items-center justify-center gap-x-5 py-5">
        <a href={getRoute('/')}>Home</a>
        <span>{' | '}</span>
        <a href={getRoute('/dashboard')}>Dashboard</a>
        <span>{' | '}</span>
        <a href={getRoute('/app')}>App</a>
        <span>{' | '}</span>
        <Counter />
      </nav> */}
      {props.children}
    </div>
  );
}

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button
      type="button"
      onClick={() => setCount((count) => count + 1)}
      class="text rounded-lg border border-transparent bg-neutral-900 px-2 py-2 text-white shadow-md hover:border-blue-500"
    >
      Root Counter {count()}
    </button>
  );
}
