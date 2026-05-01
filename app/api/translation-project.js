import request from 'superagent';


export async function getProjects(q, {token, count, length, skip, sort, fields } = {}){
    const query = {
        q: JSON.stringify(q),
        l: length,
        s: JSON.stringify(sort|| {'meta.updatedOn' : -1 }),
        sk: skip,
        c: count,
        f:JSON.stringify(fields||{})
    }
    let translationProjects = await request.get(`http://localhost:8000/api/v2025/translations`)
                        .query(query)
                        .set({ 
                            'Authorization': token
                        });

    return translationProjects;
    
}

export async function getProject(id){

    let translationProject = await request.get(`http://localhost:8000/api/v2025/translations/${id}`)
                        .set({ 
                            'Accept': 'application/json', 'Content-Type': 'application/json',
                            'Authorization': user?.token
                        });

    return translationProject;
    
}
export async function addProject(document, user){

    let translationProject = await request.post(`http://localhost:8000/api/v2025/translations`)
                        .set({ 
                            'Accept': 'application/json', 'Content-Type': 'application/json',
                            'Authorization': user?.token
                        })
                        .send(document);

    return translationProject;
    
}


export async function updateProject(id, document, user){

    let translationProject = await request.put(`http://localhost:8000/api/v2025/translations/${id}`)
                        .set({ 
                            'Accept': 'application/json', 'Content-Type': 'application/json',
                            'Authorization': user?.token
                        })
                        .send(document);

    return translationProject;
    
}


export async function updateProjectStatus(id, status, user){

    let projectStatus = await request.put(`http://localhost:8000/api/v2025/translations/${id}/${status}`)
                        .set({ 
                            'Accept': 'application/json', 'Content-Type': 'application/json',
                            'Authorization': user?.token
                        })
                        .send(document);

    return projectStatus;
    
}


export async function updatePackageStatus(id, language, status, user){

    let packageStatus = await request.put(`http://localhost:8000/api/v2025/translations/${id}/packages/${language}/${status}`)
                        .set({ 
                            'Accept': 'application/json', 'Content-Type': 'application/json',
                            'Authorization': user?.token
                        })
                        .send(document);

    return packageStatus;
    
}