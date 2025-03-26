import { cn } from '@/utils/cn';
import { ParentProps } from 'solid-js';

type KbdProps = {
  class?: string;
};

export default function Kbd(props: ParentProps<KbdProps>) {
  return (
    <kbd
      class={cn(
        'bg-background border-background-darker pointer-events-none flex w-max gap-x-0.5 rounded-sm border px-1 py-0.5 text-[10px] font-medium text-neutral-400',
        props.class
      )}
    >
      {props.children}
    </kbd>
  );
}
