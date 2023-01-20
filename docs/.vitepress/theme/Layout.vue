<script setup>
import DefaultTheme from 'vitepress/theme'
import gunAvatar from '../components/gun-avatar.vue';
import HeaderLinks from '../components/header-links.vue'
import { useState } from '../composables/state'

const { Layout } = DefaultTheme

const state = useState()

</script>

<template lang="pug">
Layout
	template(#home-hero-image)
		client-only
			gun-avatar.image-src.rounded-full.cursor-pointer.m-auto(
				:pub="state.pub"
				:size="300"
				@click="state.generatePair()"
				)
	template(#nav-bar-content-before)
		header-links
</template>