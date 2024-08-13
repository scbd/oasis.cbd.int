
import ApiBase, { tryCastToApiError } from './api-base';

export default class UserRolesApi extends ApiBase
{
  constructor(options) {
    super(options);
  }

  async getUserRoleNames(roleCodes)  {
    return this.http.get(`api/v2013/roles`, 
                    {
                      params : {
                        q : JSON.stringify({"roles":roleCodes?.map(encodeURIComponent)})
                      }
                    })                    
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

}