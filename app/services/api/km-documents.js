
import ApiBase, { tryCastToApiError } from './api-base';

export default class KMDocumentsApi extends ApiBase
{
  constructor(options) {
    super(options);
  }
  
  async queryDocuments(params, headers)  {
    return this.http.get(`api/v2013/documents`, { params, headers })
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

  async getDocumentById(id, headers)  {

    return this.http.get(`api/v2013/documents/${encodeURIComponent(id)}/info`, { headers})
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }


  async queryDocumentDrafts(params, headers)  {
    return this.http.get(`api/v2013/document-drafts`, { params, headers })
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

  async getDocumentDraftById(id, headers)  {

    return this.http.get(`api/v2013/documents/${id}/versions/draft/info`, {headers})
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }


  async getDocumentRevisions(id, params, headers)  {
    return this.http.get(`api/v2013/documents/${id}/versions`, { params, headers })
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

  async getDocumentRevisionById(id, version, headers)  {

    return this.http.get(`api/v2013/documents/${encodeURIComponent(id)}/versions/${version}/info`, {headers})
                    .then(res => res.data)
                    .catch(tryCastToApiError);
  }

  async reIndex(schema, identifier, realm)  {
    return this.http.put(`api/v2022/documents/admin/schemas/${encodeURIComponent(schema)}/${encodeURIComponent(identifier)}/index-document`, null,
      {params: {realm}}) 
    .catch(tryCastToApiError);
  }

}