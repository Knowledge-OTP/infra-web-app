(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('AdminSearchService',
            function ($mdDialog, $http, ENV, UserProfileService, $q, $log, ElasticSearchSrv) {
                'ngInject';

                var sizeLimit = 10000;

                this.getSearchResultsByTerm = function (queryTerm) {
                    return _getSearchResults(queryTerm, _buildQueryBodyByTerm);
                };
                this.getSearchResults = function (queryTerm) {
                    return _getSearchResults(queryTerm, _buildQueryBody);
                };

                function _getSearchResults(queryTerm, buildQuery) {
                    var deferred = $q.defer();
                    if (!angular.isFunction(buildQuery)) {
                        $log.error('getSearchResults: buildQuery is not a function');
                        return;
                    }
                    if (!angular.isString(queryTerm)) {
                        $log.error('getSearchResults: queryTerm is not a string');
                        return;
                    }
                    var query = {
                        index: "firebase",
                        type: "user",
                        body: {
                            "from": 0,
                            "size": sizeLimit
                        }
                    };
                    buildQuery.call(null, query.body, _makeTerm(queryTerm.toLowerCase()));
                    ElasticSearchSrv.search(query).then(function (response) {
                        deferred.resolve(_searchResults(response.hits));
                    }, function (err) {
                        $log.error(err.message);
                        deferred.reject(err.message);
                    });
                    return deferred.promise;
                }

                function _searchResults(data) {
                    var mappedData = [];
                    if (!(data && data.hits)) {
                        return mappedData;
                    }
                    mappedData = data.hits.map(function (item) {
                        var source = item._source;
                        if (!source) {
                            return mappedData;
                        }
                        source.uid = item._id;
                        source.zinkerzTeacher = !!source.zinkerzTeacher;
                        return source;
                        // {
                        //     uid: item._id,
                        //     email: source.email,
                        //     educatorTeachworksName: source.educatorTeachworksName,
                        //     educatorAvailabilityHours: source.educatorAvailabilityHours,
                        //     zinkerzTeacher: !!source.zinkerzTeacher,
                        //     name: source.nickname || source.name
                        // };
                    });
                    return mappedData;
                }

                function _buildQueryBody(body, term) {
                    body.query = {
                        "query_string": {
                            "fields": ["zinkerzTeacher", "nickname", "email"],
                            "query": term
                        }
                    };
                }

                function _buildQueryBodyByTerm(query, term) {
                    query.query = {
                        "bool": {
                            "must": [
                                {
                                    "term": {"zinkerzTeacher": "true"}
                                },
                                {
                                    "query_string": {
                                        "fields": ["zinkerzTeacher", "nickname", "email"],
                                        "query": term
                                    }
                                }]
                        }
                    };
                }

                function _makeTerm(term) {
                    var newTerm = _escape(term);
                    if (!newTerm.match(/^\*/)) {
                        newTerm = '*' + newTerm;
                    }
                    if (!newTerm.match(/\*$/)) {
                        newTerm += '*';
                    }
                    return newTerm;
                }

                function _escape(text) {
                    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                }


            }
        );
})(angular);
