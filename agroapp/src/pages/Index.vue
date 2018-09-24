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
      console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)', val)
    }
  },
  mounted () {
    this.$socket.emit('user:auth', 'felipe@felipe.com', 'teste')
  }
}
</script>
