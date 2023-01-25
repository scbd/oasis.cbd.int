<template>
  <div>
    <form class="flex flex-wrap justify-between sm:justify-center">
      <link
        href="https://fonts.googleapis.com/css?family=Material+Icons"
        rel="stylesheet"
      />
      <section>
        <v-container fluid>
          <v-overlay :value="loading" absolute>
            <v-progress-circular indeterminate size="64"></v-progress-circular>
          </v-overlay>
          <v-card v-if="initialized">
            <v-toolbar flat color="primary" dark>
              <v-toolbar-title>Widgets</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
               <v-alert prominent type="error"  v-if="validationErrors.length">
                  <v-row align="center">
                    <v-col class="grow">
                      Errors
                    </v-col>
                  </v-row>  
                  <v-divider class="my-4 info" style="opacity: 0.22"></v-divider>                
                  <table class="table">
                      <tr v-for="(error, index) in validationErrors" :key="index"> 
                          <td>{{error.type}}</td>
                          <td>{{error.message}}</td>
                      </tr>
                  </table>
              </v-alert>
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
     <v-snackbar v-model="toastMessage.show" right top :color="toastMessage.color" :timeout="toastMessage.timeout">
        {{ toastMessage.text }}
        <v-btn color="white" text @click="toastMessage.show = false">
            Close
        </v-btn>
    </v-snackbar>
  </div>
</template>

<script>

  import   codeEditor from '../components/code-editor.vue';
  import   cParam from '../components/params.vue';
  import   cDatasource from '../components/datasource.vue';
  import   axios from 'axios';
  import '~/views/workflows/vue-base-service';
  // import "css!/app/css/default-vue.css";

export default {
    components: {
      codeEditor: codeEditor,
      cParam: cParam,
      cDatasource:cDatasource
    },
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
          dataSource: [],
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
        toastMessage : {
            text:'',
            timeout:5000,
            show:false,
            color:'success'
        },
        validationErrors:[]
      };
    },
    methods: {
      save (){
          this.validationErrors = [];
          var self = this;
          var valid = this.$refs.form.validate()
          if(!valid)
            return;
          if(this.widget.template == '')
            return;

          var request;
          if(this.widget && this.widget._id){
              request = axios.put('/api/v2020/widgets/'+encodeURIComponent(this.widget._id), this.widget);
          }
          else{
              request = axios.post('/api/v2020/widgets', this.widget)
          }
          self.loading = true;
          request.then(function(response){
            self.showToast('Widget saved successfully', 'success');
            if(response.data.id){
              window.location =  window.baseUrl + 'widgets/'+ response.data.id + '/edit'
            }
          })
          .catch(function(e){
            self.showToast('Error saving widgets', 'error')
            console.log(e.response);
            self.validationErrors = e.response.data.error.details;
            window.scrollTo(0, 0)
          })
          .finally(function(){
              self.loading = false;
          })
      },
      reset () {
        window.location =  window.baseUrl + 'widgets';
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
          })
          .catch(function(e){
            console.log(e)
            self.showToast('Error loading widget details', 'error')
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
    }
  };

</script>

