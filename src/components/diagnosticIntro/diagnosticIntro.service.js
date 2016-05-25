'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').provider('DiagnosticIntroSrv', [
    function DiagnosticIntroSrv() {

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
                        $log.error('DiagnosticIntroSrv: no activeData!');
                    }
                    return $q.when($injector.invoke(_activeData));
                },
                getConfigMap: function() {
                    if (!_configMap) {
                        $log.error('DiagnosticIntroSrv: no configMap!');
                    }
                    return $q.when($injector.invoke(_configMap));
                }
            };
        }];
}]);
