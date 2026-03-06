export default {
  path: '/',
  name: 'main',
  redirect: '/rule',
  children: [
    {
      path: '/func',
      name: 'functionEdit',
      component: () => import('@/views/func.vue'),
      meta: {
        title: '函数JSDoc解析器'
      }
    },
    {
      path: '/rule',
      name: 'ruleEdit',
      component: () => import('@/views/rule.vue'),
      meta: {
        title: '规则编辑'
      }
    }
  ]
} as RouteConfigsTable
