<template>
    <section class="content">

        <div class="row">

            <div class="col-md-12">
                <div class="container" style="width:100%" id="articlesContainer">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="box box-default">
                                <div class="box-header with-border">
                                    <h3 class="box-title">Record History</h3>
                                </div>
                                <div class="box-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Clearing-House ID</label>
                                                <input type="text" class="form-control" v-model="identifier">
                                            </div>
                                        </div>                                        

                                    </div>
                                </div>
                                <div class="box-footer">
                                    <button class="btn btn-sm btn-primary" @click="showHistory()">Show History</button>                             
                                    <button class="btn btn-sm btn-danger"  @click="onReset()">Clear Selected</button>
                                </div>
                            </div>
                        </div> 

                    </div>


                    <div class="row">
                        <div class="col-md-12">
                            
                            <div class="box">
                                <div class="box-header with-border">
                                    <h3 class="box-title">
                                        <strong> Record History </strong>
                                    </h3>
                                </div>

                                <div class="box-body">
                                    <div class="row" v-if="error">
                                        <div class="col-md-12">
                                            <div class="alert alert-danger alert-dismissible" >                            
                                                <h4><i class="icon fa fa-ban"></i> Error!</h4>
                                                {{ error }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row" v-if="loading">
                                        <div class="col-md-12" style="margin:5px">
                                        <i class="fa fa-cog fa-spin fa-lg" style="margin-left: 50%;"></i> loading...</div>
                                    </div>                                   
                                    <div class="row" >
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    Published Record
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <th style="width: 10px">#</th>
                                                                <th>Realm</th>
                                                                <th>Title</th>
                                                                <th>Owner</th>
                                                                <th>Government</th>
                                                                <th>Created By</th>
                                                                <th>Submitted By</th>
                                                                <th>Updated By</th>
                                                                <td></td>
                                                            </tr>
                                                            <tr v-if="!loading && identifier && hasSearched && !document">
                                                                <td colspan="9">
                                                                    <div class="alert alert-info" >                            
                                                                        <h4><i class="icon fa fa-ban"></i> Info!</h4>
                                                                        No Published document found for {{ identifier }}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr  v-if="document">
                                                                <td>#</td>
                                                                <td>{{ document.realm }}</td>
                                                                <td>
                                                                    <strong>
                                                                        <a target="_blank" :href="appDocumentUrl(document, 'published')">
                                                                            {{document.title|lstring}} 
                                                                            <i class="fa fa-external-link"></i>
                                                                        </a>
                                                                    </strong><br/>
                                                                    <small v-html="$options.filters.lstring(document.summary, 'en')"></small>
                                                                </td>
                                                                <td> {{ countryName(document.owner.replace('country:', '')) }}</td>
                                                                <td> {{ countryName(document.metadata.government)}}</td>
                                                                <td>
                                                                    <span v-if="document.createdBy">
                                                                    {{ document.createdBy.firstName }} {{ document.createdBy.lastName }}
                                                                    </span>
                                                                    <br/>
                                                                    {{ document.createdOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <span v-if="document.submittedBy">
                                                                        {{ document.submittedBy.firstName }} {{ document.submittedBy.lastName }}</span><br/>
                                                                    {{ document.submittedOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <span v-if="document.updatedBy">
                                                                        {{ document.updatedBy.firstName }} {{ document.updatedBy.lastName }}</span><br/>
                                                                    {{ document.updatedOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <button class="btn btn-primary" @click="onShowJson(document)">Show JSON
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            
                                                            <tr v-if="document && document.showJson">
                                                                <th></th>
                                                                <td colspan="8">
                                                                    <div>
                                                                        <pre style="white-space: break-spaces;">{{ document |json }}</pre>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                                                   
                                    <div class="row" >
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    Index Record
                                                    <strong v-if="documentIndex">(Indexed on : {{  documentIndex.indexedOn | formatDate}})</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <th style="width: 10px">#</th>
                                                                <th>Realm</th>
                                                                <th>Title</th>
                                                                <th>Owner</th>
                                                                <th>Government</th>
                                                                <th>Created By</th>
                                                                <th>Submitted By</th>
                                                                <th>Updated By</th>
                                                                <td></td>
                                                            </tr>
                                                            <tr v-if="!loading && identifier && hasSearched && !documentIndex">
                                                                <td colspan="9">
                                                                    <div class="alert alert-info" >                            
                                                                        <h4><i class="icon fa fa-ban"></i> Info!</h4>
                                                                        No indexed document found for {{ identifier }}
                                                                        <p v-if="document && document.identifier" style="margin-top:20px">
                                                                            <button class="btn btn-danger" @click="reindexRecord(document)">Request Re-indexing</button>
                                                                        </p>
                                                                    </div>

                                                                </td>
                                                            </tr>
                                                            <tr  v-if="documentIndex">
                                                                <td>#</td>
                                                                <td>{{ documentIndex.realm.join(', ') }}</td>
                                                                <td>
                                                                    <strong>
                                                                        {{ (documentIndex.uniqueIdentifier_s||'').toUpperCase() }}
                                                                        <a target="_blank" :href="appDocumentUrl(documentIndex, 'published')">
                                                                            {{documentIndex.title}}
                                                                            <i class="fa fa-external-link"></i>
                                                                        </a>                                                                        
                                                                    </strong>
                                                                    <br/>
                                                                    <small v-html="documentIndex.summary"></small>
                                                                </td>
                                                                <td> {{ countryName(documentIndex.owner.replace('country:', '')) }}</td>
                                                                <td> {{ countryName(documentIndex.government)}}</td>
                                                                <td>
                                                                    {{ documentIndex.createdBy }}<br/>
                                                                    {{ documentIndex.createdOn | formatDate }}
                                                                </td>
                                                                <td>{{ documentIndex.submittedBy }}<br/>
                                                                    {{ documentIndex.submittedOn | formatDate }}
                                                                </td>
                                                                <td>{{ documentIndex.updatedBy }}<br/>
                                                                    {{ documentIndex.updatedOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <a target="_blank" :href="apiUrl + '/api/v2013/index/select?q=identifier_s:'+ documentIndex.identifier">Show JSON
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div class="row" >
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    Draft Record
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <th style="width: 10px">#</th>
                                                                <th>Realm</th>
                                                                <th>Title</th>
                                                                <th>Owner</th>
                                                                <th>Government</th>
                                                                <th>Created By</th>
                                                                <th>Submitted By</th>
                                                                <th>Updated By</th>
                                                                <th></th>
                                                            </tr>
                                                            <tr v-if="!loading && identifier && hasSearched && !documentDraft">
                                                                <td colspan="9">
                                                                    <div class="alert alert-info" >                            
                                                                        <h4><i class="icon fa fa-ban"></i> Info!</h4>
                                                                        No Draft document found for {{ identifier }}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr v-if="documentDraft">
                                                                <td>#</td>
                                                                <td>{{ documentDraft.realm }}</td>
                                                                <td>
                                                                    <strong>
                                                                        <a target="_blank" :href="appDocumentUrl(documentDraft, 'draft')">
                                                                            {{documentDraft.title|lstring}} 
                                                                            <i class="fa fa-external-link"></i>
                                                                        </a>
                                                                    </strong><br/>
                                                                    <small v-html="$options.filters.lstring(documentDraft.summary, 'en')"></small>
                                                                </td>
                                                                <td> {{ countryName(documentDraft.owner.replace('country:', '') )}}</td>
                                                                <td> {{ countryName(documentDraft.metadata.government)}}</td>
                                                                <td>
                                                                    <span v-if="documentDraft.createdBy">
                                                                        {{ documentDraft.createdBy.firstName }} {{ documentDraft.createdBy.lastName }}</span><br/>
                                                                    {{ documentDraft.createdOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <span v-if="documentDraft.submittedBy">
                                                                        {{ documentDraft.submittedBy.firstName }} {{ documentDraft.submittedBy.lastName }}</span><br/>
                                                                    {{ documentDraft.submittedOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <span v-if="documentDraft.updatedBy">
                                                                        {{ documentDraft.updatedBy.firstName }} {{ documentDraft.updatedBy.lastName }}</span><br/>
                                                                    {{ documentDraft.updatedOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <button class="btn btn-primary btn-sm" 
                                                                        @click="onShowJson(documentDraft)">Show JSON
                                                                    </button>
                                                                    <button class="btn btn-danger btn-sm" :disabled="!(documentDraft.workingDocumentLock && documentDraft.workingDocumentLock.lockID && !documentDraft.failureProcessed)" 
                                                                         @click="restartWorkflow(documentDraft)" :class="{'disabled': loading}">Restart workflow
                                                                    </button>
                                                                    <button class="btn btn-danger btn-sm" :disabled="!(documentDraft.workingDocumentLock && documentDraft.workingDocumentLock.lockID && !documentDraft.failureProcessed)" 
                                                                         @click="releaseWorkflow(documentDraft)" :class="{'disabled': loading}">Release workflow
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                            <tr v-if="documentDraft && documentDraft.workingDocumentLock && documentDraft.workingDocumentLock.lockID && 
                                                                (documentDraft.failureProcessed || documentDraft.validationErrors)">
                                                                <td></td>
                                                                <td colspan="8">
                                                                    <div v-if="documentDraft.failureProcessed">
                                                                        <span v-if="documentDraft.failureProcessed.processedOn">
                                                                            Failure Processed on {{documentDraft.failureProcessed.processedOn  | formatDate('format','DD MMM YYYY HH:mm')}}<br/>
                                                                            ({{documentDraft.failureProcessed.processedBy}}) :- {{documentDraft.failureProcessed.action}}
                                                                        </span>
                                                                        <div class="alert alert-success">Workflow processed!</div>
                                                                    </div>
                                                                    <div v-if="documentDraft.validationErrors">
                                                                        <table class="table table-bordered">
                                                                            <tr style="background-color: #dd4b39;">
                                                                                <td colspan="2">The draft record has validation Errors, please modify the record on the owner clearing-house</td>
                                                                            </tr>
                                                                            <tr v-for="error in documentDraft.validationErrors">
                                                                                <td>{{error.code}}</td>
                                                                                <td>{{error.property}}</td>
                                                                            </tr>
                                                                        </table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr v-if="documentDraft && documentDraft.showJson">
                                                                <th></th>
                                                                <td colspan="8">
                                                                    <div>
                                                                        <pre style="white-space: break-spaces;">{{ documentDraft |json }}</pre>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                    </div>


                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    Document Revisions <strong v-if="documentRevisions">{{ documentRevisions.Count }}</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <th style="width: 10px">#</th>
                                                                <th>Realm</th>
                                                                <th>Title</th>
                                                                <th>Owner</th>
                                                                <th>Government</th>
                                                                <th>Created By</th>
                                                                <th>Submitted By</th>
                                                                <th>Updated By</th>
                                                                <th></th>
                                                            </tr>

                                                            <tr v-if="!loading && identifier && hasSearched && !(documentRevisions||{}).Count">
                                                                <td colspan="9">
                                                                    <div class="alert alert-info" >                            
                                                                        <h4><i class="icon fa fa-ban"></i> Info!</h4>
                                                                        No Revisions found for {{ identifier }}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <template  v-if="documentRevisions" v-for="documentRevision in (documentRevisions||{}).Items">
                                                                <tr v-if="documentRevision && documentRevision.deletedBy" class="danger">
                                                                    
                                                                    <td colspan="10">
                                                                        <strong style="margin:30%">
                                                                           Revision {{ documentRevision.revision }} was deleted by {{ documentRevision.deletedBy.firstName }} {{ documentRevision.deletedBy.lastName }} on 
                                                                             {{ documentRevision.deletedOn | formatDate }}
                                                                        </strong>
                                                                    </td>
                                                                </tr>  
                                                                <tr :class="{'danger' :  documentRevision.deletedBy}">
                                                                    <td>{{ documentRevision.revision }}</td>
                                                                    <td>{{ documentRevision.realm }}</td>
                                                                    <td>
                                                                        <strong>
                                                                            <a target="_blank" :href="appDocumentUrl(documentRevision, 'draft')">
                                                                                {{documentRevision.title|lstring}} 
                                                                                <i class="fa fa-external-link"></i>
                                                                            </a>
                                                                        </strong><br/>
                                                                        <small v-html="$options.filters.lstring(documentRevision.summary, 'en')"></small>
                                                                    </td>
                                                                    <td> {{ countryName(documentRevision.owner.replace('country:', '') )}}</td>
                                                                    <td> {{ countryName(documentRevision.metadata.government)}}</td>
                                                                    <td>
                                                                        <span v-if="documentRevision.createdBy">
                                                                            {{ documentRevision.createdBy.firstName }} {{ documentRevision.createdBy.lastName }}</span><br/>
                                                                        {{ documentRevision.createdOn | formatDate }}
                                                                    </td>
                                                                    <td>
                                                                        <span v-if="documentRevision.submittedBy">
                                                                            {{ documentRevision.submittedBy.firstName }} {{ documentRevision.submittedBy.lastName }}</span><br/>
                                                                        {{ documentRevision.submittedOn | formatDate }}
                                                                    </td>
                                                                    <td>
                                                                        <span v-if="documentRevision.updatedBy">
                                                                            {{ documentRevision.updatedBy.firstName }} {{ documentRevision.updatedBy.lastName }}</span><br/>
                                                                        {{ documentRevision.updatedOn | formatDate }}
                                                                    </td>
                                                                    <td>
                                                                        <button class="btn btn-primary" @click="onShowJson(documentRevision)">Show JSON
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                
                                                                <tr v-if="documentRevision && documentRevision.showJson"
                                                                :class="{'danger' :  documentRevision.deletedBy}">
                                                                    <th></th>
                                                                    <td colspan="9">
                                                                        <div>
                                                                            <pre style="white-space: break-spaces;">{{ documentRevision |json }}</pre>
                                                                        </div>
                                                                    </td>
                                                                </tr>  
                                                            </template>                                                   
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                    </div>


                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    Document Workflows <strong v-if="documentWorkflows">{{ documentWorkflows.length }}</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered table-hover">
                                                            <tbody>                                                            
                                                                <tr v-if="!loading && identifier && hasSearched && !(documentWorkflows||{}).length">
                                                                    <td colspan="9">
                                                                        <div class="alert alert-info" >                            
                                                                            <h4><i class="icon fa fa-ban"></i> Info!</h4>
                                                                            No Workflows found for {{ identifier }}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                            <template  v-if="documentWorkflows" v-for="workflow in documentWorkflows">
                                                                <tbody class="workflow-row">
                                                                <tr :class="{'danger' : workflow.state =='failed'}">
                                                                    <th>Workflow Id {{ workflow._id }}</th>
                                                                    <th>State</th>
                                                                    <td>
                                                                        {{workflow.state}} <strong v-if="workflow.result">({{ workflow.result.action }})</strong>
                                                                    </td>
                                                                    <th></th>
                                                                    <td></td>
                                                                </tr>
                                                                <tr :class="{'danger' : workflow.state =='failed'}">
                                                                    <th></th>
                                                                    <td colspan="4">
                                                                        <table  class="table table-bordered" v-if="workflow.state =='failed'">
                                                                            <tbody>
                                                                            <tr class="danger">
                                                                                <th colspan="6">Failure details (AWS SWF)</th>
                                                                            </tr>
                                                                            <tr class="danger">                                                    
                                                                                <th >event Id</th>           
                                                                                <th >Timestamp</th>           
                                                                                <th >Type</th>         
                                                                                <th >Parent Id</th>           
                                                                                <th >Details</th>           
                                                                                <!-- <th >Reason</th> -->
                                                                            </tr>
                                                                            <template  v-for="event in workflow.failedExecution.events">
                                                                                <tr  class="danger">
                                                                                    <td> {{event.eventId}}</td>
                                                                                    <td> {{event.eventTimestamp | formatDate}}</td>
                                                                                    <td> {{event.eventType}}</td>
                                                                                    <td> {{event.workflowExecutionFailedEventAttributes.decisionTaskCompletedEventId}}</td>
                                                                                    <td> 
                                                                                        <pre style="white-space: break-spaces;">{{JSON.parse(event.workflowExecutionFailedEventAttributes.details)}}</pre>
                                                                                        </td>
                                                                                    <!-- <td style="white-space:break-spaces"> {{event.workflowExecutionFailedEventAttributes.reason}}</td> -->
                                                                                </tr>
                                                                                <tr  class="danger">
                                                                                    <td></td>
                                                                                    <td colspan="4">
                                                                                        {{event.workflowExecutionFailedEventAttributes.reason}}
                                                                                    </td>
                                                                                </tr>
                                                                            </template>
                                                                        </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th></th>
                                                                    <th>Title</th>
                                                                    <td colspan="4">
                                                                        <strong>
                                                                            <a target="_blank">
                                                                                {{workflow.data.title|lstring}} 
                                                                                <i class="fa fa-external-link"></i>
                                                                            </a>
                                                                        </strong><br/>
                                                                        <small v-html="$options.filters.lstring(workflow.data.abstract, 'en')"></small>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th></th>
                                                                    <th >Realm</th><td>{{workflow.data.realm}}</td>
                                                                    <th >Identifier</th>
                                                                    <td>
                                                                        <a target="_blank" :href="'https://api.cbd.int/api/v2013/documents/'+workflow.data.identifier">{{workflow.data.identifier}}</a> 
                                                                        ({{workflow.data.documentID}})
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <th></th>
                                                                    <th>Schema</th><td>{{workflow.data.metadata.schema}}</td>
                                                                    <th>Workflow Id</th><td>{{workflow._id}}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th></th>
                                                                    <th>Type</th><td>{{workflow.type.name}}</td>
                                                                    <th>Version</th><td>{{workflow.type.version}}</td>
                                                                </tr>
                                                                <tr><th></th>
                                                                    <th>Created</th><td>
                                                                        <span v-if="workflow.createdBy_info">
                                                                            {{ workflow.createdBy_info.firstName }} {{ workflow.createdBy_info.lastName }}
                                                                        </span><br/>
                                                                        {{workflow.createdOn}} ({{workflow.createdBy}})
                                                                    </td>
                                                                    <th>Closed</th><td>
                                                                        {{workflow.closedOn}} ({{workflow.closedBy}}){{ workflow.closedOn_info }}
                                                                        <br/>{{ workflow.closeReason }}
                                                                    </td>
                                                                </tr>
                                                                <tr v-if="(workflow.failedExecution||{}).lockInfo">
                                                                    <th></th>
                                                                    <th>Lock Id</th><td>{{workflow.failedExecution.lockInfo.lockID}} ({{workflow.failedExecution.lockInfo.lockedOn}})</td>
                                                                    <th>locked By</th>
                                                                    <td>
                                                                    {{workflow.failedExecution.lockInfo.lockedBy.firstName}} {{workflow.failedExecution.lockInfo.lockedBy.lastName  }}
                                                                    ({{workflow.failedExecution.lockInfo.lockedBy.email}})</td>
                                                                </tr>
                                                                <tr>
                                                                    <th></th>
                                                                    <td colspan="4">
                                                                        <button class="btn btn-primary" @click="onShowActivities(workflow)">Activities
                                                                            <strong>{{ (workflow.activities||{}).length }}</strong>
                                                                        </button>
                                                                        <button class="btn btn-primary" @click="onShowJson(workflow)">Show JSON
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                                <tr v-if="workflow.showJson">
                                                                    <th></th>
                                                                    <td colspan="4">
                                                                        <div>
                                                                            <pre style="white-space: break-spaces;">{{ workflow |json }}</pre>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr v-if="workflow.showActivities">
                                                                    <th></th>
                                                                    <td colspan="4">
                                                                        <table class="table table-bordered">
                                                                            <tr>               
                                                                                <th>Type</th>   
                                                                                <th>Result</th>                                                       
                                                                                <th>Created</th>
                                                                                <th>Assigned To</th>           
                                                                                <th>Closed</th>           
                                                                                <th>Canceled</th>
                                                                            </tr>
                                                                            <template v-for="activity in workflow.activities">
                                                                                <tbody>
                                                                                    <tr :class="{'danger' : activity.timedOutOn }">
                                                                                        <td>{{ activity.name }} 
                                                                                            <strong v-if="activity.timedOutOn">(Timed out : {{ activity.timedOutOn }})</strong>
                                                                                            <br/>
                                                                                            {{ activity._id }}
                                                                                        </td>
                                                                                        <td>
                                                                                            <span v-if="activity.result">
                                                                                                {{ activity.result.action }}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>
                                                                                            <span v-if=" workflow.createdBy_info">
                                                                                            {{ workflow.createdBy_info.firstName }} {{ workflow.createdBy_info.lastName }}</span><br/>
                                                                                            {{activity.createdOn}} ({{activity.createdBy}})
                                                                                        </td>
                                                                                        <td>
                                                                                            <strong>{{ activity.assignedToRule }}</strong>
                                                                                            <ul class="list">
                                                                                                <li v-for="assigned in activity.assignedTo_info">{{ assigned.firstName }} {{ assigned.lastName }}</li>
                                                                                            </ul>
                                                                                        </td>
                                                                                        <td> 
                                                                                            <span v-if="activity.closedOn">
                                                                                                <span v-if="activity.closedBy_info">{{ activity.closedBy_info.firstName }} {{ activity.closedBy_info.lastName }} ({{activity.closedBy}})<br/></span>
                                                                                                {{activity.closedOn}}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td> 
                                                                                            <span v-if="workflow.canceledBy_info">
                                                                                                {{ workflow.canceledBy_info.firstName }} {{ workflow.canceledBy_info.lastName }}<br/>
                                                                                                {{activity.canceledOn}} ({{activity.canceledBy}}) 
                                                                                            </span>
                                                                                        </td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </template>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </template>                                                          
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </section>

</template>

<script>
import   Multiselect         from 'vue-multiselect'
import realmConfigurationAPI from '~/services/api/realm-configuration';
import CountriesAPI          from '~/services/api/countries';
import KMDocumentsAPI        from '~/services/api/km-documents';
import KMWorkflowsAPI        from '~/services/api/km-workflows';
import SolrIndexAPI          from '~/services/api/solr-index';
import { lstring, formatDate } from '~/services/filters'
import paginate              from '../../components/vue/pagination.vue';
import { isRealm, sleep }           from '~/services/utils'


const realmConfApi    = new realmConfigurationAPI();
const countriesAPI    = new CountriesAPI();
const kmDocumentsAPI  = new KMDocumentsAPI();
const kmWorkflowsAPI  = new KMWorkflowsAPI();
const solrIndexAPI    = new SolrIndexAPI();

export default {
    components : {
        Multiselect,
        paginate
    },
    filters:{
        formatDate,
        lstring
    },
    data(){
        return {
            identifier : undefined,
            realms   : undefined,
            countries : undefined,
            document : undefined,
            documentDraft : undefined,
            documentRevisions : undefined,
            documentIndex : undefined,
            documentWorkflows : undefined,
            loading     : false,
            error       : undefined
        }
    },
    async mounted(){        
        this.realms = await realmConfApi.queryRealmConfigurations();
        this.countries = await countriesAPI.queryCountries();

        if(this.$route?.params?.identifier){
            this.identifier = this.$route.params.identifier;
            this.showHistory();
        }
    },
    computed:{
        apiUrl(){
            return window.scbd.apiUrl;
        },
        hasSearched(){
            return this.identifier == this.$route.params.identifier;
        }
    },
    methods : {        
        onReset(){
            this.identifier = undefined;
            this.document  = undefined;
            this.documentDraft  = undefined;
            this.documentRevisions  = undefined;
            this.documentIndex  = undefined;
            this.documentWorkflows  = undefined;
            this.loading      = false;
            this.error        = undefined;

            this.$router.push({
                path: `clearing-house/records/history`
            });
        },
        async showHistory(){
            try{
                if(!this.identifier)
                    return;

                this.$router.push({
                    path: `clearing-house/records/history/${this.identifier}`
                });

                this.document = undefined;
                this.error = undefined;
                this.loading = true
                const documentUidRegex = /^(?:[a-z]+(?:-dev|trg)?)-(?:[a-z]+)-(?:[a-z]+)-([0-9]+)(?:-[0-9]+)?$/i
                const documentId = this.identifier.match(documentUidRegex);

                let identifierToSearch = this.identifier;
                const mongoQuery = { $or : [{"data.identifier" : this.identifier} ]};
                const solrQuery = {
                    query : `identifier_s:${this.identifier}`, 
                    fields: 'realm:realm_ss,identifier:identifier_s,type:schema_s,title:title_EN_t, summary:summary_EN_t, createdOn:createdDate_dt, updatedOn:updatedDate_dt, owner:_ownership_s,'+
                        'uniqueIdentifier_s,submittedOn:submittedDate_dt, createdBy:createdBy_s, updatedBy:updatedBy_s,submittedBy:submittedBy_s, government:government_EN_s, indexedOn:indexedDate_dt'
                }

                if((documentId?.length && Number.isInteger(Number(documentId[1]))) || 
                    Number.isInteger(Number(this.identifier))){

                    identifierToSearch = Number(documentId&&documentId[1]||this.identifier);
                    solrQuery.query = `_documentId_i:${identifierToSearch}`;
                    mongoQuery.$or = [{"data.documentID": identifierToSearch||''}]
                    
                }   

                const queries = [
                    kmDocumentsAPI.getDocumentById(identifierToSearch).catch(e=>console.log(e)),
                    kmDocumentsAPI.getDocumentRevisions(identifierToSearch).catch(e=>console.log(e)),
                    kmWorkflowsAPI.getWorkflowHistory({q : mongoQuery}).catch(e=>console.log(e)),
                    solrIndexAPI.querySolr(solrQuery).catch(e=>console.log(e)),
                ];

                const result = await Promise.all(queries);

                this.document = result[0];
                this.documentRevisions = result[1]
                this.documentWorkflows = result[2]
                this.documentIndex     = result[3]?.response?.docs[0];

                this.documentDraft = await kmDocumentsAPI.getDocumentDraftById(this.document?.identifier || identifierToSearch).catch(e=>console.log(e))
                
            }
            catch(e){
                this.error = e;
            }
            finally{
                this.loading = false;
            }
        },
        appDocumentUrl(document, recordType){

            let realm = {};
            const documentRealm = document.realm||document.Realm;

            if(documentRealm){
                
                if(Array.isArray(documentRealm)){
                    realm = this.realms.find(e=>documentRealm.includes(e.realm.toUpperCase()));
                }
                else 
                    realm = this.realms.find(e=>e.realm == documentRealm.toUpperCase());

                if(isRealm('ABS', realm.realm) || isRealm('BCH', realm.realm)){
                    
                    if(recordType == 'drafts')
                        return `${realm.baseURL}/register/${realm.schemas[document.type].shortCode}/${document.identifier}/edit`

                    return `${realm.baseURL}/register/${realm.schemas[document.type].shortCode}/${document.identifier}/view`
                }
            }

            return realm.baseURL + '/database/' + document.identifier;
        },
        onShowActivities(workflow){
            this.$set(workflow, 'showActivities', !workflow.showActivities);
        },
        onShowJson(workflow){
            this.$set(workflow, 'showJson', !workflow.showJson);           
        },
        countryName(code){
            if(!code || !this.countries?.length)
                return;

            return this.countries.find(e=>e.code == code.toUpperCase())?.name?.en;
        },
        async startNewWorkflow(documentDraft){
            
            try{
                this.$set(documentDraft, 'validationErrors', undefined);
                this.$set(documentDraft, 'failureProcessed', undefined);
                this.loading=true;

                const response = await kmWorkflowsAPI.startNewWorkflow(documentDraft?.workingDocumentLock?.lockID.replace('workflow-', ''), documentDraft?.realm)
            
                if(response?.errors){
                    this.$set(documentDraft, 'validationErrors', response.errors);
                }
                else{
                    this.$set(documentDraft, 'failureProcessed',  response)
                }
            }
            catch(err){
                console.log(err)
                this.errors.push(err)
                this.showError(err);
            }
            finally{
                this.loading=false;
            }
        },
        async restartWorkflow(documentDraft){
            console.log(documentDraft)
            if(!documentDraft?.workingDocumentLock)
                return;

            if(confirm('Are you sure you want to restart the workflow?')){
                await this.startNewWorkflow(documentDraft)
                alert('Workflow restarted!!');
                this.showHistory();
            }
        },
        async releaseWorkflow(documentDraft){
            
            try{
                if(confirm('Are you sure you want to release the lock?')){
             
                    this.$set(documentDraft, 'validationErrors', undefined);
                    this.$set(documentDraft, 'failureProcessed', undefined);
                    this.loading=true;

                    await kmWorkflowsAPI.releaseWorkflow(documentDraft?.workingDocumentLock?.lockID.replace('workflow-', ''), documentDraft?.realm);
                    alert('Workflow released!!');
                    this.showHistory();
                }
            }
            catch(err){
                console.log(err)
                this.errors.push(err)
                this.showError(err);
            }
            finally{
                this.loading=false;
            }
        },
        async reindexRecord(document){
            try{
                if(confirm('Are you sure you want to re-index this record?')){
             
                    this.loading=true;

                    const solrResponse = await kmDocumentsAPI.reIndex(document.type, document.identifier);

                    if (solrResponse?.status == 200) {  
                        await sleep(1000)
                        alert('Re-indexing successful! please give few seconds before reloading the information.', 'success');
                        this.showHistory();
                    } else {
                        throw new Error('Re-indexing failed');
                    }
                }
            }
            catch(err){
                console.log(err)
                this.errors.push(err)
                this.showError(err);
            }
            finally{
                this.loading=false;
            }
        }
    }
}
</script>

<style>
.workflow-row:hover{
    background-color: #eee;
    border:2px solid #021e5b;
    box-shadow: 0px 0px 25px #021e5b;
    padding:5px;
}
</style>