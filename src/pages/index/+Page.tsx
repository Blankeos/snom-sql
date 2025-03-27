import {
  IconDatabase,
  IconDatabaseAdd,
  IconDatabaseSchema,
  IconFormat,
  IconPlay,
  IconQueryFiles,
  IconRoundedCornerBL,
  IconSetting,
} from '@/assets/icons';
import { useDisclosure } from '@/hooks/use-disclosure';
import { cn } from '@/utils/cn';
import { For, JSX, Match, Show, Switch } from 'solid-js';
import { Panel, PanelGroup, ResizeHandle } from 'solid-resizable-panels';
import 'solid-resizable-panels/styles.css';

import Kbd from '@/components/kbd';
import SettingsModal from '@/components/settings-modal';
import ConnectionsContent from '@/components/sidebar-tabs/connections-content';
import ConnectionsTab from '@/components/sidebar-tabs/connections-tab';
import QueryFilesTab from '@/components/sidebar-tabs/queryfiles-tab';
import { Tippy } from '@/components/solid-tippy';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/app';
import { createStore, produce } from 'solid-js/store';
import { Portal } from 'solid-js/web';

export default function Page() {
  // ===========================================================================
  // States
  // ===========================================================================
  const { sidebarFocus, setPanelGroupAPI, sidebarActive, setSidebarActive } = useAppContext();

  const [settingsModalIsOpen, settingsModalActions] = useDisclosure(false);

  const [portalDestinations, setPortalDestinations] = createStore([
    'main-1-portal',
    'main-2-portal',
  ]);

  return (
    <>
      <PanelGroup class="h-full" setAPI={setPanelGroupAPI}>
        <Panel
          class="bg-background-darker relative overflow-hidden"
          id="panel-1"
          // minSize={32}
          minSize={0}
          // maxSize={40}
          collapsible
        >
          <div class="h-full overflow-hidden">
            <SidebarTabs />

            <Switch>
              <Match when={sidebarFocus() === 'connections'}>
                <ConnectionsTab />
              </Match>
              <Match when={sidebarFocus() === 'queryfiles'}>
                <QueryFilesTab />
              </Match>
            </Switch>
            <div class="absolute right-0 bottom-0 left-0 flex items-center justify-between p-3 text-xs text-gray-500">
              <div class="text-[10px] select-none">v0.0.1</div>
              <button class="active:scale-95" onClick={() => settingsModalActions.toggle()}>
                <IconSetting class="h-5 w-5" />
              </button>
              <SettingsModal
                open={settingsModalIsOpen()}
                onOpenChange={(open) => {
                  if (!open) settingsModalActions.close();
                }}
              />
            </div>
          </div>
        </Panel>
        <ResizeHandle class="!bg-max-100 relative" />
        <Panel id="panel-2" initialSize={100} class="bg-background relative">
          <Show when={!sidebarActive()}>
            <Button
              class="absolute top-2 left-2 flex gap-x-1"
              onClick={() => setSidebarActive(true)}
            >
              <IconDatabase class="h-4 w-4 text-sky-300" />
              Snom SQL
            </Button>
          </Show>
          <Switch
            fallback={
              <>
                {() => {
                  console.log('boomer');
                  return <></>;
                }}
                <Portal
                  mount={document.getElementById(portalDestinations[0])!}
                  ref={(x) => (x.style.display = 'contents')}
                >
                  <div class="relative h-full w-full">
                    <textarea class="h-full w-full">This is the text area 🙏</textarea>
                    <div class="absolute right-0 bottom-0 left-0 flex items-center gap-x-2 p-3">
                      <Tippy props={{ arrow: false }} content="Format">
                        <Button size="icon" class="rounded-full">
                          <IconFormat class="h-4 w-4" />
                        </Button>
                      </Tippy>
                      <Tippy
                        props={{ arrow: false }}
                        content={
                          <span class="flex gap-x-2">
                            <Kbd>
                              <span>⌘</span>
                              <span>Enter</span>
                            </Kbd>
                          </span>
                        }
                      >
                        <Button class="flex gap-x-1.5" size="sm">
                          <IconPlay class="h-4 w-4 text-green-500" />
                          Run All
                        </Button>
                      </Tippy>
                    </div>
                  </div>
                </Portal>
                <Portal
                  mount={document.getElementById(portalDestinations[1])!}
                  ref={(x) => (x.style.display = 'contents')}
                >
                  <div>[THESE ARE RESULTS 🗓️]</div>
                </Portal>

                <Button
                  class="absolute top-2 right-2 z-20"
                  onClick={() => {
                    setPortalDestinations(
                      produce((state) => {
                        const [o1, o2] = state;
                        state[0] = o2;
                        state[1] = o1;
                      })
                    );
                  }}
                >
                  Swap panels
                </Button>
                <PanelGroup class="h-full" direction="column">
                  <Panel id="main-1" class="overflow-hidden">
                    <div id="main-1-portal" class="h-full w-full"></div>
                  </Panel>
                  <ResizeHandle class="!bg-max-100 relative" />
                  <Panel id="main-2" class="overflow-hidden">
                    <div id="main-2-portal" class="h-full w-full"></div>
                  </Panel>
                </PanelGroup>
              </>
            }
          >
            <Match when={sidebarFocus() === 'connections'}>
              <ConnectionsContent />
            </Match>
          </Switch>
        </Panel>
      </PanelGroup>
    </>
  );
}

function SidebarTabs() {
  const { sidebarFocus, setSidebarFocus } = useAppContext();

  const tabs = [
    {
      name: 'connections',
      icon: IconDatabaseAdd,
      tip: (
        <span class="flex gap-x-1">
          Connections
          <Kbd>
            <span>⌘</span>
            <span>1</span>
          </Kbd>
        </span>
      ),
    },
    {
      name: 'schema',
      icon: IconDatabaseSchema,
      tip: (
        <span class="flex gap-x-1">
          Schema
          <Kbd>
            <span>⌘</span>
            <span>2</span>
          </Kbd>
        </span>
      ),
    },
    {
      name: 'queryfiles',
      icon: IconQueryFiles,
      tip: (
        <span class="flex gap-x-1">
          Queries
          <Kbd>
            <span>⌘</span>
            <span>3</span>
          </Kbd>
        </span>
      ),
    },
  ];

  return (
    <div class="bg-background-border flex h-8 w-full min-w-48 justify-around">
      <For each={tabs}>
        {(tab, index) => (
          <SidebarTabItem
            tip={tab.tip}
            focus={sidebarFocus()}
            setSidebarFocus={setSidebarFocus}
            icon={tab.icon}
            name={tab.name}
            isLast={index() === tabs.length - 1}
          />
        )}
      </For>
    </div>
  );
}

function SidebarTabItem(props: {
  focus: string;
  setSidebarFocus: (focus: any) => void;
  icon: (props: { class?: string }) => JSX.Element;
  name: string;
  tip: JSX.Element;
  isLast?: boolean;
}) {
  return (
    <Tippy content={props.tip} props={{ arrow: false }}>
      <button
        class="group relative flex w-full items-center justify-center"
        onClick={() => props.setSidebarFocus(props.name)}
      >
        <Show when={props.focus === props.name}>
          <span
            class={cn(
              'bg-background-darker absolute inset-0 rounded-t-lg',
              props.isLast && 'rounded-tl-lg rounded-tr-none'
            )}
          ></span>
          {/* <span class="absolute right-full bottom-0 h-5 w-5 bg-green-500"></span> */}
          <span
            class="text-background-darker pointer-events-none absolute right-full bottom-0"
            style={{ transform: `scale(-1,1)` }}
          >
            <IconRoundedCornerBL class="h-4 w-4" />
          </span>
          <span class="text-background-darker pointer-events-none absolute bottom-0 left-full">
            <IconRoundedCornerBL class="h-4 w-4" />
          </span>
        </Show>
        <props.icon class="relative h-4 w-4 transition group-active:scale-90" />
      </button>
    </Tippy>
  );
}
