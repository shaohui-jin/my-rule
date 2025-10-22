import { addIcon } from '@iconify/vue/dist/offline'

/**
 * 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
 */

// 本地菜单图标，后端在路由的icon中返回对应的图标字符串并且前端在此处使用addIcon添加即可渲染菜单图标
import HomeFilled from '@iconify-icons/ri/home-2-line'
import InformationLine from '@iconify-icons/ri/information-line'
import SetUp from '@iconify-icons/ep/set-up'
import Lollipop from '@iconify-icons/ep/lollipop'
import UserRelease from '@iconify-icons/ri/arrow-right-circle-fill'

import AdminCenter from '@iconify-icons/ri/user-settings-line'
import MenuIcon from '@iconify-icons/ri/bill-line'
import FunctionIcon from '@iconify-icons/ri/function-line'

import PermissionIcon from '@iconify-icons/ri/database-2-line'
import RoleIcon from '@iconify-icons/ri/box-3-line'

import ThirdroleIcon from '@iconify-icons/ri/bring-forward'
import BrandIcon from '@iconify-icons/ri/briefcase-line'
import UsergroupIcon from '@iconify-icons/ri/group-line'

import CategoryIcon from '@iconify-icons/ri/node-tree'
import OrganizationIcon from '@iconify-icons/ri/organization-chart'
import UserIcon from '@iconify-icons/ri/user-line'

import RecordIcon from '@iconify-icons/ri/function-line'
import DictIcon from '@iconify-icons/ri/book-2-line'
import Setting from '@iconify-icons/ri/settings-3-line'
import RuleIcon from '@iconify-icons/ri/list-check'
import TestIcon from '@iconify-icons/ri/code-s-slash-fill'

addIcon('setUp', SetUp)
addIcon('lollipop', Lollipop)
addIcon('userRelease', UserRelease)
addIcon('adminCenter', AdminCenter)
addIcon('menuIcon', MenuIcon)
addIcon('functionIcon', FunctionIcon)
addIcon('permissionIcon', PermissionIcon)
addIcon('roleIcon', RoleIcon)
addIcon('thirdroleIcon', ThirdroleIcon)
addIcon('brandIcon', BrandIcon)
addIcon('usergroupIcon', UsergroupIcon)
addIcon('categoryIcon', CategoryIcon)
addIcon('organizationIcon', OrganizationIcon)
addIcon('userIcon', UserIcon)
addIcon('recordIcon', RecordIcon)
addIcon('dictIcon', DictIcon)
addIcon('settingIcon', Setting)
addIcon('ruleIcon', RuleIcon)
addIcon('testIcon', TestIcon)
