(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.diagnostic').provider('DiagnosticSrv', function () {
        var _diagnosticExamIdGetter;
        this.setDiagnosticExamIdGetter = function(diagnosticExamIdGetter){
            _diagnosticExamIdGetter = diagnosticExamIdGetter;
        };

        this.$get = function($log, $q, ExerciseResultSrv){
            'ngInject';

            var DiagnosticSrv = this;

            this.getDiagnosticExamId = function(){
                if(!_diagnosticExamIdGetter){
                    var errMsg = 'DiagnosticSrv: diagnostic exam id was not set';
                    $log.error(errMsg);
                    return $q.reject(errMsg);
                }

                var diagnosticExamId;
                if(angular.isFunction(_diagnosticExamIdGetter)){
                    diagnosticExamId = $injector.invoke(_diagnosticExamIdGetter);
                }else{
                    diagnosticExamId = _diagnosticExamIdGetter;
                }
                return $q.when(diagnosticExamId);
            };

            this.isDiagnosticCompleted = function(){
                return DiagnosticSrv.getDiagnosticExamId().then(function(diagnosticExamId){
                    return ExerciseResultSrv.getExamResult(diagnosticExamId, true).then(function(diagnosticExamResult){
                        return !!diagnosticExamResult.isComplete;
                    });
                });
            };
        };
    });
})(angular);
