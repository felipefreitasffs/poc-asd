import VueSocketio from 'vue-socket.io'

export default ({ Vue }) => {
  Vue.use(VueSocketio, 'http://localhost:3000')
}
