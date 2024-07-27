import { writable, type Writable } from '@square/svelte-store';
import { getContext, setContext } from 'svelte';

type TQueueItem = {
	title: string;
	icon?: string;
	promise: Promise<unknown>;
};
type TTaskQueueContext = {
	items: Writable<TQueueItem[]>;
};

function useTaskQueue() {
	const value = getContext<TTaskQueueContext>('task-queue-context');
	if (!value) throw new Error('Task queue context not found');
	return value;
}

function initTaskQueueContext() {
	const items = writable([]);
	return setContext<TTaskQueueContext>('task-queue-context', { items });
}

function queueTask<T>(
	queue: TTaskQueueContext,
	title: string,
	makePromise: () => Promise<T>
): Promise<T> {
	const promise = makePromise().finally(() =>
		queue.items.update((items) => items.filter((i) => i.promise !== promise))
	);
	queue.items.update((items) => {
		items.push({
			title,
			promise: promise
		});
		return items;
	});
	return promise;
}

export { initTaskQueueContext, queueTask, useTaskQueue };
