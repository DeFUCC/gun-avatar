<script setup>
import DefaultTheme from 'vitepress/theme'
import { state } from '../composables/state'

const { Layout } = DefaultTheme


</script>

<template lang="pug">
Layout
	template(#home-hero-image)
		gun-avatar.image-src.rounded-full.cursor-pointer.m-auto(
			:pub="state.pub"
			:size="300"
			@click="state.generatePair()"
			)
	template(#nav-bar-content-before)
		header-links
</template>