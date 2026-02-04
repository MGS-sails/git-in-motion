<script setup lang="ts">
defineProps<{ text: string }>();
</script>

<template>
  <div class="explain">
    <div class="title">What just happened</div>
    <div class="text">{{ text }}</div>
  </div>
</template>

<style scoped>
.explain { border: 1px solid #222; border-radius: 14px; padding: 12px; }
.title { font-weight: 700; opacity: 0.9; margin-bottom: 8px; }
.text { font-size: 14px; line-height: 1.4; opacity: 0.9; }
</style>
