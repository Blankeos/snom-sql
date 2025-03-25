import { ThemeContextProvider } from '@/contexts/theme';
import '@/styles/app.css';

import { type FlowProps } from 'solid-js';
import { Toaster } from 'solid-sonner';

export default function RootLayout(props: FlowProps) {
  return (
    <ThemeContextProvider>
      <div class="h-screen overflow-hidden rounded-lg bg-[#d4d2e8] p-1.5">
        <div class="box-sizing-[border-box] relative h-full overflow-hidden rounded-md will-change-[width,height]">
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
      </div>
      <Toaster />
    </ThemeContextProvider>
  );
}
