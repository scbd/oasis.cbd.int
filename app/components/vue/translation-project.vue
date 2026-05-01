<template>
    <section class="content">

        <div class="row">

            <div class="col-md-12">
                <div class="container" style="width:100%">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="box box-default">
                                <div class="box-header with-border">
                                    <h3 class="box-title">Translation project</h3>
                                </div>
                                <div class="box-body">
                                    {{ document }}
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label class="control-label " required="true" for="name">Name
                                                    <span class="color-red">*</span>
                                                    <span class="text-muted">(Max 30 alpha-numeric chars, special chars allowed [- _ .])</span>
                                                </label>
                                                <input type="text" class="form-control" name="name" v-model="document.name"
                                                 placeholder="Name of the translation project" maxlength="50"
                                                 v-on="{
                                                    input: $event => document.name = $event.target.value.replace(/[^.a-z0-9_-]/ig, '') }"
                                               >
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Application<span class="color-red">*</span></label>
                                                <input type="text" class="form-control" v-model="document.application" placeholder="Application name eg. CHM, ABSCH, ORT, CBD Website">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Description<span class="color-red">*</span></label>
                                                <input type="text" class="form-control" v-model="document.description" placeholder="Description of the translation project">
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label>Languages<span class="color-red">*</span></label>
                                                <multiselect v-model="targetLocales" :options="languages" :close-on-select="false" 
                                                    label="title" multiple placeholder="select Language(s)" track-by="code"                                                     >
                                                </multiselect>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <uploader :options="options" class="uploader-example"
                                                :auto-start="true" :categoryMap="categoryMap" ref="uploader"
                                                @file-added="onFileAdded" @file-success="onFileSuccess"
                                                @file-error="onFileError">
                                                    <uploader-unsupport></uploader-unsupport>
                                                    <uploader-drop :attrs="attrs">
                                                        <p>Drop files here to upload or</p>
                                                        <uploader-btn :attrs="attrs">select files</uploader-btn>
                                                    </uploader-drop>
                                                    <uploader-list></uploader-list>
                                                </uploader>
                                            </div>                                           
                                        </div>
                                    </div>
                                </div>
                                <div class="box-footer">
                                    <button class="btn btn-sm btn-primary" :disabled="loading" @click="onUploadAll()">Save</button>
                                    <button class="btn btn-sm btn-danger"  :disabled="loading" @click="onReset()">Clear</button>
                                </div>
                                <div class="box-footer" v-if="loading">
                                    <div class="row" >
                                        <div class="col-md-12" style="margin:5px">
                                        <i class="fa fa-cog fa-spin fa-lg" style="margin-left: 50%;"></i> Uploading files...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="row" v-show="fileStatus.length">
                            
                            <div class="col-md-12">
                                <div class="box box-default">
                                    <div class="box-header with-border">
                                        <h3 class="box-title">File Status</h3>
                                    </div>                                    
                                    <div class="box-body">
                                        <table class="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th style="width: 10px">#</th>
                                                    <th>File</th>
                                                    <th>Message</th>
                                                </tr>
                                                <template v-for="(file, index) in fileStatus">
                                                    <tr>
                                                        <td>{{index+1}}</td>                                                    
                                                        <td>
                                                            {{ file.fileName }}
                                                        </td>
                                                        <td> 
                                                            <span v-if="!(file.isFolder || file.fileType== 'application/zip') && file.files && file.files.length">{{ file.files[0].message || 'Success' }}</span>
                                                        </td>
                                                    </tr> 
                                                    <tr v-if="file.files && file.files.length && (file.isFolder || file.fileType== 'application/zip')">
                                                       
                                                        <td></td>
                                                        <td colspan="2">
                                                            <table class="table table-bordered">
                                                                <tbody>
                                                                <tr v-for="(file, index) in file.files">
                                                                    <td>{{index+1}}</td>                                                    
                                                                    <td>
                                                                        <a target="_blank" :href="$route.params.table.toLowerCase() + '/' + file.id">{{ file.fileName }}</a>
                                                                    </td>
                                                                    <td> {{ file.message || 'Success' }}
                                                                    </td>
                                                                </tr> </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
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
    </section>
</template>

<script>

import VirtualList from 'vue-virtual-scroll-list'
import simpleUpload from 'vue-simple-uploader'
import   Multiselect         from 'vue-multiselect'
import { languages } from '~/app-data/laguages';
import { addProject, updateProject, updateProjectStatus } from '~/api/translation-project';
const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));

export default {
    components: {
        Uploader         : simpleUpload.Uploader,
        UploaderBtn      : simpleUpload.UploaderBtn,
        UploaderDrop     : simpleUpload.UploaderDrop,
        UploaderUnsupport: simpleUpload.UploaderUnsupport,
        UploaderList     : simpleUpload.UploaderList,
        UploaderFiles    : simpleUpload.UploaderFiles,
        UploaderFile     : simpleUpload. UploaderFile,
        Multiselect,
        VirtualList
    },
    data () {
      return {
        options: {
            autoStart:true,
            target: (file,request,c)=>{            
                return '/api/v2015/temporary-files'
            },
            testChunks: false,
            chunkSize: 20971520 * 1024, //20G
            headers : {
                Authorization : 'Ticket ' + this.$auth.strategy?.token?.get()
            }
        },
        attrs: {
          accept: 'application/zip,application/json,sdlppx'
        },
        categoryMap : {
            document : ['zip', 'json', 'sdlppx']
        },         
        logs :[],
        fileStatus:[],
        languages : languages,
        loading:false,
        document: {
            name: '',
            application: '',
            description: '',
            targetLocales: [],
            sourceFileUrls:[]
        },
        targetLocales: languages,
      }
    },
    methods:{
        onFileAdded(rootFile, file,a,b){
            const fileType = rootFile.fileType || rootFile.getExtension();
            console.log(fileType)
            if(!this._data.attrs.accept.split(',').map(e=>e.trim()).includes(fileType)){
                this.$refs.uploader.uploader.removeFile(rootFile)
            }
        },

        async onFileSuccess(rootFile, uploadedFile,response, chunk){


            let jsonResponse = JSON.parse(response);
            if(jsonResponse){
                
                let isFolder = false   
                const { name:fileName } = uploadedFile;
                const { url,  hash, uid, contentType, size} = jsonResponse;
                const { relativePath, fileType } = uploadedFile
                isFolder = relativePath.indexOf('/') > -1;

                const fileObject = {fileName, files:uploadedFile, fileType, isFolder, folderPath:relativePath };
                this.fileStatus.push(fileObject)
                this.document.sourceFileUrls.push({
                    contentType, hash,
                    fileName, folderPath:relativePath,
                    size, uid, url,
                    })
                
            }
            if(rootFile.completed)
                this.loading = false;
        },
        onFileError(rootFile, file,response, chunk){
            console.log(rootFile, file,response, chunk)
        },
        async onUploadAll(){
            const uploader = this.$refs.uploader.uploader;
            if(!this.document?.name){
                alert('Please provide a name for the translation project')
                return;
            }
            if(!this.document?.application){
                alert('Please provide an application name for the translation project')
                return;
            }
            if(!this.targetLocales?.length){
                alert('Please select at least one target language for the translation project')
                return;
            }
            if(!this.document?.description){
                alert('Please provide a description for the translation project')
                return;
            }
            if(!this.document.sourceFileUrls?.length){
                alert('Please add files to upload')
                return;
            }

            this.loading = true;
            try{
                const userToken = {
                    token: this.$auth.strategy?.token?.get()
                }
                this.document.targetLocales = this.targetLocales.map(e=>e.code);
                if(this.document._id)
                    await updateProject(this.document._id, this.document, userToken);
                else{
                    const id = await addProject(this.document, userToken);
                    this.document._id = id;
                }
                // this.document.targetLocales = this.document.targetLocales.map(e=>e.code);
                
                this.$router.push({path: '/translation/trados-projects'});
            }
            catch(e){
                console.error(e);
                alert('An error occurred while saving the translation project. Please try again later.')
            }
            finally{
                this.loading = false;
            }

        },
        onReset(){
            const uploader = this.$refs.uploader.uploader;
            if(uploader?.fileList?.length){
                const fileList = [...uploader.fileList];
                for (let i = 0; i < fileList.length; i++) {
                    const element = fileList[i];
                    uploader.removeFile(element)
                }
            }
            this.logs = [];
            this.fileStatus = [];
            this.fileLanguage = undefined;
            this.loading = false;
        },
        async formatLogs(logs, type, fileName){
            for (let i = 0; i < logs.length; i++) {
                const log = logs[i];
                let logItem = {uid : new Date().getTime(), text : `${fileName} : ${log}`, type} ;

                if(type == 'errors'){
                    logItem.text = `${fileName} : ${log.error}`
                }

                this.logs.splice(0, 0, logItem)
                // if (this.$refs.vsl) {
                //     this.$refs.vsl.scrollToIndex(this.logs.length-2);
                //     this.$refs.vsl.scrollToBottom();
                // }
                await sleep(50);
            }
        }
    }
}
</script>
<style lang="">
    .logs{
        background: black;
        color: #b9b4b4;
        padding-left: 10px;
        height: 360px; 
        overflow-y: auto;
    }
    .uploader-file-actions .uploader-file-resume,
    .uploader-file-actions .uploader-file-retry{
        display: none!important;
    }
    .uploader-drop{
        min-height: 250px;
        padding-left: 45%;
    }
    .color-red{
        color: red;
    }
</style>