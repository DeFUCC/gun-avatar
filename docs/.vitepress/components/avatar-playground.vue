<script setup>
import GunVueAvatar from './gun-vue-avatar.vue';
import { useState } from '../composables/state'
const state = useState()
</script>

<template lang='pug'>
.p-12.max-w-1200px.m-auto 
	h1.text-2xl.font-bold Playground
	.flex.w-full.justify-between.gap-2.mt-8
		.p-2.flex.flex-col.gap-2
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
		.p-2
			gun-vue-avatar.rounded-full(
				:pub="state.pub"
				v-bind="state.options"
			)
</template>