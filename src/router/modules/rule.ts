export default {
  path: '/',
  name: 'main',
  redirect: '/func/edit',
  children: [
    {
      path: '/func/list',
      name: 'function',
      component: () => import('@/views/func/list.vue'),
      meta: {
        roles: '函数列表'
      }
    },
    {
      path: '/func/edit',
      name: 'functionEdit',
      component: () => import('@/views/func/edit.vue'),
      meta: {
        title: '函数JSDoc解析器'
      }
    },
    {
      path: '/rule/list',
      name: 'ruleList',
      component: () => import('@/views/rule/list.vue'),
      meta: {
        title: '规则列表'
      }
    },
    {
      path: '/rule/edit',
      name: 'ruleEdit',
      component: () => import('@/views/rule/edit.vue'),
      meta: {
        title: '规则编辑'
      }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/test/index.vue'),
      meta: {
        title: '规则测试'
      }
    }
  ]
} as RouteConfigsTable
