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
	import('../../../src/main').then(({ gunAvatar, mountElement }) => {
		watch(props, p => {
			avatar.value = gunAvatar({ ...props })
		}, { immediate: true })
	})

})

</script>

<template lang="pug">
.flex.overflow-hidden
	img(:src="avatar")
// <gun-avatar :pub="pub" :size="200" />
</template>