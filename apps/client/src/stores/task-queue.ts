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

async function queueTask<T>(
	queue: TTaskQueueContext,
	title: string,
	promise: () => Promise<T>
): Promise<T> {
	const _promise = promise().finally(() =>
		queue.items.update((items) => items.filter((i) => i.promise !== _promise))
	);
	queue.items.update((items) => {
		items.push({
			title,
			promise: _promise
		});
		return items;
	});
	return await promise();
}

export { initTaskQueueContext, queueTask, useTaskQueue };
