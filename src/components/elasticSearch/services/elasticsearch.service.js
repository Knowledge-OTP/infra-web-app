(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv',
            function (ENV,$log,$http) {
                'ngInject';

                var apiPath = ENV.backendEndpoint + "/search";

                this.search = function (query) {
                    if (!query && !angular.isObject(query)) {
                        $log.error('ElasticSearchSrv: query is empty or not an object');
                        return;
                    }
                    return $http.post(apiPath, query);
                };
            }
        );
})(angular);
