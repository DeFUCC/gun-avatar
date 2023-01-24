<script setup>
import GunVueAvatar from './gun-vue-avatar.vue';
import { useState } from '../composables/state'
const state = useState()
</script>

<template lang='pug'>
.p-12.max-w-1200px.m-auto 
	h1.text-4xl.font-bold Playground
	.flex.w-full.gap-2.mt-8
		.p-8.h-60.w-60
			transition(name="fade" mode="out-in")
				.m-auto(:key="state.pub")
					gun-vue-avatar.cursor-pointer(
						:style="{borderRadius: (state.options.round ? 100000 : 0) + 'px'}"
						:pub="state.pub"
						v-bind="state.options"
						@click="state.generatePair()"
						)
		.p-2.flex.flex-col.gap-2.w-80
			select.p-2(v-model="state.options.draw")
				option(value="circles") Circles
				option(value="squares") Squares
				.text-lg Draw
			label.flex.gap-2
				input(type="checkbox" v-model="state.options.dark")
				.text-lg Dark
			label.flex.gap-2
				input(type="checkbox" v-model="state.options.reflect")
				.text-lg Reflect
			label.flex.gap-2
				input(type="checkbox" v-model="state.options.round")
				.text-lg Round
</template>