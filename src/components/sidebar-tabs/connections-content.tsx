import { IconMySQL, IconPostgresql, IconSqlite } from '@/assets/icons';
import { useConnectionsContext } from '@/contexts/connections';
import { DatabaseType, db } from '@/lib/dexie';
import { useLiveQuery } from '@/lib/dexie-solid-hook';
import { cn } from '@/utils/cn';
import { parsePostgresUrl, serializePostgresUrl } from '@/utils/parse-db-url';
import { invoke } from '@tauri-apps/api/core';
import { createSignal, JSX, mergeProps, Show, VoidProps } from 'solid-js';
import { toast } from 'solid-sonner';
import { Button } from '../ui/button';
import TextField from '../ui/text-field';

type ConnectionsContentProps = {};

export default function ConnectionsContent(props: VoidProps<ConnectionsContentProps>) {
  const defaultProps = mergeProps({}, props);

  const { selectedId } = useConnectionsContext();

  const [isTestingConnection, setIsTestingConnection] = createSignal(false); // Add this line
  const [connectionTestResult, setConnectionTestResult] = createSignal<string | null>(null);

  // ===========================================================================
  // Queries
  // ===========================================================================
  const connectionQuery = useLiveQuery(() => {
    return db.databaseConnections.get(selectedId()!);
  }, [selectedId]);

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
    <>
      <Show
        when={selectedId()}
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
    </>
  );
}
