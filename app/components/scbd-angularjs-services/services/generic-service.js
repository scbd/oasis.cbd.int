import app from 'app';
    

    app.factory("IGenericService", ["$http", function($http) {

        //===========================
        //
        //===========================
        function create(version, schema, data, config) {

            // var body = {
            //     data: data
            // };

            return $http.post("/api/"+version+"/"+schema, data, config)
                        .then(function(resp) {
                            return resp.data;
                        });
        }

        //===========================
        //
        //===========================
        function get(version, schema, id) {
            return $http.get("/api/"+version+"/"+schema+"/" + id, {
                ignoreLoadingBar: true
            }).then(
                function(resp) {
                    return resp.data;
                });
        }

        //===========================
        //
        //===========================
        function update(version, schema, id, data) {
            return $http.put("/api/"+version+"/"+schema+"/" + id, data).then(
                function(resp) {
                    return resp.data;
                });
        }

        //===========================
        //
        //===========================
        function deleteRecord(version, schema, id) {
            return $http.delete("/api/"+version+"/"+schema+"/" + id).then(
                function(resp) {
                    return resp.data;
                });
        }

        //===========================
        //
        //===========================
        function query(version, schema, options) {
            
            if(options.query)
                options.query = JSON.stringify(options.query);
            if(options.ag)
                options.ag = JSON.stringify(options.ag);

            return $http.get("/api/"+version+"/"+schema, {
                params: {
                    q   :   options.query,
                    sk  :   options.pageNumber,
                    l   :   options.pageLength,
                    c   :   options.count,
                    s   :   options.sort,
                    f   :   options.fields,
                    ag  :   options.ag
                },
                cache: false,
                ignoreLoadingBar: true
            }).then(function(resp) {
                return resp.data;
            });
        }
        return {
            create: create,
            get: get,
            update: update,
            delete: deleteRecord,
            query: query,
        };
    }]);


