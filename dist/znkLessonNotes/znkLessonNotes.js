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
            'znk.infra.config'
        ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                let svgMap = {
                    'znkLessonNotes-star': 'components/znkLessonNotes/svg/star.svg',
                    'znkLessonNotes-zoe-new-record': 'components/znkLessonNotes/svg/zoe-new-record-popup-top-icon.svg',
                    'znkLessonNotes-close-popup': 'components/znkLessonNotes/svg/close-popup.svg'
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
                ['PENDING_NOTES', 1, 'pendingNotes'],
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
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-details/lesson-details.component.html',
            controllerAs: 'vm',
            controller: ["$http", "$q", "$log", "$filter", "ENV", "$translate", "LessonStatusEnum", "ZnkLessonNotesSrv", "ZnkLessonNotesUiSrv", "UserTypeContextEnum", function ($http, $q, $log, $filter, ENV, $translate, LessonStatusEnum, ZnkLessonNotesSrv,
                                  ZnkLessonNotesUiSrv, UserTypeContextEnum) {
                'ngInject';

                this.dataPromMap = {};
                this.nameSpace = 'LESSON_NOTES.LESSON_NOTES_POPUP';
                this.fields = [];
                this.userTypeContextEnum = UserTypeContextEnum;

                this.$onInit = function () {
                    $log.debug('znkLessonInfo: Init');
                    this.dataPromMap.translate = this.getTranslations();
                    this.lessonStatusArr = LessonStatusEnum.getEnumArr();
                    this.initLessonInfo();
                };

                this.getTranslations = () => {
                    return $translate([
                        `${this.nameSpace}.TEST`,
                        `${this.nameSpace}.TOPIC`,
                        `${this.nameSpace}.EDUCATOR`,
                        `${this.nameSpace}.STUDENT`,
                        `${this.nameSpace}.DATE`,
                        `${this.nameSpace}.START_TIME`,
                        `${this.nameSpace}.DURATION`,
                        `${this.nameSpace}.STATUS`,
                    ]);
                };

                this.initLessonInfo = () => {
                    this.dataPromMap.serviceList = ZnkLessonNotesSrv.getServiceList();
                    $q.all(this.dataPromMap).then((dataMap) => {
                        this.translate = dataMap.translate;
                        this.serviceListMap = dataMap.serviceList.data;
                        this.buildViewModal();
                    });
                };

                this.buildViewModal = () => {
                    Object.keys(this.translate).forEach(translateKey => {
                        let field = {label: this.translate[translateKey], text: null};
                        switch (translateKey) {
                            case `${this.nameSpace}.TEST`:
                                if (!this.lessonService) {
                                    this.lessonService = this.serviceListMap[this.lesson.serviceId];
                                }
                                field.text = this.lessonService.name;
                                break;
                            case `${this.nameSpace}.TOPIC`:
                                if (!this.lessonService) {
                                    this.lessonService = this.serviceListMap[this.lesson.serviceId];
                                }
                                field.text = this.lessonService.topics[this.lesson.topicId].name;
                                break;
                            case `${this.nameSpace}.EDUCATOR`:
                                field.text = `${this.lesson.educatorFirstName} ${this.lesson.educatorLastName}`;
                                break;
                            case `${this.nameSpace}.STUDENT`:
                                field.text = this.getStudentsNames();
                                break;
                            case `${this.nameSpace}.DATE`:
                                field.text = this.transformDate(this.lesson.date, 'DATE');
                                break;
                            case `${this.nameSpace}.START_TIME`:
                                field.text = this.lesson.startTime ? this.transformDate(this.lesson.startTime, 'START_TIME') : null;
                                break;
                            case `${this.nameSpace}.DURATION`:
                                field.text = this.lesson.startTime && this.lesson.end ?
                                    this.transformDate(this.lesson.endTime - this.lesson.startTime, 'DURATION') : null;
                                break;
                            case `${this.nameSpace}.STATUS`:
                                this.lessunStatus = this.lessonStatusArr.filter(status => status.enum === this.lesson.status)[0];
                                field.text = this.lessunStatus.val;
                                break;
                        }
                        this.fields.push(field);
                    });
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
                            pattern = 'MMM d, y';
                            transformedDate = $filter('date')(timestamp, pattern);
                            break;
                        case 'START_TIME':
                            pattern = 'h:mm a';
                            transformedDate = $filter('date')(timestamp, pattern);
                            break;
                        case 'DURATION':
                            let convertedDuration = ZnkLessonNotesUiSrv.convertMS(timestamp);
                            let hourOrMinText;
                            if (convertedDuration.hour >= 1) {
                                let translatePath = convertedDuration.hour > 1 ? `${this.nameSpace}.HOURS` : `${this.nameSpace}.HOUR`;
                                hourOrMinText = $translate.instant(translatePath);
                                transformedDate = `${convertedDuration.hour} ${hourOrMinText}`;
                            } else {
                                hourOrMinText = $translate.instant(`${this.nameSpace}.MINUTES`);
                                transformedDate = `${convertedDuration.min} ${hourOrMinText}`;
                            }
                            break;
                    }
                    return transformedDate;
                };

                this.statusChanged = (field, statusEnumObj) => {
                    field.text = statusEnumObj.val;
                    this.lesson.status = statusEnumObj.enum;
                };

            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('lessonNotesPopup', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-notes-popup.template.html',
            controllerAs: 'vm',
            controller: ["$log", "$mdDialog", "$translate", "ZnkLessonNotesSrv", "UserTypeContextEnum", "LessonStatusEnum", "LessonNotesStatusEnum", "ZnkToastSrv", function ($log, $mdDialog, $translate, ZnkLessonNotesSrv, UserTypeContextEnum, LessonStatusEnum,
                                  LessonNotesStatusEnum, ZnkToastSrv) {
                'ngInject';

                this.$onInit = () => {
                    $log.debug('lessonNotesPopup: Init with Lesson: ', this.lesson);
                    this.showSpinner = false;
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.lesson.lessonNotes = this.lesson.lessonNotes || {};
                    this.lesson.lessonNotes.status = this.lesson.lessonNotes.status || LessonNotesStatusEnum.PENDING_NOTES.enum;
                };

                this.submit = () => {
                    this.showSpinner = true;
                    if (ZnkLessonNotesSrv._mailsToSend.length > 0) {
                        ZnkLessonNotesSrv.sendEmails(this.lesson)
                            .then(() => {
                                let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.LESSON_NOTES_EMAIL_SENT');
                                translationsProm.then(message => {
                                    ZnkToastSrv.showToast('success', message);
                                });
                                // update lesson status
                                this.lesson.status = this.lesson.status === LessonStatusEnum.SCHEDULED.enum ?
                                    LessonStatusEnum.ATTENDED.enum : this.lesson.status;
                                // update sendMailTime and lessonNotes status only if email sent
                                this.lesson.lessonNotes.sendMailTime = new Date().getTime();
                                this.lesson.lessonNotes.status = this.lesson.lessonNotes.status === LessonNotesStatusEnum.PENDING_NOTES.enum ?
                                    LessonNotesStatusEnum.COMPLETE.enum : this.lesson.lessonNotes.status;
                                this.saveLesson();
                            })
                            .catch(err => {
                                $log.error('lessonNotesPopup: sendEmail failed. Error: ', err);
                                let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.SEND_MAIL_FAILED');
                                translationsProm.then(message => {
                                    ZnkToastSrv.showToast('error', message);
                                });
                                this.doItLater();
                            });
                    } else {
                        $log.error('lessonNotesPopup: At list one email is required');
                        let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.NO_MAIL');
                        translationsProm.then(message => {
                            ZnkToastSrv.showToast('error', message);
                        });
                        this.doItLater();
                    }
                };

                this.doItLater = () => {
                    this.saveLesson();
                };

                this.saveLesson = () => {
                    $log.debug('saving lesson : ', this.lesson);
                    ZnkLessonNotesSrv.updateLesson(this.lesson)
                        .then(updatedLesson => {
                            this.lesson = updatedLesson.data;
                            this.showSpinner = false;
                            let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.LESSON_NOTES_SAVED');
                            translationsProm.then(message => {
                                ZnkToastSrv.showToast('success', message);
                            });
                            $mdDialog.cancel();
                        })
                        .catch(err => {
                            this.showSpinner = false;
                            $log.error('lessonNotesPopup: updateLesson failed. Error: ', err);
                            let translationsProm = $translate('LESSON_NOTES.LESSON_NOTES_POPUP.UPDATE_LESSON_FAILED');
                            translationsProm.then(message => {
                                ZnkToastSrv.showToast('error', message);
                            });
                        });
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonStartedLate', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-started-late/lesson-started-late.component.html',
            controllerAs: 'vm',
            controller: ["$log", "ZnkLessonNotesSrv", "UserTypeContextEnum", "ZnkLessonNotesUiSrv", function ($log, ZnkLessonNotesSrv, UserTypeContextEnum, ZnkLessonNotesUiSrv) {
                'ngInject';


                this.$onInit = () => {
                    $log.debug('LessonStartedLateComponent: Init');
                    this.initLessonStartedLate();
                    this.determineLessonStartedLate();
                };

                this.initLessonStartedLate = () => {
                    this.isAdmin = this.userContext === UserTypeContextEnum.ADMIN.enum;
                    this.isTeacher = this.userContext === UserTypeContextEnum.EDUCATOR.enum;
                    if (this.isTeacher) {
                        this.lesson.lessonNotes.isStudentLate = !ZnkLessonNotesUiSrv.isNullOrUndefined(this.lesson.lessonNotes.isStudentLate) ?
                            this.lesson.lessonNotes.isStudentLate : false;
                    } else {
                        this.lesson.studentFeedback.isTeacherLate = !ZnkLessonNotesUiSrv.isNullOrUndefined(this.lesson.studentFeedback.isTeacherLate) ?
                            this.lesson.studentFeedback.isTeacherLate : false;
                    }
                };

                this.determineLessonStartedLate = () => {
                    ZnkLessonNotesSrv.getLiveSessionSettings().then(liveSessionSettings => {
                        this.lessonStartedLate = (this.lesson.date + liveSessionSettings.lessonStartedLateTimeout) < this.lesson.startTime;
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
                    this.lesson.lessonNotes = this.lesson.lessonNotes || {};
                    this.initEducatorNotes();
                };

                this.initEducatorNotes = () => {
                    if (!this.lesson.lessonNotes.educatorNotes) {
                        $translate('LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.NOTES_TEMPLATE')
                            .then(notesTemplate => this.lesson.lessonNotes.educatorNotes = notesTemplate);
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
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/send-email-notes/send-email-notes.component.html',
            controllerAs: 'vm',
            controller: ["$log", "$translate", "UserTypeContextEnum", "ZnkLessonNotesSrv", function ($log, $translate, UserTypeContextEnum, ZnkLessonNotesSrv) {
                'ngInject';

                this.isStudentsMailSelected = false;
                this.isParentsMailSelected = false;
                this.studentsMails = [];
                this.parentsMails = [];
                this.mailsToSend = [];
                this.studentsProfiles = [];
                this.userTypeContextEnum = UserTypeContextEnum;

                this.$onInit = function () {
                    $log.debug('SendEmailNotesComponent: Init');
                    this.getStudentProfiles();
                };

                this.getStudentProfiles = () => {
                    const studentsIdArr = Object.keys(this.lesson.students);
                    ZnkLessonNotesSrv.getUserProfiles(studentsIdArr)
                        .then(studentsProfiles => {
                            $log.debug(' studentsProfiles loaded: ', studentsProfiles);
                            this.studentsProfiles = studentsProfiles.data;
                            ZnkLessonNotesSrv._studentsProfiles = studentsProfiles.data;
                            this.studentsProfiles.forEach(profile => {
                                const studentMail = profile.email || profile.userEmail || profile.authEmail;
                                this.studentsMails.push(studentMail);
                                if (profile.studentInfo.parentInfo && profile.studentInfo.parentInfo.email) {
                                    this.parentsMails.push(profile.studentInfo.parentInfo.email);
                                }
                            });
                        });
                };

                this.emailSelected = (mailGroup, bool) => {
                    if (mailGroup === UserTypeContextEnum.STUDENT.enum) {
                        this.mailsToSend = bool ? this.mailsToSend.concat(this.studentsMails) :
                            this.mailsToSend.filter( item => !this.studentsMails.includes( item ));
                        this.lesson.lessonNotes.sentMailToStudents = bool;
                    } else {
                        this.mailsToSend = bool ? this.mailsToSend.concat(this.parentsMails) :
                            this.mailsToSend.filter( item => !this.parentsMails.includes( item ));
                        this.lesson.lessonNotes.sentMailToParents = bool;
                    }
                    ZnkLessonNotesSrv._mailsToSend = this.mailsToSend;
                };

            }]
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('lessonRatingPopup', {
            bindings: {
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating-popup.template.html',
            controllerAs: 'vm',
            controller: ["$log", "$mdDialog", "ZnkLessonNotesSrv", "UserTypeContextEnum", function ($log, $mdDialog, ZnkLessonNotesSrv, UserTypeContextEnum) {
                'ngInject';

                this.$onInit = () => {
                    $log.debug('lessonRatingPopup: Init with Lesson: ', this.lesson );
                    this.closeModal = $mdDialog.cancel;
                    this.showSpinner = false;
                    this.userContext = UserTypeContextEnum.STUDENT.enum;
                };

                this.save = () => {
                    this.showSpinner = true;
                    $log.debug('saving lesson : ', this.lesson);
                    ZnkLessonNotesSrv.updateLesson(this.lesson)
                        .then(updatedLesson => {
                            this.lesson = updatedLesson.data;
                            this.showSpinner = false;
                            this.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: updateLesson failed. Error: ', err));
                };

                this.closeModal = () => {
                    $mdDialog.cancel();
                };
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonRating', {
            bindings: {
                lesson: '=',
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
                    this.lesson.studentFeedback = this.lesson.studentFeedback || {};
                    this.lesson.studentFeedback.studentFreeText = this.lesson.studentFeedback.studentFreeText || '';
                    this.initStarsArr();
                    if (this.lesson.studentFeedback.rating) {
                        this.ratingChanged(this.lesson.studentFeedback.rating);
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
                            active: (starNum === this.lesson.studentFeedback.rating),  // boolean
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
                    this.lesson.studentFeedback.rating = rating;
                };

                this.getStudentFeedback = () => {
                    let strToReturn = '';

                    if (this.lesson.studentFeedback.multipleChoice) {
                        strToReturn += this.lesson.studentFeedback.multipleChoice.join('; ');
                        strToReturn += '\n\r';
                        strToReturn += this.lesson.studentFeedback.studentFreeText;
                    } else {
                        strToReturn = this.lesson.studentFeedback.studentFreeText;
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
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lesson-rating-popup/lesson-rating/znk-multiple-choice/multiple-choice.component.html',
            controllerAs: 'vm',
            controller: ["$log", "$translate", function ($log, $translate) {
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

            }]
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesUiSrv',
        ["$rootScope", "$rootElement", "$http", "ENV", "$mdDialog", function ($rootScope, $rootElement, $http, ENV, $mdDialog) {
            'ngInject';

            this.openLessonNotesPopup = (lesson, userContext) => {
                $rootScope.lesson = lesson;
                $rootScope.userContext = userContext;
                $mdDialog.show({
                    template: `<lesson-notes-popup lesson="lesson" user-context="userContext"
                        aria-label="{{\'LESSON_NOTES.LESSON_NOTES_POPUP.TITLE\' | translate}}"></lesson-notes-popup>`,
                    scope: $rootScope,
                    clickOutsideToClose: false,
                    escapeToClose: true
                });
            };

            this.openLessonRatingPopup = (lesson) => {
                $rootScope.lesson = lesson;
                $mdDialog.show({
                    template: `<lesson-rating-popup lesson="lesson"
                        aria-label="{{\'LESSON_NOTES.LESSON_RATING_POPUP.TITLE\' | translate}}"></lesson-rating-popup>`,
                    scope: $rootScope,
                    clickOutsideToClose: false,
                    escapeToClose: true
                });
            };

            this.getUserFullName = (profile) => {
                if (!profile) {
                    return;
                }
                let name = '';
                name += profile.firstName ? profile.firstName + ' ' : '';
                name += profile.lastName ? profile.lastName : '';

                return name ? name : profile.nickname ? profile.nickname : profile.email.split('@')[0];
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
        ["$log", "$rootScope", "$rootElement", "$http", "ENV", "InfraConfigSrv", function ($log, $rootScope, $rootElement, $http, ENV, InfraConfigSrv) {
            'ngInject';

            let schedulingApi = `${ENV.znkBackendBaseUrl}/scheduling`;
            let serviceBackendUrl = `${ENV.znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${ENV.znkBackendBaseUrl}/userprofile`;
            let liveSessionDurationPath = '/settings/liveSessionDuration/';

            this._mailsToSend = [];
            this._studentsProfiles = [];

            this.getLessonById = (lessonId) => {
                let getLessonsApi = `${schedulingApi}/getLessonById?lessonId=${lessonId}`;
                return $http.get(getLessonsApi, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            };

            this.getLessonsByStudentIds = (studentIds, dateRange, educatorId) => {
                return $http.post(`${schedulingApi}/getLessonsByStudentIds`, {studentIds, dateRange, educatorId});
            };

            this.updateLesson = (lessonToUpdate) => {
                let updateLessonApi = `${schedulingApi}/updateLesson`;
                return $http.post(updateLessonApi, {lesson: lessonToUpdate, isRecurring: false})
                    .then(lessonArr => {
                        return Promise.resolve(lessonArr.data);
                    });
            };

            this.getServiceList = () => {
                return $http.get(`${serviceBackendUrl}/`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            };

            this.getGlobals = () => {
                return $http.get(`${globalBackendUrl}`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            };

            this.getUserProfiles = (uidArr) => {
                return $http.post(`${userProfileEndPoint}/getuserprofiles`, uidArr);
            };

            this.getLiveSessionSettings = () => {
                return InfraConfigSrv.getGlobalStorage().then(storage => {
                    return storage.get(liveSessionDurationPath);
                });
            };

            this.sendEmails = (lesson) => {
                if (this._mailsToSend.length) {
                    const mailPromArr = [];
                    return this.getServiceList().then(serviceList => {
                        $log.debug('mailsToSend: ', this._mailsToSend);
                        const lessonService = serviceList.data[lesson.serviceId];
                        const topicName = lessonService.topics[lesson.topicId].name;
                        const mailTemplateParams = {
                            date: lesson.date,
                            startTime: lesson.startTime,
                            service: lessonService.name,
                            topic: topicName,
                            status: lesson.status,
                            educatorFirstName: lesson.educatorFirstName,
                            educatorLastName: lesson.educatorLastName,
                            educatorNotes: lesson.lessonNotes.educatorNotes
                        };

                        this._studentsProfiles.forEach(profile => {
                            mailTemplateParams.studentFirstName = profile.firstName || '';
                            const emails = [];
                            const studentMail = profile.email || profile.userEmail || profile.authEmail;
                            if (studentMail) {
                                emails.push(studentMail);
                            }
                            if (lesson.lessonNotes.sentMailToParents) {
                                const parentMail = profile.studentInfo && profile.studentInfo.parentInfo ? profile.studentInfo.parentInfo.email: null;
                                if (parentMail) {
                                    emails.push(parentMail);
                                }
                            }
                            // TODO: implement sendEmail service
                            // Mailer.prototype.sendEmail = function(emails,params,templateName, imageAttachment, replyToEmail, dontSendEmail, options)
                            mailPromArr.push($http.post('MAILER_API', { emails: emails, params: mailTemplateParams }));
                        });

                        // return Promise.all(mailPromArr);  uncomment when mailer api is available
                        return Promise.resolve('mail sent');

                    });
                } else {
                    $log.error('sendEmails: At list one email is required');
                    return Promise.reject('At list one email is required');
                }
            };
        }]
    );
})(angular);

angular.module('znk.infra-web-app.znkLessonNotes').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-details/lesson-details.component.html",
    "<div class=\"lesson-details\" ng-if=\"vm.fields.length\" translate-namespace=\"LESSON_NOTES.LESSON_NOTES_POPUP\">\n" +
    "    <div class=\"field\" ng-repeat=\"field in vm.fields\" ng-if=\"field.text\">\n" +
    "        <div class=\"label\">{{field.label}}</div>\n" +
    "        <div class=\"text\" ng-if=\"field.label !== 'Status' || vm.userContext === vm.userTypeContextEnum.STUDENT.enum\">{{field.text}}</div>\n" +
    "        <select class=\"lesson-status\" ng-if=\"field.label === 'Status' && vm.userContext !== vm.userTypeContextEnum.STUDENT.enum\"\n" +
    "                ng-options=\"status as status.val for status in vm.lessonStatusArr\"\n" +
    "                ng-model=\"vm.lessunStatus\"\n" +
    "                ng-change=\"vm.statusChanged(field, vm.lessunStatus)\">\n" +
    "        </select>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-notes-popup.template.html",
    "<div class=\"lesson-notes-popup\" ng-if=\"vm.lesson\">\n" +
    "\n" +
    "    <div class=\"znk-popup-header\">\n" +
    "        <div class=\"icon-wrapper\">\n" +
    "            <svg-icon name=\"znkLessonNotes-zoe-new-record\"></svg-icon>\n" +
    "        </div>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.doItLater()\">\n" +
    "            <svg-icon name=\"znkLessonNotes-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"content-wrapper\" ng-if=\"vm.lesson\">\n" +
    "        <div class=\"znk-scrollbar\">\n" +
    "            <div class=\"title\" translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TITLE\"></div>\n" +
    "\n" +
    "            <znk-lesson-details lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-details>\n" +
    "            <znk-lesson-started-late lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-started-late>\n" +
    "            <div class=\"divider\" ng-if=\"vm.isAdmin\"></div>\n" +
    "\n" +
    "            <znk-lesson-rating lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-rating>\n" +
    "            <div class=\"divider\" ng-if=\"vm.isAdmin\"></div>\n" +
    "\n" +
    "            <znk-lesson-teacher-notes lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-teacher-notes>\n" +
    "\n" +
    "            <div class=\"btn-group\">\n" +
    "                <button type=\"button\" class=\"btn-type-link-gray znk-uppercase\" ng-click=\"vm.doItLater()\"\n" +
    "                        translate=\"LESSON_NOTES.DO_IT_LATER\">\n" +
    "                </button>\n" +
    "\n" +
    "                <button type=\"button\" class=\"btn-type-1 save-btn\" ng-click=\"vm.submit()\">\n" +
    "                    <span class=\"btn-text\" translate=\"LESSON_NOTES.SUBMIT\"></span>\n" +
    "                    <span class=\"spinner\" ng-if=\"vm.showSpinner\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-started-late/lesson-started-late.component.html",
    "<div class=\"lesson-started-late\" ng-if=\"vm.lessonStartedLate && !vm.isAdmin\">\n" +
    "    <div class=\"teacher-view\" ng-if=\"vm.isTeacher\">\n" +
    "        <span class=\"quicksand-12-b\">{{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.STUDENT_LATE' | translate}}</span>\n" +
    "        <div class=\"teacher-view-btn-group\">\n" +
    "            <button ng-class=\"[vm.lesson.lessonNotes.isStudentLate ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                    ng-click=\"vm.lesson.lessonNotes.isStudentLate = !vm.lesson.lessonNotes.isStudentLate\">\n" +
    "                {{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.YES' | translate}}\n" +
    "            </button>\n" +
    "            <button ng-class=\"[!vm.lesson.lessonNotes.isStudentLate ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                    ng-click=\"vm.lesson.lessonNotes.isStudentLate = !vm.lesson.lessonNotes.isStudentLate\">\n" +
    "                {{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.NO' | translate}}\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"student-view\" ng-if=\"!vm.isTeacher\">\n" +
    "        <span class=\"quicksand-12-b\">{{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.TEACHER_LATE' | translate}}</span>\n" +
    "        <div class=\"student-view-btn-group\">\n" +
    "            <button ng-class=\"[vm.lesson.studentFeedback.isTeacherLate ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                    ng-click=\"vm.lesson.studentFeedback.isTeacherLate = !vm.lesson.studentFeedback.isTeacherLate\">\n" +
    "                {{'LESSON_NOTES.LESSON_RATING_POPUP.LESSON_STARTED_LATE.YES' | translate}}\n" +
    "            </button>\n" +
    "            <button ng-class=\"[!vm.lesson.studentFeedback.isTeacherLate ? 'btn-type-1' : 'btn-type-2']\"\n" +
    "                    ng-click=\"vm.lesson.studentFeedback.isTeacherLate = !vm.lesson.studentFeedback.isTeacherLate\">\n" +
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
    "    <textarea class=\"lato-14-n note-txt\" ng-model=\"vm.lesson.lessonNotes.educatorNotes\"></textarea>\n" +
    "\n" +
    "    <znk-send-email-notes lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-send-email-notes>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-notes-popup/lesson-teacher-notes/send-email-notes/send-email-notes.component.html",
    "<div class=\"send-email-notes\">\n" +
    "    <div class=\"lato-16-n\">\n" +
    "        <span translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.SEND_NOTES\"></span>\n" +
    "        <span> ({{vm.mailsToSend.length}})</span>\n" +
    "    </div>\n" +
    "    <div class=\"checkbox-group\" ng-if=\"vm.studentsProfiles.length\">\n" +
    "        <div class=\"input-wrap\">\n" +
    "            <input id=\"studentsMail\" type=\"checkbox\" ng-model=\"vm.isStudentsMailSelected\"\n" +
    "                   ng-change=\"vm.emailSelected(vm.userTypeContextEnum.STUDENT.enum, vm.isStudentsMailSelected)\">\n" +
    "            <ng-switch on=\"vm.studentsProfiles.length < 2\">\n" +
    "                <label for=\"studentsMail\" ng-switch-when=\"true\"\n" +
    "                       translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.STUDENT_MAIL\"></label>\n" +
    "                <label for=\"studentsMail\" ng-switch-when=\"false\"\n" +
    "                       translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.ALL_STUDENTS_MAIL\"></label>\n" +
    "            </ng-switch>\n" +
    "        </div>\n" +
    "        <div class=\"input-wrap\">\n" +
    "            <input id=\"parentsMail\" type=\"checkbox\" ng-model=\"vm.isParentsMailSelected\"\n" +
    "                   ng-change=\"vm.emailSelected(vm.userTypeContextEnum.PARENT.enum, vm.isParentsMailSelected)\">\n" +
    "            <ng-switch on=\"vm.studentsProfiles.length < 2\">\n" +
    "                <label for=\"parentsMail\" ng-switch=\"\" ng-switch-when=\"true\"\n" +
    "                       translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.PARENT_MAIL\"></label>\n" +
    "                <label for=\"parentsMail\" ng-switch-when=\"false\"\n" +
    "                       translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.ALL_PARENTS_MAIL\"></label>\n" +
    "            </ng-switch>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"text-muted\" ng-if=\"vm.lesson.lessonNotes.sendMailTime\">\n" +
    "        <span translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.TEACHER_NOTES.EMAIL_NOTES.SENT_ON\"></span>\n" +
    "        <span> {{vm.lesson.lessonNotes.sendMailTime | date: 'MMM d, h:mm a'}}</span>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lesson-rating-popup/lesson-rating-popup.template.html",
    "<div class=\"lesson-rating-popup\" ng-if=\"vm.lesson\">\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"znkLessonNotes-star\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"znkLessonNotes-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "\n" +
    "    <div class=\"content-wrapper\">\n" +
    "        <div class=\"znk-scrollbar\">\n" +
    "            <div class=\"quicksand-25-b title\" translate=\"LESSON_NOTES.LESSON_RATING_POPUP.TITLE\"></div>\n" +
    "\n" +
    "            <znk-lesson-details lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-details>\n" +
    "            <div class=\"divider\"></div>\n" +
    "\n" +
    "            <znk-lesson-rating lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-rating>\n" +
    "\n" +
    "            <div class=\"btn-group\">\n" +
    "                <button type=\"button\" class=\"btn-type-link-gray znk-uppercase\" ng-click=\"vm.closeModal()\"\n" +
    "                        translate=\"LESSON_NOTES.DO_IT_LATER\">\n" +
    "                </button>\n" +
    "\n" +
    "                <button type=\"button\" class=\"btn-type-1 save-btn\" ng-click=\"vm.save()\">\n" +
    "                    <span class=\"btn-text\" translate=\"LESSON_NOTES.SAVE\"></span>\n" +
    "                    <span class=\"spinner\" ng-if=\"vm.showSpinner\"></span>\n" +
    "                </button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
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
    "    <div class=\"bad-rating-wrapper\" ng-if=\"vm.lesson.studentFeedback.rating <= vm.MIN_STATR_FOR_RATING_FEEDBACK\">\n" +
    "\n" +
    "        <znk-multiple-choice lesson=\"vm.lesson\" ng-if=\"!vm.isAdmin\"></znk-multiple-choice>\n" +
    "\n" +
    "        <textarea class=\"lato-14-n note-txt admin-view\" ng-if=\"vm.isAdmin\" readonly>{{vm.readOnlyStudentFeedback}}</textarea>\n" +
    "\n" +
    "        <div class=\"student-feedback\" ng-if=\"!vm.isAdmin\">\n" +
    "            <div class=\"lato-14-n other\">{{'LESSON_NOTES.LESSON_RATING_POPUP.OTHER' | translate}}</div>\n" +
    "            <textarea class=\"lato-14-n note-txt\"\n" +
    "                      placeholder=\"{{'LESSON_NOTES.LESSON_RATING_POPUP.FREE_TEXT_PLACEHOLDER' | translate}}\"\n" +
    "                      ng-model=\"vm.lesson.studentFeedback.studentFreeText\"></textarea>\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <znk-lesson-started-late lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-started-late>\n" +
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
