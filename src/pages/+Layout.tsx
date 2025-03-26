import { AppContextProvider } from '@/contexts/app';
import { ThemeContextProvider } from '@/contexts/theme';

import '@/styles/app.css';
import 'tippy.js/dist/tippy.css';

import { MainCommandPalette } from '@/components/main-command-palette';
import { ConnectionsContextProvider } from '@/contexts/connections';
import { type FlowProps } from 'solid-js';
import { Toaster } from 'solid-sonner';

export default function RootLayout(props: FlowProps) {
  return (
    <ThemeContextProvider>
      <AppContextProvider>
        <ConnectionsContextProvider>
          <MainCommandPalette />
          <div class="bg-background-border h-screen overflow-hidden rounded-lg p-1.5">
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
        </ConnectionsContextProvider>
      </AppContextProvider>
    </ThemeContextProvider>
  );
}
