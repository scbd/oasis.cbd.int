<template>
    <section class="content">

        <div class="row">

            <div class="col-md-12">
                <div class="container" style="width:100%" id="articlesContainer">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="box box-default">
                                <div class="box-header with-border">
                                    <h3 class="box-title">Search</h3>
                                </div>
                                <div class="box-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Clearing-House</label>
                                                <multiselect v-model="search.realm" :options="realms" :close-on-select="true" 
                                                    label="displayName" placeholder="select Clearing-House" @select="onRealmSelect">
                                                </multiselect>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Schema</label>
                                                <multiselect v-model="search.schema" :options="searchSchemas" :close-on-select="true"
                                                    label="displayTitle" track-by="displayTitle" placeholder="select Realm Schema" :disabled="!search.realm"  @select="onSchemaSelect">
                                                    <template slot="singleLabel"  slot-scope="props">
                                                        <small><b>{{ props.option.type }}</b></small> : 
                                                        {{ (props.option.titlePlural|| props.option.title).en }} ({{ props.option.shortCode }})                                                        
                                                    </template>
                                                    <template slot="option" slot-scope="props">
                                                        <small><b>{{ props.option.type }}</b></small> : 
                                                        {{ (props.option.titlePlural|| props.option.title).en }} ({{ props.option.shortCode }})                                                        
                                                    </template>
                                                </multiselect>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Country</label>
                                                <multiselect v-model="search.government" :options="countries" :close-on-select="true" 
                                                    label="displayTitle" track-by="displayTitle" placeholder="select Government":disabled="!search.realm" @select="onCountrySelect">
                                                </multiselect>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div class="box-footer">
                                    <button class="btn btn-sm btn-primary" :class="{ 'btn-success' :search.recordType=='drafts'}"    @click="loadDocuments('drafts')">Show Drafts</button>
                                    <button class="btn btn-sm btn-primary" :class="{ 'btn-success' :search.recordType=='published'}" @click="loadDocuments('published')">Show Published</button>                                    
                                    <button class="btn btn-sm btn-primary" :class="{ 'btn-success' :search.recordType=='requests'}"  @click="loadDocuments('requests')">Show Requested</button>                               
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
                                        <strong>{{ search.recordType }} </strong>
                                         records
                                         <span v-if="search.realm">
                                            from 
                                            <strong><a :href="`clearing-house/realms/${encodeURIComponent(search.realm.hosts[0])}`">{{ search.realm.displayName }}</a></strong>
                                            <span v-if="search.schema"> 
                                                for <strong>{{ search.schema.title.en }}</strong>
                                            </span>
                                        </span>
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
                                    <div class="row" v-if="result.documents && result.documents.length==0">
                                        <div class="col-md-12">
                                        No Records found</div>
                                    </div>
                                    <div class="row" v-if="result.documents && result.documents.length">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <a :href="search.realm.baseURL + '/register/'+ search.schema.shortCode">
                                                        <h3 class="box-title">
                                                            {{ (search.schema.titlePlural || search.schema.title).en }}                                                    
                                                        </h3>
                                                        <i class="fa fa-external-link"></i>
                                                    </a>
                                                    <strong class="pull-right">Total {{ search.recordType }} : {{ result.count }}</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <tbody>
                                                            <tr>
                                                                <th style="width: 10px">#</th>
                                                                <th>Title</th>
                                                                <!-- <th>Summary</th> -->
                                                                <th>Owner</th>
                                                                <th>Government</th>
                                                                <th>Created By</th>
                                                                <th>Submitted By</th>
                                                                <th>Updated By</th>
                                                                <th></th>
                                                            </tr>
                                                            <tr v-for="(document, index) in result.documents">
                                                                <td>{{index+1}}</td>
                                                                <td>
                                                                    <strong>
                                                                        <a target="_blank" :href="appDocumentUrl(search.realm, document)">
                                                                            {{document.title|lstring}} 
                                                                            <i class="fa fa-external-link"></i>
                                                                        </a>
                                                                    </strong></br>
                                                                    <small v-html="$options.filters.lstring(document.summary, 'en')"></small>
                                                                </td>
                                                                <td> {{ ownerName(document.owner)}}</td>
                                                                <td> {{ countryName(document.metadata.government)}}</td>
                                                                <td>
                                                                    <a :href="`https://accounts.cbd.int/admin/users/${encodeURIComponent(document.createdBy.userID)}`" target="_blank">
                                                                        {{ document.createdBy.firstName }} {{ document.createdBy.lastName }}
                                                                    </a>
                                                                    </br>
                                                                    {{ document.createdOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <a :href="`https://accounts.cbd.int/admin/users/${encodeURIComponent(document.createdBy.userID)}`" target="_blank">
                                                                        {{ document.submittedBy.firstName }} {{ document.submittedBy.lastName }}
                                                                    </a>
                                                                    </br>
                                                                    {{ document.submittedOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <a :href="`https://accounts.cbd.int/admin/users/${encodeURIComponent(document.createdBy.userID)}`" target="_blank">
                                                                        {{ document.updatedBy.firstName }} {{ document.updatedBy.lastName }}
                                                                    </a>
                                                                    </br>
                                                                    {{ document.updatedOn | formatDate }}
                                                                </td>
                                                                <td>
                                                                    <a target="_blank" :href="'clearing-house/records/history/'+ document.identifier">Record history
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div class="box-footer clearfix">
                                                    <paginate :records-per-page="result.recordsPerPage" :record-count="result.count" @changePage="onChangePage"
                                                        :current-page="result.pageNumber"></paginate>
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
import { lstring, formatDate } from '~/services/filters'
import paginate              from '../../components/vue/pagination.vue';
import { isRealm }           from '~/services/utils'

const realmConfApi    = new realmConfigurationAPI();
const countriesAPI    = new CountriesAPI();
const kmDocumentsAPI  = new KMDocumentsAPI();

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
            search : {
                realm : undefined,
                schema: undefined,
                country: undefined,
                recordType : 'published' // Draft, public, request
            },
            realms : [],
            searchSchemas : [],
            countries : [],
            result    : {
                documents   : {},
                pageNumber: 1,
                recordsPerPage: 25,
            },            
            loading     : false,
            error       : undefined
        }
    },
    async mounted(){
        this.realms = await realmConfApi.queryRealmConfigurations();
        const countries = await countriesAPI.queryCountries();
        this.countries = countries.map(e=>{
            e.displayTitle = e.name.en
            return e;
        });

        if(this.$route?.params?.realm){
            this.search.realm  = this.realms.find(e=>e.realm == this.$route.params.realm);
            this.onRealmSelect(this.search.realm);

            if(this.$route.params.schema){
                this.search.schema = this.searchSchemas.find(e=>e.key == this.$route.params.schema);
            }
            this.loadDocuments('published');
        }
    },
    methods : {
        onRealmSelect(selected){
            this.search.schema = undefined;
            
            let schemas =[];
            for (const schema in selected.schemas) {
                if (Object.hasOwnProperty.call(selected.schemas, schema)) {
                    
                    let displayTitle = lstring(selected.schemas[schema].titlePlural, 'en');
                    if(!displayTitle)
                        displayTitle = lstring(selected.schemas[schema].title, 'en');
                    
                    displayTitle += ` (${selected.schemas[schema].shortCode||''})`;

                    schemas.push({key:schema, ...selected.schemas[schema], displayTitle });            
                }
            }
            this.searchSchemas = schemas
            
            this.result    = {
                documents       : {},
                pageNumber      : 1,
                recordsPerPage  : 25,
            };
            this.error = undefined;
        },
        onCountrySelect(){
            
            this.result    = {
                documents       : {},
                pageNumber      : 1,
                recordsPerPage  : 25,
            };
            this.error = undefined;
        },
        onSchemaSelect(){
            
            this.result    = {
                documents       : {},
                pageNumber      : 1,
                recordsPerPage  : 25,
            };
            this.error = undefined;
        },
        onReset(){
            this.search.realm = undefined;
            this.search.schema = undefined;
            this.search.country = undefined;
            this.search.recordType = undefined;
            this.searchSchemas = []
            this.result    = {
                documents       : {},
                pageNumber      : 1,
                recordsPerPage  : 25,
            };
            this.error = undefined;
        },
        onChangePage(pageNumber){
            this.result.pageNumber = pageNumber;
            this.loadDocuments(this.search.recordType, this.result.recordsPerPage * (pageNumber-1), this.result.recordsPerPage);

        },
        async loadDocuments(type, skip, top){
            try{

                this.error = undefined;

                if(!this.search.realm){
                    this.error = 'Please select a Clearing-House';
                    return;
                }

                if(!this.search.schema){
                    this.error = 'Please select a Schema';
                    return;
                }

                // if(this.search.schema.type == 'national' && !this.search.government){
                //     this.error = 'Please select a Country';
                //     return;
                // }

                this.result.documents = {};
                this.search.recordType = type;
                this.loading = true
                const query = {
                    $filter : `(type eq '${this.search.schema.key}') and (realm eq '${this.search.realm.realm}')`,
                    $orderby: 'updatedOn desc',
                    $skip   : skip || 0,
                    $top    : top  || 25
                }

                if(this.search.government){
                    // query.collection = 'government'
                    query.$filter += ` and (owner eq 'country:${this.search.government.code.toLowerCase()}')`
                }

                if(this.search.recordType == 'drafts')
                    query.collection = 'alldraft'
                else if(this.search.recordType == 'requests')
                    query.collection = 'allrequest'
                else if(this.search.recordType == 'published')
                    query.collection = 'all';

                const result = await kmDocumentsAPI.queryDocuments(query, { realm : this.search.realm.realm});
                this.result.documents = result.Items;
                this.result.count     = result.Count;
                
            }
            catch(e){
                this.error = "Error occurred on this operation \n" + JSON.stringify(e);
            }
            finally{
                this.loading = false;
            }
        },
        appDocumentUrl(realm, document){

            if(isRealm('ABS', realm.realm) || isRealm('BCH', realm.realm)){
                // 
                if(this.search.recordType == 'drafts')
                    return `${realm.baseURL}/register/${realm.schemas[document.type].shortCode}/${document.identifier}/edit`

                return `${realm.baseURL}/register/${realm.schemas[document.type].shortCode}/${document.identifier}/view`
            }

            return realm.baseURL + '/database/' + document.identifier;
        },
        ownerName(owner){
            if(!owner)
                return;

            if(owner?.toUpperCase() == 'SCBD' || owner.indexOf(':')<0)
                return owner;

            const ownerDetails = owner.split(':')
            if(ownerDetails[0] == 'country')
                return this.countryName(ownerDetails[1]);
            
            return ownerDetails[1];
        },
        countryName(code){
            return this.countries.find(e=>e.code == code?.toUpperCase())?.name?.en;
        }
    }
}
</script>

<style></style>