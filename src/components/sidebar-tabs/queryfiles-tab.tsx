import { IconAdd, IconSQL } from '@/assets/icons';
import { useConnectionsContext } from '@/contexts/connections';
import { db } from '@/lib/dexie';
import { useLiveQuery } from '@/lib/dexie-solid-hook';
import { Menu } from '@tauri-apps/api/menu';
import { For, mergeProps, Show, VoidProps } from 'solid-js';
import PrimarySidebarButton from '../primary-sidebar-button';

type QueryFilesTabProps = {};

export default function QueryFilesTab(props: VoidProps<QueryFilesTabProps>) {
  const defaultProps = mergeProps({}, props);
  const { selectedId } = useConnectionsContext();

  const queriesQuery = useLiveQuery(() => db.databaseQueries.toArray());

  async function addQuery() {
    await db.databaseQueries.add({
      connection_id: selectedId() ?? undefined,
      content: '',
      nickname: 'New Query',
    });
  }

  function handleQueryClick(id: number) {
    // Implement your logic for handling query click (e.g., opening the query)
  }

  async function handleQueryDelete(id: number) {
    await db.databaseQueries.delete(id);
  }

  return (
    <div class="p-3">
      <PrimarySidebarButton onClick={addQuery} icon={IconAdd} label="New Query" />

      <h2 class="mt-3 mb-1 text-xs">Queries</h2>
      <div class="flex flex-col gap-1">
        <Show when={queriesQuery.error}>
          {(error) => <p class="text-sm text-red-500">Error: {error()?.message}</p>}
        </Show>
        <Show when={!queriesQuery.error && queriesQuery.data?.length === 0}>
          <div class="border-muted-foreground text-muted-foreground w-full rounded-md border border-dashed p-4 text-center text-xs">
            No queries yet
          </div>
        </Show>
        <Show when={!queriesQuery.error && queriesQuery.data?.length! > 0}>
          <ul class="list-none p-0">
            <For each={queriesQuery.data || []}>
              {(query) => (
                <QueryItem
                  info={{
                    id: query.id,
                    nickname: query.nickname,
                    content: query.content,
                  }}
                  onClick={handleQueryClick}
                  onDelete={handleQueryDelete}
                  selected={false} // Replace with logic to determine if selected
                />
              )}
            </For>
          </ul>
        </Show>
      </div>

      <h2 class="mt-3 mb-1 text-xs">All Queries</h2>
      <Show when={queriesQuery.error}>
        {(error) => <p class="text-sm text-red-500">Error: {error()?.message}</p>}
      </Show>
      <Show when={!queriesQuery.error && queriesQuery.data?.length === 0}>
        <div class="border-muted-foreground text-muted-foreground w-full rounded-md border border-dashed p-4 text-center text-xs">
          No queries yet
        </div>
      </Show>
      <Show when={!queriesQuery.error && queriesQuery.data?.length! > 0}>
        <ul class="list-none p-0">
          <For each={queriesQuery.data || []}>
            {(query) => (
              <QueryItem
                info={{
                  id: query.id,
                  nickname: query.nickname,
                  content: query.content,
                }}
                onClick={handleQueryClick}
                onDelete={handleQueryDelete}
                selected={false} // Replace with logic to determine if selected
              />
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
}

type QueryInfo = {
  id: number;
  nickname?: string;
  content: string; // Assuming content is required, adjust if not
};

function QueryItem(props: {
  info: QueryInfo;
  onClick: (id: number) => void;
  onDelete?: (id: number) => void;
  selected: boolean;
}) {
  async function showContextMenu(e: MouseEvent) {
    e.preventDefault();

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
          id: 'connection-delete',
          text: 'Delete',
          action: () => {
            props.onDelete?.(props.info.id);
          },
        },
      ],
    });
    await menu.popup();
  }

  return (
    <div class="group relative">
      <button
        class={`hover:bg-background flex w-full cursor-pointer items-center gap-x-1 rounded-md p-1 px-2 text-start text-sm ${
          props.selected ? 'bg-background' : ''
        }`}
        onClick={() => props.onClick(props.info.id)}
        onContextMenu={showContextMenu}
      >
        <IconSQL class="h-4 w-4 text-yellow-400" />
        <div class="truncate select-none">{props.info.nickname || 'Untitled'}</div>
      </button>
      <button
        class="absolute top-1 right-1 hidden h-6 w-6 items-center justify-center rounded-full text-gray-500 transition group-hover:flex active:scale-90"
        onClick={showContextMenu}
        onContextMenu={showContextMenu}
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
