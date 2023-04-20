<template>
    <div>
        <span :class="source.type">{{ source.type }}</span> : {{ source.text }}
    </div>
  </template>
  
  <script>
    export default {
      name: 'item-component',
      props: {
        index: { // index of current item
          type: Number
        },
        source: { // here is: {uid: 'unique_1', text: 'abc'}
          type: Object,
          default () {
            return {}
          }
        }
      }
    }
  </script>
<style scoped>
    .errors{
        color: #ed4040;
    }
    .console{
        color: #6666a9;
    }
</style>