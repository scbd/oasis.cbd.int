<template>
    <section class="content">

        <div class="row">

            <div class="col-md-12">
                <div class="container" style="width:100%" id="articlesContainer">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="box box-default">
                                <div class="box-header with-border">
                                    <h3 class="box-title">Clearing-House Management</h3>
                                </div>
                                <div class="box-body">
                                    <div class="row">
                                        <div class="col-md-3 col-sm-6 col-xs-12">
                                            <a href="clearing-house/records">
                                                <div class="info-box bg-aqua">
                                                    <span class="info-box-icon"><i class="fa fa-list-ol"></i></span>
                                                    <div class="info-box-content">
                                                        <span class="info-box-text">Records</span>
                                                        <span class="info-box-number">&nbsp;</span>
                                                        <div class="progress">
                                                            <div class="progress-bar" style="width: 100%"></div>
                                                        </div>
                                                        <span class="progress-description">
                                                            View all Clearing-House records
                                                        </span>
                                                    </div>

                                                </div>
                                            </a>

                                        </div>

                                        <div class="col-md-3 col-sm-6 col-xs-12">
                                            <a href="clearing-house/records/history">
                                                <div class="info-box bg-green">
                                                    <span class="info-box-icon"><i class="fa fa-history"></i></span>
                                                    <div class="info-box-content">
                                                        <span class="info-box-text">Record History</span>
                                                        <span class="info-box-number">&nbsp;</span>
                                                        <div class="progress">
                                                            <div class="progress-bar" style="width: 100%"></div>
                                                        </div>
                                                        <span class="progress-description">
                                                            View all record history
                                                        </span>
                                                    </div>

                                                </div>
                                            </a>
                                        </div>

                                        <div class="col-md-3 col-sm-6 col-xs-12">
                                            <a href="clearing-house/records/failed-workflows">
                                                <div class="info-box bg-yellow">
                                                    <span class="info-box-icon"><i class="fa fa-hourglass"></i></span>
                                                    <div class="info-box-content">
                                                        <span class="info-box-text">Failed Workflows</span>
                                                        <span class="info-box-number">&nbsp;</span>
                                                        <div class="progress">
                                                            <div class="progress-bar" style="width: 100%"></div>
                                                        </div>
                                                        <span class="progress-description">
                                                            View all failed workflows
                                                        </span>
                                                    </div>

                                                </div>
                                            </a>

                                        </div>


                                    </div>
                                </div>
                                <div class="box-footer">

                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <div class="box">
                                <div class="box-header with-border">
                                    <div class="form-group">
                                        <label>Environment</label>
                                        <multiselect v-model="environment" :options="environments" :close-on-select="true" 
                                            label="title" placeholder="select Environment" @select="onEnvironmentSelect">
                                        </multiselect>
                                    </div>
                                    <h3 class="box-title">Realms</h3>
                                    <a v-if="environment && environment.key" class="pull-right btn btn-primary" :href="`/clearing-house/realms/${environment.key}/list`">
                                        View realm (list)
                                    </a>
                                </div>

                                <div class="box-body">

                                    <div class="row">
                                        <div class="col-md-4" v-for="realm in environmentRealms" :key="realm.id">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <a :href="realm.baseURL">
                                                        <h3 class="box-title">
                                                                {{realm.displayName}} ({{ realm.realm }})                                                        
                                                        </h3>
                                                        <i class="fa fa-external-link"></i>
                                                    </a>
                                                    <roles-status :admin-roles="realm.roles.administrator"></roles-status>
                                                </div>

                                                <div class="box-body">
                                                    <a class="pull-right btn btn-primary" :href="`/clearing-house/realms/${environment.key}/${encodeURIComponent(realm.hosts[0])}`">
                                                        View realm details
                                                    </a>
                                                    <table class="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <th style="width: 10px">#</th>
                                                                <th>Schema</th>
                                                                <th>Type</th>
                                                            </tr>
                                                            <tr v-for="(schema, name, index) in realm.schemas" :key="index">
                                                                <td>{{index+1}}</td>
                                                                <td>
                                                                    <a :href="'clearing-house/records/' + environment.key + '/' +realm.realm + '/' + name">{{schema.title.en}} ({{ name }})</a>
                                                                </td>
                                                                <td>{{ schema.type }}</td>
                                                            </tr>
                                                            
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div class="box-footer clearfix">
                                                    
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
import realmConfigurationAPI from '~/services/api/realm-configuration';
import Multiselect from 'vue-multiselect';
import environmentsData from '../../app-data/environments.json';
import rolesStatus from '../shared/roles-status.vue';
const isProduction = /\.cbd\.int$/i.test(window.scbd.apiHost);

export default {
    components : {
        Multiselect,
        rolesStatus
    },
    data(){
        return {
            realmConfigurations : [],
            environment:undefined
        }
    },
    computed :{
        environmentRealms(){
            return this.realmConfigurations?.filter(e => e.environment === this.environment?.key)
        },
        environments() {
            return environmentsData.filter(e => 
                isProduction ? e.key !== 'development' : e.key === 'development'
            );
        }
    },
    async mounted(){
        const realmConfApi = new realmConfigurationAPI();

        this.realmConfigurations = await realmConfApi.queryRealmConfigurations();

        if(this.$route?.params?.environment)
            this.environment = this.environments.find(e=>e.key == this.$route?.params?.environment);
        else
            this.environment = this.environments[0];
    },
    methods : {
        onEnvironmentSelect(selected){
            this.environment = {
                        "key": selected.key,
                        "title": selected.title
                    }
            this.$router.push({
                path: `clearing-house/realms/${selected?.key}`
            });
        }

    }
}
</script>

<style></style>