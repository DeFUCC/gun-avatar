<script setup>
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue';
import GunVueAvatar from '../components/gun-vue-avatar.vue';
import HeaderLinks from '../components/header-links.vue'
import AvatarPlayground from '../components/avatar-playground.vue'
import ShowKey from '../components/show-key.vue'
import { useState } from '../composables/state'

const { Layout } = DefaultTheme

const state = useState()

const list = computed(() => [...state.history.history].reverse())



</script>

<template lang="pug">
Layout
	template(#home-hero-image)
		client-only
			.flex(@click="state.generatePair()")
				transition(name="fade")
					.flex.items-center.image-src(
						:key="state.pub"
						)
						gun-vue-avatar.rounded-full.glow.z-10(
							:pub="state.pub"
							:size="300"
							)
						gun-vue-avatar.rounded-full.cursor-pointer.z-20(
							:pub="state.pub"
							:size="300"
							)

	template(#nav-bar-content-before)
		header-links
	template(#home-hero-after)
		show-key
		.flex.flex-wrap.items-center.px-12.justify-start.max-w-1200px.m-auto.flex-column-reverse.gap-2.pb-12.flex-wrap-reverse
			transition-group(name="fade")
				.flex(
					v-for="rec in list"
					:key="rec"
					)
					gun-vue-avatar.rounded-full.cursor-pointer(
						:pub="rec.snapshot.pub"
						:size="50"
						@click="state.setPair(rec.snapshot)"
						) {{ rec.snapshot.pub }}
	template(#home-features-after)
		avatar-playground
</template>

<style scoped lang="postcss">
.glow {
	@apply absolute transform scale-110 filter blur-2xl z-10;
}
</style>