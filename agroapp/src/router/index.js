import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, from, next) => {
    // Look at all routes
    Router.options.routes.forEach((route) => {
      console.log('route', route)
      console.log('to', to)
      // If this is the current route and it's secure
      if (to.path === route.path && route.secure) {
        console.log('rota segura')
        // Verify that the user isn't logged in
        const user = window.localStorage.getItem('user')
        console.log('localstorage', user)
        if (!user || (route.rule && user.profile !== route.rule)) {
          // Kill the session
          if (Router.app.$session) {
            Router.app.$session.destroy()
          }
          // Route back to the Login
          return next('Login')
        }
      }
    })
    // Proceed as normal
    next()
  })

  return Router
}
