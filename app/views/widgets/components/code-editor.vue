<template>
    <div>        
        <v-row>
            <v-col :cols="preview ? 8 : 12">
                <code-mirror ref="cmEditor" v-model="code" :options="cmOptions"
                    @ready="onCmReady" @focus="onCmFocus" @input="onCmCodeChange" />
            </v-col>
            <v-col cols="4" v-if="preview">
                <label>Template Preview</label>
                <hr/>
                <iframe ref="templatePreview"  width="100%" height="100%" style="border:none"></iframe>
            </v-col>
        </v-row>
    </div>
</template>

        
<script>

import 'https://cdn.jsdelivr.net/npm/codemirror@5.58.3';
import 'css!https://cdn.jsdelivr.net/npm/codemirror@5.58.3/theme/base16-dark.css';
import 'css!https://cdn.jsdelivr.net/npm/codemirror@5.58.3/lib/codemirror.css';
import 'css!https://cdn.jsdelivr.net/npm/codemirror@5.58.3/theme/base16-dark.css';
import { codemirror as codeMirror } from 'code-editor-vue'

       
export default {
    components: {
        codeMirror
    },
    props:['mode', 'preview', 'value', 'placeholder', 'readOnly'],
    data: function() {
        return {
            cmOptions: {
                lineNumbers: true,
                indentWithTabs: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                lineWrapping: true,
                mode: {
                    name: "handlebars", 
                    base: "text/html"
                },
                theme: 'base16-dark',
                readOnly:this.readOnly
            },
            code:''
        }
    },
    methods: {
        onCmReady(cm) {
            // console.log('the editor is readied!', cm)
        },
        onCmFocus(cm) {
            // console.log('the editor is focused!', cm)
        },
        onCmCodeChange(newCode) {
            // console.log('this is new code', newCode)
            this.code = newCode;  
            this.$emit('input', newCode)        
            if(this.preview)
                this.updatePreview(newCode);
        },
        updatePreview(code) {
            var previewFrame = this.$refs.templatePreview;
            var preview =  previewFrame.contentDocument ||  previewFrame.contentWindow.document;
            preview.open();
            preview.write(code);
            preview.close();
        }
    },
    computed: {
        codemirror() {
            return this.$refs.cmEditor.codemirror
        }
    },
    mounted() {
        this.cmOptions.mode = this.mode
        this.code = this.value;
        
        if(this.placeholder && !this.code)
            this.code = this.placeholder; //'<div><b>Add your widget template here!</b></div>';
    }
}

</script>