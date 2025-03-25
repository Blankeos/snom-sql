import { useThemeContext } from '@/contexts/theme';
import { DialogRootProps } from '@kobalte/core/dialog';
import { VoidProps } from 'solid-js';
import { Dialog, DialogContent } from './dialog';

type SettingsModalProps = {} & DialogRootProps;

export default function SettingsModal(props: VoidProps<SettingsModalProps>) {
  const { theme, setTheme } = useThemeContext();

  return (
    <Dialog {...props}>
      <DialogContent class="p-4">
        <h2 class="mb-2">Theme</h2>
        <div class="flex items-center space-x-4">
          <label class="inline-flex items-center">
            <input
              type="radio"
              class="form-radio"
              name="theme"
              value="light"
              checked={theme() === 'light'}
              onChange={() => setTheme('light')}
            />
            <span class="ml-2">Light</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              class="form-radio"
              name="theme"
              value="dark"
              checked={theme() === 'dark'}
              onChange={() => setTheme('dark')}
            />
            <span class="ml-2">Dark</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="radio"
              class="form-radio"
              name="theme"
              value="system"
              checked={theme() === 'system'}
              onChange={() => setTheme('system')}
            />
            <span class="ml-2">System</span>
          </label>
          {/* Add more themes later?
           <label class="inline-flex items-center">
            <input
              type="radio"
              class="form-radio"
              name="theme"
              value="anotherTheme"
              checked={theme() === 'anotherTheme'}
              onChange={() => setTheme('anotherTheme')}
            />
            <span class="ml-2">Another Theme</span>
          </label>
          */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
