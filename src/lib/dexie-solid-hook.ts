import { liveQuery } from 'dexie';
import { Accessor, createEffect, on, onCleanup } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

interface LiveQueryResult<T> {
  data: T | undefined;
  error?: Error;
}

/**
 * Lorem ipsum dolor sit amet, consectetur adipiscing elit.
 *
 * @param querier
 * @param deps
 * @returns
 */
export function useLiveQuery<T>(
  querier: () => T | Promise<T>,
  deps: Accessor<any> | Array<Accessor<any>> = []
): LiveQueryResult<T> {
  // @ts-ignore
  const [store, setStore] = createStore<LiveQueryResult<T>>({});

  createEffect(
    // @ts-ignore
    on(deps, () => {
      const observable = liveQuery(querier);

      const subscription = observable.subscribe((value) => {
        setStore(
          reconcile({
            data: value,
          })
        );
      });

      onCleanup(() => {
        subscription.unsubscribe();
      });
    })
  );

  return store as LiveQueryResult<T>;
}
