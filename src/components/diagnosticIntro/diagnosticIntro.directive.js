'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').directive('diagnosticIntro',
    function (DiagnosticIntroSrv, $log) {
        'ngInject';

        var directive = {
            restrict: 'E',
            scope: {
                showInstructions: '=?'
            },
            templateUrl: 'components/diagnosticIntro/diagnosticIntro.template.html',
            link: function link(scope) {
                scope.d = {};

                scope.d.diagQuestion = '.QUESTIONS';
                scope.d.diagInsTitle = '.INSTRUCTIONS_TITLE';

                var translateMap = {
                    diagDesc: '.DIAG_DESCRIPTION_',
                    diagSubjectText: '.DIAG_SUBJECT_TEXT_',
                    diagSubjectName: '.DIAG_SUBJECT_NAME_',
                    diagIns: '.DIAG_INSTRUCTIONS_'
                };

                DiagnosticIntroSrv.getActiveData().then(function (activeId) {
                    scope.d.activeId = activeId;
                    return DiagnosticIntroSrv.getConfigMap();
                }).then(function (mapData) {
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
                            currMapData = scope.d.subjects.filter(function (subject) {
                                return subject.id === scope.d.activeId;
                            })[0];
                            currMapIndex = currMapData.mapId;
                    }

                    scope.d.currMapData = currMapData;

                    angular.forEach(translateMap, function(val, key) {
                        scope.d.currMapData[key] = val + angular.uppercase(currMapData.subjectNameAlias);
                    });

                    scope.d.currMapIndex = currMapIndex;
                }).catch(function (err) {
                    $log.error('DiagnosticIntroDirective: Error catch' + err);
                });
            }
        };

        return directive;
    });
