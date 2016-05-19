'use strict';

angular.module('znk.infra-web-app.diagnosticDrv').provider('DiagnosticIntroSrv', [
    function DiagnosticIntroSrv() {

        var _getActive;


        this.setActiveFn = function(getActive) {
            _getActive = getActive;
        };

        this.$get = function() {
            return {

            };
        };

}]);
