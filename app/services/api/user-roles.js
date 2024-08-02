
import ApiBase, { tryCastToApiError } from './api-base';

export default class UserRolesApi extends ApiBase
{
  constructor(options) {
    super(options);
  }

  async getUserRoleNames()  {
    //ToDo: pass correct query params to get all roles. 
    return this.http.get(`api/v2013/roles?q={"roles":["Everyone","User","ChmNrNationalAuthorizedUser-dev"]}`)
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

}