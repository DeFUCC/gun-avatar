<script setup>
import { extractFromFile } from '../../../src';
import { ref, nextTick, computed } from 'vue';

const message = ref(null)
const dropArea = ref(null)
const imageElement = ref(null)
const showingResults = ref(false)
const currentObjectUrl = ref(null)

const result = computed(() => { try { return JSON.stringify(message.value) } catch (e) { return null } })

async function handleDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (file?.type === 'image/png') {
    await processFile(file)
  }
}

async function handleFileInput(e) {
  const file = e.target.files[0]
  if (file) await processFile(file)
}

async function processFile(file) {
  try {
    message.value = await extractFromFile(file)
    showingResults.value = true
    await nextTick()
    if (currentObjectUrl.value) {
      URL.revokeObjectURL(currentObjectUrl.value)
    }
    currentObjectUrl.value = URL.createObjectURL(file)
    imageElement.value.src = currentObjectUrl.value
  } catch (err) {
    console.error('Error processing file:', err)
    reset()
  }
}

function reset() {
  showingResults.value = false
  message.value = null
  if (currentObjectUrl.value) {
    URL.revokeObjectURL(currentObjectUrl.value)
    currentObjectUrl.value = null
  }
}
</script>

<template lang='pug'>
.relative.h-40.w-full.break-all
  .transition-all.duration-300.inset-0
    //- Upload UI
    .flex.flex-col.items-center.justify-center.gap-4.h-full.border-2.border-dashed.rounded-lg.transition-colors.cursor-pointer.hover-border-primary.dark-border-gray-700.dark-hover-border-primary(
      v-if="!showingResults"
      ref="dropArea"
      @dragover.prevent="dropArea.classList.add('border-primary')"
      @dragleave.prevent="dropArea.classList.remove('border-primary')"
      @drop="handleDrop"
    )
      .text-gray-500.dark-text-gray-400 Drop your PNG here
      .text-sm.text-gray-400.dark-text-gray-500 or
      label.px-4.py-2.text-sm.rounded-md.cursor-pointer.bg-gray-100.hover-bg-gray-200.dark-bg-gray-800.dark-hover-bg-gray-700
        input.hidden(type="file" accept="image/png" @change="handleFileInput")
        span Choose file

    //- Results UI
    .flex.flex-col.gap-4.p-4.h-full.bg-gray-50.dark-bg-gray-900.rounded-lg(
      v-else
    )
      .flex.items-center.justify-between
        .flex.items-center.gap-3
          img.w-15.h-15.rounded(ref="imageElement")
          .result.p-4.w-full.flex-1.rounded.bg-white-50.dark-bg-gray-800-50(tabindex="0") {{result}}
        button.p-2.hover-bg-gray-200.dark-hover-bg-gray-700.rounded-full(@click="reset")
          span.i-la-times.text-xl
</template>

<style>
.result {
  word-wrap: break-word;
  -webkit-user-select: all;
  user-select: all;
}

.result:focus {
  animation: select 100ms step-end forwards;
}

@keyframes select {
  to {
    -webkit-user-select: text;
    user-select: text;
  }
}
</style>