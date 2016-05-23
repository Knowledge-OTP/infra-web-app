'use strict';

angular.module('znk.infra-web-app.diagnosticDrv').directive('diagnosticIntro', ['DiagnosticIntroSrv', '$translatePartialLoader', '$log',
    function DiagnosticIntroDirective(DiagnosticIntroSrv, $translatePartialLoader, $log) {

    var directive = {
        restrict: 'E',
        scope: {
            showInstructions: '=?'
        },
        templateUrl: 'components/diagnosticDrv/diagnosticIntro.template.html',
        link: function link(scope) {

            $translatePartialLoader.addPart('diagnosticDrv');

            scope.d = {};

            DiagnosticIntroSrv.getActiveData().then(function(activeData) {
                if (!activeData || !activeData.id) {
                    $log.error('DiagnosticIntroDirective: activeData id must exist!');
                }
                scope.d.activeId = activeData.id;
                return DiagnosticIntroSrv.getConfigMap();
            }).then(function(mapData) {
                if (!angular.isArray(mapData.subjects)) {
                    $log.error('DiagnosticIntroDirective: configMap must have subjects array!');
                }
                var currMapData;
                var currMapIndex;

                scope.d.subjects = mapData.subjects.map(function (subject, index) {
                    subject.mapId = index + 1;
                    return subject;
                });

                switch (scope.d.activeId) {
                    case 'none':
                        currMapIndex = -1;
                        currMapData = mapData.none;
                        break;
                    case 'all':
                        currMapIndex = Infinity;
                        currMapData = mapData.all;
                        break;
                    default:
                        currMapData = scope.d.subjects.filter(function(subject) {
                            return subject.id === scope.d.activeId;
                        })[0];
                        currMapIndex = currMapData.mapId;
                }

                scope.d.currMapData = currMapData;
                scope.d.currMapIndex = currMapIndex;
            }).catch(function(err) {
                $log.error('DiagnosticIntroDirective: Error catch' + err);
            });
        }
    };

    return directive;
}]);
