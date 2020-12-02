<template>
  <form
    @submit.prevent="submit"
    class="flex flex-wrap justify-between sm:justify-center"
  >
    Hello
    <section class="content">
      <div class="row">
        <div class="col-md-12">
          <div class="box">
            <div class="box-header with-border">
              <h3 class="box-title">New Widget</h3>
            </div>
            <div class="box-body">
              <!-- <div class="alert alert-danger alert-dismissible" ng-if="showTranslationAlert">                            
                            <h4><i class="icon fa fa-ban"></i> Alert!</h4>
                            Changing the English version will clear the translation and will have to go through the translation workflow to get the latest trasnlation online.
                        </div>
                        <div class="blockRegion" ng-if="loading">
                            <div class="inverted dimmer active">
                                <div class="center">
                                    <div class="medium loader"><i class="fa fa-spin fa-cog" /> loading...</div>					
                                </div>
                            </div>
                        </div> -->
              <CRow>
                <CCol sm="12">
                    <code-editor></code-editor>
                  <!-- <CInput label="Name" placeholder="Enter widget name" /> -->
                </CCol>
              </CRow>
              <CRow>
                <CCol sm="6">
                  <CSelect
                    label="Content type"
                    :options="['application/html', 'application/json']"
                  />
                </CCol>
                <CCol sm="6">
                  <CSelect
                    label="Http method"
                    :options="[
                      'GET',
                      'POST',
                      'PUT'
                    ]"
                  />
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
  </form>
</template>

<script>
define(["Vue", "coreui-vue", 'vueFile!views/widgets/components/code-editor.vue'], 
function (vue, coreui, codeEditor) {
//   Vue.use(coreui);
  console.log(codeEditor);
  return {
    components: {
      CRow: coreui.CRow,
      CCol: coreui.CCol,
      CInput: coreui.CInput,
      CSelect: coreui.CSelect,
      CInput: coreui.CInput,
      codeEditor    : codeEditor
    },
    template: template,
    props: {
      populateWith: {
        type: Object,
        default: () => ({ empty: true }),
      },
    },
    data() {
      return {
        todo: {
          title: "test",
          priority: null,
        },
      };
    },
    methods: {
      clearForm() {
        this.todo = {
          title: "",
          priority: null,
        };
      },
      submit() {
        if (
          this.todo.title !== "" &&
          this.todo.priority !== null &&
          this.todo.priority >= 1 &&
          this.todo.priority <= 10
        ) {
          this.$emit("submit", this.todo);
          this.clearForm();
          this.close();
        }
      },
      close() {
        this.$emit("close");
      },
    },
    created() {
      if (!this.populateWith.empty) {
        this.todo = this.populateWith;
      }
    },
  };
});
</script>

