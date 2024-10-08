
import ApiBase, { tryCastToApiError } from './api-base';

export default class RealmConfigurationAPI extends ApiBase
{
  constructor(options) {
    super(options);
  }

  async queryRealmConfigurations(params)  {
    return this.http.get(`api/v2018/realm-configurations`, { params })
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

  async getRealmConfigurationByHost(host)  {

    return this.http.get(`api/v2018/realm-configurations/${host}`)
                    .then(res => res.data?.length ? res.data[0] : undefined)
                    .catch(tryCastToApiError);
  }

}