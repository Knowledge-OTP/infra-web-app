(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkMultipleChoice', {
            bindings: {
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating/znk-multiple-choice/multiple-choice.component.html',
            controllerAs: 'vm',
            controller: function ($log, $translate) {
                'ngInject';

                this.nameSpace = 'LESSON_NOTES.LESSON_RATING_POPUP.MULTIPLE_CHOICE';
                this.choicesArr = [];

                this.$onInit = () => {
                    this.lesson.studentFeedback.multipleChoice = this.lesson.studentFeedback.multipleChoice || [];
                    this.getTranslations().then((translations) => {
                        this.choicesArr = Object.keys(translations).map(key => {
                            return { name: translations[key], active: false };
                        });

                        if (this.lesson.studentFeedback.multipleChoice.length) {
                            this.lesson.studentFeedback.multipleChoice.forEach(studentChoice => {
                                this.choicesArr.forEach(choiceObj => {
                                    if (choiceObj.name === studentChoice) {
                                        choiceObj.active = true;
                                    }
                                });
                            });
                        }
                    });
                };

                this.getTranslations = () => {
                    return $translate([
                        `${this.nameSpace}.CHOICE1`,
                        `${this.nameSpace}.CHOICE2`,
                        `${this.nameSpace}.CHOICE3`,
                        `${this.nameSpace}.CHOICE4`,
                        `${this.nameSpace}.CHOICE5`,
                        `${this.nameSpace}.CHOICE6`,
                        `${this.nameSpace}.CHOICE7`,
                    ]);
                };

                this.updateChoice = (choice) => {
                    choice.active = !choice.active;
                    if (choice.active) {
                        this.lesson.studentFeedback.multipleChoice.push(choice.name);
                    } else {
                        this.lesson.studentFeedback.multipleChoice =
                            this.lesson.studentFeedback.multipleChoice.filter(item => item !== choice.name);
                    }
                };

            }
        });
})(angular);

