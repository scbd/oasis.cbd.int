<template lang="">
    <section class="content">

        <div class="row">

            <div class="col-md-12">
                <div class="container" style="width:100%" id="articlesContainer">
                    
                    <div class="row">
                        <div class="col-md-12">
                            
                            <div class="box">
                                <div class="box-header with-border">
                                    <h3 class="box-title">
                                        Trados Projects 
                                        <span v-if="projectsCount">({{ projectsCount }})</span>
                                    </h3>
                                    <a :href="`${baseUrl}translation/trados-projects/new`" class="pull-right btn btn-primary btn-sm">
                                        New Trados Project 
                                        <i class="fa fa-plus"></i>  
                                    </a>
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
                                    <div class="row" v-if="toastMessage.text!=''">
                                        <div class="col-md-12">
                                            <h3 :class="`text-${toastMessage.color}`">{{ toastMessage.text }}</h3>
                                        </div>
                                    </div>

                                    <div class="row" v-if="loading">
                                        <div class="col-md-12" style="margin:5px">
                                        <i class="fa fa-cog fa-spin fa-lg" style="margin-left: 50%;"></i> loading...</div>
                                    </div>
                                    <div class="row" v-if="projects && projects.length==0">
                                        <div class="col-md-12">
                                        No Records found</div>
                                    </div>
                                    
                                    <div class="row" v-if="projects && projects.length">
                                        <div class="col-md-12">
                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <th style="width: 10px">#</th>
                                                                <th>Name</th>
                                                                <th>Application</th>
                                                                <th>Target languages</th>
                                                                <th>File count</th>
                                                                <th>Status</th>
                                                                <th>Update on</th>
                                                                <th></th>
                                                            </tr>
                                                            <tr v-for="(document, index) in projects">
                                                                <td>{{index+1}}</td>
                                                                <td>{{ document.name }}</td>
                                                                <td>{{ document.application }}</td>
                                                                <td>
                                                                    {{document.targetLocales ? document.targetLocales.join(', ') : 'none'}}  
                                                                </td>
                                                                <td>
                                                                    {{ document.sourceFileUrls ? document.sourceFileUrls.length : 0 }}
                                                                </td>
                                                                <td>{{ document.status }}</td>
                                                                <td>
                                                                    <!-- <a :href="`https://accounts.cbd.int/admin/users/${encodeURIComponent(document.updatedBy.userID)}`" target="_blank">
                                                                        {{ document.updatedBy.firstName }} {{ document.updatedBy.lastName }}
                                                                    </a>
                                                                    </br> -->
                                                                    {{ document.updatedOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <a :href="`${baseUrl}translation/trados-projects/${document._id}`">
                                                                        View Project
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div class="box-footer clearfix">
                                                    <!-- <paginate :records-per-page="result.recordsPerPage" :record-count="result.count" @changePage="onChangePage"
                                                        :current-page="result.pageNumber"></paginate> -->
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

import translationProject from '~/components/vue/translation-project.vue';
import { getProjects } from '~/api/translation-project';
import { formatDate } from '~/services/filters'
export default {
    components : {
        translationProject,
        formatDate
    },
    filters:{        
    },
    data(){
        return {
            baseUrl: window.baseUrl,
            projects : [],
            projectsCount: 0,
            toastMessage: {
                text: '',
                color: 'success'
            },
            loading: false,
            error: null
        }
    },
    methods: {
        async fetchProjects() {
            this.loading = true;
            try {
                const response = await getProjects(undefined, {  
                        token:this.$auth.strategy?.token?.get(),
                        length: 25, skip: 0, 
                        sort:{"meta.updatedOn":-1},
                    });
                
                this.projects = response.body;
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        }
    },
    mounted() {
        this.fetchProjects();
    }
}

</script>
<style lang="">
    
</style>