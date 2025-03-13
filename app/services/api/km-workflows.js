
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

  async startNewWorkflow(workflowId, realm){

    return this.http.put(`/api/v2013/workflows/failed-workflows/${workflowId}/new-workflow`, null, {params : {realm}})
                    .then(res => res.data)
                    .catch(tryCastToApiError);

  }

  async releaseWorkflow(workflowId, realm){
    return this.http.put(`/api/v2013/workflows/failed-workflows/${workflowId}/release-workflow`, null, {params:{realm}})
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

}