
import ApiBase, { tryCastToApiError } from './api-base';

export default class KMWorkflowsApi extends ApiBase
{
  constructor(options) {
    super(options);
  }
  
  
  async getWorkflowHistory(params)  {
    return this.http.get(`api/v2013/workflows`, { params })
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

  async getWorkflow(workflowId)  {

    return this.http.get(`api/v2013/workflows/${workflowId}`)
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

}