<script  setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useState } from '../composables/state';

const state = useState()

const props = defineProps({
	pub: { type: String, default: '' },
	size: { type: Number, default: 100 },
	dark: { type: Boolean, default: false },
	draw: { type: String, default: 'circles' },
	reflect: { type: Boolean, default: true },
	round: { type: Boolean, default: true }
})

const avatar = computed(() => state?.gunAvatar?.({ ...props }))


</script>

<template lang="pug">
.flex.overflow-hidden
	img(:src="avatar")
</template>