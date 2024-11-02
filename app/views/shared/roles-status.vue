<template>
  <span class="badge pull-right">{{ isRealmAdmin ? "You are Administrator" : "You are not Administrator" }}</span>
</template>

<script>
export default {
  props: {
    isRealmAdmin: {
      type: Boolean,
      required: true
    }
  }
};
</script>
