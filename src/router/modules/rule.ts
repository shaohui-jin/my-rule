export default {
  path: '/',
  name: 'main',
  redirect: '/func/edit',
  children: [
    {
      path: '/func/edit',
      name: 'functionEdit',
      component: () => import('@/views/func/edit.vue'),
      meta: {
        title: '函数JSDoc解析器'
      }
    },
    {
      path: '/rule/edit',
      name: 'ruleEdit',
      component: () => import('@/views/rule/edit.vue'),
      meta: {
        title: '规则编辑'
      }
    }
  ]
} as RouteConfigsTable
