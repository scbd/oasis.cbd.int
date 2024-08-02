
import ApiBase, { tryCastToApiError } from './api-base';

export default class UserRolesApi extends ApiBase
{
  constructor(options) {
    super(options);
  }

  async getUserRoleNames(roleCodes)  {
    return this.http.get(`api/v2013/roles?q={"roles":${JSON.stringify(roleCodes)}}`)
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

}