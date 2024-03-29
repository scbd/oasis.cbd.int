<template>
    <v-container fluid>
        <v-overlay :value="loading" absolute>
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
                       <v-card v-if="!loading">
                            <v-toolbar flat>
                                <v-toolbar-title>Preview</v-toolbar-title>
                            </v-toolbar>
                            <v-card-text>
                                <v-text-field disabled v-model="previewUrl" label="Preview URL" required></v-text-field>
                                <iframe ref="templatePreview"  width="100%" height="100%" style="border:none display: block;border: none;height: calc(100vh - 30px);width: 100%;"></iframe>
                            </v-card-text>
                         </v-card>
                    </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
        <v-snackbar v-model="toastMessage.show" right top :color="toastMessage.color" :timeout="toastMessage.timeout">
            {{ toastMessage.text }}
            <v-btn color="primary" text @click="toastMessage.show = false">
                Close
            </v-btn>
        </v-snackbar>
    </v-container>
</template>

<script>

import CError from "../../widgets/components/error.vue"
import CParam from "../../widgets/components/params.vue"
import CParamValues from "../../widgets/components/param-values.vue"
import CDatasourceValues from "../../widgets/components/datasource-values.vue"
import _ from "lodash"
import axios from 'axios'
import '~/views/workflows/vue-base-service'
import "css!~/css/default-vue.css"

export default {
    components: {
      CError:CError,
      CParam:CParam,
      CParamValues:CParamValues,
      CDatasourceValues:CDatasourceValues
    },
    props: ['widgetId'],
    data: function() { 
      return {
        loading:false,
        dialogDelete: false,
        widget:[],
        toastMessage : {
            text:'',
            timeout:5000,
            show:false,
            color:'success'
        },
        previewUrl:''
      }
    },
    computed: {      
    },
    watch: {    
      loadingPreview(val){
        this.loadingPreview = val
      }  
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
        self.loadingPreview = true; 

        axios.get('/api/v2020/widgets/'+encodeURIComponent(widgetId))
        .then(function(result){
            self.widget = result.data;
            return self.onPreview();
        })
        .catch(function(e){
          console.debug(e)
          self.showToast('Error loading widget details', 'error')
        })
        .finally(function(){
            self.loading = false;
            self.initialized=true
            // self.loadingPreview = false;
        });
      },
      onPreview(){


        var self = this;

        if(self.loading)
          return;
          
        self.loading = true; 
        self.widgetPreview = '';
        self.previewUrl    = '';
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

        return axiosPromise.then(function(result){
          console.log(result);
            self.widgetPreview = result.data;
            self.previewUrl    = result.request.responseURL;
            self.loading = false;
            self.$nextTick(function(){
              var previewFrame = self.$refs.templatePreview;
              var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
              preview.open();
              preview.write(self.widgetPreview);
              preview.close();
            })
        })        
        .catch(function(e){
          console.debug(e);
          self.showToast('Error while previewing widget, try again later', 'error')
        })
        .finally(function(){
            self.loading = false;
        });
      },
      showToast(text, color){
        this.toastMessage.show = true;
        this.toastMessage.color= color||'success'
        this.toastMessage.text = text;
      }
    },
  };
</script>