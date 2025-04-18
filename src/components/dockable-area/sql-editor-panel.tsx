import { GroupPanelPartInitParameters } from 'dockview-core';
import { Component, createSignal } from 'solid-js';
import SqlEditor from '../sql-editor';

export const SqlEditorPanel: Component<{ params: GroupPanelPartInitParameters }> = (props) => {
  const [sql, setSql] = createSignal(
    `-- Sample SQL Queries (ID: ${props.params.id})\nSELECT * FROM users WHERE country = 'CA';\n\nSELECT COUNT(*) FROM orders;`
  );

  return (
    <div style={{ height: '100%', display: 'flex', 'flex-direction': 'column', padding: '0px' }}>
      <SqlEditor />
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
