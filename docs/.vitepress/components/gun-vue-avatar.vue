<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useState } from '../composables/state';
import { gunAvatar } from '../../../src';

const state = useState()

const props = defineProps({
	pub: { type: String, default: '' },
	size: { type: Number, default: 100 },
	dark: { type: Boolean, default: false },
	draw: { type: String, default: 'circles' },
	reflect: { type: Boolean, default: true },
	round: { type: Boolean, default: true },
	embed: { type: [Boolean, Object, String], default: true },
})

</script>

<template>
	<div class="flex overflow-hidden"><img :src="gunAvatar(props)"></div>
</template>