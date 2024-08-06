// uno.config.ts
import extractorSvelte from '@unocss/extractor-svelte';
import { defineConfig, presetIcons, presetWebFonts } from 'unocss';

export default defineConfig({
	extractors: [extractorSvelte],
	presets: [
		presetWebFonts({
			provider: 'bunny',
			fonts: {
				sans: 'Inter:400,500,600,700,800,900'
			}
		}),
		presetIcons({
			extraProperties: {
				color: 'auto',
				display: 'inline-block',
				'vertical-align': 'middle'
			}
		})
	]
});
