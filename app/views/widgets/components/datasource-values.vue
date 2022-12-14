<template>
  <v-data-table
    :headers="headers"
    :items="localDatasource"
    class="elevation-1"
    hide-default-footer
    item-key="name"
    :single-expand="singleExpand"
    :expanded.sync="expanded"
    show-expand
  >
    <template v-slot:top>
      <v-toolbar flat color="blue lighten-5" >
        <v-toolbar-title>{{ placeholder }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="1200px">
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
                      <v-text-field
                        v-model="editedItem.url"
                        label="URL"
                        :rules="validations.paramUrlRules"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12">
                      <v-select
                        v-model="editedItem.method"
                        flat
                        solo-inverted
                        hide-details
                        :items="datasourceMethods"
                        label="Method"
                        :rules="validations.paramMethodRules"
                      ></v-select>
                    </v-col>

                    <v-col cols="12" v-if="editedItem.method" >
                        <cParam v-model="editedItem.queryString" placeholder="Querystring params"></cParam>
                    </v-col>

                    <v-col cols="12" v-if="editedItem.method == 'POST' || editedItem.method == 'PUT'">
                        <cParam v-model="editedItem.formData" placeholder="Form data params"></cParam>
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
      </v-toolbar>
    </template>

    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
       
        <v-col cols="12" v-if="item.method" >
            <CParamValues v-model="item.queryString" placeholder="Querystring params" crud="false"></CParamValues>
        </v-col>

        <v-col cols="12" v-if="item.method == 'POST' || item.method == 'PUT'">
            <CParamValues v-model="item.formData" placeholder="Form data params" crud="false"></CParamValues>
        </v-col>   
      </td>
    </template>
    <template v-slot:item.actions="{ item }">
    </template>
    <template v-slot:no-data>
      <b>No datasource params configured!</b>
    </template>
  </v-data-table>
</template>

<script>

import CError from "./error.vue"
import cParam from "./params.vue"
import CParamValues from "./param-values.vue"
import _ from "lodash"

export default {
    components: {
      CError:CError,
      cParam:cParam,
      CParamValues:CParamValues
    },
    props: ["value", "placeholder"],
    data: function() { 
      return {
        expanded: [],
        singleExpand: false,
        dialog: false,
        dialogDelete: false,
        headers: [
            { text: "Name", align: "start", sortable: false, value: "name",},
            { text: "URL", value: "url", sortable: false },
            { text: "Method", value: "method", sortable: false },,
            { text: '', value: 'data-table-expand' },
            { text: 'Actions', value: 'actions', sortable: false },
        ],
        localDatasource: [],
        editedIndex: -1,
        editedItem: {
            name: "",
            url: '',
            method: '',
        },
        defaultItem: {
            name: "",
            url: '',
            method: '',
        },
        datasourceMethods: ['GET', 'POST', 'PUT'],
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
            paramUrlRules: [
                function (v) {
                    return !!_.trim(v) || "URL is required";
                },
                function (v) {
                    return (/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.\{\}]+$/.test(v)) || "Please enter a valid url";
                },
            ],
            paramMethodRules: [
                function (v) {
                    return !!_.trim(v) || "Method is required";
                },
            ],
        },
      }
    },

    computed: {
      formTitle() {
        return "Datsource param value";
      },
    },

    watch: {
      dialog(val) {
        val || this.close();
      },
    },

    created() {
      this.initialize();
    },

    methods: {
      initialize() {
        this.localDatasource = [];
        if (this.value) {
          this.localDatasource = _.clone(this.value);
        }
      },

      editItem(item) {
        this.editedIndex = this.localDatasource.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.dialog = true;
      },

      close() {
        this.dialog = false;
        this.$nextTick(function() {
          this.editedItem = Object.assign({}, this.defaultItem);
          this.editedIndex = -1;
        });
      },

      save() {
       
        var result = this.$refs.form.validate();
        if(!result)
            return
        console.log(result, this.editedItem);

        if (this.editedIndex > -1) {
          Object.assign(this.localDatasource[this.editedIndex], this.editedItem);
        } else {
          this.localDatasource.push(this.editedItem);
        }
        
        this.$emit('input', this.localDatasource)    
        this.close();
      },
    },
  };
</script>