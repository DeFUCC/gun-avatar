<script setup>
import DefaultTheme from 'vitepress/theme'
import { computed } from 'vue';
import GunVueAvatar from '../components/gun-vue-avatar.vue';
import AvatarPlayground from '../components/avatar-playground.vue'
import { state } from '../composables/state'
import { useFavicon } from '@vueuse/core';

const { Layout } = DefaultTheme


const list = computed(() => [...state.history.history].reverse())

useFavicon(() => state?.gunAvatar?.({ pub: state.pub, size: 256, dark: state.options.dark }))


</script>

<template lang="pug">
Layout
	template(#home-hero-image)
		.flex(@click="state.generatePair()")
			transition(name="fade")
				.flex.items-center.image-src(
					:key="state.pub"
					)
					gun-vue-avatar.absolute.transform.scale-700.filter.blur-1000px.z-5.op-5(
						:pub="state.pub"
						:size="300"
						)
					gun-vue-avatar.absolute.transform.scale-130.filter.blur-200px.z-10.op-70(
						:pub="state.pub"
						:size="300"
						)
					gun-vue-avatar.cursor-pointer.z-20(
						:pub="state.pub"
						:size="300"
						)
	template(#nav-bar-content-before)
		.flex.items-center.text-4xl.gap-4
			a(href="https://codepen.io/Davay/pen/eYGeGMZ" title="Codepen playground" target="_blank")
				.i-la-codepen
			a(href="https://www.npmjs.com/package/gun-avatar" title="NPM package" target="_blank")
				.i-la-npm
			a(href="https://github.com/DeFUCC/gun-avatar" title="GitHub repository" target="_blank")
				.i-la-github
			.w-2px.rounded.h-8.bg-dark-100.opacity-40
			button(@click="state.options.dark = !state.options.dark")
				transition(name="fade" mode="out-in")
					.i-la-moon(v-if="state.options.dark")
					.i-la-sun(v-else)

	template(#home-features-after)
		.my-16.w-full.min-h-100vh.bg-cover.bg-fixed.flex.items-center.justify-center.flex-wrap(
			style="transition: all ease 1s;"
			:style="{backgroundImage:`url(${state?.gunAvatar?.({pub:state.pub, size: 1400, draw:'squares', reflect: false, dark:state.options.dark, round: false})})`}"
			)
			transition(name="fade" mode="out-in")
				gun-vue-avatar.rounded-full.shadow-xl.cursor-pointer(
					@click="state.generatePair()"
					:size="300"
					:pub="state.pub")
			.card.flex.flex-col.items-center.gap-2.px-2.py-8.rounded-40px.bg-light-100.max-w-120.m-8.bg-opacity-50.backdrop-filter.backdrop-blur-2xl.dark-bg-dark-100.dark-bg-opacity-50.shadow-lg
				.flex.flex-col.items-center.gap-8
					.text-center.font-mono.break-all(
						style="font-size: 14px;"
						)
						span.inline-block {{ state.pub.split('.')[0] }}
						span.inline-block .
						span.inline-block {{ state.pub.split('.')[1] }}
					.p-2.flex.flex-wrap.gap-0.justify-stretch.w-full.gap-1px.max-w-120
						.h-8.flex.w-full.gap-1px(
							:class="{'items-end': a == 0}"
							v-for="(arr,a) in state.parsed.decoded" :key="a")
							.p-0.dark-bg-light-900.flex-1.bg-dark-100.rounded(
								style="transition: all 0.4s ease"
								:style="{height:num*100+'%', backgroundColor: state.parsed.colors[a]}"
								v-for="(num,n) in arr" :key="n")
				.flex.items-center.justify-center.gap-2.flex-wrap
					.button(
						:class="{'disabled':!state.history.canUndo}"
						@click="state.history.undo()")
						.i-la-undo
					.button.opacity-20(
						:class="{'disabled':!state.history.canRedo}"
						@click="state.history.redo()")
						.i-la-redo
					.button(@click="state.generatePair()")
						.i-la-plus
					.button(
						@click="state.loop?.isActive ? state?.loop?.pause() : state.loop.resume()"
						)
						.i-la-play(v-if="!state.loop?.isActive")
						.i-la-pause(v-else)
					.button(
						:style="{transform:`scale(${state.clip.copied ? 1.2 : 1})`}"
						@click="state.clip.copy()"
						)
						.i-la-clipboard
		.flex.flex-wrap.items-center.px-12.justify-start.max-w-1200px.m-auto.flex-column-reverse.gap-2.pb-12.flex-wrap-reverse.mt-16
			transition-group(name="fade")
				.flex(
					v-for="rec in list"
					:key="rec"
					@click="state.clip.copy()")
					gun-vue-avatar.rounded-full.cursor-pointer.shadow-lg(
						:pub="rec.snapshot.pub"
						:size="60"
						:class="{'outline':rec.snapshot == state.pair}"
						@click="state.setPair(rec.snapshot)"
						) {{ rec.snapshot.pub }}
</template>

<style scoped lang="postcss">
.button {
	@apply text-2xl rounded-full border border-dark-100 w-12 h-12 flex items-center justify-center opacity-60 hover-opacity-100 transition cursor-pointer dark-border-light-100;
}

.button.disabled {
	@apply opacity-20 cursor-normal pointer-events-none;
}
</style>

<style>
.VPHome {
	padding-bottom: 0 !important;
}
</style>