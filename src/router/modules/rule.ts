export default {
  path: '/',
  name: 'RuleCenter',
  redirect: '/func/edit',
  component: () => import('@/layout/index.vue'),
  meta: {
    title: '规则模块',
    rank: 1,
  },
  children: [
    {
      path: '/rule/list',
      name: 'ruleList',
      component: () => import('@/views/rule/RuleList.vue'),
      meta: {
        title: '规则列表'
      }
    },
    {
      path: '/rule/edit',
      name: 'ruleEdit',
      component: () => import('@/views/rule/RuleEdit.vue'),
      meta: {
        title: '规则编辑',
      }
    },
    {
      path: '/func/list',
      name: 'function',
      component: () => import('@/views/rule/FunctionList.vue'),
      meta: {
        roles: '函数列表'
      }
    },
    {
      path: '/func/edit',
      name: 'functionEdit',
      component: () => import('@/views/rule/FuncEdit.vue'),
      meta: {
        title: '函数编辑',
      }
    },
    {
      path: '/func/edit-lua',
      name: 'functionEditLua',
      component: () => import('@/views/rule/FuncEdit-lua.vue'),
      meta: {
        title: '函数编辑',
      }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/rule/TestList.vue'),
      meta: {
        title: '规则测试',
      }
    }
  ]
} as RouteConfigsTable
