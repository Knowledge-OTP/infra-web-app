(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('AdminSearchService',
            function ($mdDialog, $http, ENV, UserProfileService, $q, $log, ElasticsearchSrv) {
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
                    var query = {
                        index: "firebase",
                        type: "user",
                        body: {
                            "from": 0,
                            "size": sizeLimit
                        }
                    };
                    buildQuery.call(null, query.body, _makeTerm(queryTerm));
                    ElasticsearchSrv.search(query).then(function (response) {
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
                        var source = item._source.profile || item._source;
                        if (!source) {
                            return mappedData;
                        }
                        return {
                            uid: item._id,
                            email: source.email,
                            zinkerzTeacher: !!source.zinkerzTeacher,
                            name: source.nickname
                        };
                    });
                    return mappedData;
                }

                function _buildQueryBody(body, term) {
                    body.query = {
                        "query_string": {
                            "fields": ["profile.zinkerzTeacher", "profile.nickname", "profile.email"],
                            "query": term
                        }
                    };
                }

                function _buildQueryBodyByTerm(query, term) {
                    query.query = {
                        "bool": {
                            "must": [
                                {
                                    "term": {"profile.zinkerzTeacher": "true"}
                                },
                                {
                                    "query_string": {
                                        "fields": ["profile.zinkerzTeacher", "profile.nickname", "profile.email"],
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
