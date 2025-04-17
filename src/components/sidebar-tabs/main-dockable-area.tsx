import {
  Component,
  createUniqueId,
  For,
  Match,
  mergeProps,
  Show,
  Switch,
  VoidProps,
} from 'solid-js';
import { createMutable, createStore, produce } from 'solid-js/store';
import { Portal } from 'solid-js/web';
import { Panel, PanelGroup, ResizeHandle } from 'solid-resizable-panels';
import { Button } from '../ui/button';

function generateShortId(type: 'panel' | 'tab' = 'panel', length = 16) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return 'panel-' + Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

class Dock {
  id: string;
  type: 'vertical' | 'horizontal' | 'panel' | 'tab';
  children: Dock[];
  parent: Dock | undefined;

  // get id() {
  //   return this.#_id;
  // }
  // get type() {
  //   return this.#_type;
  // }
  // get children() {
  //   return this.#_children;
  // }
  // get parent() {
  //   return this.#_parent;
  // }

  constructor(initializer: {
    id?: string;
    type: 'vertical' | 'horizontal' | 'panel' | 'tab';
    docks?: Dock[];
  }) {
    this.id = initializer.id || createUniqueId();
    this.type = initializer.type;
    this.children = initializer.docks ?? [];

    return createMutable(this); // This is what makes this class reactive.
  }

  public toVertical() {
    this.type = 'vertical';
  }
  public toHorizontal() {
    this.type = 'horizontal';
  }
  public setParent(dock: Dock) {
    this.parent = dock;
  }
  public addDockItem(dockItem: Dock) {
    this.children.push(dockItem);
  }
}

function useDocksStore() {
  type AddDirection = 'above' | 'below' | 'left' | 'right';

  const [dockRenderers, setDockRenderers] = createStore({
    renderers: [
      { id: 'tab-1', component: () => <div>Panel 1</div> },
      { id: 'tab-2', component: () => <div>Panel 2</div> },
      { id: 'tab-3', component: () => <div>Panel 3</div> },
      { id: 'tab-4', component: () => <div>Panel 4</div> },
      // { id: 'tab-5', component: () => <div>Panel 5</div> },
    ],
  });

  const root = new Dock({
    id: 'root',
    type: 'vertical',
    docks: [
      new Dock({ id: 'panel-1', type: 'panel', docks: [new Dock({ id: 'tab-1', type: 'tab' })] }),
      new Dock({ id: 'panel-2', type: 'panel', docks: [new Dock({ id: 'tab-2', type: 'tab' })] }),
      new Dock({
        id: 'horizontal-1',
        type: 'horizontal',
        docks: [
          new Dock({
            id: 'panel-3',
            type: 'panel',
            docks: [new Dock({ id: 'tab-3', type: 'tab' })],
          }),
          new Dock({
            id: 'panel-4',
            type: 'panel',
            docks: [new Dock({ id: 'tab-4', type: 'tab' })],
          }),
        ],
      }),
      // new Dock({ id: 'panel-5', type: 'panel', docks: [new Dock({ id: 'tab-5', type: 'tab' })] }),
    ],
  });

  // const [docks, setDocks] = createStore<{ root: Dock }>({
  //   root: new Dock({
  //     id: 'root',
  //     type: 'vertical',
  //     docks: [
  //       new Dock({ id: 'panel-1', type: 'panel', docks: [new Dock({ id: 'tab-1', type: 'tab' })] }),
  //       new Dock({ id: 'panel-2', type: 'panel', docks: [new Dock({ id: 'tab-2', type: 'tab' })] }),
  //       new Dock({
  //         id: 'horizontal-1',
  //         type: 'horizontal',
  //         docks: [
  //           new Dock({
  //             id: 'panel-3',
  //             type: 'panel',
  //             docks: [new Dock({ id: 'tab-3', type: 'tab' })],
  //           }),
  //           new Dock({
  //             id: 'panel-4',
  //             type: 'panel',
  //             docks: [new Dock({ id: 'tab-4', type: 'tab' })],
  //           }),
  //         ],
  //       }),
  //       // new Dock({ id: 'panel-5', type: 'panel', docks: [new Dock({ id: 'tab-5', type: 'tab' })] }),
  //     ],
  //   }),
  // });

  // const [docks, setDocks] = createStore<{ root: Dock }>({
  //   root: new Dock({
  //     id: 'root',
  //     type: 'vertical',
  //     docks: [
  //       new Dock({ id: 'panel-1', type: 'panel', docks: [new Dock({ id: 'tab-1', type: 'tab' })] }),
  //       new Dock({ id: 'panel-2', type: 'panel', docks: [new Dock({ id: 'tab-2', type: 'tab' })] }),
  //       new Dock({
  //         id: 'horizontal-1',
  //         type: 'horizontal',
  //         docks: [
  //           new Dock({
  //             id: 'panel-3',
  //             type: 'panel',
  //             docks: [new Dock({ id: 'tab-3', type: 'tab' })],
  //           }),
  //           new Dock({
  //             id: 'panel-4',
  //             type: 'panel',
  //             docks: [new Dock({ id: 'tab-4', type: 'tab' })],
  //           }),
  //         ],
  //       }),
  //       // new Dock({ id: 'panel-5', type: 'panel', docks: [new Dock({ id: 'tab-5', type: 'tab' })] }),
  //     ],
  //   }),
  // });

  function _getDockById(id: string, startNode: Dock = root): Dock | undefined {
    if (startNode.id === id) {
      return startNode;
    }
    const children = startNode.children;
    if (children && children.length > 0) {
      for (const child of children) {
        const found = _getDockById(id, child); // Recursive call
        if (found) {
          return found; // Propagate the found dock up the call stack
        }
      }
    }
    return undefined;
  }

  function addPanel(params: {
    id: string;
    title: string;
    position?: { rootId?: string; direction?: AddDirection };
  }) {
    let rootId: string | undefined = undefined;
    if (params?.position?.rootId) {
      rootId = params.position.rootId;
    }
    let referenceDock = _getDockById(rootId ?? 'root');
    let direction: AddDirection = (() => {
      if (referenceDock?.type === 'tab') return 'right';
      if (referenceDock?.type === 'panel') return 'right';
      if (referenceDock?.type === 'horizontal') return 'right';
      if (referenceDock?.type === 'vertical') return 'below';
      return 'right';
    })();

    if (params?.position?.direction) {
      if (referenceDock?.type === 'tab') {
        // referenceDock?.
        referenceDock = referenceDock?.parent;
      }
      if (referenceDock?.type === 'panel') {
        referenceDock = referenceDock?.parent;
      }
      if (referenceDock?.type === 'horizontal') {
        direction = 'right';
      }
      if (referenceDock?.type === 'vertical') {
        direction = 'below';
      }
    }

    const newTabId = generateShortId('tab');
    const newPanelId = generateShortId('panel');

    // setDocks(
    //   'root',
    //   produce((_state) => {
    console.log('setDocks.produce:', root);
    root.addDockItem(
      new Dock({
        id: newPanelId,
        type: 'panel',
        docks: [new Dock({ id: newTabId, type: 'tab' })],
      })
    );
    //   })
    // );

    // console.log('dock positions', unwrap(docks.root));
    setDockRenderers(
      'renderers',
      produce((_state) => {
        _state.push({ id: newTabId, component: () => <div>Panel {newTabId}</div> });
      })
    );
  }

  function removePanel(id: string) {
    if (id === 'root') {
      throw new Error('Cannot remove the root dock.');
      return;
    }
    const dock = _getDockById(id);
    if (dock) dock?.parent?.children.splice(dock?.parent?.children.indexOf(dock), 1);
  }

  return {
    /** Contains the actual element for the dock. */
    dockRenderers,
    /** Contains portal position rendering.  */
    docks: root,
    addPanel,
  };
}

type MainDockableAreaProps = {};

export default function MainDockableArea(props: VoidProps<MainDockableAreaProps>) {
  const defaultProps = mergeProps({}, props);

  const { dockRenderers, docks, addPanel } = useDocksStore();

  function add() {
    addPanel({
      id: 'something',
      title: 'Something',
    });
  }

  return (
    <>
      <For each={dockRenderers.renderers}>
        {(renderer) => (
          <Portal
            mount={document.getElementById(renderer.id)!}
            ref={(x) => (x.style.display = 'contents')}
          >
            {renderer.component?.()}
          </Portal>
        )}
      </For>
      {/* <Portal
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
      </Portal> */}

      <Button
        class="absolute top-2 right-2 z-20"
        onClick={() => {
          add();
          // setPortalDestinations(
          //   produce((state) => {
          //     const [o1, o2] = state;
          //     state[0] = o2;
          //     state[1] = o1;
          //   })
          // );
        }}
      >
        Add Panel
      </Button>
      <RenderDock dock={docks} />
      {/* <PanelGroup direction="column" class="h-full w-full">
        <Panel id="1">Panel 1</Panel>
        <ResizeHandle />
        <Panel id="2">
          <PanelGroup class="h-full w-full">
            <Panel id="1">Panel 1</Panel>
            <ResizeHandle />
            <Panel id="2">Panel 2</Panel>
            <ResizeHandle />
            <Panel id="3">Panel 3</Panel>
          </PanelGroup>
        </Panel>
        <ResizeHandle />
        <Panel id="3">Panel 3</Panel>
      </PanelGroup> */}

      {/* <PanelGroup class="h-full" direction="column">
        <Panel id="main-1" class="overflow-hidden">
          <div id="main-1-portal" class="h-full w-full"></div>
        </Panel>
        <ResizeHandle class="!bg-max-100 relative" />
        <Panel id="main-2" class="overflow-hidden">
          <div id="main-2-portal" class="h-full w-full"></div>
        </Panel>
      </PanelGroup> */}
    </>
  );
}

const RenderDock: Component<{ dock: Dock }> = (props) => {
  const dock = () => props.dock; // Use accessor for reactivity

  return (
    <Switch>
      {/* RootVertical */}
      <Match when={dock().type === 'vertical' && dock().id === 'root'}>
        <PanelGroup direction="column" class="h-full w-full">
          <For each={dock().children}>
            {(child, index) => (
              <>
                {/* Add Resize Handle between children */}
                <Show when={index() > 0}>
                  <ResizeHandle class="!bg-border hover:!bg-primary/20 relative !h-1.5" />
                </Show>
                {/* Recursively render child dock */}
                <RenderDock dock={child} />
              </>
            )}
          </For>
        </PanelGroup>
      </Match>
      {/* RootHorizontal */}
      <Match when={dock().type === 'horizontal' && dock().id === 'root'}>
        <PanelGroup direction="row" class="h-full w-full">
          <For each={dock().children}>
            {(child, index) => (
              <>
                {/* Add Resize Handle between children */}
                <Show when={index() > 0}>
                  {/* Adjust handle class for vertical orientation */}
                  <ResizeHandle class="!bg-border hover:!bg-primary/20 relative !w-1.5" />
                </Show>
                {/* Recursively render child dock */}
                <RenderDock dock={child} />
              </>
            )}
          </For>
        </PanelGroup>
      </Match>

      {/* Vertical Panel Group */}
      <Match when={dock().type === 'vertical'}>
        <Panel id={dock().id}>
          <PanelGroup direction="column" class="h-full w-full">
            <For each={dock().children}>
              {(child, index) => (
                <>
                  {/* Add Resize Handle between children */}
                  <Show when={index() > 0}>
                    <ResizeHandle class="!bg-border hover:!bg-primary/20 relative !h-1.5" />
                  </Show>
                  {/* Recursively render child dock */}
                  <RenderDock dock={child} />
                </>
              )}
            </For>
          </PanelGroup>
        </Panel>
      </Match>

      {/* Horizontal Panel Group */}
      <Match when={dock().type === 'horizontal'}>
        <Panel id={dock().id}>
          <PanelGroup direction="row" class="h-full w-full">
            <For each={dock().children}>
              {(child, index) => (
                <>
                  {/* Add Resize Handle between children */}
                  <Show when={index() > 0}>
                    {/* Adjust handle class for vertical orientation */}
                    <ResizeHandle class="!bg-border hover:!bg-primary/20 relative !w-1.5" />
                  </Show>
                  {/* Recursively render child dock */}
                  <RenderDock dock={child} />
                </>
              )}
            </For>
          </PanelGroup>
        </Panel>
      </Match>

      <Match when={dock().type === 'panel'}>
        <Show when={dock().children.length > 0 && dock().children[0].type === 'tab'}>
          <Panel id={dock().id} class="h-full w-full overflow-hidden">
            <div id={dock().children[0].id} class=""></div>
          </Panel>
        </Show>
        <Show when={dock().children.length === 0}>
          <Panel id={dock().id} class="h-full w-full overflow-hidden">
            <div class="text-muted-foreground p-4 italic">Empty Panel</div>
          </Panel>
        </Show>
      </Match>

      {/* Tab type itself doesn't render a structure here, it's handled by the parent panel */}
      {/* <Match when={dock().type === 'tab'}> {null} </Match> */}
    </Switch>
  );
};
