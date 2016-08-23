(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq', [
        'vAccordion',
        'znk.infra.svgIcon'
    ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').config(
        ["$stateProvider", function ($stateProvider) {
            'ngInject';
            $stateProvider
                .state('app.faq', {
                    url: '/faq',
                    templateUrl: 'components/faq/templates/faq.template.html',
                    controller: 'FaqController',
                    controllerAs: 'vm'
            });
        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'faq-circle-arrow-icon': 'components/svg/circle-arrow.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ]);

})(angular);

/**
 * FaqController
 *   set in locale ie:
 *     "FAQ": {
 *         "MAIN_TITLE": "What Is The ACT® Test?",
 *         "QUESTION_1": "What is the ACT?",
           "ANSWER_1": "?? ??",
           ...
 *     }
 */
(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').controller('FaqController', ["$filter", "FaqSrv", function($filter, FaqSrv) {
        'ngInject';
        this.questionsAndAnswers = [];
        var lengthQuestion = FaqSrv.getLengthQuestion();
        for (var i = 1; i < lengthQuestion; i++) {
            this.questionsAndAnswers.push(
                {
                    'question': $filter('translate')('FAQ.QUESTION_AND_ANSWERS.QUESTION_' + i),
                    'answer': $filter('translate')('FAQ.QUESTION_AND_ANSWERS.ANSWER_' + i)
                }
            );
        }
    }]);
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq').provider('FaqSrv', function() {
        'ngInject';

        var lengthQuestion = 11;

        this.setLengthQuestion = function(_lengthQuestion) {
            lengthQuestion = _lengthQuestion;
        };

        this.$get = function() {
            var faqSrvApi = {};

            faqSrvApi.getLengthQuestion = function() {
                return lengthQuestion;
            };

            return faqSrvApi;
        };
    });
})(angular);

angular.module('znk.infra-web-app.faq').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/faq/svg/circle-arrow.svg",
    "<svg version=\"1.1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     class=\"circle-arrow-icon\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 39 39\">\n" +
    "    <style type=\"text/css\">\n" +
    "        svg.circle-arrow-icon {\n" +
    "            width: 100%;\n" +
    "            height: auto;\n" +
    "        }\n" +
    "        svg.circle-arrow-icon.st0 {\n" +
    "            fill: #88C54F;\n" +
    "        }\n" +
    "        svg.circle-arrow-icon.st1 {\n" +
    "            fill: #ffffff;\n" +
    "        }\n" +
    "    </style>\n" +
    "<circle class=\"st0\" cx=\"19.5\" cy=\"19.5\" r=\"19.5\"/>\n" +
    "<path class=\"st1\" d=\"M19.7,27.2c-0.2,0-0.4-0.1-0.6-0.2L8.1,18c-0.4-0.3-0.5-1-0.1-1.4c0.3-0.4,1-0.5,1.4-0.1l10.4,8.4l10-8.4\n" +
    "	c0.4-0.4,1-0.3,1.4,0.1c0.4,0.4,0.3,1-0.1,1.4l-10.6,9C20.2,27.1,20,27.2,19.7,27.2z\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/faq/templates/faq.template.html",
    "<div class=\"app-workouts\" layout=\"row\" flex=\"grow\">\n" +
    "    <div id=\"faq-container\" class=\"workouts-container base-border-radius\" translate-namespace=\"FAQ\">\n" +
    "\n" +
    "        <h1 class=\"main-title\" translate=\".MAIN_TITLE\"></h1>\n" +
    "\n" +
    "        <div id=\"faq-inner\">\n" +
    "            <v-accordion class=\"vAccordion--default\">\n" +
    "\n" +
    "                <v-pane ng-repeat=\"faqitem in ::vm.questionsAndAnswers\" expanded=\"$first\">\n" +
    "                    <v-pane-header>\n" +
    "                        <svg-icon class=\"faq-icon\" name=\"faq-circle-arrow-icon\"></svg-icon> <span ng-bind-html=\"::faqitem.question\"></span>\n" +
    "                    </v-pane-header>\n" +
    "\n" +
    "                    <v-pane-content>\n" +
    "                        <div ng-bind-html=\"::faqitem.answer\"></div>\n" +
    "                    </v-pane-content>\n" +
    "                </v-pane>\n" +
    "\n" +
    "            </v-accordion>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
