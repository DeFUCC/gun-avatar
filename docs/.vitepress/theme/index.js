import DefaultTheme from 'vitepress/theme'
import MyLayout from './Layout.vue'

import "@unocss/reset/tailwind.css";
import "uno.css";

export default {
	...DefaultTheme,
	Layout: MyLayout,
	enhanceApp({ app }) {

	}
}