(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.faq', [
        'vAccordion'
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

        };
    });
})(angular);

angular.module('znk.infra-web-app.faq').run(['$templateCache', function($templateCache) {
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
    "                        <svg-icon class=\"faq-icon\" name=\"circle-arrow-icon\"></svg-icon> <span ng-bind-html=\"::faqitem.question\"></span>\n" +
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
