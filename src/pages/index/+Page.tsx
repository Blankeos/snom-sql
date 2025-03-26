import {
  IconAdd,
  IconDatabaseAdd,
  IconDatabaseSchema,
  IconMySQL,
  IconPostgresql,
  IconQueryFiles,
  IconRoundedCornerBL,
  IconSetting,
  IconSqlite,
} from '@/assets/icons';
import SettingsModal from '@/components/settings-modal';
import { Button } from '@/components/ui/button';
import TextField from '@/components/ui/text-field';
import { useDisclosure } from '@/hooks/use-disclosure';
import { DatabaseType, db } from '@/lib/dexie';
import { cn } from '@/utils/cn';
import { parsePostgresUrl, serializePostgresUrl } from '@/utils/parse-db-url';
import { useHotkeys } from 'bagon-hooks';
import { createEffect, createSignal, For, JSX, Match, on, Show, Switch } from 'solid-js';
import { Panel, PanelGroup, PanelGroupAPI, ResizeHandle } from 'solid-resizable-panels';
import 'solid-resizable-panels/styles.css';

import { Tippy } from '@/components/solid-tippy';
import { useAppContext } from '@/contexts/app';
import { useLiveQuery } from '@/lib/dexie-solid-hook';
import { invoke } from '@tauri-apps/api/core';
import { Menu } from '@tauri-apps/api/menu';
import { createStore } from 'solid-js/store';
import { toast } from 'solid-sonner';

export default function Page() {
  // ===========================================================================
  // States
  // ===========================================================================
  const [panelGroupAPI, setPanelGroupAPI] = createSignal<PanelGroupAPI>();

  const [settingsModalIsOpen, settingsModalActions] = useDisclosure(false);

  const [selectedId, setSelectedId] = createSignal<number | null>(null);
  const [showNewConnectionForm, setShowNewConnectionForm] = createSignal(false);

  // To deprecate
  const [newConnectionForm, setNewConnectionForm] = createStore({
    nickname: '',
    databaseType: DatabaseType.Postgres,
    databaseUri: '',
    name: '',
    host: '',
    port: '5432', // Default port
    user: '',
    password: '',
    databaseName: '',
  });

  const [isTestingConnection, setIsTestingConnection] = createSignal(false); // Add this line
  const [connectionTestResult, setConnectionTestResult] = createSignal<string | null>(null);

  // ===========================================================================
  // Queries
  // ===========================================================================
  const connectionsQuery = useLiveQuery(() => db.databaseConnections.toArray());
  const connectionQuery = useLiveQuery(() => {
    return db.databaseConnections.get(selectedId()!);
  }, [selectedId]);

  async function addConnection() {
    console.log('add connection!', 'carlll');
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

    console.log('what', id);

    setSelectedId(id);
  }

  const [lastSize, setLastSize] = createSignal(32);

  useHotkeys([
    [
      'meta+w',
      () => {
        setSelectedId(null);
      },
    ],
    [
      'meta+b',
      () => {
        const api = panelGroupAPI();
        const currentSize = api?.getLayout().at(0);
        if (currentSize === 0) {
          api?.expand('panel-1', lastSize());
        } else {
          setLastSize(currentSize ?? 32);
          api?.collapse('panel-1');
        }
      },
    ],
  ]);

  createEffect(
    on(panelGroupAPI, () => {
      panelGroupAPI()?.expand('panel-1', lastSize());
    })
  );

  // ===========================================================================
  // Functions
  // ===========================================================================

  function handleConnect() {
    // Implement connection logic here (e.g., using Tauri to connect)
  }

  const handleTestConnection = async () => {
    toast.loading('Checking connection...', { id: 'test-connection' });

    setIsTestingConnection(true);
    setConnectionTestResult(null); // Clear any previous result

    try {
      if (!selectedId()) {
        throw new Error('No connection selected.');
      }

      const connection = await db.databaseConnections.get(selectedId()!);

      if (!connection) {
        throw new Error('Connection not found in the database.');
      }

      const result = await invoke<string>('test_database_connection', {
        connection: connection,
      });

      setConnectionTestResult(`Connection successful: ${result}`);
      toast.success('Connection works!', { id: 'test-connection' });
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setConnectionTestResult(`Connection failed: ${error.message || 'Unknown error'}`);
      toast.error('Something went wrong.', { id: 'test-connection' });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleDatabaseTypeChange = async (databaseType: DatabaseType) => {
    if (selectedId() === null) return;

    await db.databaseConnections.update(selectedId()!, { database_type: databaseType });
  };

  const handleNicknameChange: JSX.EventHandler<HTMLInputElement, InputEvent> = async (e) => {
    if (selectedId() === null) return;

    await db.databaseConnections.update(selectedId()!, { nickname: e.currentTarget.value });
  };

  const handleUriChange: JSX.EventHandler<HTMLInputElement, InputEvent> = async (e) => {
    if (selectedId() === null) return;

    const parsed = parsePostgresUrl(e.currentTarget.value);

    await db.databaseConnections.update(selectedId()!, { database_uri: e.currentTarget.value });

    if (!parsed) {
      return;
    }

    await db.databaseConnections.update(selectedId()!, {
      database_name: parsed.databaseName,
      host: parsed.host,
      port: parsed.port,
      user: parsed.user,
      password: parsed.password,
    });
  };

  async function serializeUrl() {
    if (selectedId() === null) return;

    const connection = await db.databaseConnections.get(selectedId()!);

    if (!connection) return;

    const serializedUrl = serializePostgresUrl({
      databaseName: connection.database_name,
      host: connection.host || '<host>',
      port: connection.port || '',
      user: connection.user || '<user>',
      password: connection.password || '<password>',
    });
    await db.databaseConnections.update(selectedId()!, { database_uri: serializedUrl });
  }
  const handleHostChange: JSX.EventHandler<HTMLInputElement, InputEvent> = async (e) => {
    if (selectedId() === null) return;

    await db.databaseConnections.update(selectedId()!, { host: e.currentTarget.value });
    serializeUrl();
  };

  const handlePortChange: JSX.EventHandler<HTMLInputElement, InputEvent> = async (e) => {
    if (selectedId() === null) return;
    await db.databaseConnections.update(selectedId()!, { port: e.currentTarget.value });
    serializeUrl();
  };

  const handleUserChange: JSX.EventHandler<HTMLInputElement, InputEvent> = async (e) => {
    if (selectedId() === null) return;

    await db.databaseConnections.update(selectedId()!, { user: e.currentTarget.value });
    serializeUrl();
  };

  const handlePasswordChange: JSX.EventHandler<HTMLInputElement, InputEvent> = async (e) => {
    if (selectedId() === null) return;
    await db.databaseConnections.update(selectedId()!, { password: e.currentTarget.value });
    serializeUrl();
  };

  const handleDatabaseNameChange: JSX.EventHandler<HTMLInputElement, InputEvent> = async (e) => {
    if (selectedId() === null) return;
    await db.databaseConnections.update(selectedId()!, { database_name: e.currentTarget.value });
    serializeUrl();
  };

  return (
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
          <div class="p-3">
            <Button
              class="h-8 w-full gap-x-1 truncate text-xs"
              size="sm"
              onClick={() => {
                addConnection(); // for now we just add
              }}
            >
              <IconAdd class="h-4 w-4 shrink-0 text-sky-300" />
              <span class="truncate">New Connection</span>
            </Button>
            <h2 class="mt-3 mb-1 text-xs">Connections</h2>
            <div class="flex flex-col gap-1">
              <Show when={showNewConnectionForm()}>
                <ConnectionItem
                  info={{
                    databaseType: newConnectionForm.databaseType,
                    id: -100,
                    nickname: newConnectionForm.nickname,
                  }}
                  selected={false}
                  onClick={() => {}}
                  onDelete={() => {}}
                />
              </Show>
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
        </div>
      </Panel>
      <ResizeHandle class="!bg-max-100 relative" />
      <Panel id="panel-2" initialSize={100} class="bg-background">
        <Show
          when={selectedId() || showNewConnectionForm()}
          children={
            <div class="p-4 text-xs">
              <h2 class="mb-4 text-sm font-medium">
                {connectionQuery.data?.nickname || 'New Database Connection'}
              </h2>

              <div class="mb-4 flex gap-2 font-light">
                <Button
                  class="h-6 gap-1 px-2 text-[0.6rem]"
                  onClick={() => handleDatabaseTypeChange(DatabaseType.Postgres)}
                >
                  <IconPostgresql class="h-3 w-3" />
                  Postgresql
                </Button>
                <Button
                  class="h-6 gap-1 px-2 text-[0.6rem]"
                  onClick={() => handleDatabaseTypeChange(DatabaseType.SQLite)}
                >
                  <IconSqlite class="h-3 w-3" />
                  Sqlite
                </Button>
                <Button
                  class="h-6 gap-1 px-2 text-[0.6rem]"
                  onClick={() => handleDatabaseTypeChange(DatabaseType.MySQL)}
                >
                  <IconMySQL class="h-3 w-3" />
                  MySQL
                </Button>
              </div>

              <div class="flex flex-col gap-2">
                <TextField
                  label="Nickname"
                  class="w-full"
                  onInput={handleNicknameChange}
                  value={connectionQuery.data?.nickname || ''}
                />
                <TextField
                  label="Database URI"
                  class="w-full"
                  value={connectionQuery.data?.database_uri || ''}
                  onInput={handleUriChange}
                />

                <div class="my-3 flex items-center gap-2 text-neutral-400">
                  <div class="w-full border-b"></div>
                  <div>or</div>
                  <div class="w-full border-b"></div>
                </div>

                <div class="flex gap-x-2">
                  <TextField
                    label="Host"
                    required
                    value={connectionQuery.data?.host || ''}
                    onInput={handleHostChange}
                  />
                  <TextField
                    label="Port"
                    value={connectionQuery.data?.port || ''}
                    onInput={handlePortChange}
                  />
                </div>
                <div class="flex gap-x-2">
                  <TextField
                    label="User"
                    required
                    value={connectionQuery.data?.user || ''}
                    onInput={handleUserChange}
                  />
                  <TextField
                    label="Password"
                    required
                    passwordMode
                    value={connectionQuery.data?.password || ''}
                    onInput={handlePasswordChange}
                  />
                </div>
                <TextField
                  label="Database Name"
                  required
                  value={connectionQuery.data?.database_name || ''}
                  onInput={handleDatabaseNameChange}
                />

                <div class="flex w-full gap-2">
                  <Button size="sm" class="mt-2 h-8 flex-grow text-xs" onClick={handleConnect}>
                    Connect
                  </Button>
                  <Button
                    size="sm"
                    class="mt-2 h-8 truncate px-3 text-xs"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection()}
                  >
                    {isTestingConnection() ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>

                <Show when={connectionTestResult()}>
                  <p
                    class={cn(
                      'mt-2 text-sm',
                      connectionTestResult()?.startsWith('Connection successful')
                        ? 'text-green-500'
                        : 'text-red-500'
                    )}
                  >
                    {connectionTestResult()}
                  </p>
                </Show>
              </div>
            </div>
          }
          fallback={
            <div class="flex h-full w-full flex-col items-center justify-center p-8 text-center text-sm text-gray-500 select-none">
              <img
                src="https://preview.redd.it/7obwhaxvi9f41.png?auto=webp&s=9177b3168479ec91e467c4ba0ce03971146969f7"
                class="mb-4 max-h-32 max-w-full object-contain grayscale"
              />
              Select a connection to view details.
            </div>
          }
        />
      </Panel>
    </PanelGroup>
  );
}

// postgresql://postgres:password123@localhost:5432/reformula_db

function ConnectionItem(props: {
  info: { id: number; nickname?: string; databaseType: DatabaseType };
  onClick: (id: number) => void;
  onDelete?: (id: number) => void;
  selected: boolean;
  onContextMenu?: (e: MouseEvent) => void;
}) {
  const showContextMenu: JSX.EventHandler<HTMLButtonElement, MouseEvent> = async (e) => {
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
  };

  return (
    <div class="group relative">
      <button
        class={cn(
          'hover:bg-background flex w-full cursor-pointer items-center rounded-md p-1 px-2 text-start text-sm',
          props.selected ? 'bg-background' : ''
        )}
        onClick={() => props.onClick(props.info.id)}
        onContextMenu={showContextMenu}
      >
        <div>
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
        <div class="truncate select-none">{props.info.nickname || 'Unnamed'}</div>
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

function SidebarTabItem(props: {
  focus: string;
  setSidebarFocus: (focus: any) => void;
  icon: (props: { class?: string }) => JSX.Element;
  name: string;
  tip: string;
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

function SidebarTabs() {
  const { sidebarFocus, setSidebarFocus } = useAppContext();

  const tabs = [
    {
      name: 'connections',
      icon: IconDatabaseAdd,
      tip: 'Connections',
    },
    {
      name: 'schema',
      icon: IconDatabaseSchema,
      tip: 'Schema',
    },
    {
      name: 'queryfiles',
      icon: IconQueryFiles,
      tip: 'Query Files',
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
