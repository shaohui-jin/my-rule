import { $t } from '@/plugins/i18n'
const Layout = () => import('@/layout/index.vue')

export default {
  path: '/setting',
  name: 'SettingCenter',
  component: Layout,
  redirect: '/cluster',
  meta: {
    icon: 'settingIcon',
    title: $t('menus.setting'),
    rank: 3,
    roles: ['BACKEND_Perms_Sys']
  },
  children: []
} as RouteConfigsTable
