<template>
  <q-page class="q-pa-lg">

    <div class="row justify-end">
      <q-btn icon="add" color="secondary" label="Novo Usuário" @click="userModal = true; isEdition = false"/>
    </div>
    <br>

    <div class="row justify-center">

      <div class="col-10">
        <q-table
          :data="usersTableData"
          :columns="usersColumns"
          row-key="id"
        >
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="(col, index) in props.cols" :key="col.name" :props="props">
              <div class="text-center" v-if="props.cols.length === index + 1">
                <q-btn size="sm" round dense color="secondary" icon="delete" @click="deleteUser(col.value)"/>
                <q-btn size="sm" round dense color="secondary" icon="edit" @click="modalEditUser(props.row)"/>
              </div>
              <template v-else>
                {{ col.value }}
              </template>
            </q-td>
          </q-tr>
        </q-table>
      </div>
    </div>

    <q-modal v-model="userModal" :content-css="{minWidth: '50vw', minHeight: '50vh'}" @hide="cleanData">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn
            flat
            round
            dense
            v-close-overlay
            icon="keyboard_arrow_left"
          />
          <q-toolbar-title>
            <template v-if="isEdition">
              {{ form.name }}
            </template>
            <template v-else>
              Novo usuário
            </template>
          </q-toolbar-title>
        </q-toolbar>

        <q-toolbar slot="footer">
          <q-toolbar-title>
            <div class="row justify-end">
              <q-btn
                color="negative"
                v-close-overlay
                label="Cancelar"
                class="q-mr-md"
              />
              <q-btn
                color="positive"
                label="Confirmar"
                @click="addOrEditUser"
              />
            </div>
          </q-toolbar-title>
        </q-toolbar>

        <div class="row justify-center q-ma-lg">
          <div class="col-md-8">
            <q-field
              icon="fas fa-user"
              label="Nome: "
              helper="digite o nome do usuário!"
            >
              <q-input v-model="form.name" />
            </q-field>
            <q-field
              icon="fas fa-at"
              label="Usuário: "
              helper="digite o email do usuário!"
            >
              <q-input v-model="form.username" />
            </q-field>
            <q-field
              icon="fas fa-user-tag"
              label="Perfil: "
              helper="selecione um perfil para o usuário!"
            >
              <q-select
                v-model="form.profile"
                :options="listProfiles"
              />
            </q-field>
            <q-field
              v-if="!isEdition"
              icon="fas fa-key"
              label="Senha: "
              helper="defina uma senha para o usuário!"
            >
              <q-input v-model="form.password" type="password"/>
            </q-field>
          </div>
        </div>
      </q-modal-layout>
    </q-modal>
  </q-page>
</template>

<style lang="stylus" scoped>
img
  opacity 0.6
</style>

<script>
export default {
  name: 'Users',
  data () {
    return {
      users: '',
      userModal: false,
      isEdition: false,
      editUserId: undefined,
      listProfiles: [],
      form: {
        username: undefined,
        profile: undefined,
        password: undefined,
        name: undefined
      },
      usersColumns: [
        {
          name: 'Name',
          required: true,
          label: 'Nome',
          align: 'left',
          field: 'name',
          sortable: true
        },
        {
          name: 'Profile',
          required: true,
          label: 'Perfil',
          align: 'left',
          field: 'profile',
          sortable: true
        },
        {
          name: 'Usuário',
          required: true,
          label: 'Usuário',
          align: 'left',
          field: 'username',
          sortable: true
        },
        {
          name: 'Ação',
          required: true,
          label: 'Ação',
          align: 'center',
          field: 'id',
          sortable: true
        }
      ],
      usersTableData: []
    }
  },
  sockets: {
    filtered_users (users) {
      console.log(users)
      this.usersTableData = users
    },
    add_user_result (msg) {
      this.userModal = false
      this.form.username = undefined
      this.form.profile = undefined
      this.form.password = undefined
      this.form.name = undefined
      this.loadUsers()
    },
    delete_user_result (msg) {
      this.loadUsers()
    },
    edit_user_result (msg) {
      this.userModal = false
      this.form.username = undefined
      this.form.profile = undefined
      this.form.password = undefined
      this.form.name = undefined
      this.editUserId = undefined
      this.loadUsers()
    },
    filtered_profiles (profiles) {
      this.listProfiles = profiles.map(profile => {
        return {
          label: profile.description,
          value: profile.id
        }
      })
    }
  },
  mounted () {
    this.loadUsers()
    this.loadProfiles()
  },
  methods: {
    addOrEditUser () {
      if (!this.isEdition) {
        this.$socket.emit('add_users', this.form)
      } else {
        this.$socket.emit('edit_users', {
          username: this.form.username,
          profile: this.form.profile,
          name: this.form.name,
          id: this.editUserId
        })
      }
    },
    deleteUser (userId) {
      this.$socket.emit('delete_users', userId)
    },
    editUser (userId) {
      this.$socket.emit('edit_users', userId)
    },
    modalEditUser (user) {
      console.log(user)
      this.form.username = user.username
      this.form.profile = user.profile
      this.form.name = user.name
      this.editUserId = user.id
      this.userModal = true
      this.isEdition = true
    },
    loadUsers (username) {
      this.$socket.emit('list_users', { username: undefined })
    },
    loadProfiles () {
      this.$socket.emit('list_profiles', { description: undefined })
    },
    cleanData () {
      this.form.username = undefined
      this.form.profile = undefined
      this.form.password = undefined
      this.form.name = undefined
      this.editUserId = undefined
    }
  }
}
</script>
