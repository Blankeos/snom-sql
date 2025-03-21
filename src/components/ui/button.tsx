import type { JSX, ValidComponent } from 'solid-js';
import { Show, splitProps } from 'solid-js';

import * as ButtonPrimitive from '@kobalte/core/button';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { IconLoading } from '@/assets/icons';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'active:scale-[98%] transition inline-flex items-center justify-center text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-[12px]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-b to-gray-100 via-white from-white text-primary-foreground hover:bg-primary/90 border border-gray-200 shadow-sm',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps<T extends ValidComponent = 'button'> = ButtonPrimitive.ButtonRootProps<T> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    class?: string | undefined;
    children?: JSX.Element;
  };

const Button = <T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, ButtonProps<T>>
) => {
  const [local, others] = splitProps(props as ButtonProps, [
    'variant',
    'size',
    'class',
    'loading',
    'disabled',
    'children',
  ]);
  return (
    <ButtonPrimitive.Root
      class={cn(buttonVariants({ variant: local.variant, size: local.size }), local.class)}
      disabled={local.disabled || local.loading}
      {...others}
    >
      <Show when={props.loading} children={<IconLoading class="mr-2 h-4 w-4" />} />
      {local.children}
    </ButtonPrimitive.Root>
  );
};

export { Button, buttonVariants };
export type { ButtonProps };

