import type { Component, ComponentProps, ParentProps, VoidProps } from 'solid-js';
import { splitProps } from 'solid-js';

import type { DialogRootProps } from '@kobalte/core/dialog';
import * as CommandPrimitive from 'cmdk-solid';

import { cn } from '@/utils/cn';
import { Dialog, DialogContent } from './dialog';

const Command: Component<ParentProps<CommandPrimitive.CommandRootProps>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <CommandPrimitive.CommandRoot
      class={cn(
        'bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-md blur-none',
        local.class
      )}
      {...others}
    />
  );
};

const CommandDialog: Component<
  ParentProps<DialogRootProps & { commandProps?: CommandPrimitive.CommandRootProps }>
> = (props) => {
  const [local, others] = splitProps(props, ['children', 'commandProps']);

  return (
    <Dialog {...others}>
      <DialogContent class="border-border overflow-hidden rounded-lg border p-0 shadow-lg">
        <Command
          {...local.commandProps}
          class="[&_[cmdk-group-heading]]:text-primary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:size-5 [&_[cmdk-input]]:h-11 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:size-5"
        >
          {local.children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput: Component<VoidProps<CommandPrimitive.CommandInputProps>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <div class="border-border flex items-center border-b px-3" cmdk-input-wrapper="">
      <CommandPrimitive.CommandInput
        class={cn(
          'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50',
          local.class
        )}
        {...others}
      />
    </div>
  );
};

const CommandList: Component<ParentProps<CommandPrimitive.CommandListProps>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <CommandPrimitive.CommandList
      class={cn('max-h-[300px] overflow-x-hidden overflow-y-auto', local.class)}
      {...others}
    />
  );
};

const CommandEmpty: Component<ParentProps<CommandPrimitive.CommandEmptyProps>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <CommandPrimitive.CommandEmpty
      class={cn('py-6 text-center text-sm', local.class)}
      {...others}
    />
  );
};

const CommandGroup: Component<ParentProps<CommandPrimitive.CommandGroupProps>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <CommandPrimitive.CommandGroup
      class={cn(
        'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
        local.class
      )}
      {...others}
    />
  );
};

const CommandSeparator: Component<VoidProps<CommandPrimitive.CommandSeparatorProps>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <CommandPrimitive.CommandSeparator class={cn('bg-border h-px', local.class)} {...others} />
  );
};

const CommandItem: Component<ParentProps<CommandPrimitive.CommandItemProps>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <CommandPrimitive.CommandItem
      cmdk-item=""
      class={cn(
        'aria-selected:bg-accent aria-selected:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        local.class
      )}
      {...others}
    />
  );
};

const CommandShortcut: Component<ComponentProps<'span'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);

  return (
    <span
      class={cn('text-muted-foreground ml-auto text-xs tracking-widest', local.class)}
      {...others}
    />
  );
};

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
