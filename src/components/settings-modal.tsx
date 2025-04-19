import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useThemeContext } from '@/contexts/theme';
import { useVimModeContext } from '@/contexts/vim-mode'; // Import the Vim mode context hook
import { DialogRootProps } from '@kobalte/core/dialog';
import { VoidProps } from 'solid-js';

type SettingsModalProps = {} & DialogRootProps;

export default function SettingsModal(props: VoidProps<SettingsModalProps>) {
  const { theme, setTheme } = useThemeContext();
  // Get Vim mode state and toggle function from the context
  const { vimModeEnabled, toggleVimMode } = useVimModeContext();

  return (
    <Dialog {...props}>
      <DialogContent class="space-y-4 p-4">
        {' '}
        {/* Added space-y-4 for spacing between sections */}
        {/* Theme Section */}
        <div>
          <h2 class="mb-2 text-lg font-semibold">Theme</h2>
          <div class="flex items-center space-x-4">
            <label class="inline-flex cursor-pointer items-center">
              {' '}
              {/* Added cursor-pointer */}
              <input
                type="radio"
                class="form-radio" // Assuming you have Tailwind Forms plugin or similar styles
                name="theme"
                value="light"
                checked={theme() === 'light'}
                onChange={() => setTheme('light')}
              />
              <span class="ml-2">Light</span>
            </label>
            <label class="inline-flex cursor-pointer items-center">
              {' '}
              {/* Added cursor-pointer */}
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
            <label class="inline-flex cursor-pointer items-center">
              {' '}
              {/* Added cursor-pointer */}
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
          </div>
        </div>
        {/* Editor Settings Section */}
        <div>
          <h2 class="mb-2 text-lg font-semibold">Editor</h2>
          <div class="flex items-center">
            <label class="inline-flex cursor-pointer items-center">
              {' '}
              {/* Added cursor-pointer */}
              <input
                type="checkbox"
                class="form-checkbox text-primary focus:ring-primary h-5 w-5 rounded" // Added basic checkbox styling
                checked={vimModeEnabled()}
                onChange={toggleVimMode} // Call toggleVimMode on change
              />
              <span class="ml-2">Enable Vim Keybindings</span>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
