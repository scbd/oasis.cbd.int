<template>
    <div>
        {{param}}
        {{newParam}}
        <CRow>
            <CCol sm="12">
                <CInput label="Name" placeholder="Enter param name" 
                    :value="newParam.name" @input="newParam.name=$event" />
            </CCol>
        </CRow>
        <CRow>
            <CCol sm="12">
                <CSelect :value.sync="newParam.type" label="Type" :options="[{label:'Regex', value:'regex'}, {label:'JSON Schema', value:'jsonSchema'}]" />
            </CCol>
        </CRow>
        <CRow>
            <CCol sm="12" v-if="newParam.type=='jsonSchema'">
                <label>Template</label>
                <code-editor v-model="param.jsonSchema"  mode="jsonMode" :template="newParam.template"></code-editor>
            </CCol>
        </CRow>
    </div>
</template>

<script>
    define(['vueFile!views/widgets/components/code-editor.vue', 'coreui-vue'], function(codeEditor, coreui) {
        
        return {
            components:{
                codeEditor:codeEditor,
                CRow: coreui.CRow,
                CCol: coreui.CCol,
                CInput:coreui.CInput,
                CSelect:coreui.CSelect
            },
            template:template,
            props:['param'],
            data(){
                return {
                    newParam : {
                        name    : '', 
                        type    : '', 
                        validation: ''
                    }
                }
            },
            mounted(){
                console.log(this.param)
                if(this.param)
                    this.newParam = this.param;
            }
        }
        
    });
</script>