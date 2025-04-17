import {
  createDockview,
  DockviewApi,
  GroupPanelPartInitParameters,
  IContentRenderer,
} from 'dockview-core';
import 'dockview-core/dist/styles/dockview.css'; // Core Dockview styles

import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { render } from 'solid-js/web'; // Import render and Disposer
import SQLEditor from '../sql-editor';

// --- 1. Define SolidJS Components ---

const SqlEditorComponent: Component<{ params: GroupPanelPartInitParameters }> = (props) => {
  const [sql, setSql] = createSignal(
    `-- Sample SQL Queries (ID: ${props.params.id})\nSELECT * FROM users WHERE country = 'CA';\n\nSELECT COUNT(*) FROM orders;`
  );

  return (
    <div style={{ height: '100%', display: 'flex', 'flex-direction': 'column', padding: '0px' }}>
      <SQLEditor />
      {/* Basic Textarea for SQL */}
      {/* <textarea
        style={{
          'flex-grow': '1', // Take available space
          'font-family': 'monospace',
          'font-size': '13px',
          border: '1px solid #444',
          'background-color': '#2a2a2a', // Darker background for editor
          color: '#ccc', // Light text
          resize: 'none', // Optional: disable resizing
        }}
        value={sql()}
        onInput={(e) => setSql(e.currentTarget.value)}
      /> */}
    </div>
  );
};

const ResultsPanelComponent: Component<{ params: GroupPanelPartInitParameters }> = (props) => {
  return (
    <div style={{ padding: '15px', color: '#ddd' }}>
      <h3>Results (Panel ID: {props.params.id})</h3>
      <p style={{ 'font-family': 'monospace', 'font-size': '14px', color: 'lightgreen' }}>
        [RESULTS GO HERE]
      </p>
      {/* You could potentially access panel API via props.params.api */}
      {/* <p>Query from: {props.params.api.title}</p> */}
    </div>
  );
};

// --- 2. Create Renderer Classes ---

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

// Specific renderer for the SQL Editor
class SqlEditorRenderer extends SolidPanelRenderer {
  getSolidComponent() {
    return SqlEditorComponent;
  }
}

// Specific renderer for the Results Panel
class ResultsRenderer extends SolidPanelRenderer {
  getSolidComponent() {
    return ResultsPanelComponent;
  }
}

// --- 3. Main Dockable Area Component Setup ---

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
            return new ResultsRenderer();
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
