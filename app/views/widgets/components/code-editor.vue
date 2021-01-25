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

    define(["Vue", 'code-editor-vue', 
        'css!https://cdn.cbd.int/codemirror@5.58.3/theme/base16-dark.css',
        'https://cdn.cbd.int/codemirror@5.58.3/mode/xml/xml',
        'https://cdn.cbd.int/codemirror@5.58.3/mode/handlebars/handlebars',
        'https://cdn.cbd.int/codemirror@5.58.3/mode/htmlmixed/htmlmixed',       
        'https://cdn.cbd.int/codemirror@5.58.3/mode/javascript/javascript',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/selection/active-line',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/edit/closetag',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/edit/matchbrackets',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/comment/continuecomment.js',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/comment/comment.js',
        'css!https://cdn.cbd.int/codemirror@5.58.3/lib/codemirror.css',
        'css!https://cdn.cbd.int/codemirror@5.58.3/theme/base16-dark.css'
    ], function (vue, codemirror) {
       
        return {
            template: template,
            components: {
                codeMirror:codemirror.codemirror
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
                    console.log('this is new code', newCode)
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
    });

</script>