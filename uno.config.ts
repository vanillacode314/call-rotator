// uno.config.ts
import { defineConfig, presetIcons } from 'unocss';
import extractorSvelte from '@unocss/extractor-svelte';

export default defineConfig({
	extractors: [extractorSvelte],
	presets: [
		// presetWebFonts({
		//   extendTheme: true,
		//   fonts: {
		//     sans: "Inter:400,500,600,700,800,900",
		//   },
		// }),
		presetIcons({
			extraProperties: {
				color: 'auto',
				display: 'inline-block',
				'vertical-align': 'middle'
			}
		})
	]
});
