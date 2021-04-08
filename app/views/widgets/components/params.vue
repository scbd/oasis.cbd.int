<template>
  <v-data-table
    :headers="headers"
    :items="localParams"
    class="elevation-1"
    hide-default-footer
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>{{ placeholder }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="600px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn x-small color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              New Param
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-form
                  ref="form"
                  v-model="validations.valid"
                  lazy-validation
                  style="width: 100%"
                >
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="editedItem.name"
                        label="Name"
                        :rules="validations.paramNameRules"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-select
                        v-model="editedItem.type"
                        flat
                        solo-inverted
                        hide-details
                        :items="paramTypes"
                        label="Type"
                        :rules="validations.paramTypeRules"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" v-if="editedItem.type == 'jsonSchema'">
                      <label>Validation JSON schema</label>

                      <code-editor
                        mode='application/ld+json'
                        v-model="editedItem.validationJsonSchema"
                        :rules="validations.paramSchemaRules"
                        placeholder=''
                      ></code-editor>
                      <CError error-message="JSON schema is required" v-if="validations.jsonSchemaRules.isMissing"></CError>
                      <CError :error-message="validations.jsonSchemaRules.isInvalid" v-if="validations.jsonSchemaRules.isInvalid"></CError>
                      
                    </v-col>

                    <v-col cols="12" v-if="editedItem.type == 'regex'">
                      <v-text-field
                        v-model="editedItem.validationRegex"
                        label="Validation regex"
                        :rules="validations.paramRegexRules"
                      ></v-text-field>
                      <CError :error-message="validations.invalidRegex" v-if="validations.invalidRegex"></CError>
                    </v-col>
                  </v-row>
                </v-form>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
              <v-btn
                color="blue darken-1"
                text
                @click="save"
                :disabled="!validations.valid"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="600px">
          <v-card>
            <v-card-title class="headline"
              >Are you sure you want to delete this item?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:item.validation="{ item }">
        <span v-if="item.type == 'regex'">{{item.validationRegex}}</span>
        <span v-if="item.type == 'jsonSchema'">{{item.validationJsonSchema}}</span>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template v-slot:no-data>
      <b>No params configured!</b>
    </template>
  </v-data-table>
</template>

<script>
define([
  "vueFile!views/widgets/components/code-editor.vue",
  "vueFile!views/widgets/components/error.vue",
  "lodash",
], function (codeEditor, CError, _) {
  return {
    components: {
      codeEditor: codeEditor,
      CError:CError
    },
    template: template,
    props: ["value", "placeholder"],
    data: function() { 
      return {
        dialog: false,
        dialogDelete: false,
        headers: [
            {
            text: "Name",
            align: "start",
            sortable: false,
            value: "name",
            },
            { text: "Type", value: "type", sortable: false },
            { text: "Validation", value: "validation", sortable: false },
            { text: 'Actions', value: 'actions', sortable: false },
        ],
        localParams: [],
        editedIndex: -1,
        editedItem: {
            name: "",
            type: '',
            validationRegex: '',
            validationJsonSchema: '',
        },
        defaultItem: {
            name: "",
            type: '',
            validationRegex: '',
            validationJsonSchema: '',
        },
        paramTypes: [
            { text: "Regex", value: "regex" },
            { text: "JSON Schema", value: "jsonSchema" },
        ],
        validations: {
            valid: false,
            paramNameRules: [
                function (v) {
                    return !!_.trim(v) || "Name is required";
                },
                function (v) {
                    return (
                    (_.trim(v) && v.length <= 30) || "Name must be less than 10 characters"
                    );
                },
            ],
            paramTypeRules: [
                function (v) {
                    return !!_.trim(v) || "Type is required";
                },
            ],
            paramSchemaRules: [
                function (v) {
                    return !!_.trim(v) || "Validation schema is required";
                },
            ],
            paramRegexRules: [
                function (v) {
                    return !!_.trim(v) || "Validation regex is required";
                },
            ],
            jsonSchemaRules:{
                isInvalid : '',
                isMissing:false,
            },
            invalidRegex:''
        },
      }
    },

    computed: {
      formTitle() {
        return this.editedIndex === -1 ? "New Item" : "Edit Item";
      },
    },

    watch: {
      dialog(val) {
        val || this.close();
      },
      dialogDelete(val) {
        val || this.closeDelete();
      },
    },

    created() {
      this.initialize();
    },

    methods: {
      initialize() {
        this.localParams = [];
        if (this.value) {
          //params are passed make sure its array or convert to array
          if (!_.isArray(this.value) && _.isObject(this.value)) {     
            var params = this.value;
            this.localParams = _(this.value)
              .keys()
              .map(function (key) {
                var param = params[key];
                param.name = key;
                return param;
              })
              .value();
          }
        }
      },

      editItem(item) {
        this.editedIndex = this.localParams.indexOf(item);
        this.editedItem = Object.assign({}, item);
        if(this.editedItem.type == 'jsonSchema'){
            try{
               this.editedItem.validationJsonSchema = JSON.stringify(this.editedItem.validationJsonSchema, null, 4);
            }
            catch{}
        }
        this.dialog = true;
      },

      deleteItem(item) {
        this.editedIndex = this.localParams.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialogDelete = true;
      },

      deleteItemConfirm() {
        this.localParams.splice(this.editedIndex, 1);
        this.closeDelete();
      },

      close() {
        this.dialog = false;
        this.$nextTick(function() {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },

      closeDelete() {
        this.dialogDelete = false;
        this.$nextTick(function() {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },

      save() {
        this.validations.invalidRegex = '';
        this.validations.jsonSchemaRules.isInvalid = '';

        var result = this.$refs.form.validate();
        if(!result)
            return
        console.log(result, this.editedItem);

        if(this.editedItem.type == 'regex'){
            try{
                if(!/^\/\^/.test(this.editedItem.validationRegex) || !/\$\/(i?g?)?$/.test(this.editedItem.validationRegex))
                    return this.validations.invalidRegex = 'Invalid regex, please make sure regex starts with /^ and ends with $/ and available flags are ig';
                   
                var regex = new RegExp(this.editedItem.validationRegex)
            }
            catch(e){
                this.validations.invalidRegex = 'Invalid regex';
                return;
            }
        }
        else if(this.editedItem.type == 'jsonSchema'){
            try{
               this.editedItem.validationJsonSchema = JSON.parse(this.editedItem.validationJsonSchema);
            }
            catch(e){
                this.validations.jsonSchemaRules.isInvalid = 'Invalid JSON schema. \n' + e;
                return;
            }
        }

        if (this.editedIndex > -1) {
          Object.assign(this.localParams[this.editedIndex], this.editedItem);
        } else {
          this.localParams.push(this.editedItem);
        }
        var newParams = {};
        _.each(this.localParams, function(param){
            newParams[param.name] = _.clone(param);
            delete newParams[param.name].name;
            if(param.type == 'jsonSchema')
                delete newParams[param.name].validationRegex;
            else
                delete newParams[param.name].validationJsonSchema;
        })
        this.$emit('input', newParams)    
        this.close();
      },
    },
  };
});
</script>