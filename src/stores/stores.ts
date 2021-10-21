import { writable } from 'svelte/store';
//This is the global value to shift classes for page transitions.
export const transition = writable(false);
