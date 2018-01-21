(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('AdminSearchService',
            function ($mdDialog, $http, ENV, UserProfileService, $q, $log, ElasticSearchSrv, StorageSrv, InfraConfigSrv, AccountStatusEnum) {
                'ngInject';

                var sizeLimit = 10000;
                var upwardBoundKey = ENV.upwardBoundKey;
                var PROMO_CODES_PATH = StorageSrv.variables.appUserSpacePath + '/promoCodes';
                var query = {
                    index: ENV.elasticSearchIndex,
                    type: "user",
                    body: {
                        "from": 0,
                        "size": sizeLimit
                    }
                };

                this.getSearchResults = function (queryTerm, hasTeacher) {
                    return _getSearchResults(queryTerm, hasTeacher);
                };

                function _getSearchResults(queryTerm, hasTeacher) {
                    var deferred = $q.defer();
                    hasUBPromoCode().then(function (hasUB) {
                        _buildQuery(query.body, queryTerm.toLowerCase(), hasUB, hasTeacher);
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
                        var zinkerzTeacher = source && source.teacherInfo && source.teacherInfo.accountStatus === AccountStatusEnum.ACTIVE.enum;
                        source.uid = item._id;
                        source.zinkerzTeacher = zinkerzTeacher;
                        return source;
                    });
                    return mappedData;
                }

                function _buildQuery(body, term, hasUB, hasTeacher) {
                    body.query = {
                        "bool": {
                            "should": [
                                {
                                    "query_string": {
                                        "fields": ["user.zinkerzTeacher", "user.nickname", "user.email", "user.promoCodes", "user.purchase"],
                                        "query": _makeTerm(term)
                                    }
                                },
                                {"query": {"ids": {"values": [term]}}}
                            ],
                            "must": [],
                            "minimum_should_match": 1
                        }
                    };
                    if (hasTeacher) {
                        body.query.bool.must.push({
                            "term": {
                                "user.zinkerzTeacher": "true"
                            }
                        });
                    }
                    if (hasUB) {
                        body.query.bool.must.push(_buildQueryForUB());
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

                function _buildQueryForUB() {
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
                                hasUB = Object.keys(promoCodeData).indexOf(upwardBoundKey) > -1;
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
