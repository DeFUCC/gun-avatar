import { defineConfig } from "vitepress";

export default defineConfig({
	title: 'Gun-avatar',
	titleTemplate: "Gun-avatar public key visualizer",
	outDir: "../public/docs/",
	lang: 'en-US',
	lastUpdated: true,
	themeConfig: {
		repo: "https://github.com/defucc/gun-avatar",
	}
})