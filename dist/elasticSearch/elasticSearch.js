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

                var apiPath = ENV.backendEndpoint + "/search";

                this.search = function (query) {
                    var uid =uidObj.uid;

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
                        appName: ENV.firebaseAppScopeName
                    };
                    return $http.post(apiPath, searchObj);
                };
            }]
        );
})(angular);

angular.module('znk.infra-web-app.elasticSearch').run(['$templateCache', function($templateCache) {

}]);
