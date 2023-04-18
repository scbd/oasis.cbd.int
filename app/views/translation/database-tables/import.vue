<template>
    <section class="content">

        <div class="row">

            <div class="col-md-12">
                <div class="container" style="width:100%" id="articlesContainer">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="box box-default">
                                <div class="box-header with-border">
                                    <h3 class="box-title">Import from translations : </h3>
                                </div>
                                <div class="box-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label>Language of file(s)</label>
                                                <multiselect v-model="fileLanguage" :options="languages" :close-on-select="true" 
                                                    label="title" placeholder="select Language">
                                                </multiselect>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <!-- <label>Clearing-House ID</label>
                                                <input type="text" class="form-control" v-model="identifier"> -->

                                                <uploader :options="options" class="uploader-example"
                                                :auto-start="false" :categoryMap="categoryMap" ref="uploader"
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
                                    <button class="btn btn-sm btn-primary" @click="onUploadAll()">Upload All</button>
                                    <button class="btn btn-sm btn-danger" @click="onReset()">Clear</button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="row" v-show="logs.length">
                            
                            <div class="col-md-12">
                                <div class="box box-default">
                                    <div class="box-header with-border">
                                        <h3 class="box-title">Logs</h3>
                                    </div>                                    
                                    <div class="box-body">
                                        <div class="list-container logs">
                                            <virtual-list class="stream scroll-touch" ref="vsl"
                                            :data-key="'uid'"
                                            :data-sources="logs"
                                            :data-component="itemComponent"
                                            :item-class="'stream-item'"
                                            :keeps="logs.length"
                                            :estimate-size="logs.length"
                                            >
                                            </virtual-list>                                                    
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

import VirtualList from 'vue-virtual-scroll-list'
import simpleUpload from 'vue-simple-uploader'
import   Multiselect         from 'vue-multiselect'
import LogItem from './log-item.vue'

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
            autoStart:false,
            target: (file,request,c)=>{
                const urls = {
                    'application/zip'  : '/translation-api/database-table/Articles/import/zip',
                    'application/json' : '/translation-api/database-table/Articles/import/json'
                }
                let url = urls[file.fileType];
                url = `${url}/${this.fileLanguage?.code}`;

                return url
            },
            testChunks: false,
            chunkSize: 20971520 * 1024, //20G
            headers : {
                Authorization : 'Ticket ' + this.$auth.strategy?.token?.get()
            }
        },
        attrs: {
          accept: 'application/zip,application/json'
        },
        categoryMap : {
            document : ['zip', 'json']
        },         
        logs :[],
        itemComponent:LogItem,
        languages : [
            {code : 'ar', title : "العربية" },
            {code : 'zh', title : "中文"    } ,
            // {code : 'en', title : "English"} ,
            {code : 'es', title : "Español"} ,
            {code : 'fr', title : "Françai"} ,
            {code : 'ru', title : "Русский"}  
        ],
        fileLanguage : undefined
      }
    },
    methods:{
        onFileAdded(rootFile, file,a,b){
            console.log(rootFile.fileType)
            if(!this._data.attrs.accept.split(',').map(e=>e.trim()).includes(rootFile.fileType)){
                this.$refs.uploader.uploader.removeFile(rootFile)
                return false;
            }
        },

        onFileSuccess(rootFile, file,response, chunk){

            const jsonResponse = JSON.parse(response);
            if(jsonResponse){
                jsonResponse.forEach(async file => {
                    if(file.console){
                        await this.formatLogs(file.console, 'console', file?.fileName)
                    }
                    if(file.errors){
                        await this.formatLogs(file.errors, 'errors', file?.fileName)
                    }
                });
                
            }
        },
        onFileError(rootFile, file,response, chunk){
            console.log(rootFile, file,response, chunk)
        },
        onUploadAll(){
            const uploader = this.$refs.uploader.uploader;
            if(!this.fileLanguage){
                alert('Select translation language')
                return;
            }
            if(!uploader?.fileList?.length){
                alert('Add at least one file to process translation')
                return;
            }
           
            if(uploader?.fileList?.length)
                uploader.resume();
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
                await sleep(200);
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
</style>