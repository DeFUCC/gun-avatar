<script setup>
import DefaultTheme from 'vitepress/theme'
import { computed, ref } from 'vue';
import GunVueAvatar from './components/gun-vue-avatar.vue';
import AvatarPlayground from './components/avatar-playground.vue'
import { state } from './composables/state'
import { useFavicon } from '@vueuse/core';
import ExtractText from './components/extract-text.vue';
import { gunAvatar } from '../../src';
import { useShare } from '@vueuse/core';
import { onKeyStroke } from '@vueuse/core';

const { Layout } = DefaultTheme

const list = computed(() => [...state.history.history].reverse())

useFavicon(() => gunAvatar?.({ pub: state.pub, size: 256, dark: state.options.dark }))

const { share, isSupported: isShareSupported } = useShare()

const sharePNG = async () => {
	const avatarUrl = gunAvatar({
		pub: state.pub,
		size: 1024,
		dark: state.options.dark,
		embed: state.pair
	})

	try {
		const response = await fetch(avatarUrl)
		const blob = await response.blob()
		const file = new File([blob], `avatar-${state.pub.slice(0, 8)}.png`, { type: 'image/png' })
		await share({
			files: [file]
		})
	} catch (e) {
		console.warn('Share failed', e)
	}
}

const downloadPNG = async () => {
	const avatarUrl = gunAvatar({
		pub: state.pub,
		size: 300,
		dark: state.options.dark,
		embed: state.pair
	})

	try {
		const link = document.createElement('a')
		link.download = `avatar-${state.pub.slice(0, 8)}.png`
		link.href = avatarUrl
		link.target = '_blank'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	} catch (e) {
		// Fallback: Open in new window
		window.open(avatarUrl, '_blank')
	}
}

onKeyStroke('Enter', () => {
	state.generatePair()
})

</script>

<template lang="pug">
Layout.overflow-hidden
	template(#home-hero-before)
		img.absolute.top-0.bottom-0.left-0.right-0.bg-red.w-full.op-10(inert :key="state.pub" :src="gunAvatar({pub:state.pub, svg:false, size:1400,  draw:'squares', reflect: false, dark:state.options.dark, round: false,})" )
	template(#home-hero-image)
		.flex(@click="state.generatePair()")
			transition(name="fade")
				.flex.items-center.image-src(
					:key="state.pub"
					)
					gun-vue-avatar.rounded-full.absolute.transform.scale-200.filter.blur-40px.z-5.op-80.dark-op-30(
						:pub="state.pub"
						:size="300"
						:svg="true"
						)
					gun-vue-avatar.rounded-full.absolute.transform.scale-110.filter.blur-30px.z-10.dark-op-70(
						:pub="state.pub"
						:size="300"
						:svg="true"
						)
					gun-vue-avatar.rounded-full.cursor-pointer.z-20.shadow-2xl(
						:pub="state.pub"
						:size="300"
						:embed="state.pair"
						:svg="false"
						)
	
	template(#home-features-after)
		.my-16.w-full.min-h-100vh.bg-cover.bg-fixed.flex.items-center.justify-center.flex-wrap.relative(
			style="transition: all ease 1s;"
			)
			//- :style="{backgroundImage:`url(${gunAvatar({pub:state.pub, size: 1400, draw:'squares', reflect: false, dark:state.options.dark, round: false})})`}"
			transition(name="fade")
				object.absolute.top-0.left-0.right-0.bottom-0.z-1.h-full.w-full(
						:key="state.pub"
						type="image/svg+xml"
						:data="gunAvatar({pub:state.pub, svg:'interactive', size:1200,  draw:'squares', reflect: false, dark:state.options.dark, round: false})")
			.h-80.w-80.min-h-70.z-4
				transition(name="fade" mode="out-in")
					object.shadow-2xl.rounded-full.z-2.w-full(
						:key="state.pub"
						type="image/svg+xml"
						:data="gunAvatar({pub:state.pub, svg:'interactive', size: 1000, dark:state.options.dark})")
			.card.z-2.flex.flex-col.items-center.gap-2.px-2.py-8.rounded-40px.bg-light-100.max-w-120.m-8.bg-opacity-50.backdrop-filter.backdrop-blur-2xl.dark-bg-dark-100.dark-bg-opacity-50.shadow-lg
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
					.button(
						@click="downloadPNG()"
						)
						.i-la-download
					.button(
						v-if="isShareSupported"
						@click="sharePNG()"
						)
						.i-la-share-alt
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
			.button.mb-4.flex.items-center.gap-2.select-none(style="flex: 100 0 100%" @click="state.generatePair()")
				.i-la-plus
				.text-lg Generate more
		ExtractText
</template>

<style scoped lang="postcss">
.button {
	@apply text-2xl rounded-full border border-dark-100 w-12 h-12 flex items-center justify-center opacity-60 hover-opacity-100 transition cursor-pointer dark-border-light-100 select-none;
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