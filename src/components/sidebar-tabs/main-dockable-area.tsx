import { createUniqueId, mergeProps, VoidProps } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { Portal } from 'solid-js/web';
import { Tippy } from '../solid-tippy';
import { Button } from '../ui/button';
import { IconFormat, IconPlay } from '@/assets/icons';
import Kbd from '../kbd';
import { Panel, PanelGroup, ResizeHandle } from 'solid-resizable-panels';

function useDocksStore() {
  class Dock {
    #_id: string;
    #_type: 'vertical' | 'horizontal';
    #_docks: Dock[];

    get id() {
      return this.#_docks;
    }
    get docks() {
      return { subscribe: this.#_docks };
    }

    constructor(initializer: { id?: string; type: 'vertical' | 'horizontal'; docks?: Dock[] }) {
      this.#_id = initializer.id || createUniqueId();
      this.#_type = initializer.type;
      this.#_docks = initializer.docks ?? [];
    }

    public toVertical() {
      this.#_type = 'vertical';
    }
    public toHorizontal() {
      this.#_type = 'horizontal';
    }
    public addDockItem(dockItem: Dock) {
      this.#_docks.push(dockItem);
    }
  }

  const [docks, setDocks] = createStore<{ docks: Dock[] }>({
    docks: [],
  });

  return { docks, setDocks };
}

type MainDockableAreaProps = {};

export default function MainDockableArea(props: VoidProps<MainDockableAreaProps>) {
  const defaultProps = mergeProps({}, props);

  const [portalDestinations, setPortalDestinations] = createStore([
    'main-1-portal',
    'main-2-portal',
  ]);

  return (
    <>
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
  );
}
