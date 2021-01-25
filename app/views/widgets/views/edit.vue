<template>
  <form class="flex flex-wrap justify-between sm:justify-center">
    <link
      href="https://fonts.googleapis.com/css?family=Material+Icons"
      rel="stylesheet"
    />
    <section>
      <v-container fluid>
        {{widget}}
        <v-overlay :value="loading" style="position:absolute">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <v-card v-if="initialized">
          <v-toolbar flat color="primary" dark>
            <v-toolbar-title>Widgets</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="validations.valid" lazy-validation style="width:100%">
              <v-text-field v-model="widget.name" :counter="30" :rules="validations.widgetNameRules" label="Name" required></v-text-field>
              <v-row>
                <v-col cols="6">
                  <v-select v-model="widget.contentType" :items="items.contentType" :rules="[(v) => !!v || 'Item is required']" 
                      label="Content type" required></v-select>
                </v-col>
                <v-col cols="6">
                  <v-select v-model="widget.method" :items="items.method" :rules="[(v) => !!v || 'Item is required']" 
                      label="HTTP method" required></v-select>
                </v-col>
              </v-row>

              <v-row v-if="widget.method">
                <v-col cols="12">
                    <cParam v-model="widget.queryString" placeholder="Querystring params"></cParam>
                </v-col>
              </v-row>

              <v-row v-if="widget.method == 'POST' || widget.method == 'PUT'">
                <v-col cols="12">
                    <cParam v-model="widget.formData" placeholder="Form data params"></cParam>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12">
                    <cDatasource v-model="widget.dataSource" placeholder="Datasources"></cDatasource>
                </v-col>
              </v-row>
  
              <v-row>
                  <v-col cols="12">
                    <label class="v-label theme--light primary--text">Template</label>
                    <code-editor v-model="widget.template"  :mode="handlebarMode" preview="true"></code-editor>
                  </v-col>
              </v-row>

              <br/>
              <v-btn :disabled="!validations.valid" color="success" class="mr-4" @click="save">
                Save
              </v-btn>

              <v-btn color="error" class="mr-4" @click="reset">
                Cancel
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
     
    </section>
  </form>
</template>

<script>
define([
  'Vue',
  'vueFile!views/widgets/components/code-editor.vue',
  'vueFile!views/widgets/components/params.vue',
  'vueFile!views/widgets/components/datasource.vue',
  'axios',
  'views/workflows/vue-base-service',
  "css!/app/css/default-vue.css",
], function (Vue, codeEditor, cParam, cDatasource, axios) {
  return {
    components: {
      codeEditor: codeEditor,
      cParam: cParam,
      cDatasource:cDatasource
    },
    template: template,
    props: ['widgetId'],
    data() {
      return {
        loading:false,
        initialized:false,
        widget: {
          name: "",
          contentType: "text/html",
          method: "GET",
          queryString: {},
          formData: {},
          dataSource: [{}],
          template: "",
        },
        validations : {
          valid: true,
          widgetNameRules: [
            function (v){ return !!v || 'Name is required' },
            function (v){ return (v && v.length <= 30) || 'Name must be less than 10 characters' },
          ],
        },
        items: {
          contentType : [ 'text/html', 'application/json' ],
          method      : [ 'GET', 'POST', 'PUT']
        },
        jsonMode: "application/json",
        handlebarMode: { name: "handlebars", base: "text/html" },
      };
    },
    methods: {
      save (){
          var self = this;
          var valid = this.$refs.form.validate()
          if(!valid)
            return;
          console.log(this.widget);
          if(this.widget.template == '')
            return;

          var request;
          if(this.widget && this.widget._id){
              request = axios.put('/api/v2020/widgets/'+encodeURIComponent(this.widget._id), this.widget);
          }
          else{
              request = axios.post('/api/v2020/widgets', this.widget);
          }

          request.then(function(response){
            self.failedRecords.total = response.data[0].count
          })
          .catch(function(err) {          
            console.log(err);
            // self.errors.push(err)
            // self.showError(err);
          })
          .finally(function(){
              self.searchCountSource=undefined
          })
      },
      reset () {
        this.$refs.form.reset()
      },
      resetValidation () {
        this.$refs.form.resetValidation()
      },
      inputChange(a, b) {
        // console.log(a,b)
      },
      dialogClosed(a, b) {
        console.log(a, b);
      },
      loadWidgetDetails(id){
          var self = this;
          self.loading = true;
          axios.get('/api/v2020/widgets/'+encodeURIComponent(id))
          .then(function(result){
            self.widget = result.data;
            console.log(self.widget)
          })
          .finally(function(){
            self.loading = false;
            self.initialized=true
          });
      }
    },
    created() {
      // if (!this.populateWith.empty) {
      //   this.todo = this.populateWith;
      // }
      if(this.widgetId && this.widgetId!='new'){
        this.loadWidgetDetails(this.widgetId);
      }
      else{
        this.loading = false;
        this.initialized=true
      }
    },
  };
});
</script>

