define(['vue', 'text!./vue-list.html', 'axios', './vue-base-service', 'views/workflows/vue-wrapper'], 
function(Vue, template, axios, vueBaseService){

    Vue.component('failed-workflows', {
        props: ['vueValue'],
        template: template,
        data: function() {
            return {                
                errors:[],
                processWorkflowModel : {
                    show : false,
                    workflow : {},
                    action:''
                },
                failedRecords:{
                    page:1,
                    options:{
                        "page": 1, "itemsPerPage": 20,
                        sortDesc:[true],
                        sortBy:['failedExecution.failDate']
                    },
                    loading:false,
                    updatingAction:false,
                    expanded: [],
                    headers: [ 
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
            vueValue: function(update) {
                this.angularVueValue = update;
                this.countUpdated();
            }
        },
        methods: {
            loadFailedWorkflows : function(){

                var self = this;
                var options = self.failedRecords.options||{};

                self.failedRecordsLoading = true
                var ag = [];
                if(options.sortBy){
                    var sortDesc = options.sortDesc[0]
                    var sort = {}
                    sort[options.sortBy[0]]= sortDesc ? -1 : 1;
                    ag.push({$sort:sort})
                }
                ag.push({$skip:options.itemsPerPage * (options.page-1)})
                ag.push({$limit:options.itemsPerPage})


                var queryString = {
                    ag : JSON.stringify(ag)
                }

                axios.get(`/api/v2013/workflows/failed-workflows`, { params : {c:1}})
                .then(function(response){
                    self.failedRecords.total = response.data[0].count
                })
                axios.get(`/api/v2013/workflows/failed-workflows`, { params : queryString})
                .then(function(response){
                    self.failedRecords.workflows = response.data
                })
                .catch(function(err){
                    self.errors.push(e)
                })
                .finally(function(){
                    self.failedRecordsLoading = false;
                })
            }, 
            showProcessWorkflow         : function(workflow){
                this.processWorkflowModel.show = true
                this.processWorkflowModel.workflow = workflow;
            },
            setFailedWorkflowToProcessed: function(workflow){
                var self = this;
                self.updatingAction = true;
                axios.put('/api/v2013/workflows/failed-workflows/' + workflow._id + 
                            '/processed', {action:self.processWorkflowModel.action})
                .then(function(response){
                    if(response.status == 200){
                        workflow.failureProcessed = {
                            action : self.processWorkflowModel.action
                        }
                        self.processWorkflowModel.show = false;
                    }
                })
                .catch(function(err){
                    self.errors.push(e)
                })
                .finally(function(){
                    self.updatingAction=false;
                })
            },
            startNewWorkflow: function(workflow){
                
                var self = this;
                self.updatingAction = true;
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
                        }
                    }
                })
                .catch(function(err){
                    console.log(err)
                    self.errors.push(err)
                })
                .finally(function(){
                    self.updatingAction=false;
                })
            }
        }
    });
})

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
