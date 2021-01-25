<template>

  <v-container fluid>
    <v-data-table
      :headers="headers"
      :items="widgets"
      class="elevation-1"
      hide-default-footer
      item-key="name"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Widgets</v-toolbar-title>
          <v-spacer></v-spacer>
          <template >
              <v-btn x-small color="primary" dark class="mb-2" @click="newWidget()">
                  New Widget
              </v-btn>
          </template>
        <v-dialog v-model="dialogDelete" max-width="600px">
            <v-card>
              <v-card-title class="headline"
                >Are you sure you want to delete this item?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete"
                  >Cancel</v-btn
                >
                <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
        <v-icon small class="mr-2" @click="viewItem(item)"> mdi-feature-search </v-icon>
        <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
      </template>
      <template v-slot:no-data>
        <b>No querystring params configured!</b>
      </template>
    </v-data-table>
    <v-snackbar v-model="toastMessage.show" right top :color="toastMessage.color" :timeout="toastMessage.timeout">
        {{ toastMessage.text }}
        <v-btn color="primary" text @click="toastMessage.show = false">
            Close
        </v-btn>
    </v-snackbar>
  </v-container>
</template>

<script>
define([
  "vueFile!views/widgets/components/error.vue",
  "lodash",
  'axios',
  'views/workflows/vue-base-service',
  "css!/app/css/default-vue.css",
], function (CError, _, axios) {
  return {
    components: {
      CError:CError
    },
    template: template,
    data: () => ({
        dialogDelete: false,
        headers: [
            { text: "Name", align: "start", sortable: false, value: "name"},
            { text: "Method", value: "method", sortable: false },
            { text: "Content type", value: "contentType", sortable: false },
            { text: 'Actions', value: 'actions', sortable: false },
        ],
        widgets:[],
        toastMessage : {
            text:'',
            timeout:5000,
            show:false,
            color:'success'
        }
    }),
    computed: {
      
    },
    watch: {
      dialog(val) {
        val || this.close();
      },
      dialogDelete(val) {
        val || this.closeDelete();
      },
    },

    created() {
      this.initialize();
    },

    methods: {
      initialize() {
        this.widgets = [];        
        this.loadWidgets();
      },
      newWidget(){
        window.location.href = '/widgets/new';  
      },
      editItem(item) {
        window.location.href = '/widgets/' + item._id + '/edit';        
      },
      viewItem(item) {
        window.location.href = '/widgets/' + item._id + '/view';        
      },

      deleteItem(item) {
        this.editedIndex = this.localDatasource.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialogDelete = true;
      },

      deleteItemConfirm() {
        this.localDatasource.splice(this.editedIndex, 1);
        this.closeDelete();
      },

      close() {
        this.dialog = false;
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },

      closeDelete() {
        this.dialogDelete = false;
        this.$nextTick(() => {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },
      loadWidgets(){
        var self = this;
        self.loading = true;
        axios.get('/api/v2020/widgets', {params:{f:{name:1,contentType:1,method:1,_id:1}}})
        .then(function(result){
            self.widgets = result.data;
            console.log(self.widgets)
        })
        .catch(function(e){
          self.showToast('Error loasing widgets', 'error')
        })
        .finally(function(){
            self.loading = false;
            self.initialized=true
        });
      },
      showToast(text, color){
        this.toastMessage.show = true;
        this.toastMessage.color= color||'success'
        this.toastMessage.text = text;
      }
    },
  };
});
</script>