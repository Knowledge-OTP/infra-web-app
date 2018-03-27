(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes',
        [
            'ngMaterial',
            'znk.infra.popUp',
            'pascalprecht.translate',
            'znk.infra.auth',
            'znk.infra.user',
            'znk.infra.analytics',
            'znk.infra.general',
            'znk.infra.svgIcon',
            'znk.infra-web-app.znkToast',
            'znk.infra.config',
            'znk.infra.utility'
        ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                let svgMap = {
                    'znkLessonNotes-star': 'components/znkLessonNotes/svg/star.svg',
                    'znkLessonNotes-zoe-new-record': 'components/znkLessonNotes/svg/zoe-new-record-popup-top-icon.svg',
                    'znkLessonNotes-close-popup': 'components/znkLessonNotes/svg/close-popup.svg',
                    'znkLessonNotes-x-icon': 'components/znkLessonNotes/svg/x-icon.svg',
                    'znkLessonNotes-v-icon': 'components/znkLessonNotes/svg/v-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').factory('LessonNotesStatusEnum',
        ["EnumSrv", function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['PENDING_COMPLETION', 1, 'pendingCompletion'],
                ['COMPLETE', 2, 'complete'],
                ['INCOMPLETE', 3, 'incomplete']
            ]);
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').factory('LessonStatusEnum',
        ["EnumSrv", function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['SCHEDULED', 1, 'scheduled'],
                ['PENDING_SCHEDULE', 2, 'pendingSchedule'],
                ['CANCELED', 3, 'canceled'],
                ['ATTENDED', 4, 'attended'],
                ['MISSED', 5, 'missed']
            ]);
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').factory('UserTypeContextEnum',
        ["EnumSrv", function (EnumSrv) {
            'ngInject';

            return new EnumSrv.BaseEnum([
                ['STUDENT', 1, 'student'],
                ['EDUCATOR', 2, 'educator'],
                ['ADMIN', 3, 'admin'],
                ['STUDENT_AND_EDUCATOR', 4, 'studentAndEducator'],
                ['PARENT', 5, 'parent']
            ]);
        }]
    );
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonDetails', {
            bindings: {
                lesson: '=',
                lessonSummary: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-details/lesson-details.component.html',
            controllerAs: 'vm',
            controller: ["$scope", "$http", "$q", "$log", "$filter", "ENV", "$translate", "LessonStatusEnum", "ZnkLessonNotesSrv", "ZnkLessonNotesUiSrv", "UserTypeContextEnum", "UserProfileService", function ($scope, $http, $q, $log, $filter, ENV, $translate, LessonStatusEnum, ZnkLessonNotesSrv,
                                  ZnkLessonNotesUiSrv, UserTypeContextEnum, UserProfileService) {
                'ngInject';

                this.nameSpace = 'LESSON_NOTES.LESSON_NOTES_POPUP';
                this.showTooltipV = false;
                this.showTooltipX = false;

                this.$onInit = function () {
                    $log.debug('znkLessonDetails: Init');
                    const translateProm = this.getTranslations();
                    const userProfileProm = UserProfileService.getProfile();
                    const serviceListProm = ZnkLessonNotesSrv.getServiceList();
                    const lessonStatusArr = LessonStatusEnum.getEnumArr();
                    this.lessonStatusArr = lessonStatusArr.filter(status =>
                        status.enum === LessonStatusEnum.ATTENDED.enum || status.enum === LessonStatusEnum.MISSED.enum);
                    this.LessonStatusEnum = LessonStatusEnum;
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.isStudent = !this.isAdmin && this.userContext === UserTypeContextEnum.STUDENT.enum;

                    Promise.all([userProfileProm, translateProm, serviceListProm])
                        .then(([userProfile, translate, serviceListMap]) => {
                            this.userProfile = userProfile;
                            this.translate = translate;
                            this.serviceListMap = serviceListMap;
                            this.buildViewModal();
                        });
                };

                this.getTranslations = () => {
                    return $translate([
                        `${this.nameSpace}.TEST`,
                        `${this.nameSpace}.TOPIC`,
                        `${this.nameSpace}.EDUCATOR`,
                        `${this.nameSpace}.STUDENT`,
                        `${this.nameSpace}.DATE`,
                        `${this.nameSpace}.ACTUAL_TIME`,
                        `${this.nameSpace}.STATUS`,
                    ]);
                };

                this.buildViewModal = () => {
                    this.viewModal = {
                        serviceName: this.getServiceField(),
                        topicName: this.getTopicField(),
                        educatorName: this.getEducatorField(),
                        studentList: this.getStudentsField(),
                        lessonDate: this.getLessonDateField(),
                        actualTime: this.getActualTimeField(),
                        lessonStatus: this.getLessonStatusField(),
                    };
                };

                this.getServiceField = () => {
                    const field = {label: null, val: null};
                    field.label = this.translate[`${this.nameSpace}.TEST`] || null;
                    const lessonService = this.serviceListMap[this.lesson.serviceId];
                    if (lessonService && lessonService.name) {
                        field.val = lessonService.name;
                    }
                    return field;
                };

                this.getTopicField = () => {
                    const field = {label: null, val: null};
                    field.label = this.translate[`${this.nameSpace}.TOPIC`] || null;
                    const lessonService = this.serviceListMap[this.lesson.serviceId];
                    if (lessonService && lessonService.topics) {
                        field.val = lessonService.topics[this.lesson.topicId].name;
                    }
                    return field;
                };

                this.getEducatorField = () => {
                    const field = {label: null, val: null};
                    field.label = this.translate[`${this.nameSpace}.EDUCATOR`] || null;
                    if (this.lesson.educatorFirstName || this.lesson.educatorLastName) {
                        field.val = `${this.lesson.educatorFirstName || ''} ${this.lesson.educatorLastName || ''}`;
                    }
                    return field;
                };

                this.getStudentsField = () => {
                    const field = {label: null, val: null};
                    field.label = this.translate[`${this.nameSpace}.STUDENT`] || null;
                    const studentList = Object.keys(this.lesson.students)
                        .map(studentId => this.lesson.students[studentId]);
                    if (studentList.length) {
                        field.val = studentList;
                    }
                    return field;
                };

                this.getLessonDateField = () => {
                    const field = {label: null, val: null};
                    field.label = this.translate[`${this.nameSpace}.DATE`] || null;
                    if (this.lesson.date) {
                        field.val = this.transformDate(this.lesson.date, 'DATE');
                    }
                    return field;
                };

                this.getActualTimeField = () => {
                    const field = {label: null, val: null};
                    field.label = this.translate[`${this.nameSpace}.ACTUAL_TIME`] || null;
                    if (this.lessonSummary.startTime && this.lessonSummary.endTime) {
                        const startTimeStr = this.transformDate(this.lessonSummary.startTime, 'ACTUAL_TIME');
                        const endTimeStr = this.transformDate(this.lessonSummary.endTime, 'ACTUAL_TIME');
                        field.val = `${startTimeStr} - ${endTimeStr}`;
                    }
                    return field;
                };

                this.getLessonStatusField = () => {
                    const field = {label: null, val: ''};
                    field.label = this.translate[`${this.nameSpace}.STATUS`] || null;
                    if (this.isStudent) {
                        field.val = this.lesson.students[this.userProfile.uid].attendanceStatus || null;
                    } else if (this.lesson.status === LessonStatusEnum.ATTENDED.enum ||
                        this.lesson.status === LessonStatusEnum.MISSED.enum) {
                        field.val = String(this.lesson.status);
                    }
                    return field;
                };

                this.updateAttendanceStatus = (student, status) => {
                    student.attendanceStatus = status;
                    this.lesson.students[student.uid].attendanceStatus = status;
                    $scope.$emit('LESSON_CHANGED');
                };

                this.getStudentsNames = () => {
                    let studentsNames = '';
                    let studentsKeys = Object.keys(this.lesson.students);
                    studentsKeys.forEach((studentId, index) => {
                        let student = this.lesson.students[studentId];
                        studentsNames += ZnkLessonNotesUiSrv.getUserFullName(student);
                        studentsNames += index !== (studentsKeys.length - 1) ? ', ' : '';
                    });

                    return studentsNames;
                };

                this.transformDate = (timestamp, dateType) => {
                    let pattern;
                    let transformedDate;
                    switch (dateType) {
                        case 'DATE':
                            pattern = 'MMM d, y h:mm a';
                            transformedDate = $filter('date')(timestamp, pattern);
                            break;
                        case 'ACTUAL_TIME':
                            pattern = 'h:mm a';
                            transformedDate = $filter('date')(timestamp, pattern);
                            break;
                    }
                    return transformedDate;
                };

                this.statusChanged = (status) => {
                    this.lesson.status = status ? Number(status): null;
                    $scope.$emit('LESSON_CHANGED');
                };

            }]
        });
})(angular);

(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkLessonNotes')
        .controller('lessonNotesPopupCtrl',

            ["locals", "$q", "$scope", "$log", "$mdDialog", "$translate", "ZnkLessonNotesSrv", "UserTypeContextEnum", "LessonStatusEnum", "LessonNotesStatusEnum", "ZnkToastSrv", "UtilitySrv", function (locals, $q, $scope, $log, $mdDialog, $translate, ZnkLessonNotesSrv, UserTypeContextEnum, LessonStatusEnum,
                      LessonNotesStatusEnum, ZnkToastSrv, UtilitySrv) {
                'ngInject';

                this.lesson = locals.lesson;
                this.lessonSummary = locals.lessonSummary;
                this.userContext = locals.userContext;
                this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                this.isStudent = this.userContext === UserTypeContextEnum.STUDENT.enum;
                this.lessonSummary = this.lessonSummary || {};
                this.lessonSummary.id = this.lessonSummary.id || UtilitySrv.general.createGuid();
                this.lessonSummary.studentIds = this.lessonSummary.studentIds || Object.keys(this.lesson.students);
                this.lessonSummary.educatorId = this.lessonSummary.educatorId || this.lesson.educatorId;
                this.lessonSummary.lessonNotes = this.lessonSummary.lessonNotes || {};
                this.lessonSummary.lessonNotes.status = this.lessonSummary.lessonNotes.status || LessonNotesStatusEnum.PENDING_COMPLETION.enum;

                const lessonStatusListener = $scope.$on('LESSON_CHANGED', () => {
                    $log.debug('lessonChanged Event');
                    this.isLessonUpdateNeeded = true;
                    this.showStatusError = false;

                });

                this.$onInit = () => {
                    $log.debug('lessonNotesPopup: Init with lesson: ', this.lesson);
                    $log.debug('lessonNotesPopup: Init with lessonSummary: ', this.lessonSummary);
                    this.showSpinner = false;
                    this.showStatusError = false;
                    this.isLessonUpdateNeeded = false;
                };

                this.isLessonValid = (lesson) => {
                    return lesson.status === LessonStatusEnum.ATTENDED.enum || lesson.status === LessonStatusEnum.MISSED.enum;
                };

                this.submit = () => {
                    if (!this.isLessonValid(this.lesson)) {
                        this.showStatusError = true;
                        return;
                    }

                    this.showSpinner = true;
                    if (ZnkLessonNotesSrv.sendEmailIndicators.sendMailToStudents ||
                        ZnkLessonNotesSrv.sendEmailIndicators.sendMailToParents) {
                        this.lessonSummary.lessonNotes.status =
                            this.lessonSummary.lessonNotes.status === LessonNotesStatusEnum.PENDING_COMPLETION.enum ?
                                LessonNotesStatusEnum.COMPLETE.enum : this.lessonSummary.lessonNotes.status;

                    }

                    this.saveLessonSummary(ZnkLessonNotesSrv.sendEmailIndicators);
                };

                this.doItLater = () => {
                    $mdDialog.cancel();
                };

                this.saveLessonSummary = (sendEmailIndicators) => {
                    const savePromArr = [];
                    if (this.isLessonUpdateNeeded) {
                        $log.debug('Saving lesson: ', this.lesson);
                        savePromArr.push(ZnkLessonNotesSrv.updateLesson(this.lesson));
                    } else {
                        savePromArr.push($q.resolve(this.lesson));
                    }
                    $log.debug('saving lessonSummary : ', this.lessonSummary);
                    savePromArr.push(ZnkLessonNotesSrv.saveLessonSummary(this.lessonSummary, sendEmailIndicators));

                    $q.all(savePromArr).then(([lesson, lessonSummary]) => {
                        this.lesson = lesson;
                        this.isLessonUpdateNeeded = false;
                        this.lessonSummary = lessonSummary;
                        $log.debug('lessonNotesPopup saveLessonSummary:  updatedLessonSummary: ', lessonSummary);
                        this.showSpinner = false;
                        let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.LESSON_NOTES_SAVED');
                        translationsProm.then(message => {
                            ZnkToastSrv.showToast('success', message);
                        });
                        $mdDialog.cancel();
                    })
                        .catch(err => {
                            this.showSpinner = false;
                            $log.error('lessonNotesPopup: saveLessonSummary failed. Error: ', err);
                            let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.UPDATE_LESSON_FAILED');
                            translationsProm.then(message => {
                                ZnkToastSrv.showToast('error', message);
                            });
                        });
                };

                this.$onDestroy = () => {
                    lessonStatusListener();
                };

            }]
        );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonStartedLate', {
            bindings: {
                lesson: '=',
                lessonSummary: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-started-late/lesson-started-late.component.html',
            controllerAs: 'vm',
            controller: ["$log", "ZnkLessonNotesSrv", "UserTypeContextEnum", "ZnkLessonNotesUiSrv", function ($log, ZnkLessonNotesSrv, UserTypeContextEnum, ZnkLessonNotesUiSrv) {
                'ngInject';


                this.$onInit = () => {
                    $log.debug('LessonStartedLateComponent: Init');
                    this.lessonSummary.lessonNotes = this.lessonSummary.lessonNotes || {};
                    this.lessonSummary.studentFeedback = this.lessonSummary.studentFeedback || {};
                    this.initLessonStartedLate();
                    this.determineLessonStartedLate();
                };

                this.initLessonStartedLate = () => {
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.isTeacher = this.userContext === UserTypeContextEnum.EDUCATOR.enum;
                    if (this.isTeacher) {
                        this.lessonSummary.lessonNotes.isStudentLate = !ZnkLessonNotesUiSrv.isNullOrUndefined(this.lessonSummary.lessonNotes.isStudentLate) ?
                            this.lessonSummary.lessonNotes.isStudentLate : false;
                    } else {
                        this.lessonSummary.studentFeedback.isTeacherLate = !ZnkLessonNotesUiSrv.isNullOrUndefined(this.lessonSummary.studentFeedback.isTeacherLate) ?
                            this.lessonSummary.studentFeedback.isTeacherLate : false;
                    }
                };

                this.determineLessonStartedLate = () => {
                    ZnkLessonNotesSrv.getGlobalVariables().then(globalVariables => {
                        this.lessonStartedLate = (this.lesson.date + globalVariables.liveSession.lessonStartedLateTimeout) < this.lessonSummary.startTime;
                    });
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonTeacherNotes', {
            bindings: {
                lesson: '=',
                lessonSummary: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/lesson-teacher-notes.component.html',
            controllerAs: 'vm',
            controller: ["$log", "$translate", "UserTypeContextEnum", function ($log, $translate, UserTypeContextEnum) {
                'ngInject';

                this.$onInit = function () {
                    $log.debug('znkLessonTeacherNotes: Init');
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.showComponent = this.isAdmin || this.userContext === UserTypeContextEnum.EDUCATOR.enum;
                    this.lessonSummary.lessonNotes = this.lessonSummary.lessonNotes || {};
                    this.initEducatorNotes();
                };

                this.initEducatorNotes = () => {
                    if (!this.lessonSummary.lessonNotes.educatorNotes) {
                        $translate('LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.NOTES_TEMPLATE')
                            .then(notesTemplate => this.lessonSummary.lessonNotes.educatorNotes = notesTemplate);
                    }
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkSendEmailNotes', {
            bindings: {
                lesson: '=',
                lessonSummary: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/send-email-notes/send-email-notes.component.html',
            controllerAs: 'vm',
            controller: ["$log", "ZnkLessonNotesSrv", function ($log, ZnkLessonNotesSrv) {
                'ngInject';

                this.studentsMails = [];
                this.parentsMails = [];
                this.mailsToSend = [];
                this.studentsProfiles = [];
                this.sendMailToStudents = true;
                this.sendMailToParents = true;

                this.$onInit = function () {
                    $log.debug('SendEmailNotesComponent: Init');
                    this.emailSelectionChanged();
                };


                this.emailSelectionChanged = () => {
                    ZnkLessonNotesSrv.sendEmailIndicators = {
                        sendMailToStudents: this.sendMailToStudents,
                        sendMailToParents: this.sendMailToParents,
                    };
                };
            }]
        });
})(angular);


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.znkLessonNotes')
        .controller('lessonRatingPopupCtrl',

            ["locals", "$log", "$mdDialog", "ZnkLessonNotesSrv", "UserTypeContextEnum", "UtilitySrv", function (locals, $log, $mdDialog, ZnkLessonNotesSrv, UserTypeContextEnum, UtilitySrv) {
                'ngInject';

                this.lesson = locals.lesson;
                this.lessonSummary = locals.lessonSummary;
                this.userContext = UserTypeContextEnum.STUDENT.enum;
                this.lessonSummary = this.lessonSummary || {};
                this.lessonSummary.id = this.lessonSummary.id || UtilitySrv.general.createGuid();
                this.lessonSummary.studentFeedback = this.lessonSummary.studentFeedback || {};

                this.$onInit = function() {
                    $log.debug('lessonRatingPopup: Init with lesson: ', this.lesson );
                    $log.debug('lessonRatingPopup: Init with lessonSummary: ', this.lessonSummary);
                    this.showSpinner = false;
                };

                this.saveStudentFeedback = function() {
                    this.showSpinner = true;
                    $log.debug('saving studentFeedback : ', this.lessonSummary.studentFeedback);
                    return ZnkLessonNotesSrv.saveStudentFeedback(this.lessonSummary.id, this.lessonSummary.studentFeedback)
                        .then(() => {
                            this.showSpinner = false;
                            this.closeModal();
                        })
                        .catch(err => {
                            $log.error('lessonNotesPopup: saveLessonSummary failed. Error: ', err);
                            this.showSpinner = false;
                        });

                };

                this.closeModal = function () {
                    $mdDialog.cancel();
                };
            }]
        );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonRating', {
            bindings: {
                lesson: '=',
                lessonSummary: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating/lesson-rating.component.html',
            controllerAs: 'vm',
            controller: ["$log", "$translate", "UserTypeContextEnum", function ($log, $translate, UserTypeContextEnum) {
                'ngInject';

                this.MIN_STATR_FOR_RATING_FEEDBACK = 4;
                this.MAX_STARS = 5;
                this.starArr = [];
                this.showComponent = false;

                this.$onInit = () => {
                    $log.debug('znkLessonRating: Init');
                    this.lessonSummary.studentFeedback = this.lessonSummary.studentFeedback || {};
                    this.lessonSummary.studentFeedback.studentFreeText = this.lessonSummary.studentFeedback.studentFreeText || '';
                    this.initStarsArr();
                    if (this.lessonSummary.studentFeedback.rating) {
                        this.ratingChanged(this.lessonSummary.studentFeedback.rating);
                    }
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.showComponent = this.isAdmin || this.userContext === UserTypeContextEnum.STUDENT.enum;
                    this.readOnlyStudentFeedback = this.isAdmin ? this.getStudentFeedback() : null;
                };

                this.initStarsArr = () => {
                    for (let i = 0; i < this.MAX_STARS; i++) {
                        let starNum = i + 1;
                        this.starArr[i] = {
                            title: $translate.instant(`LESSON_NOTES.LESSON_RATING_POPUP.STAR${starNum}`),
                            active: (starNum === this.lessonSummary.studentFeedback.rating),  // boolean
                            value: starNum,
                        };
                    }
                };

                this.onHover = (selectedStar, bool) => {
                    if (this.isAdmin) { return; }
                    this.starArr.forEach(star => {
                        star.hover = bool && (star.value <= selectedStar.value);
                    });
                };

                this.ratingChanged = (rating) => {
                    if (this.isAdmin) { return; }
                    $log.debug('lesson rating changed: ', rating);
                    this.starArr.forEach(star => {
                        star.active = star.value <= rating;
                    });
                    this.lessonSummary.studentFeedback.rating = rating;
                };

                this.getStudentFeedback = () => {
                    let strToReturn = '';

                    if (this.lessonSummary.studentFeedback.multipleChoice) {
                        strToReturn += this.lessonSummary.studentFeedback.multipleChoice.join('; ');
                        strToReturn += '\n\r';
                        strToReturn += this.lessonSummary.studentFeedback.studentFreeText;
                    } else {
                        strToReturn = this.lessonSummary.studentFeedback.studentFreeText;
                    }

                    return strToReturn;
                };

            }]
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkMultipleChoice', {
            bindings: {
                lesson: '=',
                lessonSummary: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating/znk-multiple-choice/multiple-choice.component.html',
            controllerAs: 'vm',
            controller: ["$log", "$translate", function ($log, $translate) {
                'ngInject';

                this.nameSpace = 'LESSON_NOTES.LESSON_RATING_POPUP.MULTIPLE_CHOICE';
                this.choicesArr = [];

                this.$onInit = () => {
                    this.lessonSummary.studentFeedback.multipleChoice = this.lessonSummary.studentFeedback.multipleChoice || [];
                    this.getTranslations().then((translations) => {
                        this.choicesArr = Object.keys(translations).map(key => {
                            return { name: translations[key], active: false };
                        });

                        if (this.lessonSummary.studentFeedback.multipleChoice.length) {
                            this.lessonSummary.studentFeedback.multipleChoice.forEach(studentChoice => {
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
                        `${this.nameSpace}.CHOICE8`,
                    ]);
                };

                this.updateChoice = (choice) => {
                    choice.active = !choice.active;
                    if (choice.active) {
                        this.lessonSummary.studentFeedback.multipleChoice.push(choice.name);
                    } else {
                        this.lessonSummary.studentFeedback.multipleChoice =
                            this.lessonSummary.studentFeedback.multipleChoice.filter(item => item !== choice.name);
                    }
                };

            }]
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesUiSrv',
        ["$log", "$rootScope", "$rootElement", "$http", "ENV", "$mdDialog", "LessonNotesStatusEnum", "UtilitySrv", function ($log, $rootScope, $rootElement, $http, ENV, $mdDialog, LessonNotesStatusEnum, UtilitySrv) {
            'ngInject';

            this.openLessonNotesPopup = (lesson, lessonSummary, userContext) => {
                return $mdDialog.show({
                    locals: { lesson, lessonSummary, userContext },
                    controller: 'lessonNotesPopupCtrl',
                    controllerAs: 'vm',
                    templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-notes-popup.template.html',
                    clickOutsideToClose: false,
                    escapeToClose: true
                });
            };

            this.openLessonRatingPopup = (lesson, lessonSummary) => {
                return $mdDialog.show({
                    locals: { lesson, lessonSummary },
                    controller: 'lessonRatingPopupCtrl',
                    controllerAs: 'vm',
                    templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating-popup.template.html',
                    clickOutsideToClose: false,
                    escapeToClose: true
                });
            };

            this.newLessonSummary = () => {
                return {
                    id: UtilitySrv.general.createGuid(),
                    startTime: null,
                    endTime: null,
                    liveSessions: [],
                    studentFeedback: null,
                    lessonNotes: {
                        status: LessonNotesStatusEnum.PENDING_COMPLETION.enum
                    },
                    dbType: 'lessonSummary'
                };
            };

            this.updateLessonSummaryFromLiveSessionData  = (lessonSummary, liveSessionData) => {
                lessonSummary.startTime = lessonSummary.startTime || liveSessionData.startTime;
                lessonSummary.endTime = liveSessionData.endTime;
                lessonSummary.liveSessions.push(liveSessionData.guid);
                return lessonSummary;
            };

            this.getUserFullName = (profile) => {
                if (!profile) {
                    return;
                }
                let name = '';
                name += profile.firstName ? profile.firstName + ' ' : '';
                name += profile.lastName ? profile.lastName : '';

                return name ? name : profile.nickname ? profile.nickname : '';
            };

            this.convertMS = (ms) => {
                let day, hour, min, sec;
                sec = Math.floor(ms / 1000);
                min = Math.floor(sec / 60);
                sec = sec % 60;
                hour = Math.floor(min / 60);
                min = min % 60;
                day = Math.floor(hour / 24);
                hour = hour % 24;
                return {day, hour, min, sec};
            };

            this.isNullOrUndefined = (obj) => {
                return typeof obj === "undefined" || obj === null;
            };

        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesSrv',
        ["$q", "$log", "$rootScope", "$rootElement", "$http", "ENV", function ($q, $log, $rootScope, $rootElement, $http, ENV) {
            'ngInject';

            let schedulingApi = `${ENV.znkBackendBaseUrl}/scheduling`;
            let lessonApi = `${ENV.znkBackendBaseUrl}/lesson`;
            let serviceBackendUrl = `${ENV.znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${ENV.znkBackendBaseUrl}/userprofile`;

            this.sendEmailIndicators = {};

            this.getLessonById = (lessonId) => {
                const getLessonsApi = `${schedulingApi}/getLessonById?lessonId=${lessonId}`;
                return $http.get(getLessonsApi, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(lesson => lesson.data)
                    .catch((err) => $log.error('getLessonById: Failed to get lesson summary by  id: ',
                        lessonId, ' Error: ', err));
            };

            this.getLessonSummaryById = (lessonSummaryId) => {
                const getLessonSummaryApi = `${lessonApi}/getLessonSummaryById?lessonSummaryId=${lessonSummaryId}`;
                return $http.get(getLessonSummaryApi, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(lessonSummary => lessonSummary.data)
                    .catch((err) => $log.error('getLessonSummaryById: Failed to get lesson summary by id: ',
                        lessonSummaryId, ' Error: ', err));
            };

            this.getEducatorStudentIds = (educatorId) => {
                const getEducatorStudentIdsApi = `${schedulingApi}/getStudentsIdsByEducatorId/${educatorId}`;
                return $http.get(getEducatorStudentIdsApi, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(lessonSummary => lessonSummary.data)
                    .catch((err) => $log.error('getEducatorStudentIds: Failed to get students by educatorId: ',
                        educatorId, ' Error: ', err));
            };

            this.getLessonsByLessonSummaryIds = (lessonSummaryIds) => {
                const getLessonsByLessonSummaryIdsApi = `${lessonApi}/getLessonsByLessonSummaryIds`;
                return $http.post(getLessonsByLessonSummaryIdsApi, lessonSummaryIds)
                    .then(lessons => lessons.data)
                    .catch((err) => $log.error('getLessonsByLessonSummaryIds: Failed to get lesson by ' +
                        'lesson summary by  ids: ', lessonSummaryIds, ' Error: ', err));
            };

            this.getLessonsByBackToBackId = (backToBackId) => {
                const getBackToBackApi = `${lessonApi}/getLessonsByBackToBackId?backToBackId=${backToBackId}`;
                return $http.get(getBackToBackApi, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(lessons => lessons.data)
                    .catch((err) => $log.error('getLessonsByBackToBackId: Failed to get lessons by backToBackId: ',
                        backToBackId, ' Error: ', err));
            };

            this.getLessonsByStudentIds = (studentIds, dateRange, educatorId, lessonStatusList, serviceId) => {
                const getLessonsByStudentIds = `${schedulingApi}/getLessonsByStudentIds`;
                return $http.post(getLessonsByStudentIds, {studentIds, dateRange, educatorId, lessonStatusList, serviceId})
                    .then(lessons => lessons.data)
                    .catch((err) => $log.error('getLessonsByStudentIds: Failed to get lessons by studentIds: ',
                        studentIds, ' Error: ', err));
            };

            this.updateLesson = (lessonToUpdate) => {
                const updateLessonApi = `${schedulingApi}/updateLesson`;
                return $http.post(updateLessonApi, {lesson: lessonToUpdate, isRecurring: false})
                    .then(lessons => lessons.data[0])
                    .catch((err) => $log.error('updateLesson: Failed to update lesson: ',
                        lessonToUpdate, ' Error: ', err));
            };

            this.updateLessonsStatus = (id, newStatus, isBackToBackId) => {
                const lessonsProm = isBackToBackId ? this.getLessonsByBackToBackId(id) : this.getLessonById(id);
                // lessonsProm: Could return lessons array or single lesson
                return lessonsProm.then(lessons => {
                    lessons = isBackToBackId ? lessons : lessons ? [lessons] : null;
                    let updateLessonPromArr = [];
                    if (lessons && lessons.length) {
                        updateLessonPromArr = lessons.map(lesson => {
                            // TODO: need to validate previous status before update
                            lesson.status = newStatus;
                            return this.updateLesson(lesson);
                        });
                        return $q.all(updateLessonPromArr);
                    } else {
                        $log.error(`updateLessonsStatus: NO lessons are found with this id: ${id}, isBackToBackId: ${isBackToBackId}`);
                    }
                });
            };

            this.saveStudentFeedback = (lessonSummaryId, studentFeedback) => {
                const saveStudentFeedbackApi = `${lessonApi}/saveStudentFeedback`;
            return $http.post(saveStudentFeedbackApi, { lessonSummaryId, studentFeedback })
                .then(studentFeedback => studentFeedback.data)
                .catch((err) => $log.error('saveStudentFeedback: Failed to save studentFeedback: ',
                    studentFeedback, ' Error: ', err));
        };

            this.saveLessonSummary = (lessonSummary, sendEmailIndicators) => {
                const saveLessonSummaryApi = `${lessonApi}/saveLessonSummary`;
                return $http.post(saveLessonSummaryApi, {lessonSummary, sendEmailIndicators})
                    .then(lessonSummary => lessonSummary)
                    .catch((err) => $log.error('saveLessonSummary: Failed to save lesson summary: ',
                        lessonSummary, ' Error: ', err));
            };

            this.getServiceList = () => {
                return $http.get(`${serviceBackendUrl}/`, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(services => services.data)
                    .catch((err) => $log.error('getServiceList: Failed to get service list. Error: ', err));
            };

            this.getGlobalVariables = () => {
                return $http.get(`${globalBackendUrl}`, {timeout: ENV.promiseTimeOut, cache: true})
                    .then(globalVariables => globalVariables.data)
                    .catch((err) => $log.error('getGlobalVariables: Failed to get global variables. Error: ', err));
            };

            this.getUserProfiles = (uidArr) => {
                return $http.post(`${userProfileEndPoint}/getuserprofiles`, uidArr)
                    .then(userProfiles => userProfiles.data)
                    .catch((err) => $log.error('getUserProfiles: Failed to get user profiles: ',
                        uidArr, ' Error: ', err));
            };

        }]
    );
})(angular);

angular.module('znk.infra-web-app.znkLessonNotes').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-details/lesson-details.component.html",
    "<div class=\"lesson-details\" ng-if=\"vm.viewModal\">\n" +
    "    <div class=\"left-col\">\n" +
    "\n" +
    "        <div class=\"lato-14-n field\" ng-if=\"vm.viewModal.serviceName.val\">\n" +
    "            <div class=\"label\">{{vm.viewModal.serviceName.label}}</div>\n" +
    "            <div class=\"text\">{{vm.viewModal.serviceName.val}}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"lato-14-n field\" ng-if=\"vm.viewModal.topicName.val\">\n" +
    "            <div class=\"label\">{{vm.viewModal.topicName.label}}</div>\n" +
    "            <div class=\"text\">{{vm.viewModal.topicName.val}}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"lato-14-n field student-list-field\" ng-if=\"vm.viewModal.studentList.val.length && !vm.isStudent\">\n" +
    "            <div class=\"label\">{{vm.viewModal.studentList.label}}</div>\n" +
    "            <div class=\"student-list\">\n" +
    "                <div class=\"student-wrapper\" ng-repeat=\"student in vm.viewModal.studentList.val track by $index\"\n" +
    "                     ng-class=\"{'attended': student.attendanceStatus===vm.LessonStatusEnum.ATTENDED.enum,\n" +
    "                         'missed': student.attendanceStatus===vm.LessonStatusEnum.MISSED.enum}\">\n" +
    "                    <div class=\"student-name\">{{student.firstName || ''}} {{student.lastName || ''}}</div>\n" +
    "                    <svg-icon class=\"svg-v-icon\" name=\"znkLessonNotes-v-icon\" ng-mouseover=\"vm.showTooltipV=true\"\n" +
    "                              ng-mouseleave=\"vm.showTooltipV=false\"\n" +
    "                              ng-click=\"vm.updateAttendanceStatus(student, vm.LessonStatusEnum.ATTENDED.enum)\"></svg-icon>\n" +
    "                    <md-tooltip md-visible=\"vm.showTooltipV\" md-direction=\"bottom\" class=\"md-fab\">\n" +
    "                        <div translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.ATTENDED\"></div>\n" +
    "                    </md-tooltip>\n" +
    "\n" +
    "                    <svg-icon class=\"svg-x-icon\" name=\"znkLessonNotes-x-icon\" ng-mouseover=\"vm.showTooltipX=true\"\n" +
    "                              ng-mouseleave=\"vm.showTooltipX=false\"\n" +
    "                              ng-click=\"vm.updateAttendanceStatus(student, vm.LessonStatusEnum.MISSED.enum)\"></svg-icon>\n" +
    "                    <md-tooltip md-visible=\"vm.showTooltipX\" md-direction=\"bottom\" class=\"md-fab\">\n" +
    "                        <div translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.MISSED\"></div>\n" +
    "                    </md-tooltip>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"right-col\">\n" +
    "        <div class=\"lato-14-n field\" ng-if=\"vm.viewModal.educatorName.val && (vm.isAdmin || vm.isStudent)\">\n" +
    "            <div class=\"label\">{{vm.viewModal.educatorName.label}}</div>\n" +
    "            <div class=\"text\">{{vm.viewModal.educatorName.val}}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"lato-14-n field\" ng-if=\"vm.viewModal.lessonDate.val\">\n" +
    "            <div class=\"label\">{{vm.viewModal.lessonDate.label}}</div>\n" +
    "            <div class=\"text\">{{vm.viewModal.lessonDate.val}}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"lato-14-n field\" ng-if=\"vm.viewModal.actualTime.val\">\n" +
    "            <div class=\"label\">{{vm.viewModal.actualTime.label}}</div>\n" +
    "            <div class=\"text\">{{vm.viewModal.actualTime.val}}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"lato-14-n field\" ng-if=\"vm.viewModal.duration.val\">\n" +
    "            <div class=\"label\">{{vm.viewModal.duration.label}}</div>\n" +
    "            <div class=\"text\">{{vm.viewModal.duration.val}}</div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"lato-14-n field\" ng-if=\"vm.isStudent && vm.viewModal.lessonStatus.val\">\n" +
    "            <div class=\"label\">{{vm.viewModal.lessonStatus.label}}</div>\n" +
    "            <div class=\"text\" ng-class=\"vm.LessonStatusEnum[vm.viewModal.lessonStatus.val]\">\n" +
    "                {{vm.LessonStatusEnum[vm.viewModal.lessonStatus.val]}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <!--If admin or teacher show select-->\n" +
    "        <div class=\"lato-14-n field\" ng-if=\"!vm.isStudent\">\n" +
    "            <div class=\"label\">{{vm.viewModal.lessonStatus.label}}</div>\n" +
    "            <select ng-model=\"vm.viewModal.lessonStatus.val\" ng-class=\"{\n" +
    "             'attended': vm.lesson.status === vm.LessonStatusEnum.ATTENDED.enum,\n" +
    "             'missed': vm.lesson.status === vm.LessonStatusEnum.MISSED.enum}\"\n" +
    "                    ng-change=\"vm.statusChanged(vm.viewModal.lessonStatus.val)\">\n" +
    "                <option value=\"\" translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.SELECT\"></option>\n" +
    "                <option ng-repeat=\"status in vm.lessonStatusArr\" value=\"{{status.enum}}\">{{status.val}}</option>\n" +
    "            </select>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-notes-popup.template.html",
    "<div class=\"lesson-notes-popup\" ng-if=\"vm.lesson && vm.lessonSummary\">\n" +
    "\n" +
    "    <header class=\"znk-popup-header\">\n" +
    "        <div class=\"icon-wrapper\">\n" +
    "            <svg-icon name=\"znkLessonNotes-zoe-new-record\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.doItLater()\">\n" +
    "            <svg-icon name=\"znkLessonNotes-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </header>\n" +
    "\n" +
    "    <main class=\"content-wrapper\">\n" +
    "        <div class=\"title\" translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TITLE\"></div>\n" +
    "        <div class=\"znk-scrollbar\">\n" +
    "            <znk-lesson-details lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" user-context=\"vm.userContext\"></znk-lesson-details>\n" +
    "            <div class=\"error\" ng-if=\"vm.showStatusError\" translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.LESSON_STATUS_REQUIRED\"></div>\n" +
    "            <znk-lesson-started-late lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" user-context=\"vm.userContext\"></znk-lesson-started-late>\n" +
    "            <div class=\"divider\" ng-if=\"vm.isAdmin\"></div>\n" +
    "\n" +
    "            <znk-lesson-rating ng-if=\"vm.isAdmin || vm.isStudent\" lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" user-context=\"vm.userContext\"></znk-lesson-rating>\n" +
    "            <div class=\"divider\" ng-if=\"vm.isAdmin\"></div>\n" +
    "\n" +
    "            <znk-lesson-teacher-notes lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" user-context=\"vm.userContext\"></znk-lesson-teacher-notes>\n" +
    "        </div>\n" +
    "    </main>\n" +
    "\n" +
    "    <footer>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"btn-group\">\n" +
    "            <button type=\"button\" class=\"btn-type-1 save-btn\" ng-click=\"vm.submit()\">\n" +
    "                <span class=\"btn-text\" translate=\"LESSON_NOTES.SUBMIT\"></span>\n" +
    "                <span class=\"spinner\" ng-if=\"vm.showSpinner\"></span>\n" +
    "            </button>\n" +
    "            <button type=\"button\" class=\"btn-type-link\" ng-click=\"vm.doItLater()\"\n" +
    "                    translate=\"LESSON_NOTES.DO_IT_LATER\">\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </footer>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-started-late/lesson-started-late.component.html",
    "<div class=\"lesson-started-late\" ng-if=\"vm.lessonStartedLate && !vm.isAdmin\">\n" +
    "    <div class=\"teacher-view\" ng-if=\"vm.isTeacher\">\n" +
    "        <span class=\"quicksand-12-b\">{{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.STUDENT_LATE' | translate}}</span>\n" +
    "        <div class=\"teacher-view-btn-group\">\n" +
    "            <button ng-class=\"[vm.lessonSummary.lessonNotes.isStudentLate ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                    ng-click=\"vm.lessonSummary.lessonNotes.isStudentLate = !vm.lessonSummary.lessonNotes.isStudentLate\">\n" +
    "                {{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.YES' | translate}}\n" +
    "            </button>\n" +
    "            <button ng-class=\"[!vm.lessonSummary.lessonNotes.isStudentLate ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                    ng-click=\"vm.lessonSummary.lessonNotes.isStudentLate = !vm.lessonSummary.lessonNotes.isStudentLate\">\n" +
    "                {{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.NO' | translate}}\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"student-view\" ng-if=\"!vm.isTeacher\">\n" +
    "        <span class=\"quicksand-12-b\">{{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.TEACHER_LATE' | translate}}</span>\n" +
    "        <div class=\"student-view-btn-group\">\n" +
    "            <button ng-class=\"[vm.lessonSummary.studentFeedback.isTeacherLate ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                    ng-click=\"vm.lessonSummary.studentFeedback.isTeacherLate = !vm.lessonSummary.studentFeedback.isTeacherLate\">\n" +
    "                {{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.YES' | translate}}\n" +
    "            </button>\n" +
    "            <button ng-class=\"[!vm.lessonSummary.studentFeedback.isTeacherLate ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                    ng-click=\"vm.lessonSummary.studentFeedback.isTeacherLate = !vm.lessonSummary.studentFeedback.isTeacherLate\">\n" +
    "                {{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.NO' | translate}}\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/lesson-teacher-notes.component.html",
    "<div class=\"lesson-teacher-notes\" ng-if=\"vm.showComponent\">\n" +
    "\n" +
    "    <div class=\"lato-18-n znk-uppercase\" ng-if=\"vm.isAdmin\"\n" +
    "         translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.ADMIN_TITLE\"></div>\n" +
    "\n" +
    "    <div class=\"teacher-title\" ng-if=\"!vm.isAdmin\">\n" +
    "        <div>{{'LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.TEACHER_TITLE1' | translate}}</div>\n" +
    "        <div>{{'LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.TEACHER_TITLE2' | translate}}</div>\n" +
    "    </div>\n" +
    "\n" +
    "    <textarea class=\"lato-14-n note-txt\" ng-model=\"vm.lessonSummary.lessonNotes.educatorNotes\"></textarea>\n" +
    "\n" +
    "    <znk-send-email-notes lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" user-context=\"vm.userContext\"></znk-send-email-notes>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/send-email-notes/send-email-notes.component.html",
    "<div class=\"send-email-notes\">\n" +
    "    <div class=\"lato-16-n\">\n" +
    "        <span translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.SEND_NOTES\"></span>\n" +
    "    </div>\n" +
    "    <div class=\"checkbox-group\">\n" +
    "        <div class=\"input-wrap\">\n" +
    "            <input id=\"studentsMail\" type=\"checkbox\" ng-model=\"vm.sendMailToStudents\"\n" +
    "                   ng-change=\"vm.emailSelectionChanged()\">\n" +
    "            <ng-switch on=\"vm.lessonSummary.studentIds.length < 2\">\n" +
    "                <label for=\"studentsMail\" ng-switch-when=\"true\"\n" +
    "                       translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.STUDENT_MAIL\"></label>\n" +
    "                <label for=\"studentsMail\" ng-switch-when=\"false\"\n" +
    "                       translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.ALL_STUDENTS_MAIL\"></label>\n" +
    "            </ng-switch>\n" +
    "        </div>\n" +
    "        <div class=\"input-wrap\">\n" +
    "            <input id=\"parentsMail\" type=\"checkbox\" ng-model=\"vm.sendMailToParents\"\n" +
    "                   ng-change=\"vm.emailSelected()\">\n" +
    "            <ng-switch on=\"vm.lessonSummary.studentIds.length < 2\">\n" +
    "                <label for=\"parentsMail\" ng-switch=\"\" ng-switch-when=\"true\"\n" +
    "                       translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.PARENT_MAIL\"></label>\n" +
    "                <label for=\"parentsMail\" ng-switch-when=\"false\"\n" +
    "                       translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.ALL_PARENTS_MAIL\"></label>\n" +
    "            </ng-switch>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"text-muted\" ng-if=\"vm.lessonSummary.lessonNotes.sendMailTime\">\n" +
    "        <span translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.SENT_ON\"></span>\n" +
    "        <span> {{vm.lessonSummary.lessonNotes.sendMailTime | date: 'MMM d, h:mm a'}}</span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-rating-popup/lesson-rating-popup.template.html",
    "<div class=\"lesson-rating-popup\" ng-if=\"vm.lesson && vm.lessonSummary\">\n" +
    "\n" +
    "    <header class=\"znk-popup-header\">\n" +
    "        <div class=\"icon-wrapper\">\n" +
    "            <svg-icon name=\"znkLessonNotes-star\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"znkLessonNotes-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </header>\n" +
    "\n" +
    "    <main class=\"content-wrapper\">\n" +
    "        <div class=\"quicksand-25-b title\" translate=\"LESSON_NOTES.LESSON_RATING_POPUP.TITLE\"></div>\n" +
    "        <div class=\"znk-scrollbar\">\n" +
    "            <znk-lesson-details lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" user-context=\"vm.userContext\"></znk-lesson-details>\n" +
    "            <div class=\"divider\"></div>\n" +
    "\n" +
    "            <znk-lesson-rating lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" user-context=\"vm.userContext\"></znk-lesson-rating>\n" +
    "        </div>\n" +
    "\n" +
    "    </main>\n" +
    "\n" +
    "    <footer>\n" +
    "        <div class=\"divider\"></div>\n" +
    "        <div class=\"btn-group\">\n" +
    "            <button type=\"button\" class=\"btn-type-1 save-btn\" ng-click=\"vm.saveStudentFeedback()\">\n" +
    "                <span class=\"btn-text\" translate=\"LESSON_NOTES.SUBMIT\"></span>\n" +
    "                <span class=\"spinner\" ng-if=\"vm.showSpinner\"></span>\n" +
    "            </button>\n" +
    "\n" +
    "            <button type=\"button\" class=\"btn-type-link\" ng-click=\"vm.closeModal()\"\n" +
    "                    translate=\"LESSON_NOTES.DO_IT_LATER\">\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </footer>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-rating-popup/lesson-rating/lesson-rating.component.html",
    "<div class=\"lesson-rating\" ng-if=\"vm.showComponent\">\n" +
    "\n" +
    "    <div class=\"lato-18-n lesson-rating-title\" ng-if=\"vm.isAdmin\"\n" +
    "         translate=\"LESSON_NOTES.LESSON_RATING_POPUP.SUB_TITLE\"></div>\n" +
    "\n" +
    "    <div class=\"rating\" ng-class=\"[vm.isAdmin ? 'admin-view' : 'margin-20']\">\n" +
    "        <svg-icon class=\"star-icon\" name=\"znkLessonNotes-star\" ng-repeat=\"star in vm.starArr\"\n" +
    "                  ng-mouseenter=\"vm.onHover(star, true)\" ng-mouseleave=\"vm.onHover(star, false)\" title=\"{{star.title}}\"\n" +
    "                  ng-class=\"{'active': star.active, 'hover': star.hover}\" ng-click=\"vm.ratingChanged(star.value)\">\n" +
    "        </svg-icon>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"bad-rating-wrapper\" ng-if=\"vm.lessonSummary.studentFeedback.rating <= vm.MIN_STATR_FOR_RATING_FEEDBACK\">\n" +
    "\n" +
    "        <znk-multiple-choice lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" ng-if=\"!vm.isAdmin\"></znk-multiple-choice>\n" +
    "\n" +
    "        <textarea class=\"lato-14-n note-txt admin-view\" ng-if=\"vm.isAdmin\" readonly>{{vm.readOnlyStudentFeedback}}</textarea>\n" +
    "\n" +
    "        <div class=\"student-feedback\" ng-if=\"!vm.isAdmin\">\n" +
    "            <div class=\"lato-14-n other\">{{'LESSON_NOTES.LESSON_RATING_POPUP.OTHER' | translate}}</div>\n" +
    "            <textarea class=\"lato-14-n note-txt\"\n" +
    "                      placeholder=\"{{'LESSON_NOTES.LESSON_RATING_POPUP.FREE_TEXT_PLACEHOLDER' | translate}}\"\n" +
    "                      ng-model=\"vm.lessonSummary.studentFeedback.studentFreeText\"></textarea>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <znk-lesson-started-late lesson=\"vm.lesson\" lesson-summary=\"vm.lessonSummary\" user-context=\"vm.userContext\"></znk-lesson-started-late>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-rating-popup/lesson-rating/znk-multiple-choice/multiple-choice.component.html",
    "<div class=\"multiple-choice\">\n" +
    "    <div class=\"quicksand-16-b multiple-choice-title\" translate=\"LESSON_NOTES.LESSON_RATING_POPUP.MULTIPLE_CHOICE.TITLE\"></div>\n" +
    "\n" +
    "    <div class=\"choice-group\">\n" +
    "        <button ng-repeat=\"choice in vm.choicesArr track by $index\"\n" +
    "               ng-class=\"[choice.active ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                ng-click=\"vm.updateChoice(choice)\">{{choice.name}}</button>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/svg/close-popup.svg",
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-1010.6 704.8 137.2 137.5\" style=\"enable-background:new -1010.6 704.8 137.2 137.5;\" xml:space=\"preserve\">\n" +
    "<path class=\"st0\" d=\"M-412,214.5\"/>\n" +
    "<g>\n" +
    "	<path class=\"st1\" d=\"M-879.4,842.3c-1.5,0-3.1-0.6-4.2-1.8l-125.2-125.3c-2.3-2.3-2.3-6.1,0-8.5c2.3-2.3,6.1-2.3,8.5,0l125.2,125.3\n" +
    "		c2.3,2.3,2.3,6.1,0,8.5C-876.3,841.7-877.9,842.3-879.4,842.3z\"/>\n" +
    "	<path class=\"st1\" d=\"M-1004.6,842c-1.5,0-3.1-0.6-4.2-1.8c-2.3-2.3-2.3-6.1,0-8.5l125.2-125.2c2.3-2.3,6.1-2.3,8.5,0\n" +
    "		c2.3,2.3,2.3,6.1,0,8.5l-125.2,125.2C-1001.5,841.4-1003.1,842-1004.6,842z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/svg/star.svg",
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n" +
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 28.6 27.2\" style=\"enable-background:new 0 0 28.6 27.2;\" xml:space=\"preserve\">\n" +
    "<path id=\"XMLID_14_\" class=\"st0\" d=\"M15.1,0.5l3.7,7.6c0.1,0.3,0.4,0.4,0.6,0.5l8.4,1.2c0.7,0.1,1,1,0.5,1.5l-6.1,5.9\n" +
    "	c-0.2,0.2-0.3,0.5-0.2,0.8l1.4,8.3c0.1,0.7-0.6,1.2-1.3,0.9l-7.5-3.9c-0.3-0.1-0.6-0.1-0.8,0l-7.5,3.9c-0.6,0.3-1.4-0.2-1.3-0.9\n" +
    "	l1.4-8.3c0-0.3,0-0.6-0.2-0.8l-6.1-5.9C-0.3,10.7,0,9.9,0.7,9.8l8.4-1.2c0.3,0,0.5-0.2,0.6-0.5l3.7-7.6C13.8-0.2,14.7-0.2,15.1,0.5z\n" +
    "	\"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/svg/v-icon.svg",
    "<?xml version=\"1.0\" encoding=\"iso-8859-1\"?>\n" +
    "<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n" +
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\">\n" +
    "<g>\n" +
    "	<g>\n" +
    "		<path d=\"M504.502,75.496c-9.997-9.998-26.205-9.998-36.204,0L161.594,382.203L43.702,264.311c-9.997-9.998-26.205-9.997-36.204,0\n" +
    "			c-9.998,9.997-9.998,26.205,0,36.203l135.994,135.992c9.994,9.997,26.214,9.99,36.204,0L504.502,111.7\n" +
    "			C514.5,101.703,514.499,85.494,504.502,75.496z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/svg/x-icon.svg",
    "<?xml version=\"1.0\" encoding=\"iso-8859-1\"?>\n" +
    "<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n" +
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 512.001 512.001\" style=\"enable-background:new 0 0 512.001 512.001;\" xml:space=\"preserve\">\n" +
    "<g>\n" +
    "	<g>\n" +
    "		<path d=\"M294.111,256.001L504.109,46.003c10.523-10.524,10.523-27.586,0-38.109c-10.524-10.524-27.587-10.524-38.11,0L256,217.892\n" +
    "			L46.002,7.894c-10.524-10.524-27.586-10.524-38.109,0s-10.524,27.586,0,38.109l209.998,209.998L7.893,465.999\n" +
    "			c-10.524,10.524-10.524,27.586,0,38.109c10.524,10.524,27.586,10.523,38.109,0L256,294.11l209.997,209.998\n" +
    "			c10.524,10.524,27.587,10.523,38.11,0c10.523-10.524,10.523-27.586,0-38.109L294.111,256.001z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "<g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/svg/zoe-new-record-popup-top-icon.svg",
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
    "<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n" +
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 134 126\" style=\"enable-background:new 0 0 134 126;\" xml:space=\"preserve\">\n" +
    "<g id=\"CxUJay.tif\">\n" +
    "	<g id=\"XMLID_14_\">\n" +
    "		<path id=\"XMLID_96_\" d=\"M87.8,0c9.7,3.5,13.3,9.9,11.2,20.3c-0.2,0.8-0.8,1.5-1.4,2.2c-2.2,2.5-4.4,5-6.6,7.5\n" +
    "			c-0.4-0.3-0.9-0.5-1.3-0.8c0-4.8,0-9.7,0-14.5c0-4.4-0.9-5.3-5.3-5.3c-23.5,0-46.9,0-70.4,0c-4.1,0-4.9,0.9-4.9,4.9\n" +
    "			c0,32.4,0,64.8,0,97.2c0,4,0.9,4.9,4.9,4.9c23.6,0,47.1,0,70.7,0c3.9,0,4.9-1,4.9-5c0-10.2,0.1-20.3,0-30.5c0-2.5,0.7-4.4,2.6-6.1\n" +
    "			c2-1.9,3.7-4.2,5.5-6.3c0.4,0.2,0.9,0.5,1.3,0.7c0,1,0,2,0,3.1c0,12.3,0,24.6,0,36.9c0,10.7-2.1,13.6-12,16.8\n" +
    "			c-25.2,0-50.5,0-75.7,0c-5.5-1.4-9.6-4.4-11.4-10.1C0,80.6,0,45.4,0,10.1C1.9,4.5,5.7,1.2,11.4,0C36.9,0,62.3,0,87.8,0z\"/>\n" +
    "		<path id=\"XMLID_95_\" d=\"M134,22.1C116,39.5,97.9,57,79.9,74.4c-1,0.9-1.9,1.8-2.8,2.6c-3.8-3.8-7.4-7.4-11.2-11.2\n" +
    "			c19-18.3,38-36.6,58-55.9c3.5,3.9,6.8,7.7,10.2,11.5C134,21.7,134,21.9,134,22.1z\"/>\n" +
    "		<path id=\"XMLID_90_\" d=\"M16.8,18.2c21.8,0,43.4,0,65.6,0c0,6.1,0.1,12.3-0.1,18.5c0,1.1-1.8,2.1-2.6,3.3c-4.6,6.2-10.6,8-18.2,7.6\n" +
    "			c-13.6-0.6-27.2-0.2-40.9-0.2c-1.2,0-2.4,0-3.7,0C16.8,37.4,16.8,27.9,16.8,18.2z M73,27.6c-15.9,0-31.4,0-46.9,0\n" +
    "			c0,3.6,0,6.9,0,10.3c15.8,0,31.3,0,46.9,0C73,34.3,73,31,73,27.6z\"/>\n" +
    "		<path id=\"XMLID_89_\" d=\"M16.9,107.9c0-2.9,0-5.7,0-8.6c21.8,0,43.5,0,65.3,0c0,2.8,0,5.6,0,8.6C60.5,107.9,38.9,107.9,16.9,107.9z\n" +
    "			\"/>\n" +
    "		<path id=\"XMLID_88_\" d=\"M16.9,67.5c0-3,0-5.9,0-8.9c10.8,0,21.5,0,32.4,0c0,2.9,0,5.8,0,8.9C38.5,67.5,27.8,67.5,16.9,67.5z\"/>\n" +
    "		<path id=\"XMLID_87_\" d=\"M17,79.8c10.9,0,21.5,0,32.4,0c0,2.9,0,5.6,0,8.7c-10.7,0-21.4,0-32.4,0C17,85.8,17,82.9,17,79.8z\"/>\n" +
    "		<path id=\"XMLID_86_\" d=\"M72.9,81.1c-5.2,1.8-10.5,3.6-16.6,5.6c2.1-6,4-11.4,5.7-16.3C65.7,74,69.3,77.4,72.9,81.1z\"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
}]);
