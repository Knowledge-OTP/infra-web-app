(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('AdminSearchService',
            function ($mdDialog, $http, ENV, UserProfileService, $q, $log, ElasticSearchSrv, StorageSrv, InfraConfigSrv) {
                'ngInject';

                var sizeLimit = 10000;
                var upwardBoundKey = ENV.upwardBoundKey;
                var PROMO_CODES_PATH = StorageSrv.variables.appUserSpacePath + '/promoCodes';

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
                        var source = item._source.user;
                        if (!source) {
                            return mappedData;
                        }
                        source.uid = item._id;
                        source.zinkerzTeacher = !!source.zinkerzTeacher;
                        return source;
                    });
                    return mappedData;
                }

                function _buildQueryBody(body, term, hasUB) {
                    body.query = {
                        "bool": {
                            "must": [
                                {
                                    "query_string": {
                                        "fields": ["user.zinkerzTeacher", "user.nickname", "user.email", "user.promoCodes","user.purche"],
                                        "query": term
                                    }
                                }
                            ]
                        }
                    };
                    if (hasUB) {
                        body.query.bool.must.push(_buidQueryForUB());
                    }
                }

                function _buildQueryBodyByTerm(body, term, hasUB) {
                    body.query = {
                        "bool": {
                            "must": [{
                                "term": {
                                    "user.zinkerzTeacher": "true"
                                }
                            },
                                {
                                    "query_string": {
                                        "fields": ["user.zinkerzTeacher", "user.nickname", "user.email", "user.promoCodes"],
                                        "query": term
                                    }
                                }
                            ]
                        }
                    };
                    if (hasUB) {
                        body.query.bool.must.push(_buidQueryForUB());
                    }

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

                function _buidQueryForUB() {
                    var promoCodeKey = "user.promoCodes." + ENV.studentAppName + "." + ENV.upwardBoundKey;
                    var nestedObj = {
                        nested: {
                            path: "user.promoCodes",
                            "filter": {
                                "exists": {"field": promoCodeKey}
                            }
                        }
                    };
                    return nestedObj;
                }

                function _escape(text) {
                    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                }

                function hasUBPromoCode() {
                    return InfraConfigSrv.getTeacherStorage().then(function (TeacherStorageSrv) {
                        return TeacherStorageSrv.get(PROMO_CODES_PATH).then(function (promoCodeData) {
                            var hasUB = false;
                            if (promoCodeData) {
                                hasUB = Object.keys(promoCodeData).map(function (item) {
                                        return item.toString().toLowerCase();
                                    }).indexOf(upwardBoundKey.toLowerCase()) > -1;
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
