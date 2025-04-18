import {
  createDockview,
  DockviewApi,
  GroupPanelPartInitParameters,
  IContentRenderer,
} from 'dockview-core';
import 'dockview-core/dist/styles/dockview.css'; // Core Dockview styles

import { Component, onCleanup, onMount } from 'solid-js';
import { render } from 'solid-js/web'; // Import render and Disposer
import { ResultsPanel } from './results-panel';
import { SqlEditorPanel } from './sql-editor-panel';

// --- 1. Create Renderer Classes ---

// Base class to handle Solid rendering and cleanup
abstract class SolidPanelRenderer implements IContentRenderer {
  protected readonly _element: HTMLDivElement;
  protected _params: GroupPanelPartInitParameters | null = null;
  protected _disposer: Disposer | null = null;

  // Subclasses must provide the Solid Component to render
  abstract getSolidComponent(): Component<{ params: GroupPanelPartInitParameters }>;

  get element(): HTMLElement {
    return this._element;
  }

  constructor() {
    this._element = document.createElement('div');
    this._element.style.height = '100%'; // Ensure container takes up space
    this._element.style.overflow = 'auto'; // Allow scrolling if needed
  }

  init(params: GroupPanelPartInitParameters): void {
    this._params = params;
    const SolidComponent = this.getSolidComponent();
    // Render the Solid component into the container and store the dispose function
    this._disposer = render(() => <SolidComponent params={params} />, this._element);
  }

  update(params: GroupPanelPartInitParameters): void {
    // Basic update: Store new params.
    // More complex logic might be needed if the component needs to react
    // specifically to panel API updates after initialization.
    this._params = params;
    console.log(`Panel ${params.id} updated.`);
  }

  dispose(): void {
    // Call Solid's dispose function to clean up the component and its reactivity
    if (this._disposer) {
      this._disposer();
      this._disposer = null;
    }
    this._params = null;
  }
}

class SqlEditorRenderer extends SolidPanelRenderer {
  getSolidComponent() {
    return SqlEditorPanel;
  }
}
class ResultsPanelRenderer extends SolidPanelRenderer {
  getSolidComponent() {
    return ResultsPanel;
  }
}

// --- 2. Main Dockable Area Component Setup ---

export default function MainDockableArea() {
  let containerRef!: HTMLDivElement;
  let dockviewApi: DockviewApi | undefined; // Use undefined initially

  onMount(() => {
    if (!containerRef) return; // Safety check

    dockviewApi = createDockview(containerRef, {
      // Optional: Apply theme class name here or on the container div
      // className: 'dockview-theme-abyss',
      disableDnd: false,
      theme: {
        className: 'dockview-carlo',
        name: '',
      },
      // createComponent maps names to our Solid renderers
      createComponent: (options) => {
        switch (options.name) {
          case 'sqlEditorComponent': // Name used in addPanel
            return new SqlEditorRenderer();
          case 'resultsComponent': // Name used in addPanel
            return new ResultsPanelRenderer();
          default:
            // Provide a fallback or throw an error
            console.warn(`Unknown component name: ${options.name}. Creating empty panel.`);
            // Simple fallback: an empty renderer
            return {
              element: document.createElement('div'),
              init: (params) => {
                params.api.setTitle('Error: Unknown Component');
              },
            } as IContentRenderer;
          // Or: throw new Error(`Unknown component name: ${options.name}`);
        }
      },
    });

    // Add the SQL Editor panel
    dockviewApi.addPanel({
      id: 'sql_editor_main', // Unique ID for this panel
      component: 'sqlEditorComponent', // Matches name in createComponent
      title: 'SQL Editor',
    });

    // Add the Results panel below the editor
    dockviewApi.addPanel({
      id: 'results_main', // Unique ID for this panel
      component: 'resultsComponent', // Matches name in createComponent
      title: 'Results',
      position: { referencePanel: 'sql_editor_main', direction: 'below' }, // Position below the editor
    });
  }); // End onMount

  // Cleanup when the component is unmounted
  onCleanup(() => {
    if (dockviewApi) {
      dockviewApi.dispose(); // Dispose Dockview instance
      dockviewApi = undefined;
    }
  });

  return (
    <div
      ref={containerRef}
      // Apply a Dockview theme class here
      class="dockview-carlo" // Or dockview-theme-dracula, etc.
      style="height: 100%; width: 100%; position: relative;" // Ensure container has dimensions & default bg
    >
      {/* Dockview will render its content inside this div */}
    </div>
  );
}
