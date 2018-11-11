<template>
  <div class="window-height window-width" id="loginPage">
    <div class="fixed-center text-center">
      <q-card id="loginCard">
        <q-card-title>
          Login
        </q-card-title>
        <q-card-separator />
        <q-card-main>
          <q-field>
            <q-input float-label="Usuário:" v-model="username" class="loginField"/>
          </q-field>
          <q-field>
            <q-input float-label="Senha:" v-model="password" class="loginField"/>
          </q-field>
          <br><br>
          <q-btn color="primary" label="Entrar" @click="login"/>
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      username: undefined,
      password: undefined
    }
  },
  sockets: {
    user_accept: function (val) {
      this.$q.localStorage.set('user', val)
      this.$router.push('/')
      this.$q.loading.hide()
      this.$q.notify({
        message: 'Usuário logado!',
        type: 'positive'
      })
    },
    user_denied: function () {
      this.$q.loading.hide()
      this.$q.notify({
        message: 'Usuário negado!',
        type: 'negative'
      })
    }
  },
  methods: {
    login () {
      this.$q.loading.show({
        delay: 400 // ms
      })
      this.$socket.emit('user_auth', this.username, this.password)
    }
  }
}
</script>

<style lang="stylus" scoped>
#loginPage
  background-image url("../statics/images/loginBackground.jpg")
  background-size cover

#loginCard
  background-color rgba(0, 0, 0, 0.73)
  border-radius 10px
  color white
  min-width 300px
</style>

<style lang="stylus">
#loginCard
  input[type="text"]
    color white !important
  .q-if-label
    color white
</style>
