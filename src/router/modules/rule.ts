export default {
  path: '/',
  name: 'main',
  component: () => import('@/App.vue'),
  meta: {
    title: '规则模块',
    rank: 1,
  },
  children: [
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
        title: '规则编辑',
      }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/test/index.vue'),
      meta: {
        title: '规则测试',
      }
    }
  ]
} as RouteConfigsTable
