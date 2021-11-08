import preprocess from 'svelte-preprocess';
import netlify from '@sveltejs/adapter-netlify';
const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: netlify(),
		vite: {
			ssr: {
				noExternal: dev ? [] : ['@supabase/supabase-js']
			}
		}
	}
};

export default config;
