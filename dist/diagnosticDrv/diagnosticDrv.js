(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.diagnosticDrv', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.config',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'check-mark': 'components/diagnosticDrv/svg/check-mark-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);


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

'use strict';

angular.module('znk.infra-web-app.diagnosticDrv').provider('DiagnosticIntroSrv', [
    function DiagnosticIntroSrv() {

        var _activeData;

        var _configMap;

        this.setActiveFn = function(activeData) {
            _activeData = activeData;
        };

        this.setConfigMapFn = function(configMap) {
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

angular.module('znk.infra-web-app.diagnosticDrv').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/diagnosticDrv/diagnosticIntro.template.html",
    "<div class=\"diagnostic-intro-drv\" translate-namespace=\"DIAGNOSTIC_INTRO\">\n" +
    "    <div class=\"description\">\n" +
    "        <div class=\"diagnostic-text\" translate=\"{{d.currMapData.descriptionTranslate}}\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"icons-section\" ng-class=\"{pristine: d.currMapIndex === -1}\">\n" +
    "        <div ng-repeat=\"subject in d.subjects\"\n" +
    "             class=\"icon-circle {{subject.iconCircleClassName}}\"\n" +
    "             ng-class=\"{\n" +
    "                    active: subject.mapId === d.currMapIndex,\n" +
    "                    done: subject.mapId < d.currMapIndex\n" +
    "            }\">\n" +
    "            <div class=\"icon-wrapper\">\n" +
    "                <svg-icon class=\"subject-icon\" name=\"{{subject.subjectIconName}}\"></svg-icon>\n" +
    "                <svg-icon class=\"section-complete\" name=\"check-mark\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"raccoon-img-container\">\n" +
    "        <div class=\"raccoon-img-wrapper\">\n" +
    "            <div class=\"diagnostic-raccoon\" ng-class=\"d.currMapData.raccoonClassName\"></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"section-question\" ng-if=\"!d.currMapData.hideSectionQuestion\">\n" +
    "            <div>\n" +
    "                <span translate=\"{{d.currMapData.subjectTextTranslate}}\"></span>\n" +
    "                <span\n" +
    "                    class=\"{{d.currMapData.colorClassName}}\"\n" +
    "                    translate=\"{{d.currMapData.subjectNameTranslate}}\">\n" +
    "                </span>\n" +
    "                <span translate=\".QUESTIONS\"></span>\n" +
    "                <div class=\"diagnostic-instructions\" ng-if=\"showInstructions\">\n" +
    "                    <span class=\"diagnostic-instructions-title\" translate=\".INSTRUCTIONS_TITLE\"></span>\n" +
    "                    <span class=\"diagnostic-instructions-text\" translate=\"{{d.currMapData.instructionsTranslate}}\"></span>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/diagnosticDrv/svg/check-mark-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 329.5 223.7\"\n" +
    "	 class=\"check-mark-svg\">\n" +
    "    <style type=\"text/css\">\n" +
    "        .check-mark-svg .st0 {\n" +
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
