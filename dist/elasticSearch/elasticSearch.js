(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch', [
        'elasticsearch'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv', ["esFactory", "ENV", "loadResourceSrv", "loadResourceEnum", "$q", function (esFactory, ENV, loadResourceSrv, loadResourceEnum, $q) {
                'ngInject';

                var SRC_PATH = '/bower_components/elasticsearch/elasticsearch.js';
                var elasticObject;
                var isScriptLoaded = loadResourceSrv.isResourceLoaded(SRC_PATH, loadResourceEnum.SCRIPT);
                _initElastic();

                this.getElastic = function () {
                    return elasticObject;
                };

                function _initElastic() {
                    if (isScriptLoaded) {
                        elasticObject = esFactory(ENV.elasticSearch);
                    }
                    else {
                        elasticObject = _searchFakeFactory();
                    }
                }

                function _searchFakeFactory() {
                    return {
                        search: function () {
                            return $q.reject({message: 'ElasticSearchSrv: elastic search script is not loaded'});
                        }
                    };
                }

            }]
        );
})(angular);

angular.module('znk.infra-web-app.elasticSearch').run(['$templateCache', function($templateCache) {

}]);
