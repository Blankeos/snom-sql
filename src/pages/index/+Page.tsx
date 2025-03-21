import { IconAdd, IconMySQL, IconPostgresql, IconSetting, IconSqlite } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import TextField from '@/components/ui/text-field';
import { DatabaseType } from '@/lib/dexie';
import { cn } from '@/utils/cn';
import { parsePostgresUrl, serializePostgresUrl } from '@/utils/parse-db-url';
import Resizable from '@corvu/resizable'; // 'corvu/resizable'
import { invoke } from '@tauri-apps/api/core';
import { useHotkeys } from 'bagon-hooks';
import { createEffect, createSignal, JSX, Match, Show, Switch } from 'solid-js';

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  connectionString: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  databaseName?: string;
}

import { createStore, produce } from 'solid-js/store';

export default function Page() {
  const [connections, setConnections] = createSignal<DatabaseConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = createSignal<DatabaseConnection | null>(null);

  const [showNewConnectionForm, setShowNewConnectionForm] = createSignal(false);
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

  const [dbUri, setDbUri] = createSignal('');

  async function loadConnections() {
    const loadedConnections: DatabaseConnection[] = await invoke('get_connections', {});
    setConnections(loadedConnections);
  }

  async function addConnection() {
    setShowNewConnectionForm(true);
    // const newConnection: DatabaseConnection = {
    //   id: crypto.randomUUID(),
    //   name: newConnectionName(),
    //   type: 'postgres', // Hardcoded for now, expand later
    //   host: newConnectionHost(),
    //   port: newConnectionPort(),
    //   user: newConnectionUser(),
    //   password: newConnectionPassword(),
    //   databaseName: newConnectionDatabaseName(),
    //   connectionString: '', // Generate this later, or omit entirely
    // };
    // await invoke('add_connection', { connection: newConnection });
    // setConnections([...connections(), newConnection]);
    // // Clear the form
    // setNewConnectionName('');
    // setNewConnectionHost('');
    // setNewConnectionPort(5432);
    // setNewConnectionUser('');
    // setNewConnectionPassword('');
    // setNewConnectionDatabaseName('');
  }

  createEffect(() => {
    loadConnections();
  });

  function handleConnectionClick(connection: DatabaseConnection) {
    setSelectedConnection(connection);
  }

  function handleConnect() {
    // Implement connection logic here (e.g., using Tauri to connect)
    if (selectedConnection()) {
      alert(`Connecting to ${selectedConnection()?.name}`);
    }
  }

  useHotkeys([
    [
      'escape',
      () => {
        setShowNewConnectionForm(false);
      },
    ],
  ]);

  const handleNicknameChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    setNewConnectionForm('nickname', e.currentTarget.value);
  };

  const handleUriChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    const parsed = parsePostgresUrl(e.currentTarget.value);
    setNewConnectionForm('databaseUri', e.currentTarget.value);

    if (!parsed) {
      return;
    }

    setNewConnectionForm(
      produce((state) => {
        state.databaseName = parsed.databaseName;
        state.host = parsed.host;
        state.port = parsed.port;
        state.user = parsed.user;
        state.password = parsed.password;
      })
    );
  };

  function serializeUrl() {
    const serializedUrl = serializePostgresUrl({
      databaseName: newConnectionForm.databaseName,
      host: newConnectionForm.host || '<host>',
      port: newConnectionForm.port || '<port>',
      user: newConnectionForm.user || '<user>',
      password: newConnectionForm.password || '<password>',
    });
    setNewConnectionForm('databaseUri', serializedUrl);
  }
  const handleHostChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    setNewConnectionForm('host', e.currentTarget.value);
    serializeUrl();
  };

  const handlePortChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    setNewConnectionForm('port', e.currentTarget.value);
    serializeUrl();
  };

  const handleUserChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    setNewConnectionForm('user', e.currentTarget.value);
    serializeUrl();
  };

  const handlePasswordChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    setNewConnectionForm('password', e.currentTarget.value);
    serializeUrl();
  };

  const handleDatabaseNameChange: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    setNewConnectionForm('databaseName', e.currentTarget.value);
    serializeUrl();
  };

  return (
    <Resizable class="h-screen">
      <Resizable.Panel class="bg-background-darker p-3" id="panel-1" initialSize={0.25}>
        <div class="relative h-full">
          <div class="h-5"></div>
          <Button
            class="h-8 w-full gap-x-1 truncate text-xs"
            size="sm"
            onClick={() => {
              // "New Connection" logic, potentially open a modal
              addConnection(); // for now we just add
            }}
          >
            <IconAdd class="h-4 w-4 text-sky-300" />
            New Connection
          </Button>
          <h2 class="mt-3 mb-1 text-xs">Connections</h2>
          <Show when={showNewConnectionForm()}>
            <ConnectionItem
              info={{
                databaseType: DatabaseType.Postgres,
                id: 'preview-currently-edited',
                nickname: newConnectionForm.nickname,
              }}
              onClick={() => {}}
              selected={false}
            />
          </Show>
          {/* {connections().length === 0 ? (
            <p class="text-sm text-gray-500">No connections yet.</p>
          ) : (
            <ul class="list-none p-0">
              {connections().map((connection) => (
                <li
                  key={connection.id}
                  class="cursor-pointer rounded p-1 text-sm hover:bg-gray-100"
                  onClick={() => handleConnectionClick(connection)}
                >
                  {connection.name}
                </li>
              ))}
            </ul>
          )} */}
          <div class="absolute right-0 bottom-0 left-0 flex items-center justify-between text-xs text-gray-500">
            <div class="text-[10px] select-none">v0.0.1</div>
            <button class="active:scale-95">
              <IconSetting class="h-5 w-5" />
            </button>
          </div>
        </div>
      </Resizable.Panel>
      <Resizable.Handle
        id="panel-1:panel-2"
        class="w-0.5 bg-[#e5e7eb] ring-[#e5e7eb]/20 hover:ring-4"
      />
      <Resizable.Panel id="panel-2" initialSize={1}>
        <Show
          when={selectedConnection() || showNewConnectionForm()}
          children={
            <div class="p-4 text-xs">
              <h2 class="mb-4 text-sm font-medium">New Database Connection</h2>

              <div class="mb-4 flex gap-2 font-light">
                <Button class="h-6 gap-1 px-2 text-[0.6rem]">
                  <IconMySQL class="h-3 w-3" />
                  MySQL
                </Button>
                <Button class="h-6 gap-1 px-2 text-[0.6rem]">
                  <IconPostgresql class="h-3 w-3" />
                  Postgresql
                </Button>
                <Button class="h-6 gap-1 px-2 text-[0.6rem]">
                  <IconSqlite class="h-3 w-3" />
                  Sqlite
                </Button>
              </div>

              <div class="flex flex-col gap-2">
                <TextField
                  label="Nickname"
                  class="w-full"
                  onInput={handleNicknameChange}
                  value={newConnectionForm.nickname}
                />
                <TextField
                  label="Database URI"
                  class="w-full"
                  value={newConnectionForm.databaseUri}
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
                    value={newConnectionForm.host}
                    onInput={handleHostChange}
                  />
                  <TextField
                    label="Port"
                    required
                    value={newConnectionForm.port}
                    onInput={handlePortChange}
                  />
                </div>
                <div class="flex gap-x-2">
                  <TextField
                    label="User"
                    required
                    value={newConnectionForm.user}
                    onInput={handleUserChange}
                  />
                  <TextField
                    label="Password"
                    required
                    passwordMode
                    value={newConnectionForm.password}
                    onInput={handlePasswordChange}
                  />
                </div>
                <TextField
                  label="Database Name"
                  required
                  value={newConnectionForm.databaseName}
                  onInput={handleDatabaseNameChange}
                />

                <Button size="sm" class="mt-2 h-8 text-xs" onClick={handleConnect}>
                  Connect
                </Button>
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
      </Resizable.Panel>
    </Resizable>
  );
}

// postgresql://postgres:password123@localhost:5432/reformula_db

function ConnectionItem(props: {
  info: { id: string; nickname?: string; databaseType: DatabaseType };
  onClick: (connection: DatabaseConnection) => void;
  selected: boolean;
}) {
  return (
    <button
      class={cn(
        'w-full cursor-pointer rounded-md p-1 px-2 text-start text-sm hover:bg-gray-100',
        props.selected ? 'bg-gray-100' : ''
      )}
      // onClick={() => props.onClick({
      //   // id: props.info.id,
      //   // name: props.info.nickname || 'Unnamed',
      //   // type: props.info.databaseType,
      //   // connectionString: '', // You'll need to fetch the actual connection string
      // })}
    >
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
      {props.info.nickname || 'Unnamed'}
    </button>
  );
}
