(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.elasticSearch')
        .service('ElasticSearchSrv', function (esFactory, ENV, loadResourceSrv, loadResourceEnum, $q) {
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
                            return $q.reject(
                                {message: 'ElasticSearchSrv: ElasticSearch script is not loaded'}
                            );
                        }
                    };
                }

            }
        );
})(angular);
