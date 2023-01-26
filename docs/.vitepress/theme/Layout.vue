<script setup>
import DefaultTheme from 'vitepress/theme'
import { computed, onMounted } from 'vue';
import GunVueAvatar from '../components/gun-vue-avatar.vue';
import HeaderLinks from '../components/header-links.vue'
import AvatarPlayground from '../components/avatar-playground.vue'
import ShowKey from '../components/show-key.vue'
import { useState } from '../composables/state'

const { Layout } = DefaultTheme

const state = useState()

const list = computed(() => [...state.history.history].reverse())

onMounted(() => {
	import('../../../src/index').then(({ gunAvatar, mountElement }) => {
		state.gunAvatar = gunAvatar
	})

})

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
		transition(name="fade" mode="out-in")
			.w-full.h-70vh.bg-cover.bg-fixed.flex.items-center.justify-center(
				:style="{backgroundImage:`url(${state?.gunAvatar?.({pub:state.pub, size: 1400, draw:'squares', reflect: false})})`}"
				:key="state.pub"
				)
				.flex.flex-col.items-center
					gun-vue-avatar.rounded-full.shadow-xl(
						:pub="state.pub"
						:size="200"
					)
					show-key
		.flex.flex-wrap.items-center.px-12.justify-start.max-w-1200px.m-auto.flex-column-reverse.gap-2.pb-12.flex-wrap-reverse
			transition-group(name="fade")
				.button(
					key="play"
					style="order:1000000"
					@click="state.loop.isActive ? state.loop.pause() : state.loop.resume()"
					)
					.i-la-play(v-if="!state.loop.isActive")
					.i-la-pause(v-else)
				.button(
					key="add"
					style="order:1000000"
					@click="state.generatePair()"
					)
					.i-la-plus
				.flex(
					v-for="rec in list"
					:key="rec"
					@click="state.clip.copy()"
					)
					gun-vue-avatar.rounded-full.cursor-pointer(
						:pub="rec.snapshot.pub"
						:size="60"
						:class="{'outline':rec.snapshot == state.pair}"
						@click="state.setPair(rec.snapshot); state.loop.pause()"
						) {{ rec.snapshot.pub }}
	template(#home-features-after)
		avatar-playground
</template>

<style scoped lang="postcss">
.glow {
	@apply absolute transform scale-110 filter blur-2xl z-10;
}

.button {
	@apply text-2xl rounded-full border w-12 h-12 flex items-center justify-center opacity-60 hover-opacity-100 transition cursor-pointer;
}
</style>