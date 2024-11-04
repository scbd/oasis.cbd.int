<template>
  <span class="badge pull-right">{{ isAdmin ? "You are Administrator" : "You are not Administrator" }}</span>
</template>

<script>
import { isAdministrator } from '~/services/roles';

export default {
  props: {
    adminRoles: {
      type: Array,
      required: false
    }
  },
  computed: {
    isAdmin() {
      return isAdministrator(this.adminRoles||[], this.$auth?.user.roles);
    }
  }
};
</script>
