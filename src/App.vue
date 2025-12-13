<template>
  <div class="h-full flex flex-col min-h-screen">
    <!-- 导航栏 -->
    <nav
      class="bg-gradient-to-r from-theme-dark to-theme-medium text-white shadow-md h-12 flex-shrink-0"
    >
      <div class="container mx-auto px-3 h-full">
        <div class="flex items-center justify-between h-full">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <i class="fas fa-code text-lg sm:text-xl text-theme-lightest"></i>
            <h1 class="text-base sm:text-xl font-bold">{{ title }}</h1>
          </div>
          <div>
            <h1 class="text-base sm:text-xl font-bold">
              <router-link :to="{ name: 'functionEdit' }" class="font-bold text-theme-lightest">
                函数编辑
              </router-link>
              <router-link :to="{ name: 'ruleEdit' }" class="font-bold text-theme-lightest">
                规则编辑
              </router-link>
            </h1>
          </div>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
const route = useRoute()
const title = computed(() => {
  return route.meta.title
})
</script>
