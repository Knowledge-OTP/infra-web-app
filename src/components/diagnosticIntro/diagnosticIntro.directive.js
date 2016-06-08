'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').directive('diagnosticIntro', ['DiagnosticIntroSrv', '$translatePartialLoader', '$log',
    function (DiagnosticIntroSrv, $translatePartialLoader, $log) {
        'ngInject';

    var directive = {
        restrict: 'E',
        scope: {
            showInstructions: '=?'
        },
        templateUrl: 'components/diagnosticIntro/diagnosticIntro.template.html',
        link: function link(scope) {
            var PART_NAME = 'diagnosticIntro';
            if(!$translatePartialLoader.isPartAvailable(PART_NAME)){
                $translatePartialLoader.addPart(PART_NAME);
            }

            scope.d = {};

            DiagnosticIntroSrv.getActiveData().then(function(activeId) {
                scope.d.activeId = activeId;
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
