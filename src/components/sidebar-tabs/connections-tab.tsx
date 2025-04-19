import { IconAdd, IconMySQL, IconPostgresql, IconSqlite } from '@/assets/icons';
import { useConnectionsContext } from '@/contexts/connections';
import { DatabaseType, db } from '@/lib/dexie';
import { useLiveQuery } from '@/lib/dexie-solid-hook';
import { cn } from '@/utils/cn';
import { Menu } from '@tauri-apps/api/menu';
import { createSignal, For, JSX, Match, mergeProps, Show, Switch, VoidProps } from 'solid-js';
import PrimarySidebarButton from '../primary-sidebar-button';

type ConnectionsTabProps = {};

export default function ConnectionsTab(props: VoidProps<ConnectionsTabProps>) {
  const defaultProps = mergeProps({}, props);

  const { selectedId, setSelectedId } = useConnectionsContext();

  // ===========================================================================
  // Queries
  // ===========================================================================
  const connectionsQuery = useLiveQuery(() => db.databaseConnections.toArray());

  async function addConnection() {
    const id = await db.databaseConnections.add({
      nickname: '',
      database_type: DatabaseType.Postgres,
      database_uri: '',
      host: '',
      port: '',
      user: '',
      password: '',
      database_name: '',
      schema: '',
    });

    setSelectedId(id);
  }

  return (
    <div class="p-3">
      <PrimarySidebarButton
        icon={IconAdd}
        onClick={() => {
          addConnection();
        }}
        label="New Connection"
      />
      <h2 class="mt-3 mb-1 text-xs">Connections</h2>
      <div class="flex flex-col gap-1">
        <Show when={connectionsQuery.error}>
          {(error) => <p class="text-sm text-red-500">Error: {error()?.message}</p>}
        </Show>
        <Show when={!connectionsQuery.error && connectionsQuery.data?.length === 0}>
          <div class="border-muted-foreground text-muted-foreground w-full rounded-md border border-dashed p-4 text-center text-xs">
            No connections yet
          </div>
        </Show>
        <Show when={!connectionsQuery.error && connectionsQuery.data?.length! > 0}>
          <ul class="list-none p-0">
            <For each={connectionsQuery.data || []}>
              {(connection) => (
                <ConnectionItem
                  info={{
                    databaseType: connection.database_type,
                    id: connection.id,
                    nickname: connection.nickname,
                  }}
                  onClick={() => {
                    setSelectedId(connection.id);
                  }}
                  onRenameInput={async (id, newNickname) => {
                    await db.databaseConnections.update(id, { nickname: newNickname });
                  }}
                  onDelete={async () => {
                    await db.databaseConnections.delete(connection.id);
                  }}
                  selected={selectedId() === connection.id}
                />
              )}
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
}

function ConnectionItem(props: {
  info: { id: number; nickname?: string; databaseType: DatabaseType };
  onClick: (id: number) => void;
  onDelete?: (id: number) => void;
  onRenameInput: (id: number, newNickname: string) => Promise<void> | void; // Added onRename prop
  selected: boolean;
  onContextMenu?: (e: MouseEvent) => void; // Keep context menu prop if needed elsewhere
}) {
  const [isEditing, setIsEditing] = createSignal(false);
  let inputRef: HTMLInputElement | undefined; // Ref for the input element

  const displayName = () => props.info.nickname || 'Untitled';

  // Enter edit mode
  const startEditing = () => {
    setIsEditing(true);
    setTimeout(() => inputRef?.focus(), 0);
  };

  // Handle key presses in the input
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== 'Escape') return;
    e.preventDefault();
    inputRef?.blur();
  };

  const showContextMenu: JSX.EventHandler<HTMLButtonElement, MouseEvent> = async (e) => {
    e.preventDefault();
    if (isEditing()) return; // Don't show context menu while editing name

    const menu = await Menu.new({
      items: [
        {
          id: 'connection-view',
          text: 'View',
          action: () => {
            props.onClick(props.info.id);
          },
        },
        {
          id: 'connection-rename',
          text: 'Rename',
          action: () => {
            startEditing();
          },
        },
        {
          id: 'connection-delete',
          text: 'Delete',
          // Add styling for destructive actions if possible/desired
          // style: { color: 'red' } // Note: Tauri menu styling is limited
          action: () => {
            props.onDelete?.(props.info.id);
          },
        },
      ],
    });
    await menu.popup();
  };

  return (
    <div class="group relative">
      {/* Main clickable button area */}
      <button
        class={cn(
          'hover:bg-background flex w-full cursor-pointer items-center rounded-md p-1 px-2 text-start text-sm',
          props.selected ? 'bg-background' : ''
        )}
        onClick={() => {
          if (!isEditing()) {
            // Prevent selection change when clicking to finish edit
            props.onClick(props.info.id);
          }
        }}
        // Use button's context menu handler
        onContextMenu={showContextMenu}
        // Prevent double-click on the button itself from propagating if needed, though targeting the div is better
      >
        {/* Icon */}
        <div class="shrink-0">
          {' '}
          {/* Prevent icon from shrinking */}
          <Switch>
            <Match when={props.info.databaseType === DatabaseType.Postgres}>
              <IconPostgresql class="mr-1 inline h-3 w-3" />
            </Match>
            <Match when={props.info.databaseType === DatabaseType.MySQL}>
              <IconMySQL class="mr-1 inline h-3 w-3" />
            </Match>
            <Match when={props.info.databaseType === DatabaseType.SQLite}>
              <IconSqlite class="mr-1 inline h-3 w-3" />
            </Match>
          </Switch>
        </div>

        {/* Nickname Display / Input Area */}
        <div class="flex-grow truncate">
          {' '}
          {/* Use flex-grow and truncate on the container */}
          <Show
            when={isEditing()}
            fallback={
              // Display Mode: div that triggers editing on double-click
              <div
                class="truncate select-none"
                onDblClick={(e) => {
                  e.stopPropagation(); // Prevent click/dblclick on button
                  startEditing();
                }}
                title={displayName()} // Show full name on hover if truncated
              >
                {displayName()}
              </div>
            }
          >
            {/* Edit Mode: Input field */}
            <input
              ref={inputRef}
              type="text"
              value={props.info.nickname}
              onInput={(e) => props.onRenameInput(props.info.id, e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => setIsEditing(false)}
              class={cn(
                'm-0 h-full w-full border-none bg-transparent p-0 text-sm text-inherit outline-none'
              )}
              onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to the button
              onDblClick={(e) => e.stopPropagation()} // Prevent double-click from restarting edit
            />
          </Show>
        </div>
      </button>

      {/* Kebab menu button (optional) - shown on hover */}
      <button
        class={cn(
          'absolute top-1 right-1 hidden h-6 w-6 items-center justify-center rounded-full text-gray-500 transition group-hover:flex active:scale-90',
          isEditing() && 'hidden' // Hide kebab when editing name
        )}
        onClick={showContextMenu} // Trigger same context menu
        // onContextMenu={showContextMenu} // Not strictly needed here if onClick works
        title="Connection Options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="h-3 w-3"
        >
          <path
            fill-rule="evenodd"
            d="M3 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm9 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm9 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
