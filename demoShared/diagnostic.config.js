(function(angular){
    angular.module('demo').config(function(DiagnosticSrvProvider){
        DiagnosticSrvProvider.setDiagnosticExamIdGetter(14);
    });
})(angular);
