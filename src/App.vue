<template>
  <component :is="useComp" />
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const useComp = ref()

const routeMap = ref({
  'func-list': {
    component: defineAsyncComponent(() => import('@/views/func/list.vue')),
    props: {
      operationMode: 'ADD'
    }
  },
  '/': {
    component: defineAsyncComponent(() => import('@/views/func/edit.vue')),
    props: {
      operationMode: 'ADD'
    }
  },
  '/func-edit-lua': {
    component: defineAsyncComponent(() => import('@/views/func/edit-lua.vue')),
    props: {
      operationMode: 'ADD'
    }
  },
})

watch(
  route,
  (value) => {
    useComp.value = routeMap.value[value.path].component
  },
  { immediate: true, deep: true }
)
</script>
