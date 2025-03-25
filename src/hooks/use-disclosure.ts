import { createSignal } from 'solid-js';

export function useDisclosure(
  initialState = false,
  callbacks?: { onOpen?: () => void; onClose?: () => void }
) {
  const [opened, setOpened] = createSignal(initialState);

  const open = () => {
    setOpened((isOpened) => {
      if (!isOpened) {
        callbacks?.onOpen?.();
        return true;
      }
      return isOpened;
    });
  };

  const close = () => {
    setOpened((isOpened) => {
      if (isOpened) {
        callbacks?.onClose?.();
        return false;
      }
      return isOpened;
    });
  };

  const toggle = () => {
    opened() ? close() : open();
  };

  return [opened, { open, close, toggle }] as const;
}

export function useDisclosureData<T>(
  initialData: T | null = null,
  initialIsOpen: boolean = false,
  options?: { onOpen?: () => void; onClose?: () => void; dataDisappearDelay?: number }
) {
  const [disclosureData, setDisclosureData] = createSignal<T | null>(initialData);
  const [_isOpen, setIsOpen] = createSignal<boolean>(initialIsOpen);

  const open = (data: T | null) => {
    setIsOpen(true);
    setDisclosureData((_) => data);
    options?.onOpen?.();
  };

  const close = () => {
    setIsOpen(false);

    setTimeout(() => {
      setDisclosureData(null);
    }, options?.dataDisappearDelay ?? 250); // Only remove data after 250ms (usually when a modal has closed after animation)

    options?.onClose?.();
  };

  return [disclosureData, _isOpen, { open, close }] as const;
}
