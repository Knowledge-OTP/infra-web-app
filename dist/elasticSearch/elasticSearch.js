(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch', []);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv', ["ENV", "loadResourceSrv", "loadResourceEnum", "$q", function (ENV, loadResourceSrv, loadResourceEnum, $q) {
                'ngInject';

                var SRC_PATH = '/bower_components/elasticsearch/elasticsearch.js';
                var elasticObject;
                var elasticsearch = elasticsearch || {client: {}};
                var isScriptLoaded = loadResourceSrv.isResourceLoaded(SRC_PATH, loadResourceEnum.SCRIPT);

                this.getElastic = function () {
                    return $q.when(_initElastic());
                };

                function _initElastic() {
                    var deferred = $q.defer();
                    if (isScriptLoaded) {
                        elasticObject = new elasticsearch.Client(ENV.elasticSearch);
                        deferred.resolve(elasticObject);
                    }
                    else {
                        loadResourceSrv.addResource(SRC_PATH, loadResourceEnum.SCRIPT).then(function () {
                            isScriptLoaded = true;
                            elasticObject = new elasticsearch.Client(ENV.elasticSearch);
                            deferred.resolve(elasticObject);
                        });
                    }
                    return deferred.promise;
                }
            }]
        );
})(angular);

angular.module('znk.infra-web-app.elasticSearch').run(['$templateCache', function($templateCache) {

}]);
