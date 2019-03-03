import Vue from 'vue'
import VueRouter from 'vue-router'
import { Notify } from 'quasar'
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
    // If this is the current route and it's secure
    if (to.matched.some(record => record.meta.requiresAuth)) {
      console.log('rota segura')
      // Verify that the user isn't logged in
      const user = window.localStorage.getItem('user')
      console.log('localstorage', user)
      if (!user || (to.rule && user.profile !== to.rule)) {
        console.log('aqui')
        // Kill the session
        if (Router.app.$session) {
          Router.app.$session.destroy()
        }

        Notify.create({
          message: 'Não logado! Você será redirecionado para a página de login'
        })

        setTimeout(() => {
          // Route back to the Login
          return next({
            path: '/login',
            params: { return: to.fullPath }
          })
        }, 5000)
      }
    }
    console.log('aqui 3')
    // Proceed as normal
    next()
  })

  return Router
}
