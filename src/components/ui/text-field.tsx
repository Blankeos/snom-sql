import { IconEye, IconEyeClosed } from '@/assets/icons';
import { cn } from '@/utils/cn';
import { children, createSignal, JSX, Show, splitProps, VoidProps } from 'solid-js';

type TextFieldProps = {
  label: JSX.Element;
  class?: string;
  required?: boolean;
  passwordMode?: boolean;
} & JSX.InputHTMLAttributes<HTMLInputElement>;

export default function TextField(props: VoidProps<TextFieldProps>) {
  const [splittedProps, rest] = splitProps(props, ['type', 'passwordMode']);
  const _label = children(() => props.label);

  const [visiblePassword, setVisiblePassword] = createSignal(false);

  return (
    <div class="relative grid w-full items-center gap-1">
      <Show when={_label()}>
        <label for={props.id} class="text-xs">
          {_label()}
          <Show when={props.required}>
            <span class="ml-0.5 text-[10px] text-red-400">*</span>
          </Show>
        </label>
      </Show>
      <div class="flex w-full items-center">
        <input
          {...rest}
          id={rest.id}
          name={rest.id}
          class={cn('border-input w-full rounded-md border p-0.5 px-2', props.class)}
          type={
            splittedProps.passwordMode
              ? visiblePassword()
                ? 'text'
                : 'password'
              : splittedProps.type
          }
        />
        <Show when={splittedProps.passwordMode}>
          <button class="absolute right-2" onClick={() => setVisiblePassword(!visiblePassword())}>
            <Show
              when={visiblePassword()}
              children={<IconEye class="h-4 w-4" />}
              fallback={<IconEyeClosed class="h-4 w-4" />}
            />
          </button>
        </Show>
      </div>
    </div>
  );
}
