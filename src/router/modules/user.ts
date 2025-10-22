import { $t } from '@/plugins/i18n'
const Layout = () => import('@/layout/index.vue')
import RuleEdit from '@/views/rule/RuleEdit.vue'
import FuncEdit from '@/views/rule/FuncEdit.vue'

export default {
  path: '/user',
  name: 'UserinfoCenter',
  component: Layout,
  redirect: '/rule',
  meta: {
    icon: 'adminCenter',
    title: $t('menus.userinfoCenter'),
    rank: 1,
    roles: ['BACKEND_Users']
  },
  children: [
    {
      path: '/rule',
      name: 'rule',
      component: () => import('@/views/rule/RuleList.vue'),
      meta: {
        icon: 'ruleIcon',
        title: $t('menus.rule'),
        roles: ['BACKEND_Perms_Org']
      }
    },
    {
      path: '/ruleEdit',
      name: 'ruleEdit',
      component: RuleEdit,
      meta: {
        icon: 'ruleIcon',
        title: $t('menus.ruleEdit'),
        roles: ['BACKEND_Perms_Org'],
        dynamicLevel: 10
        // hideTag: true
      }
    },
    {
      path: '/function',
      name: 'function',
      component: () => import('@/views/rule/FunctionList.vue'),
      meta: {
        icon: 'functionIcon',
        title: $t('menus.functionManage'),
        roles: ['BACKEND_Perms_Org']
      }
    },
    {
      path: '/functionEdit',
      name: 'functionEdit',
      component: FuncEdit,
      meta: {
        icon: 'functionIcon',
        title: $t('menus.functionEdit'),
        roles: ['BACKEND_Perms_Org'],
        // hideTag: true
      }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/rule/TestList.vue'),
      meta: {
        icon: 'testIcon',
        title: $t('menus.test'),
        roles: ['BACKEND_Perms_Org']
      }
    },
    {
      path: '/classDirectory',
      name: 'classDirectory',
      component: () => import('@/views/rule/ClassDirectory.vue'),
      meta: {
        icon: 'testIcon',
        title: $t('menus.classDirectory'),
        roles: ['BACKEND_Perms_Org']
      }
    }
  ]
} as RouteConfigsTable
