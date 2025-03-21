import { createSignal } from 'solid-js';

export default function Page() {
  const [name, setName] = createSignal('');

  return <div class="flex flex-col items-center gap-y-5">App Page</div>;
}
