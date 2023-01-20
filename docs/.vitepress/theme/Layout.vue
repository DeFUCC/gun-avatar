<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template lang="pug">
Layout
	template(#home-hero-image)
		avatar-view
	template(#nav-bar-content-before)
		header-links
</template>