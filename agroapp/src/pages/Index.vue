<template>
  <q-page class="flex flex-center">
    <img alt="Quasar logo" src="~assets/quasar-logo-full.svg">
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'PageIndex',
  sockets: {
    connect: function () {
      console.log('socket connected')
    },
    user_accept: function (val) {
      console.log('usuário logado!', val)
    },
    user_denied: function () {
      console.log('usuário negado!')
    }
  },
  mounted () {
    this.$socket.emit('user_auth', 'felipe@felipe.com', '112345')
  }
}
</script>
