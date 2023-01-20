<script setup>
import { state } from '../composables/state.js'
</script>

<template lang='pug'>
.p-8(@click="state.generatePair()") {{ state.pair }}
</template>