<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch } from 'vue'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange'
import { useNav } from './layout/hooks/useNav'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'app',
  components: {
    [ElConfigProvider.name]: ElConfigProvider
  },
  setup() {
    const { $storage } = useNav()
    const { locale } = useI18n()
    const route = useRoute()
    const { dataThemeChange } = useDataThemeChange()
    dataThemeChange()

    watch(route, v => {
      if (window.__WUJIE) {
        // @ts-ignore
        window.$wujie?.bus.$emit('sub-route-change', 'rule', v.path)
      }
    })

    onMounted(() => {
      if (window.__WUJIE) {
        // @ts-ignore
        window?.$wujie.bus.$on('translation', lang => {
          if (lang === 'en') {
            $storage.locale = { locale: 'en' }
            locale.value = 'en'
          } else {
            $storage.locale = { locale: 'zh' }
            locale.value = 'zh'
          }
        })
      }
    })
  },
  computed: {
    currentLocale() {
      return this.$storage.locale?.locale === 'zh' ? zhCn : en
    }
  }
})
</script>
