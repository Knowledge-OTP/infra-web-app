(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv',
        function (ENV, $log, $http, AuthService) {
            'ngInject';

            var API_PATH = ENV.backendEndpoint + "/search";

            this.search = function (query) {
                return AuthService.getAuth().then(authData => {
                    var uid = authData.uid;
                    if (!angular.isString(uid)) {
                        $log.error('ElasticSearchSrv: uid is not a string or not exist');
                        return;
                    }
                    if (!query && !angular.isObject(query)) {
                        $log.error('ElasticSearchSrv: query is empty or not an object');
                        return;
                    }
                    var searchObj = {
                        query: query,
                        uid: uid
                    };
                    return $http.post(API_PATH, searchObj);
                });

            };
        }
        );
})(angular);
