import { Component, JSX, VoidProps } from 'solid-js';
import { Button } from './ui/button';

type PrimarySidebarButtonProps = {
  onClick: () => void;
  icon?: Component<any>;
  label?: JSX.Element;
};

export default function PrimarySidebarButton(props: VoidProps<PrimarySidebarButtonProps>) {
  return (
    <Button class="h-8 w-full gap-x-1 truncate text-xs" size="sm" onClick={props.onClick}>
      {props.icon && <props.icon class="h-4 w-4 shrink-0 text-sky-300" />}
      <span class="truncate">{props.label}</span>
    </Button>
  );
}
