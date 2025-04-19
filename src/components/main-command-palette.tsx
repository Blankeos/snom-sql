'use client';

import { useHotkeys, useOs } from 'bagon-hooks';

import { useAppContext } from '@/contexts/app';
import { createSignal } from 'solid-js';
import Kbd from './kbd';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { DialogTitle } from './ui/dialog';

export const MainCommandPalette = () => {
  const [open, setOpen] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal('');
  const os = useOs();

  const { setSidebarFocus, sidebarActive, setSidebarActive } = useAppContext();

  const COMMANDS_LIST = [
    {
      id: 'focus-connections',
      title: "sidebar: focus 'connections'",
      tip: () => <Kbd>⌘ 1</Kbd>,
      onSelect: () => {
        setSidebarActive(true);
        setSidebarFocus('connections');
      },
    },
    {
      id: 'focus-schema',
      title: "sidebar: focus 'schema'",
      tip: () => <Kbd>⌘ 2</Kbd>,
      onSelect: () => {
        setSidebarActive(true);
        setSidebarFocus('schema');
      },
    },
    {
      id: 'focus-queryfiles',
      title: "sidebar: focus 'query files'",
      tip: () => <Kbd>⌘ 3</Kbd>,
      onSelect: () => {
        setSidebarActive(true);
        setSidebarFocus('queryfiles');
      },
    },
    {
      id: 'toggle-sidebar',
      title: 'sidebar: toggle',
      tip: () => <Kbd>⌘ B</Kbd>,
      onSelect: () => {
        setSidebarActive(!sidebarActive());
      },
    },
    // Doing this will require custom filtering.
    // {
    //   id: 'focus-connection-name',
    //   title: 'sidebar: focus connection name',
    //   onselect: () => {
    //     // setSidebarFocus('')
    //   },
    // },
  ];

  useHotkeys(
    [
      [
        'meta+shift+p', // Meta = cmd on Mac | Ctrl on Windows/Linux
        () => {
          setOpen(!open());
        },
      ],
    ],
    []
  );

  // createEffect(() => {
  //   if (searchQuery) {
  //     search(searchQuery);
  //   }
  // }, [search, searchQuery]);

  // const filteredCommands = createMemo(() => {
  //   if (!searchQuery) return commandPaletteDefaultCommands;

  //   return commandPaletteDefaultCommands.filter(
  //     (command) =>
  //       command.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       command.category.toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  // }, [searchQuery]);

  // const hasResults = filteredCommands.length > 0 || searchResults.length > 0;

  return (
    <>
      {/* <div class="group relative w-full max-w-[250px]">
        <button
          onClick={() => setOpen(true)}
          class="flex w-full items-center justify-between rounded-md border border-neutral-200 py-1 pr-1 pl-4 text-sm text-neutral-500 group-hover:border-neutral-300 group-hover:bg-neutral-100 group-hover:text-neutral-800 hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-800 dark:border-neutral-600 dark:text-neutral-300 dark:group-hover:border-neutral-500 dark:group-hover:bg-neutral-800 dark:group-hover:text-white dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <span>Quick search...</span>
          <div class="flex items-center text-xs">
            <span class="rounded bg-neutral-200 px-1.5 py-0.5 text-neutral-700 group-hover:bg-neutral-300 group-hover:text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300 dark:group-hover:bg-neutral-600 dark:group-hover:text-white">
              {os() === 'macos' ? '⌘ K' : 'Ctrl K'}
            </span>
          </div>
        </button>
      </div> */}

      <CommandDialog
        open={open()}
        onOpenChange={(value) => {
          setOpen(value);
        }}
        commandProps={
          {
            // shouldFilter: false,
          }
        }
      >
        <DialogTitle class="hidden">Quick Search</DialogTitle>
        <CommandInput
          placeholder="Execute a command..."
          // value={searchQuery()}
          // onValueChange={setSearchQuery}
        />
        <div>
          <div class="flex flex-col space-y-2">
            <CommandList>
              <CommandEmpty class="py-2 text-center text-sm text-neutral-500">
                No commands found that match your search.
              </CommandEmpty>

              <CommandGroup>
                {COMMANDS_LIST.map((command) => (
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      command.onSelect();
                    }}
                    class="flex items-center justify-between"
                  >
                    <div class="flex items-center">
                      {/* <Show when={command.icon}>
                        <span class="mr-2">{command.icon}</span>
                      </Show> */}
                      {command.title}
                    </div>
                    <span class="text-xs text-neutral-500">{command?.tip?.()}</span>
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* {filteredCommands.length > 0 && (
                <CommandGroup heading="Main Pages">
                  {filteredCommands.map((command) => (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        router.push(command.path);
                      }}
                      class="flex items-center justify-between"
                    >
                      <div class="flex items-center">
                        <span class="mr-2">{command.icon}</span>
                        {command.title}
                      </div>
                      <span class="text-xs text-neutral-500">{command.category}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )} */}

              {/* {searchResults.length > 0 && (
                <CommandGroup heading="Documentation">
                  {searchResults.map((result) => (
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        router.push(`/docs/${result.slugAsParams}`);
                      }}
                      class="flex items-center justify-between"
                    >
                      <div class="flex w-full flex-col items-start gap-y-3">
                        <div class="flex w-full items-start justify-between">
                          <div class="font-medium">
                            <span class="mr-2">📄</span>
                            {result.title}
                          </div>
                          <span class="max-w-32 flex-shrink truncate text-end text-xs text-neutral-500">
                            {result.slug}
                          </span>
                        </div>
                        {result.highlights?.length ? (
                          <div>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: result.highlights,
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )} */}
            </CommandList>
          </div>
        </div>
      </CommandDialog>
    </>
  );
};
