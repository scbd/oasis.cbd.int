<template>
  <span class="badge pull-right">{{ isAdmin ? "You are Administrator" : "You are not Administrator" }}</span>
</template>

<script>
import { isRealmAdmin as checkRealmAdmin } from '~/services/utils';

export default {
  props: {
    isRealmAdmin: {
      type: Boolean,
      required: false
    },
    adminRoles: {
      type: Array,
      required: false
    }
  },
  computed: {
    isAdmin() {
      if (this.isRealmAdmin) {
        return true;
      }
      if (this.adminRoles) {
        return checkRealmAdmin(this.adminRoles);
      }
      return false;
    }
  }
};
</script>
