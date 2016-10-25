(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.completeExercise')
        .config(
            function ($translateProvider) {
                'ngInject';
                $translateProvider.translations('en', {
                        "COMPLETE_EXERCISE": {
                            "EXERCISE_PARENT": {
                                "TYPE_1": "Workout {{exerciseParentId}}: {{exerciseContent.name}}",
                                "TYPE_2": "Tips & Tricks: {{exerciseContent.name}}",
                                "TYPE_3": "Exam {{exerciseParentContent.name}}: {{exerciseContent.name}}",
                                "TYPE_4": "{{exerciseContent.name}}"
                            },
                            "SECTION_INSTRUCTION":{
                                "0":"Solve the following problems.",
                                "1":"Answer the following questions based on the information in the text.",
                                "2":"Evaluate the following essay.",
                                "3":"You should listen to each conversation or lecture only once. After each conversation or lecture, you will answer a series of questions. Some questions requires listening again to a part of the audio. You may take notes while you listen.",
                                "4":"The following questions requires recording of your response. You will have time to prepare your response and to speak. Further instructions appear on each question.",
                                "5":"Following is a passage with 15 questions. Some portions of text are highlighted to indicate a grammatical or stylistic error. Select the best choice from the four possible options.",
                                "6":"Answer the following questions based on the information presented in the passages.",
                                "7":"",
                                "8":"After reading the persuasive essay, assess the essay by answering the following questions."
                            },
                            "SUBJECTS":{
                                "0":"Mathematics",
                                "1":"Reading",
                                "2":"Writing",
                                "3":"Listening",
                                "4":"Speaking",
                                "5":"English",
                                "6":"Science",
                                "7":"Verbal",
                                "8":"Essay"
                            },
                            "EXIT": "Exit",
                            "GO_QST": "Go To Questions",
                            "QUESTIONS": "Questions: {{num}}",
                            "TIME": "Time: {{min}} min {{sec}} sec",
                            "INSTRUCTIONS": "Instructions",
                            "START": "START",
                            "SOME_ANSWER_LEFT_CONTENT": "You’ve left some questions unanswered…",
                            "FINISH_TITLE": "Finished?",
                            "GO_TO_SUMMARY_BTN": "GO TO SUMMARY",
                            "STAY_BTN": "STAY",
                            "TIME_UP_CONTENT": "To best simulate the conditions of a real exam, we recommend you stop taking this practice test now. However, if you prefer to continue and complete all remaining questions, you may do so.",
                            "TIME_UP_TITLE": "Time’s Up",
                            "STOP": "STOP",
                            "CONTINUE_BTN": "CONTINUE",
                            "SUMMARY": "Summary"
                        }
                    }
                );
            });
})(angular);
