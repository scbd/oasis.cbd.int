<template>
    <v-container fluid>
        <v-overlay :value="loading" style="position:absolute">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <v-card v-if="!loading">
          <v-toolbar flat color="primary" dark>
            <v-toolbar-title>Widget Preview</v-toolbar-title>
          </v-toolbar>
          <v-card-text color="grey lighten-5">
            <v-form ref="form" style="width:100%">
                <v-text-field disabled v-model="widget.name" label="Name" required></v-text-field>
                <v-row>
                    <v-col cols="6">
                        <v-text-field disabled v-model="widget.contentType" label="Content type" required></v-text-field>
                    </v-col>
                    <v-col cols="6">
                        <v-text-field disabled v-model="widget.method" label="Method" required></v-text-field>
                    </v-col>
                </v-row>
                <v-row v-if="widget.method">
                  <v-col cols="12">
                      <cParamValues v-model="widget.queryString" placeholder="Querystring params"></cParamValues>
                  </v-col>
                </v-row>
                <v-row v-if="widget.method == 'POST' || widget.method == 'PUT'">
                  <v-col cols="12">
                      <cParam v-model="widget.formData" placeholder="Form data params"></cParam>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">
                      <CDatasourceValues v-model="widget.dataSource" placeholder="Datasources"></CDatasourceValues>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12">                    
                     <v-btn color="primary" dark  @click="onPreview" >
                    Preview
                  </v-btn>
                  </v-col>
                </v-row>
                
                <v-row>
                    <v-col col="12">
                        <v-card >
                            <v-toolbar flat>
                                <v-toolbar-title>Preview</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                              {{loadingPreview}}
                               <v-overlay :value="loadingPreview" style="position:absolute">
                                <v-progress-circular indeterminate size="64"></v-progress-circular>
                              </v-overlay>
                              <iframe ref="templatePreview"  width="100%" height="100%" style="border:none display: block;border: none;height: calc(100vh - 30px);width: 100%;"></iframe>
                            </v-card-text>
                         </v-card>
                    </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
</template>

<script>
define([
  "vueFile!views/widgets/components/error.vue",
  "vueFile!views/widgets/components/param-values.vue",
  "vueFile!views/widgets/components/datasource-values.vue",
  "lodash",
  'axios',
  'views/workflows/vue-base-service',
  "css!/app/css/default-vue.css",
], function (CError, CParamValues,CDatasourceValues, _, axios) {
  return {
    components: {
      CError:CError,
      CParamValues:CParamValues,
      CDatasourceValues:CDatasourceValues
    },
    template: template,
    props: ['widgetId'],
    data: function() { 
      return {
        loading:false,
        dialogDelete: false,
        widget:[]
      }
    },
    computed: {      
    },
    watch: {      
    },

    created() {
      this.initialize();
    },

    methods: {
      initialize() {
        this.widgets = [];        
        this.loadWidget(this.widgetId);
      },

      editItem(item) {
        window.location.href = '/widgets/' + item._id + '/edit';
        
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
        this.$nextTick(function() {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },

      closeDelete() {
        this.dialogDelete = false;
        this.$nextTick(function() {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },
      loadWidget(widgetId){
        var self = this;
        self.loading = true;
        axios.get('/api/v2020/widgets/'+encodeURIComponent(widgetId))
        .then(function(result){
            self.widget = result.data;
            self.onPreview();
        })
        .finally(function(){
            self.loading = false;
            self.initialized=true
        });
      },
      onPreview(){
            var self = this;
            self.loadingPreview = true;
            var lWidget = Object.assign({}, this.widget);
            var queryString = {};
            var formData = {};

            if(lWidget.queryString){
              _.each(lWidget.queryString, function(param, key){
                if(param.value)
                  queryString[key] = param.value
              })
            }

            if(lWidget.formData){
              _.each(lWidget.formData, function(param, key){
                if(param.value)
                  if(lWidget.method == 'GET')
                    queryString[key] = param.value;
                  else 
                    formData[key] = param.value;
              })
            }

            if(lWidget.dataSource){
              _.each(lWidget.dataSource, function(source){                
                if(source.queryString){
                  _.each(source.queryString, function(param, key){
                    if(param.value)
                      queryString[key] = param.value
                  })
                }
                if(source.formData){
                  _.each(source.formData, function(param, key){
                    if(param.value)
                      if(lWidget.method == 'GET')
                        queryString[key] = param.value;
                      else 
                        formData[key] = param.value;
                  })
                }
              })
            }

            var axiosPromise;
            if(lWidget.method == 'GET')
              axiosPromise = axios.get('/api/v2020/widgets/'+encodeURIComponent(this.widgetId)+'/render', { params: queryString } );
            else if(lWidget.method == 'POST')
                axiosPromise = axios.post('/api/v2020/widgets/'+encodeURIComponent(this.widgetId)+'/render', { data:formData, params: queryString } );
            else if(lWidget.method == 'PUT')
                axiosPromise = axios.put('/api/v2020/widgets/'+encodeURIComponent(this.widgetId)+'/render',  { data:formData, params: queryString } );          


            axiosPromise.then(function(result){
                self.widgetPreview = result.data;
                console.log(result);
                self.loadingPreview = false;
                self.$nextTick(function(){
                  var previewFrame = self.$refs.templatePreview;
                  var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
                  preview.open();
                  preview.write(self.widgetPreview);
                  preview.close();
                })
            })
            .finally(function(){
                self.loadingPreview = false;
            });
      }
    },
  };
});
</script>