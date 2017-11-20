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
        .component('znkLessonInfo', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonInfo/lessonInfo.component.html',
            controllerAs: 'vm',
            controller: ["$http", "$q", "$log", "$filter", "ENV", "$translate", "LessonStatusEnum", "ZnkLessonNotesSrv", "UserTypeContextEnum", function ($http, $q, $log, $filter, ENV, $translate, LessonStatusEnum, ZnkLessonNotesSrv, UserTypeContextEnum) {
                'ngInject';

                let vm = this;
                vm.dataPromMap = {};
                vm.nameSpace = 'LESSON_NOTES.LESSON_NOTES_POPUP';
                vm.fields = [];
                vm.userTypeContextEnum = UserTypeContextEnum;
                vm.statusChanged = statusChanged;

                this.$onInit = function () {
                    $log.debug('znkLessonInfo: Init');
                    vm.dataPromMap.translate = getTranslations();
                    vm.lessonStatusArr = LessonStatusEnum.getEnumArr();
                    initLessonInfo();
                };

                function getTranslations() {
                    return $translate([
                        `${vm.nameSpace}.TEST`,
                        `${vm.nameSpace}.TOPIC`,
                        `${vm.nameSpace}.EDUCATOR`,
                        `${vm.nameSpace}.STUDENT`,
                        `${vm.nameSpace}.DATE`,
                        `${vm.nameSpace}.START_TIME`,
                        `${vm.nameSpace}.DURATION`,
                        `${vm.nameSpace}.STATUS`,
                    ]);
                }

                function initLessonInfo() {
                    vm.dataPromMap.serviceList = ZnkLessonNotesSrv.getServiceList();
                    $q.all(vm.dataPromMap).then((dataMap) => {
                        vm.translate = dataMap.translate;
                        vm.serviceListMap = dataMap.serviceList.data;
                        buildViewModal();
                    });
                }



                function buildViewModal() {
                    Object.keys(vm.translate).forEach(translateKey => {
                        let field = {label: vm.translate[translateKey], text: null};
                        switch (translateKey) {
                            case `${vm.nameSpace}.TEST`:
                                if (!vm.lessonService) {
                                    vm.lessonService = vm.serviceListMap[vm.lesson.serviceId];
                                }
                                field.text = vm.lessonService.name;
                                break;
                            case `${vm.nameSpace}.TOPIC`:
                                if (!vm.lessonService) {
                                    vm.lessonService = vm.serviceListMap[vm.lesson.serviceId];
                                }
                                field.text = vm.lessonService.topics[vm.lesson.topicId].name;
                                break;
                            case `${vm.nameSpace}.EDUCATOR`:
                                field.text = `${vm.lesson.educatorFirstName} ${vm.lesson.educatorLastName}`;
                                break;
                            case `${vm.nameSpace}.STUDENT`:
                                field.text = getStudentsNames();
                                break;
                            case `${vm.nameSpace}.DATE`:
                                field.text = transformDate(vm.lesson.date, 'DATE');
                                break;
                            case `${vm.nameSpace}.START_TIME`:
                                field.text = transformDate(vm.lesson.startTime, 'START_TIME');
                                break;
                            case `${vm.nameSpace}.DURATION`:
                                field.text = transformDate(vm.lesson.endTime - vm.lesson.startTime, 'DURATION');
                                break;
                            case `${vm.nameSpace}.STATUS`:
                                vm.lessunStatus = vm.lessonStatusArr.filter(status => status.enum === vm.lesson.status)[0];
                                field.text = vm.lessunStatus.val;
                                break;
                        }
                        vm.fields.push(field);
                    });
                }

                function getStudentsNames() {
                    let studentsNames = '';
                    let studentsKeys = Object.keys(vm.lesson.students);
                    studentsKeys.forEach((studentId, index) => {
                        let student = vm.lesson.students[studentId];
                        studentsNames += ZnkLessonNotesSrv.getUserFullName(student);
                        studentsNames += index !== (studentsKeys.length - 1) ? ', ' : '';
                    });

                    return studentsNames;
                }

                function transformDate(timestamp, dateType) {
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
                            let convertedDuration = ZnkLessonNotesSrv.convertMS(timestamp);
                            let hourOrMinText;
                            if (convertedDuration.hour >= 1) {
                                let translatePath = convertedDuration.hour > 1 ? `${vm.nameSpace}.HOURS` : `${vm.nameSpace}.HOUR`;
                                hourOrMinText = $translate.instant(translatePath);
                                transformedDate = `${convertedDuration.hour} ${hourOrMinText}`;
                            } else {
                                hourOrMinText = $translate.instant(`${vm.nameSpace}.MINUTES`);
                                transformedDate = `${convertedDuration.min} ${hourOrMinText}`;
                            }
                            break;
                    }
                    return transformedDate;
                }

                function statusChanged(field, statusEnumObj) {
                    field.text = statusEnumObj.val;
                    vm.lesson.status = statusEnumObj.enum;
                }

            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('lessonNotesPopup', {
            bindings: {
                lessonId: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonNotesPopup.template.html',
            controllerAs: 'vm',
            controller: ["$log", "$mdDialog", "ZnkLessonNotesSrv", function ($log, $mdDialog, ZnkLessonNotesSrv) {
                'ngInject';

                let vm = this;
                vm.save = save;
                vm.closeModal = closeModal;

                this.$onInit = function () {
                    $log.debug('lessonNotesPopup: Init');
                    ZnkLessonNotesSrv.getLessonById(vm.lessonId).then(lesson => {
                        vm.lesson = lesson.data;
                    });
                    vm.closeModal = $mdDialog.cancel;
                    vm.showSpinner = false;
                    vm.save = save;
                };

                function save() {
                    vm.showSpinner = true;
                    ZnkLessonNotesSrv.updateLesson(vm.lesson)
                        .then(updatedLesson => {
                            vm.lesson = updatedLesson.data;
                            vm.showSpinner = false;
                            vm.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: updateLesson failed. Error: ', err));
                }

                function closeModal() {
                    $mdDialog.cancel();
                }
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
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonRating/lessonRating.component.html',
            controllerAs: 'vm',
            controller: ["$log", "$translate", "UserTypeContextEnum", function ($log, $translate, UserTypeContextEnum) {
                'ngInject';

                let vm = this;

                vm.MIN_STATR_FOR_RATING_FEEDBACK = 2;
                vm.MAX_STARS = 5;
                vm.starArr = [];
                vm.showComponent = false;
                vm.onHover = onHover;
                vm.ratingChanged = ratingChanged;

                this.$onInit = function () {
                    $log.debug('znkLessonRating: Init');
                    vm.lesson.studentFeedback = vm.lesson.studentFeedback || {};
                    vm.showComponent = vm.userContext === UserTypeContextEnum.STUDENT.enum ||
                        vm.userContext === UserTypeContextEnum.ADMIN.enum;
                    initStarsArr();
                    if (!vm.lesson.studentFeedback.rating) {
                        ratingChanged(vm.lesson.studentFeedback.rating);
                    }
                    vm.lesson.studentFeedback.studentFreeText = vm.lesson.studentFeedback.studentFreeText || '';
                };

                function initStarsArr() {
                    for (let i = 0; i < vm.MAX_STARS; i++) {
                        let starNum = i + 1;
                        vm.starArr[i] = {
                            title: $translate.instant(`LESSON.LESSON_NOTES_POPUP.RATING.TITLE${starNum}`),
                            active: (starNum === vm.lesson.studentFeedback.rating),  // boolean
                            value: starNum,
                        };
                    }
                }

                function onHover(selectedStar, bool) {
                    vm.starArr.forEach(star => {
                        star.hover = bool && (star.value <= selectedStar.value);
                    });
                }

                function ratingChanged(rating) {
                    $log.debug('lesson rating changed: ', rating);
                    vm.starArr.forEach(star => {
                        star.active = star.value <= rating;
                    });
                    vm.lesson.studentFeedback.rating = rating;
                }

            }]
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonSummaryNote', {
            bindings: {
                lesson: '=',
                userContext: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonSummaryNote/lessonSummaryNote.component.html',
            controllerAs: 'vm',
            controller: ["$log", "UserTypeContextEnum", "ZnkLessonNotesSrv", function ($log, UserTypeContextEnum, ZnkLessonNotesSrv) {
                'ngInject';

                let vm = this;

                vm.studentsMails = [];
                vm.parentsMails = [];
                vm.mailsToSend = [];
                vm.sentDate = null;
                vm.studensMail = false;
                vm.parentsMail = false;
                vm.studentsProfiles = [];
                vm.showComponent = false;
                vm.userTypeContextEnum = UserTypeContextEnum;
                vm.emailSelected = emailSelected;
                vm.sendEmail = sendEmail;

                this.$onInit = function () {
                    $log.debug('znkLessonSummaryNote: Init');
                    vm.showComponent = vm.userContext === UserTypeContextEnum.EDUCATOR.enum ||
                        vm.userContext === UserTypeContextEnum.ADMIN.enum;
                    vm.lesson.lessonNotes = vm.lesson.lessonNotes || {};
                    initSummaryNote();
                    getStudentProfiles();
                };

                function initSummaryNote() {
                    if (!vm.lesson.lessonNotes.educatorNotes) {
                        ZnkLessonNotesSrv.getGlobals().then(globals => {
                            vm.lesson.lessonNotes.educatorNotes = globals.data.lessonEducatorNotesTemplate;
                        });
                    }
                }

                function getStudentProfiles() {
                    if (vm.lesson.students) {
                        let studentsIdArr = Object.keys(vm.lesson.students);
                        ZnkLessonNotesSrv.getUserProfiles(studentsIdArr)
                            .then(studentsProfiles => {
                                $log.debug(' studentsProfiles loaded: ', studentsProfiles.data);
                                vm.studentsProfiles = studentsProfiles.data;
                                vm.studentsProfiles.forEach(profile => {
                                    let studentMail = profile.email || profile.userEmail || profile.authEmail;
                                    vm.studentsMails.push(studentMail);
                                    if (profile.studentInfo.parentInfo && profile.studentInfo.parentInfo.email) {
                                        vm.parentsMails.push(profile.studentInfo.parentInfo.email);
                                    }
                                });
                            });
                    } else {
                        $log.error('getStudentProfiles: No students in this lesson. lessonId: ', vm.lesson.id);
                    }

                }

                function emailSelected(mailGroup, bool) {
                    if (mailGroup === UserTypeContextEnum.STUDENT.enum) {
                        vm.mailsToSend = bool ? vm.mailsToSend.concat(vm.studentsMails) :
                            vm.mailsToSend.filter( item => !vm.studentsMails.includes( item ));
                        vm.lesson.lessonNotes.sentMailToStudents = bool;
                    } else {
                        vm.mailsToSend = bool ? vm.mailsToSend.concat(vm.parentsMails) :
                            vm.mailsToSend.filter( item => !vm.parentsMails.includes( item ));
                        vm.lesson.lessonNotes.sentMailToParents = bool;
                    }
                }

                function sendEmail() {
                    vm.lesson.lessonNotes.sendMailTime = new Date().getTime();
                    $log.debug('mailsToSend: ', vm.mailsToSend);
                }
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesSrv',
        ["$rootScope", "$rootElement", "$http", "ENV", "$mdDialog", "InfraConfigSrv", function ($rootScope, $rootElement, $http, ENV, $mdDialog, InfraConfigSrv) {
            'ngInject';

            let schedulingApi = `${ENV.znkBackendBaseUrl}/scheduling`;
            let serviceBackendUrl = `${ENV.znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${ENV.znkBackendBaseUrl}/userprofile`;
            let liveSessionDurationPath = '/settings/liveSessionDuration/';
            let ZnkLessonNotesSrv = {};

            function openLessonNotesPopup(lessonId, userContext) {
                $rootScope.lessonId = lessonId;
                $rootScope.userContext = userContext;
                $mdDialog.show({
                    template: `<lesson-notes-popup lesson-id="lessonId" user-context="userContext"
                        aria-label="{{\'LESSON_NOTES.LESSON_NOTES_POPUP.TITLE\' | translate}}"></lesson-notes-popup>`,
                    scope: $rootScope,
                    clickOutsideToClose: true,
                    escapeToClose: true
                });
            }

            function getLessonById(lessonId) {
                let getLessonsApi = `${schedulingApi}/getLessonById?lessonId=${lessonId}`;
                return $http.get(getLessonsApi, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            }

            function getLessonsByStudentIds(studentIds, dateRange, educatorId) {
                return $http.post(`${schedulingApi}/getLessonsByStudentIds`, {studentIds, dateRange, educatorId});
            }

            function updateLesson(lessonToUpdate) {
                let updateLessonApi = `${schedulingApi}/updateLessons`;
                return $http.post(updateLessonApi, [lessonToUpdate]).then(lessonArr => {
                    return Promise.resolve(lessonArr[0]);
                });
            }

            function getServiceList() {
                return $http.get(`${serviceBackendUrl}/`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            }

            function getGlobals() {
                return $http.get(`${globalBackendUrl}`, {
                    timeout: ENV.promiseTimeOut,
                    cache: true
                });
            }

            function getUserProfiles(uidArr) {
                return $http.post(`${userProfileEndPoint}/getuserprofiles`, uidArr);
            }

            function enumToArray(enumObj, capitalize, returnedArrType) {
                return Object.keys(enumObj).map(item => {
                    if (returnedArrType === 'number') {
                        if (typeof (parseInt(item, 10)) === 'number') {
                            return parseInt(item, 10);
                        }
                    } else if (!isNaN(parseInt(item, 10))) {
                        if (capitalize) {
                            return capitalizeFirstLetter(enumObj[item]);
                        } else {
                            return enumObj[item];
                        }
                    }
                }).filter(item => item);
            }

            function capitalizeFirstLetter(str) {
                return str.split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
            }

            function getUserFullName(profile) {
                if (!profile) {
                    return;
                }
                let name = '';
                name += profile.firstName ? profile.firstName + ' ' : '';
                name += profile.lastName ? profile.lastName : '';

                return name ? name : profile.nickname ? profile.nickname : profile.email.split('@')[0];
            }

            function getLiveSessionDuration() {
                return InfraConfigSrv.getGlobalStorage().then(storage => {
                    return storage.get(liveSessionDurationPath);
                });
            }

            function convertMS(ms) {
                let day, hour, min, sec;
                sec = Math.floor(ms / 1000);
                min = Math.floor(sec / 60);
                sec = sec % 60;
                hour = Math.floor(min / 60);
                min = min % 60;
                day = Math.floor(hour / 24);
                hour = hour % 24;
                return {day, hour, min, sec};
            }

            ZnkLessonNotesSrv.openLessonNotesPopup = openLessonNotesPopup;
            ZnkLessonNotesSrv.getLessonById = getLessonById;
            ZnkLessonNotesSrv.getLessonsByStudentIds = getLessonsByStudentIds;
            ZnkLessonNotesSrv.updateLesson = updateLesson;
            ZnkLessonNotesSrv.getServiceList = getServiceList;
            ZnkLessonNotesSrv.getGlobals = getGlobals;
            ZnkLessonNotesSrv.getUserProfiles = getUserProfiles;
            ZnkLessonNotesSrv.enumToArray = enumToArray;
            ZnkLessonNotesSrv.capitalizeFirstLetter = capitalizeFirstLetter;
            ZnkLessonNotesSrv.getUserFullName = getUserFullName;
            ZnkLessonNotesSrv.getLiveSessionDuration = getLiveSessionDuration;
            ZnkLessonNotesSrv.convertMS = convertMS;

            return ZnkLessonNotesSrv;

        }]
    );
})(angular);

angular.module('znk.infra-web-app.znkLessonNotes').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkLessonNotes/lessonNotesPopup/lessonInfo/lessonInfo.component.html",
    "<div class=\"lesson-info\" ng-if=\"vm.fields.length\" translate-namespace=\"LESSON_NOTES.LESSON_NOTES_POPUP\">\n" +
    "    <div class=\"field\" ng-repeat=\"field in vm.fields\">\n" +
    "        <div class=\"label\">{{field.label}}</div>\n" +
    "        <div class=\"text\" ng-if=\"field.label !== 'Status' || vm.userContext === vm.userTypeContextEnum.STUDENT.enum\">{{field.text}}</div>\n" +
    "        <select class=\"lesson-status\" ng-if=\"field.label === 'Status' && vm.userContext !== vm.userTypeContextEnum.STUDENT.enum\"\n" +
    "                ng-options=\"status as status.val for status in vm.lessonStatusArr\"\n" +
    "                ng-model=\"vm.lessunStatus\"\n" +
    "                ng-change=\"vm.statusChanged(field, vm.lessunStatus)\">\n" +
    "        </select>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lessonNotesPopup/lessonNotesPopup.template.html",
    "<div class=\"lesson-notes-popup\" translate-namespace=\"LESSON_NOTES.LESSON_NOTES_POPUP\">\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"znkLessonNotes-zoe-new-record\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeModal()\">\n" +
    "            <svg-icon name=\"znkLessonNotes-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <div class=\"content-wrapper\" ng-if=\"vm.lesson\">\n" +
    "        <div class=\"znk-scrollbar\">\n" +
    "            <div class=\"title\" translate=\".TITLE\"></div>\n" +
    "            <znk-lesson-info lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-info>\n" +
    "            <div class=\"divider\"></div>\n" +
    "            <znk-lesson-rating lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-rating>\n" +
    "            <div class=\"divider\"></div>\n" +
    "            <znk-lesson-summary-note lesson=\"vm.lesson\" user-context=\"vm.userContext\"></znk-lesson-summary-note>\n" +
    "            <button type=\"button\" class=\"btn-type-1 save-btn\" ng-click=\"vm.save()\">\n" +
    "                <span class=\"btn-text\" translate=\".SAVE\"></span>\n" +
    "                <span class=\"spinner\" ng-if=\"showSpinner\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lessonNotesPopup/lessonRating/lessonRating.component.html",
    "<div class=\"lesson-rate\" ng-if=\"vm.showComponent\" translate-namespace=\"LESSON_NOTES.LESSON_NOTES_POPUP.RATING\">\n" +
    "  <div class=\"lato-18-n znk-uppercase\" translate=\".TITLE\"></div>\n" +
    "  <div class=\"rating\">\n" +
    "    <svg-icon class=\"star-icon\" name=\"znkLessonNotes-star\" ng-repeat=\"star in vm.starArr\"\n" +
    "         ng-mouseenter=\"vm.onHover(star, true)\" ng-mouseleave=\"vm.onHover(star, false)\" title=\"{{star.title}}\"\n" +
    "         ng-class=\"{'active': star.active, 'hover': star.hover}\" ng-click=\"vm.ratingChanged(star.value)\">\n" +
    "    </svg-icon>\n" +
    "  </div>\n" +
    "\n" +
    "  <textarea class=\"lato-14-n note-txt\" ng-model=\"vm.lesson.studentFeedback.studentFreeText\"\n" +
    "            ng-if=\"vm.lesson.studentFeedback.rating <= vm.MIN_STATR_FOR_RATING_FEEDBACK\"></textarea>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lessonNotesPopup/lessonSummaryNote/lessonSummaryNote.component.html",
    "<div class=\"lesson-summary-notes\" ng-if=\"vm.showComponent\" translate-namespace=\"LESSON_NOTES.LESSON_NOTES_POPUP.SUMMARY_NOTES\">\n" +
    "    <div class=\"lato-18-n znk-uppercase\" translate=\".TITLE\"></div>\n" +
    "\n" +
    "    <textarea class=\"lato-14-n note-txt\" ng-model=\"vm.lesson.lessonNotes.educatorNotes\"></textarea>\n" +
    "\n" +
    "    <div class=\"email-section\">\n" +
    "        <div class=\"lato-16-n\">\n" +
    "            <span translate=\".SEND_NOTES\"></span>\n" +
    "            <span> ({{vm.mailsToSend.length}})</span>\n" +
    "        </div>\n" +
    "        <div class=\"checkbox-group\" ng-if=\"vm.studentsProfiles.length\">\n" +
    "            <div class=\"input-wrap\">\n" +
    "                <input id=\"studensMail\" type=\"checkbox\" ng-model=\"vm.studensMail\"\n" +
    "                       ng-change=\"vm.emailSelected(vm.userTypeContextEnum.STUDENT.enum, vm.studensMail)\">\n" +
    "                <ng-switch on=\"vm.studentsProfiles.length < 2\">\n" +
    "                    <label for=\"studensMail\" ng-switch-when=\"true\" translate=\".STUDENT_MAIL\"></label>\n" +
    "                    <label for=\"studensMail\" ng-switch-when=\"false\" translate=\".ALL_STUDENTS_MAIL\"></label>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "            <div class=\"input-wrap\">\n" +
    "                <input id=\"parentsMail\" type=\"checkbox\" ng-model=\"vm.parentsMail\"\n" +
    "                       ng-change=\"vm.emailSelected(vm.userTypeContextEnum.PARENT.enum, vm.parentsMail)\">\n" +
    "                <ng-switch on=\"vm.studentsProfiles.length < 2\">\n" +
    "                    <label for=\"parentsMail\" ng-switch=\"\" ng-switch-when=\"true\" translate=\".PARENT_MAIL\"></label>\n" +
    "                    <label for=\"parentsMail\" ng-switch-when=\"false\"  translate=\".ALL_PARENTS_MAIL\"></label>\n" +
    "                </ng-switch>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"button-wrapper\">\n" +
    "            <button type=\"button\" class=\"btn-type-2\" ng-click=\"vm.sendEmail()\" translate=\".SEND\"></button>\n" +
    "            <div class=\"text-muted\" ng-if=\"vm.lesson.lessonNotes.sendMailTime\">\n" +
    "                <span translate=\".SENT_ON\"></span>\n" +
    "                <span> {{vm.lesson.lessonNotes.sendMailTime | date: 'MMM d, h:mm a'}}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/svg/close-popup.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\">\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
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
