(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.performance', [
        'ngMaterial',
        'pascalprecht.translate',
        'ui.router',
        'znk.infra.scoring',
        'znk.infra-web-app.estimatedScoreWidget'

    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.performance').provider('PerformanceSrv', [
        function () {
            var _subjectMapGetter;

            this.setSubjectsMap = function (subjectsMapGetter) {
                _subjectMapGetter = subjectsMapGetter;
            };

            this.$get = ["$q", "$log", "$injector", function ($q, $log, $injector) {
                'ngInject';
                var PerformanceSrv = {};

                PerformanceSrv.getSubjectsMap = function () {
                    if (!_subjectMapGetter) {
                        var errMsg = 'PerformanceSrv: _subjectMapGetter was not set.';
                        $log.error(errMsg);
                        return $q.reject(errMsg);
                    }

                    return $q.when($injector.invoke(_subjectMapGetter));
                };

                return PerformanceSrv;
            }];
        }
    ]);
})(angular);

angular.module('znk.infra-web-app.performance').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/performance/templates/performance.template.html",
    "<div class=\"app-performance\" layout=\"vertical\" layout-fill translate-namespace=\"PERFORMANCE\">\n" +
    "\n" +
    "    <estimated-score-widget widget-title=\".TITLE\" is-nav-menu=\"{{true}}\"\n" +
    "                            ng-model=\"vm.currentSubjectId\"></estimated-score-widget>\n" +
    "\n" +
    "    <div class=\"performance-main-container base-border-radius base-box-shadow\"\n" +
    "         subject-id-to-attr-drv=\"vm.currentSubjectId\">\n" +
    "        <div class=\"time-line-title\" translate=\"SUBJECTS.{{vm.currentSubjectId}}\"\n" +
    "             translate-values=\"{subjectName: vm.subjectEnum.getValByEnum(vm.currentSubjectId)}\"></div>\n" +
    "\n" +
    "        <!--<performance-timeline subject-id=\"{{vm.currentSubjectId}}\"></performance-timeline>-->\n" +
    "\n" +
    "        <!--<div>{{vm.subjectsMap[vm.currentSubjectId].name}}</div>-->\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
}]);
