(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch', []);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch').service('ElasticSearchSrv',
        ["esFactory", function (esFactory) {
            'ngInject';

            return esFactory({
                host: 'znk-elastic-dev4891.cloudapp.net:9200',
                apiVersion: '5.x',
                log: 'trace'
            });
        }]
    );
})(angular);

angular.module('znk.infra-web-app.elasticSearch').run(['$templateCache', function($templateCache) {

}]);
