(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.diagnostic').provider('DiagnosticSrv', function () {
        
        var _diagnosticExamIdGetter;
        
        this.setDiagnosticExamIdGetter = function(diagnosticExamIdGetter){
            _diagnosticExamIdGetter = diagnosticExamIdGetter;
        };

        this.$get = function($log, $q, ExerciseResultSrv, ExerciseStatusEnum, $injector){
            'ngInject';

            var DiagnosticSrv = {};

            DiagnosticSrv.getDiagnosticExamId = function(){
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

            DiagnosticSrv.getDiagnosticExamResult = function(){
                return DiagnosticSrv.getDiagnosticExamId().then(function(diagnosticExamId) {
                    return ExerciseResultSrv.getExamResult(diagnosticExamId, true);
                });
            };

            DiagnosticSrv.getDiagnosticStatus = function(){
                return DiagnosticSrv.getDiagnosticExamResult().then(function(diagnosticExamResult){
                    if(diagnosticExamResult === null){
                        return ExerciseStatusEnum.NEW.enum;
                    }

                    if(diagnosticExamResult.isComplete){
                        return ExerciseStatusEnum.COMPLETED.enum;
                    }

                    var startedSectionsNum= Object.keys(diagnosticExamResult.sectionResults);
                    return startedSectionsNum ? ExerciseStatusEnum.ACTIVE.enum : ExerciseStatusEnum.NEW.enum;
                });
            };

            return DiagnosticSrv;
        };
    });
})(angular);
