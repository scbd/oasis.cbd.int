<template>
  <form class="flex flex-wrap justify-between sm:justify-center">
    <section class="content">
      <div class="row">
        <div class="col-md-12">
          <div class="box">
            <div class="box-header with-border">
              <h3 class="box-title">New Widget</h3>
            </div>
            <div class="box-body">
              {{widget}}
              
              <CRow>
                <CCol sm="12">
                  <CInput label="Name" placeholder="Enter widget name" :value="widget.name" @input="widget.name=$event" />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="6">
                  <CSelect :value.sync="widget.contentType"
                    label="Content type"
                    :options="['application/html', 'application/json']"
                  />
                </CCol>
                <CCol sm="6">
                  <CSelect :value.sync="widget.method" label="Http method" :options="['GET', 'POST', 'PUT' ]" />
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="12">
                  <label>Querystring params</label>
                  <CButton color="primary" size="sm" class="m-2" @click="showParamDialog = true">
                    Add
                  </CButton>
                  <table class="table">
                    <tr>
                      <td>Name</td>
                      <td>Type</td>
                      <td>Value</td>
                    </tr>
                    <tr>
                      <td v-for="param in widget.queryString">
                        {{param}}
                      </td>
                    </tr>
                  </table>
                </CCol>
              </CRow>


              <CRow>
                <CCol sm="12">
                  <label>Template</label>
                  <code-editor v-model="widget.template"  :mode="handlebarMode" preview="true"></code-editor>
                  <br/>
                  <code-editor v-model="widget.template"  :mode="jsonMode" template="{'r':'df'}"></code-editor>
                </CCol>
              </CRow>

            </div>
            <div class="box-footer">
              <button type="submit" class="btn btn-primary" ng-click="submit()">
                Submit
              </button>
              <!-- <button type="submit" class="btn btn-primary" ng-click="getTags()">Get Tags</button> -->
            </div>
          </div>
        </div>
      </div>
    </section>
    <div>
      <CModal title="Modal title" :show.sync="showParamDialog" on-update="dialogClosed">
          <cParam :param="{name:'test', type:'jsonSchema'}"></cParam>
      </CModal>
    </div>
  </form>
</template>

<script>
define(["Vue", "coreui-vue", 'vueFile!views/widgets/components/code-editor.vue', 
'vueFile!views/widgets/components/params.vue',
'css!/app/css/default-vue.css'], 
function (Vue, coreui, codeEditor, cParam) {


// Vue.use(coreui);

return {
    components: {
      CRow: coreui.CRow,
      CCol: coreui.CCol,
      CInput: coreui.CInput,
      CSelect: coreui.CSelect,
      CInput: coreui.CInput,
      CButton:coreui.CButton,
      CModal:coreui.CModal,
      codeEditor    : codeEditor,
      cParam        : cParam
    },
    template: template,
    props: {
      
    },
    data() {
      return {
        widget:{
          name       : 'test',
          contentType: 'text/html',
          method     : 'GET',
          queryString: {},
          formData   : {},
          dataSource : [{}],
          template:'<div><b>Add your widget template here!</b></div>'
        },
        showParamDialog:false,
        jsonMode:'application/json',
        handlebarMode:{name: "handlebars", base: "text/html"}
      };
    },
    methods: {
      clearForm() {
        // this.todo = {
        //   title: "",
        //   priority: null,
        // };
      },
      submit() {
        // if (
        //   this.todo.title !== "" &&
        //   this.todo.priority !== null &&
        //   this.todo.priority >= 1 &&
        //   this.todo.priority <= 10
        // ) {
        //   this.$emit("submit", this.todo);
        //   this.clearForm();
        //   this.close();
        // }
      },
      close() {
        this.$emit("close");
      },
      inputChange(a, b){
        // console.log(a,b)
      },
      dialogClosed(a,b){
        console.log(a,b)
      }
    },
    created() {
      // if (!this.populateWith.empty) {
      //   this.todo = this.populateWith;
      // }
    },
  };
});
</script>

