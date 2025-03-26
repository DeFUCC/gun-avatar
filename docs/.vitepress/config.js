import { defineConfig } from "vitepress";
import Unocss from 'unocss/vite'
import { presetUno, presetIcons, transformerDirectives, extractorSplit } from "unocss";
import extractorPug from '@unocss/extractor-pug'


export default defineConfig({
	title: 'Gun-avatar',
	titleTemplate: "Gun-avatar public key visualizer",
	outDir: "../dist/",
	lang: 'en-US',
	themeConfig: {
		logo: '/avatar.png',
		siteTitle: 'Gun-avatar',
		repo: "https://github.com/defucc/gun-avatar",
		nav: [

		],
		footer: {
			message: 'MIT License',
			copyright: 'Copyright © 2020-PRESENT Davay42',
		},

	},
	head: [
		['meta', { name: 'theme-color', content: '#ffffff' }],
		['meta', { name: 'author', content: 'Davay42' }],
		['meta', { property: 'og:title', content: 'Gun-Avatar' }],
		['meta', { property: 'og:image', content: 'https://gun-avatar.js.org/screenshot.png' }],
		['meta', { property: 'og:description', content: 'Public key human recognizable visual hash' }],
		['meta', { name: 'twitter:card', content: 'summary_large_image' }],
		['meta', { name: 'twitter:creator', content: '@davay42' }],
		['meta', { name: 'twitter:image', content: 'https://gun-avatar.js.org/screenshot.jpg' }],
	],
	vue: {
		template: {
			compilerOptions: {
				isCustomElement: tag => tag == 'gun-avatar'
			}
		}
	},
	vite: {
		plugins: [
			Unocss({
				presets: [
					presetIcons({
						extraProperties: {
							'display': 'inline-block',
							'vertical-align': 'middle',
						},
					}),
					presetUno()
				],
				transformers: [
					transformerDirectives(),
				],
				extractors: [
					extractorPug(),
					extractorSplit,
				],
			}),
		]
	}
})