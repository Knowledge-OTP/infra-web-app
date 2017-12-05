(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticIntro', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.config',
        'ngMaterial'
    ]).config(["SvgIconSrvProvider", function (SvgIconSrvProvider) {
            'ngInject';
            var svgMap = {
                'diagnostic-intro-check-mark': 'components/diagnosticIntro/svg/diagnostic-intro-check-mark-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }]);

})(angular);


'use strict';

angular.module('znk.infra-web-app.diagnosticIntro').directive('diagnosticIntro',
    ["DiagnosticIntroSrv", "$log", function (DiagnosticIntroSrv, $log) {
        'ngInject';

        var directive = {
            restrict: 'E',
            scope: {
                showInstructions: '=?',
                showIconsSection: '=?'
            },
            templateUrl: 'components/diagnosticIntro/directives/diagnosticIntro.template.html',
            link: function link(scope) {
                scope.d = {};

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
    }]);

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

        this.$get = ["$injector", "$log", "$q", function($injector, $log, $q) {
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

angular.module('znk.infra-web-app.diagnosticIntro').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/diagnosticIntro/directives/diagnosticIntro.template.html",
    "<div class=\"diagnostic-intro-drv\" translate-namespace=\"DIAGNOSTIC_INTRO\">\n" +
    "    <div class=\"description\">\n" +
    "        <div class=\"diagnostic-text\"\n" +
    "             translate=\"{{d.currMapData.diagDesc}}\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"icons-section\" ng-if=\"showIconsSection\">\n" +
    "        <div ng-repeat=\"subject in d.subjects\"\n" +
    "             class=\"icon-circle {{subject.subjectNameAlias}}-color\"\n" +
    "             ng-class=\"{\n" +
    "                    active: subject.mapId === d.currMapIndex,\n" +
    "                    done: subject.mapId < d.currMapIndex,\n" +
    "                    pristine: d.currMapIndex === -1\n" +
    "            }\">\n" +
    "            <div class=\"icon-wrapper\">\n" +
    "                <svg-icon class=\"subject-icon\" name=\"{{subject.subjectIconName}}\"></svg-icon>\n" +
    "                <svg-icon class=\"section-complete\" name=\"diagnostic-intro-check-mark\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"raccoon-img-container\">\n" +
    "        <div class=\"raccoon-img-wrapper\">\n" +
    "            <div ng-class=\"d.currMapData.subjectNameAlias ? 'diagnostic-raccoon-'+d.currMapData.subjectNameAlias : diagnostic-raccoon\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"section-question\" ng-if=\"d.currMapData && !d.currMapData.hideSectionQuestion\">\n" +
    "            <div>\n" +
    "                <span translate=\"{{d.currMapData.diagSubjectText}}\" ng-cloak></span>\n" +
    "                <span\n" +
    "                    class=\"{{d.currMapData.subjectNameAlias}}\"\n" +
    "                    translate=\"{{d.currMapData.diagSubjectName}}\">\n" +
    "                </span>\n" +
    "                <span translate=\".QUESTIONS\"></span>\n" +
    "                <div class=\"diagnostic-instructions\" ng-if=\"showInstructions\">\n" +
    "                    <span class=\"diagnostic-instructions-title\" translate=\".INSTRUCTIONS_TITLE\"></span>\n" +
    "                    <span class=\"diagnostic-instructions-text\" translate=\"{{d.currMapData.diagIns}}\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticIntro/svg/diagnostic-intro-check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"diagnostic-intro-check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .diagnostic-intro-check-mark-svg .st0 {\n" +
    "            fill: none;\n" +
    "            stroke: #ffffff;\n" +
    "            stroke-width: 21;\n" +
    "            stroke-linecap: round;\n" +
    "            stroke-linejoin: round;\n" +
    "            stroke-miterlimit: 10;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g>\n" +
    "	    <line class=\"st0\" x1=\"10.5\" y1=\"107.4\" x2=\"116.3\" y2=\"213.2\"/>\n" +
    "	    <line class=\"st0\" x1=\"116.3\" y1=\"213.2\" x2=\"319\" y2=\"10.5\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);
