(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv',
            function (esFactory, ENV) {
                'ngInject';

                return esFactory(ENV.elasticSearch);
            }
        );
})(angular);
