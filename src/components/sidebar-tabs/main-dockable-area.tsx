import {
  createDockview,
  DockviewApi,
  GroupPanelPartInitParameters,
  IContentRenderer,
  PanelInitParameters,
} from 'dockview-core';
import 'dockview-core/dist/styles/dockview.css';

import { onCleanup, onMount } from 'solid-js';

// Define a type for your panel class (important for type safety)
class EditorPanel implements IContentRenderer {
  private readonly _element: HTMLDivElement; // Specific type
  private _params: PanelInitParameters | null = null;

  get element(): HTMLElement {
    return this._element;
  }

  constructor() {
    this._element = document.createElement('div');
    // this._element.style.width = '100%';
    // this._element.style.height = '100%';
    // this._element.boxSizing = 'border-box';
    // this._element.padding = '8px';
    // this._element.border = 'none';
    // this._element.outline = 'none';
    // this._element.fontFamily = 'monospace';
    // this._element.fontSize = '14px';
    this._element.textContent = 'This is the text area 🙏';
  }

  init(params: GroupPanelPartInitParameters): void {
    this._params = params;
  }

  update(params: GroupPanelPartInitParameters): void {
    this._params = params;
    // Potentially update the panel based on new parameters
  }

  dispose(): void {
    // Cleanup (remove event listeners, etc.) if necessary
  }
}

class ResultsPanel implements IContentRenderer {
  private readonly _element: HTMLDivElement;
  private _params: PanelInitParameters | null = null;

  get element(): HTMLElement {
    return this._element;
  }

  constructor() {
    this._element = document.createElement('div');
    this._element.style.padding = '10px';
    this._element.textContent = '[THESE ARE RESULTS 🗓️]';
  }

  init(params: GroupPanelPartInitParameters): void {
    this._params = params;
  }

  update(params: GroupPanelPartInitParameters): void {
    this._params = params;
  }

  dispose(): void {
    // Cleanup if needed
  }
}

class Panel implements IContentRenderer {
  private readonly _element: HTMLElement;

  get element(): HTMLElement {
    return this._element;
  }

  constructor() {
    this._element = document.createElement('div');
    this._element.style.color = 'white';
  }

  init(parameters: GroupPanelPartInitParameters): void {
    this._element.textContent = 'Hello World';
  }
}

export default function MainDockableArea() {
  let containerRef!: HTMLDivElement;
  let dockviewApi: DockviewApi;

  onMount(() => {
    dockviewApi = createDockview(containerRef, {
      className: 'dockview-theme-abyss',
      disableDnd: false,
      createComponent: (options) => {
        switch (options.name) {
          case 'default':
            return new Panel();
          default:
            return new Panel();
        }
      },
    });

    dockviewApi.addPanel({
      id: 'panel_1',
      component: 'default',
      title: 'Panel 1',
    });

    dockviewApi.addPanel({
      id: 'panel_2',
      component: 'default',
      position: { referencePanel: 'panel_1', direction: 'right' },
      title: 'Panel 2',
    });

    dockviewApi.addPanel({
      id: 'panel_3',
      component: 'default',
      position: { direction: 'below' },
      title: 'Panel 3',
    });

    onCleanup(() => {
      dockviewApi!.dispose();
    });

    // dockviewApi = createDockview(containerRef, {
    //   // className: 'dockview-theme-dracula',  // Optional: Apply a theme

    //   createComponent: (options) => {
    //     switch (options.name) {
    //       case 'editorComponent':
    //         return new EditorPanel();
    //       case 'resultsComponent':
    //         return new ResultsPanel();
    //       default:
    //         throw new Error(`Unknown component: ${options.name}`);
    //     }
    //   },
    // });

    // dockviewApi.addPanel({
    //   id: 'editor_1',
    //   component: 'editorComponent',
    //   title: 'Editor 1',
    // });

    // dockviewApi.addPanel({
    //   id: 'editor_2',
    //   component: 'editorComponent',
    //   title: 'Editor 2',
    //   position: { referencePanel: 'editor_1', direction: 'right' },
    // });

    // dockviewApi.addPanel({
    //   id: 'results',
    //   component: 'resultsComponent',
    //   title: 'Results',
    //   position: { referencePanel: 'editor_1', direction: 'below' },
    // });
  });

  return (
    <div
      ref={containerRef}
      class="dockview-theme-dracula"
      style="height: 100%; width: 100%; position: relative;"
    ></div>
  );
}
