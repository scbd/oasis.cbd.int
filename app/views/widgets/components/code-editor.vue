<template>
    <div>        
        <CRow>
            <CCol :sm="preview ? 8 : 12">
                <code-mirror ref="cmEditor" v-model="code" :options="cmOptions"
                    @ready="onCmReady" @focus="onCmFocus" @input="onCmCodeChange" />
            </CCol>
            <CCol sm="4" v-if="preview">
                <div id="templatePreview" v-html="code"></div>
            </CCol>
        </CRow>
    </div>
</template>

        
<script>

    define(["Vue", "coreui-vue", 'code-editor-vue', 
        'css!https://cdn.cbd.int/codemirror@5.58.3/theme/base16-dark.css',
        'https://cdn.cbd.int/codemirror@5.58.3/mode/xml/xml',
        'https://cdn.cbd.int/codemirror@5.58.3/mode/handlebars/handlebars',
        'https://cdn.cbd.int/codemirror@5.58.3/mode/htmlmixed/htmlmixed',       
        'https://cdn.cbd.int/codemirror@5.58.3/mode/javascript/javascript',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/selection/active-line',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/edit/closetag',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/comment/continuecomment.js',
        'https://cdn.cbd.int/codemirror@5.58.3/addon/comment/comment.js',
        'css!https://cdn.cbd.int/codemirror@5.58.3/lib/codemirror.css',
        'css!https://cdn.cbd.int/codemirror@5.58.3/theme/base16-dark.css'
    ], function (vue, coreui, codemirror) {
       
        return {
            template: template,
            components: {
                codeMirror:codemirror.codemirror,
                CRow: coreui.CRow,
                CCol: coreui.CCol,
            },
            props:['mode', 'preview', 'template'],
            data: function() {
                return {
                    cmOptions: {
                        lineNumbers: true,
                        mode: {
                            name: "handlebars", 
                            base: "text/html"
                        },
                        theme: 'base16-dark',
                    },
                    code:''
                }
            },
            methods: {
                onCmReady(cm) {
                console.log('the editor is readied!', cm)
                },
                onCmFocus(cm) {
                console.log('the editor is focused!', cm)
                },
                onCmCodeChange(newCode) {
                console.log('this is new code', newCode)
                this.code = newCode
                }
            },
            computed: {
                codemirror() {
                    return this.$refs.cmEditor.codemirror
                }
            },
            mounted() {
                console.log('the current CodeMirror instance object:', this.codemirror)
                // you can use this.codemirror to do something...

                this.cmOptions.mode = this.mode
                this.code = this.template || '<div><b>Add your widget template here!</b></div>';
            }
        }
    });

</script>