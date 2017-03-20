(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('AdminSearchService',
            function ($mdDialog, $http, ENV, UserProfileService, $q, $log, ElasticSearchSrv, StorageSrv, InfraConfigSrv) {
                'ngInject';

                var sizeLimit = 10000;
                var PROMO_CODES_PATH = StorageSrv.variables.appUserSpacePath + '/promoCodes';
                var hasUB;

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
                        index: ENV.elasticSearchIndex,
                        type: "user",
                        body: {
                            "from": 0,
                            "size": sizeLimit
                        }
                    };
                    hasUBPromoCode().then(function (hasUB) {
                        buildQuery.call(null, query.body, _makeTerm(queryTerm.toLowerCase()), hasUB);
                        ElasticSearchSrv.search(query).then(function (response) {
                            deferred.resolve(_searchResults(response.data.hits));
                        }, function (err) {
                            $log.error(err.message);
                            deferred.reject(err.message);
                        });
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
                        var source = item._source.user ? item._source.user : item._source;
                        if (!source) {
                            return mappedData;
                        }
                        source.uid = item._id;
                        source.zinkerzTeacher = !!source.zinkerzTeacher;
                        return source;
                    });
                    return mappedData;
                }

                function _buildQueryBody(body, term, proo) {
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

                function hasUBPromoCode() {
                    return InfraConfigSrv.getTeacherStorage().then(function (TeacherStorageSrv) {
                        return TeacherStorageSrv.get(PROMO_CODES_PATH).then(function (promoCodeData) {
                            var hasUB = false;
                            if (promoCodeData) {
                                data = Object.keys(promoCodeData).filter(function (key) {
                                    return promoCodeData[key] === ENV.UB;
                                });
                            }
                            return $q.when(hasUB);
                        });
                    }).catch(function (err) {
                        $log.debug('AdminSearchService - getPromoCodes: failed to get getTeacherStorage', err);
                    });
                }
            }
        );
})(angular);
