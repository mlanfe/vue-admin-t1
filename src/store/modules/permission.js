import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    // 判断用户的权限于当前路由访问所需要的权限是否有一个满足
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    // 如果路由没有设置meta, 默认是可访问的
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */

// 生成可访问路由
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route } // 利用扩展运算符实现对象的浅复制
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      // 将可访问路由放入数组中
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [], // 可访问的所有路由: constantRoutes+AsyncRoutes
  addRoutes: [] // 可访问的动态路由: AsyncRoutes
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('admin')) {
        // admin可以访问所有路由
        accessedRoutes = asyncRoutes || []
      } else {
        // 根据roles对动态路由进行筛选,生成可访问的动态路由
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
