(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch', [
        'elasticsearch'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv',
            ["esFactory", "ENV", function (esFactory, ENV) {
                'ngInject';

                return esFactory(ENV.elasticSearch);
            }]
        );
})(angular);

angular.module('znk.infra-web-app.elasticSearch').run(['$templateCache', function($templateCache) {

}]);
