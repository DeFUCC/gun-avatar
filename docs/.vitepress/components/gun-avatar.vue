<script  setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
	pub: { type: String, default: '' },
	size: { type: Number, default: 100 },
	dark: { type: Boolean, default: false },
	draw: { type: String, default: 'circles' },
	reflect: { type: Boolean, default: true },
	round: { type: Boolean, default: true }
})

const avatar = ref('')

onMounted(() => {
	import('../../../src/main').then(d => {
		watch(props, p => {
			avatar.value = d.gunAvatar({ ...props })
		}, { immediate: true })
	})

})

</script>

<template>
	<img :src="avatar" />
</template>