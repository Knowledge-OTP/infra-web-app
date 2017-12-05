'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').provider('DiagnosticIntroSrv',
    function DiagnosticIntroSrv() {
        'ngInject';
        var _activeData;

        var _configMap;

        this.setActiveSubjectGetter = function(activeData) {
            _activeData = activeData;
        };

        this.setConfigGetter = function(configMap) {
            _configMap = configMap;
        };

        this.$get = ['$injector', '$log', '$q', function($injector, $log, $q) {
            return {
                getActiveData: function() {
                    if (!_activeData) {
                        var errorMsg = 'DiagnosticIntroSrv: no activeData!';
                        $log.error(errorMsg);
                        return $q.reject(errorMsg);
                    }
                    return $q.when($injector.invoke(_activeData));
                },
                getConfigMap: function() {
                    if (!_configMap) {
                        var errorMsg = 'DiagnosticIntroSrv: no configMap!';
                        $log.error(errorMsg);
                        return $q.reject(errorMsg);
                    }
                    return $q.when($injector.invoke(_configMap));
                }
            };
        }];
});
