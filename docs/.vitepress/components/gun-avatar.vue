<script setup>
import { gunAvatar } from '../../../src/main'
import { useCssVar } from '@vueuse/core'
import { computed } from 'vue';

const props = defineProps({
	pub: { type: String, default: '' },
	size: { type: Number, default: 100 },
	dark: { type: Boolean, default: false },
	draw: { type: String, default: 'circles' },
	reflect: { type: Boolean, default: true },
	round: { type: Boolean, default: true }
})

const avatar = computed(() => gunAvatar({ ...props }))

</script>

<template>
	<img :src="avatar" />
</template>