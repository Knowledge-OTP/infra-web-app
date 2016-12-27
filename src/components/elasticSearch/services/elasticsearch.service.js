(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv',
        function (esFactory) {
            'ngInject';

            return esFactory({
                host: 'znk-elastic-dev4891.cloudapp.net:9200',
                apiVersion: '5.x',
                log: 'trace'
            });
        }
    );
})(angular);
