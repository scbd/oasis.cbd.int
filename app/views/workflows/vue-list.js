import Vue from 'vue';
import template from './vue-list.html';
import axios from 'axios';
import './vue-base-service';
import './vue-wrapper';

export { default as template } from './vue-list.html';
    Vue.component('failed-workflows', {
        props: ['vueValue'],
        template: template,
        data: function() {
            return {     
                search: '',           
                errors:[],
                processWorkflowModel : {
                    show : false,
                    workflow : {},
                    action:''
                },
                confirmModal : {
                    show : false,
                    workflow : {}
                },
                toastMessage : {
                    text:'',
                    timeout:5000,
                    show:false,
                    color:'success'
                },
                failedRecords:{
                    page:1,
                    options:{
                        "page": 1, 
                        "itemsPerPage": 20,
                        sortDesc:[true],
                        sortBy:['failedExecution.failDate']
                    },
                    loading:false,
                    updatingAction:false,
                    expanded: [],
                    headers: [ 
                        { text: 'History', value: 'history'},
                        { text: 'State', value: 'state'},
                        { text: 'Realm', value: 'data.realm'},
                        { text: 'Schema', value: 'data.metadata.schema'},
                        { text: 'Title', value: 'data.title.en' },
                        { text: 'Fail Date', value: 'failedExecution.failDate' },
                        { text: '', value: 'failureProcessed' }
                    ],
                    workflows:[],
                    total:0
                }
            }
        },
        created(){
            // this.loadFailedWorkflows();
        },
        watch: {
            'failedRecords.options': {
                handler () {
                  this.loadFailedWorkflows()
                },
                deep: true,
            },
            'search': {
                handler () {
                  this.loadFailedWorkflows()
                }
            },
            vueValue: function(update) {
                this.angularVueValue = update;
                this.countUpdated();
            }
        },
        methods: {
            loadFailedWorkflows : function(){

                var self = this;

                if (self.searchCountSource) {
                    self.searchCountSource.cancel('Cancel previous count request');
                }
                if (self.searchSource) {
                    self.searchSource.cancel('Cancel previous search request');
                }
                self.searchCountSource = axios.CancelToken.source();
                self.searchSource = axios.CancelToken.source();

                var options = self.failedRecords.options||{};

                self.failedRecords.loading = true
                var ag = [];
                var countAg = [];

                if(this.search!=''){
                    var searchQuery = {
                        "$or" : [
                            {"data.title.en": { "$$contains" : this.search}}, 
                            {"data.abstract.en": { "$$contains" : this.search}},
                            {"data.realm": { "$$contains" : this.search}},
                            {"data.metadata.schema": { "$$contains" : this.search}},
                        ]
                    };
                    ag.push({$match:searchQuery});
                    countAg.push({$match:searchQuery})
                }
                
                if(options.sortBy){
                    var sortDesc = options.sortDesc[0]
                    var sort = {}
                    sort[options.sortBy[0]]= sortDesc ? -1 : 1;
                    ag.push({$sort:sort})
                }
                ag.push({$skip:options.itemsPerPage * (options.page-1)})
                if(options.itemsPerPage>0)
                    ag.push({$limit:options.itemsPerPage})

                var queryString = {
                    ag : JSON.stringify(ag)
                }
                countAg.push({ $count    : 'count' });
                var countAgQuery = {
                    ag: JSON.stringify(countAg)
                }
                
                axios.get(`/api/v2013/workflows/failed-workflows`, { params : countAgQuery, cancelToken: self.searchCountSource.token})
                .then(function(response){
                    self.failedRecords.total = response.data[0].count
                })
                .catch(function(err) {
                    if (axios.isCancel(err)) {
                        console.log('Request canceled', err.message);
                    }
                    else{
                        self.errors.push(err)
                        self.showError(err);
                    }
                })
                .finally(function(){
                    self.searchCountSource=undefined
                })
                axios.get(`/api/v2013/workflows/failed-workflows`, { params : queryString, cancelToken: self.searchSource.token})
                .then(function(response){
                    self.failedRecords.workflows = response.data
                })
                .catch(function(err){
                    if (axios.isCancel(err)) {
                        console.log('Request canceled', err.message);
                    }
                    else{
                        self.errors.push(err)
                        self.showError(err);
                    }
                })
                .finally(function(){
                    self.failedRecords.loading = false;
                    self.searchSource=undefined
                })
            }, 
            showProcessWorkflow         : function(workflow){
                this.processWorkflowModel.show = true
                this.processWorkflowModel.workflow = workflow;
            },
            setFailedWorkflowToProcessed: function(workflow){
                var self = this;
                self.failedRecords.updatingAction = true;
                self.processWorkflowModel.show = false;
                axios.put('/api/v2013/workflows/failed-workflows/' + workflow._id + 
                            '/processed', {action:self.processWorkflowModel.action})
                .then(function(response){
                    if(response.status == 200){
                        workflow.failureProcessed = {
                            action : self.processWorkflowModel.action
                        }
                        self.toastMessage.show = true;
                        self.toastMessage.color='success'
                        self.toastMessage.text = 'Workflow was successfully set to processed.'
                    }
                })
                .catch(function(err){
                    self.errors.push(err)
                        self.showError(err);
                })
                .finally(function(){
                    self.failedRecords.updatingAction=false;
                })
            },
            startNewWorkflow: function(workflow){
                var self = this;
                self.failedRecords.updatingAction = true;
                axios.put('/api/v2013/workflows/failed-workflows/' + workflow._id + '/new-workflow')
                .then(function(response){
                    if(response.status == 200){
                        if(response.data.errors){
                            self.$set(workflow, 'validationErrors', response.data.errors);
                        }
                        else{   
                            workflow.failureProcessed = {
                                action : self.processWorkflowModel.action
                            }
                        
                            self.processWorkflowModel.show = false;
                            self.confirmModal.show = false;
                            self.toastMessage.show = true;
                            self.toastMessage.color='success'
                            self.toastMessage.text = 'New workflow was successfully started.'
                        }
                    }
                })
                .catch(function(err){
                    console.log(err)
                    self.errors.push(err)
                    self.showError(err);
                })
                .finally(function(){
                    self.failedRecords.updatingAction=false;
                })
            },
            confirm: function(item){
                this.confirmModal.show = true;
                this.confirmModal.workflow = item;
            },
            showError:function(err){
                this.toastMessage.show = true;
                this.toastMessage.color='error'
                if(err && err.message)
                    this.toastMessage.text = err.message;
                else
                    this.toastMessage.text = 'Error occoured when processing request.';
            }
        }
    });


            // }
            // increment: function() {
            //     this.angularVueValue+=1;
            //     this.$emit('vuevaluechange', this.angularVueValue);
            // },
            // decrement: function() {
            //     this.angularVueValue-=1;
            //     this.$emit('vuevaluechange', this.angularVueValue);
            // },
            // countUpdated: function() {
            //     this.$emit('vuevaluechange', this.angularVueValue);
            // }
