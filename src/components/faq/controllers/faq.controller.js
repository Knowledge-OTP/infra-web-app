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

    angular.module('znk.infra-web-app.faq').controller('FaqController', function($filter, FaqSrv) {
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
    });
})(angular);

