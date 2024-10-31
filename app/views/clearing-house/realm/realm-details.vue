<template>
    <section class="content">
        <div class="row">
            <div class="col-md-12">
                <div class="container" id="articlesContainer">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="box">
                                <div class="box-header with-border">
                                    <h3 class="box-title">
                                        <strong> {{ realmDetails.realm }} Details </strong>
                                    </h3>
                                </div>

                                <div class="box-body">
                                    <div class="row" v-if="error">
                                        <div class="col-md-12">
                                            <div class="alert alert-danger alert-dismissible">
                                                <h4><i class="icon fa fa-ban"></i> Error!</h4>
                                                {{ error }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row" v-if="loading">
                                        <div class="col-md-12 text-center" style="margin:5px">
                                            <i class="fa fa-cog fa-spin fa-lg"></i> loading...
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <strong>Hosts info</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Protocol</th>
                                                                <th>UId prefix</th>
                                                                <th>Display name</th>
                                                                <th>Hosts</th>
                                                                <th>Email</th>
                                                                <th>Base URL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{{ realmDetails.protocol }}</td>
                                                                <td>{{ realmDetails.uIdPrefix }}</td>
                                                                <td>{{ realmDetails.displayName }}</td>
                                                                <td>
                                                                    <span v-for="(host, index) in realmDetails.hosts" :key="index">{{ host }}<br></span>
                                                                </td>
                                                                <td>{{ realmDetails.email }}</td>
                                                                <td>{{ realmDetails.baseURL }}</td>
                                                                
                                                            </tr>

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- <section Roles -->
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <strong>Roles</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Roles</th>
                                                                <th>Admin roles</th>
                                                                <th>NFP roles</th>
                                                                
                                                                
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <div v-for="(roles, roleName) in realmDetails.roles" :key="roleName">
                                                                        <strong>{{ camelCaseToUpperCase(roleName) }}:</strong>
                                                                        <ul>
                                                                            <li v-for="(role, index) in roles" :key="index"><a target="_blank" :href="`https://accounts.cbd.int/admin/users?role=${getUserRoleId(role)}`"> {{ getUserRoleNames(role) }} ({{ role }})</a></li>
                                                                        </ul>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span v-for="(role, index) in realmDetails.adminRoles" :key="index"><a target="_blank" :href="`https://accounts.cbd.int/admin/users?role=${getUserRoleId(role)}`"> {{ getUserRoleNames(role) }} ({{ role }})</a><br></span>
                                                                </td>
                                                                <td>
                                                                    <span v-for="(role, index) in realmDetails.nfpRoles" :key="index"><a target="_blank" :href="`https://accounts.cbd.int/admin/users?role=${getUserRoleId(role)}`"> {{ getUserRoleNames(role) }} ({{ role }})</a><br></span>
                                                                </td>
                                                                
                                                                
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                <!-- <section Schemas -->
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <strong>Schemas</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Schema</th>
                                                                <th>Title</th>
                                                                <th>Type</th>
                                                                <th>Short Code</th>
                                                                <th>Disable new</th>
                                                                <th>Roles</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="(schema, key) in realmDetails.schemas" :key="key">
                                                                <td>
                                                                    <a :href="'clearing-house/records/'+ environment +'/' + realmDetails.realm + '/' + key">{{ key }}</a>
                                                                    </td>
                                                                <td>
                                                                    {{ schema.title.en }}<br>
                                                                    <span v-if="schema.titlePlural"><strong>Title Plural:</strong> {{ schema.titlePlural.en }}</span>
                                                                </td>
                                                                <td>{{ schema.type }}</td>
                                                                <td>{{ schema.shortCode }}</td>
                                                                <td>{{ schema.disableAdd }}</td>
                                                                <td>
                                                                    
                                                                    <div  v-if="schema.publishingAuthorities">
                                                                        <strong>Publishing Authorities: </strong>
                                                                        <ul>
                                                                            <li v-for="(role, index) in schema.publishingAuthorities" :key="index"><a target="_blank" :href="`https://accounts.cbd.int/admin/users?role=${getUserRoleId(role)}`"> {{ getUserRoleNames(role) }} ({{ role }})</a></li>
                                                                        </ul>
                                                                    </div>
                                                                    <div  v-if="schema.nationalAuthorizedUser">
                                                                        <strong>NAU: </strong>
                                                                        <ul>
                                                                            <li v-for="(role, index) in schema.nationalAuthorizedUser" :key="index"><a target="_blank" :href="`https://accounts.cbd.int/admin/users?role=${getUserRoleId(role)}`"> {{ getUserRoleNames(role) }} ({{ role }})</a></li>
                                                                        </ul>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- <section PDF -->
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <strong>PDF</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Type</th>
                                                                <th>File name</th>
                                                                <th>Path</th>
                                                                <th>S3</th>
                                                                <th>Use PrincePDF</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="(schema, key) in realmDetails.pdf" :key="key">
                                                                <td>{{ key }}</td>
                                                                <td>{{ schema.fileName }}</td>
                                                                <td>{{ schema.path }}</td>
                                                                <td>{{ schema.s3 ? (schema.s3.bucket + '/' + schema.s3.folder) : '' }}</td>
                                                                <td>{{ schema.usePrincePdf }}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                     <!-- <section PDF -->
                                    <div class="row" v-if="realmDetails.externalNotification">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <strong>External notification</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Organization</th>
                                                                <th>Email</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr v-for="(schema, key) in realmDetails.externalNotification" :key="key">
                                                                <td>{{ key }}</td>
                                                                <td>{{ schema.join(', ') }}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- <section Notification/Env message-->
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <strong>Notification/Env message</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Notification template folder</th>
                                                                <th>Env message</th>
                                                                
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{{ realmDetails.notificationTemplateFolder }}</td>
                                                                <td>{{ realmDetails.envMsg }}</td>                                                                
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- <section Show JSON start-->
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <button class="btn btn-primary" @click="toggleShowJson" style="color:white !important;">
                                                        {{ showJson ? 'Hide JSON' : 'Show JSON' }}
                                                    </button>
                                                </div>
                                                <div class="box-body">
                                                    <table class="table table-bordered">  
                                                        <tbody>
                                                            <tr v-if="showJson">
                                                                <td>
                                                                    <pre style="white-space: break-spaces;">{{ realmDetails }}</pre>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- <section Show JSON End-->
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
import UserRolesApi from '~/services/api/user-roles';


const realmConfApi = new realmConfigurationAPI();
const userRolesApi = new UserRolesApi();

export default {
    data() {
        return {
            realmDetails: [],
            userRoleNames: undefined,
            loading: false,
            error: undefined,
            showJson: false
        };
    },
    async mounted() {
        this.loading = true;
        try {
            this.realmDetails = await realmConfApi.getRealmConfigurationByHost(this.$route.params.realm);
            this.userRoleNames = await userRolesApi.getUserRoleNames([...new Set(this.roleCodes)]); 

        } catch (err) {
            this.error = err.message || 'Failed to load realms';
        } finally {
            this.loading = false;
        }
    },
    computed : {
        roleCodes () {
            return [...(this.realmDetails.adminRoles || []),...(this.realmDetails.nfpRoles || []),...Object.values(this.realmDetails.roles || {}).flat()];
        },
        environment(){
            return this.$route?.params?.environment;
        }
    },
    methods :{
        toggleShowJson() {
            this.showJson = !this.showJson;
        },
        camelCaseToUpperCase(str) {
            return str.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
        },
        getUserRoleNames (roleCode){
            const userRole = this.userRoleNames?.find(role => role.code === roleCode);
            return userRole ? userRole.name : roleCode;
        },
        getUserRoleId (roleCode){
            const userRole = this.userRoleNames?.find(role => role.code === roleCode);
            return userRole ? userRole.roleId : roleCode;
        }
    }
};
</script>

<style scoped>
#articlesContainer {
    width: 100%;
}

.text-center {
    text-align: center;
}
</style>
