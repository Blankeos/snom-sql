import { IconFormat, IconPlay } from '@/assets/icons';
import { GroupPanelPartInitParameters } from 'dockview-core';
import { Component, createSignal, Show } from 'solid-js';
import Kbd from '../kbd';
import { Tippy } from '../solid-tippy';
import SqlEditor from '../sql-editor';
import { Button } from '../ui/button';

export const SqlEditorPanel: Component<{ params: GroupPanelPartInitParameters }> = (props) => {
  const [sql, setSql] = createSignal(
    `-- Sample SQL Queries (ID: ${props.params.id})\nSELECT * FROM users WHERE country = 'CA';\n\nSELECT COUNT(*) FROM orders;`
  );

  const [selectedLinesInfo, setSelectedLinesInfo] = createSignal<{
    fromLine: number;
    toLine: number;
  } | null>(null);

  return (
    <div class="relative flex h-full flex-col p-0">
      <SqlEditor
        onSelectedLinesChange={setSelectedLinesInfo}
        onMetaEnter={(info) => {
          console.log('Meta Enter:', info);
        }}
      />
      <div class="absolute right-2 bottom-2 flex gap-x-1">
        <Tippy props={{ arrow: false }} content="Format">
          <Button size="icon" class="h-7 w-7 rounded-full">
            <IconFormat class="h-3 w-3" />
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
          <Button class="flex h-7 gap-x-1.5 px-2 text-[11px]" size="sm">
            <IconPlay class="h-3 w-3 text-green-500" />
            <Show
              when={selectedLinesInfo() === null}
              children={<>Run All</>}
              fallback={<>Run Selected</>}
            />
          </Button>
        </Tippy>
      </div>
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
