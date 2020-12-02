<template>
    <div>
        code here
        <code-mirror
        ref="cmEditor"
        v-model="code" 
        :options="cmOptions"
        @ready="onCmReady"
      @focus="onCmFocus"
      @input="onCmCodeChange"
      />
    </div>
</template>

        
<script>
    define(["Vue", 'code-editor-vue', 
        "https://cdn.cbd.int/codemirror@5.58.3/mode/xml/xml",
        'css!https://cdn.cbd.int/codemirror@5.58.3/theme/base16-dark.css'
    ], function (vue, codemirror) {
        console.log(codemirror)
        // Vue.use(VueCodemirror)
        return {
            template: template,
            components: {
                codeMirror:codemirror.codemirror
            },
            data: function() {
                return {
                    cmOptions: {
                        lineNumbers: true,
                        mode: "xml",
                        theme: 'base16-dark',

                    },
                    code: '<div><span>{{name}}</span></div>'
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
            }
        }
    });
</script>