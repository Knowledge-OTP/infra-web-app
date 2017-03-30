(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch', ['znk.infra-web-app.lazyLoadResource']);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv',
            ["ENV", "$log", "$http", "AuthService", function (ENV, $log, $http, AuthService) {
                'ngInject';
                var uidObj = AuthService.getAuth();

                var API_PATH = ENV.backendEndpoint + "/search";
                var ZNK_NAME = "znk-dev";

                if (!ENV.debug) {
                    ZNK_NAME = "znk-prod";
                }
                this.search = function (query) {
                    var uid = uidObj.uid;

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
                        uid: uid,
                        appName: ZNK_NAME
                    };
                    return $http.post(API_PATH, searchObj);
                };
            }]
        );
})(angular);

angular.module('znk.infra-web-app.elasticSearch').run(['$templateCache', function($templateCache) {

}]);
