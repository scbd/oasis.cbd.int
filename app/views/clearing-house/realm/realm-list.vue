<template>
    <section class="content">
        <div class="row">
            <div class="col-md-12">
                <div class="container" id="articlesContainer">

                    <div class="row">
                        <div class="col-md-12">
                            <div class="box">
                                <div class="box-header with-border">
                                    <h3 class="box-title">
                                        <strong> Realms List </strong>
                                    </h3>
                                </div>

                                <div class="box-body">
                                    <div class="row" v-if="error">
                                        <div class="col-md-12">
                                            <div class="alert alert-danger alert-dismissible">
                                                <h4><i class="icon fa fa-ban"></i> Error!</h4>
                                                {{ error }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row" v-if="loading">
                                        <div class="col-md-12 text-center" style="margin:5px">
                                            <i class="fa fa-cog fa-spin fa-lg"></i> loading...
                                        </div>
                                    </div>
                                    <div class="row" v-for="realm in realms" :key="realm.id">
                                        <div class="col-md-12">
                                            <div class="box box-default box-solid">
                                                <div class="box-header with-border">
                                                    <strong>{{ realm.realm }}</strong>
                                                </div>

                                                <div class="box-body">
                                                    <table class="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>UId prefix</th>
                                                                <th>Display name</th>
                                                                <th>Hosts</th>
                                                                <th>Email</th>
                                                                <th>Details</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{{ realm.uIdPrefix }}</td>
                                                                <td>{{ realm.displayName }}</td>
                                                                <td>
                                                                    <span v-for="(host, index) in realm.hosts" :key="index">{{ host }}<br></span>
                                                                </td>
                                                                <td>{{ realm.email }}</td>
                                                                <td style="text-align: center;">
                                                                    <a :href="'/clearing-house/realms/' + realm.realm"><i class="fa fa-search" aria-hidden="true"></i></a>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </section>
</template>

<script>
import realmConfigurationAPI from '~/services/api/realm-configuration';

const realmConfApi = new realmConfigurationAPI();

export default {
    data() {
        return {
            realms: [],
            loading: false,
            error: undefined
        };
    },
    async mounted() {
        this.loading = true;
        try {
            this.realms = await realmConfApi.queryRealmConfigurations();
        } catch (err) {
            this.error = err.message || 'Failed to load realms';
        } finally {
            this.loading = false;
        }
    }
};
</script>

<style scoped>
#articlesContainer {
    width: 100%;
}

.text-center {
    text-align: center;
}
</style>
