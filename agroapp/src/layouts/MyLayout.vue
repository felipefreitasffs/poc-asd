<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        color="primary"
        :glossy="$q.theme === 'mat'"
        :inverted="$q.theme === 'ios'"
        class="q-py-none row"
      >

        <q-toolbar-title class="col-md-2">
          Agro App
        </q-toolbar-title>
        <q-tabs align="center" :glossy=true class="on-left">
          <q-route-tab
            label="Usuários"
            to="/Users"
            exact
            slot="title"
          />
          <q-route-tab
            label="Fornecedores"
            to="/alarms"
            exact
            slot="title"
          />
        </q-tabs>
        <div class="absolute-right">
          <q-btn
            flat
            dense
            round
            aria-label="logout"
            @click="logout"
          >
            <q-icon name="logout" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-layout-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'MyLayout',
  data () {
    return {
    }
  },
  sockets: {
    user_off: function (val) {
      this.$q.localStorage.remove('user')
      this.$router.push('/Login')
      this.$q.loading.hide()
      this.$q.notify({
        message: 'Usuário deslogado!',
        type: 'positive'
      })
    }
  },
  methods: {
    logout () {
      this.$q.loading.show({
        delay: 400 // ms
      })
      this.$socket.emit('user_logout')
    }
  }
}
</script>

<style lang="stylus">
.q-layout-page
  background rgba(235, 255, 226, 0.42);
</style>
