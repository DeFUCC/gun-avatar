<script setup>
import { state } from '../composables/state';
</script>

<template lang='pug'>
transition(name="fade" mode="out-in")
	.p-8.text-center.font-mono.break-all(:key="state.pub")
		span.inline-block {{ state.pub.split('.')[0] }}.
		span.inline-block {{ state.pub.split('.')[1] }}
</template>

