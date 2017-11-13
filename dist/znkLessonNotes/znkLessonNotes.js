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
                    'znkLessonNotes-star': 'components/znkLessonNotes/svg/star.svg'
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
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonInfo/lessonInfo.component.html',
            controllerAs: 'vm',
            controller: ["$http", "$q", "$log", "$filter", "ENV", "$translate", "LessonStatusEnum", "ZnkLessonNotesSrv", function ($http, $q, $log, $filter, ENV, $translate, LessonStatusEnum, ZnkLessonNotesSrv) {
                'ngInject';

                let vm = this;
                vm.nameSpace = 'LIVE_SESSION.LESSON_NOTES_POPUP';
                vm.fields = [];

                this.$onInit = function () {
                    $log.debug('znkLessonInfo: Init');
                    vm.dataPromMap.translate = getTranslations();
                    vm.lessonStatusArr = ZnkLessonNotesSrv.enumToArray(LessonStatusEnum, true);
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
                        vm.serviceList = dataMap.serviceList;
                        buildViewModal();
                    });
                }



                function buildViewModal() {
                    Object.keys(vm.translate).forEach(translateKey => {
                        let field = {label: vm.translate[translateKey], text: null};
                        switch (translateKey) {
                            case `${vm.nameSpace}.TEST`:
                                if (!vm.lessonService) {
                                    vm.lessonService = vm.serviceList.filter(service => service.id === vm.lesson.serviceId)[0];
                                }
                                field.text = vm.lessonService.name;
                                break;
                            case `${vm.nameSpace}.TOPIC`:
                                if (!vm.lessonService) {
                                    vm.lessonService = vm.serviceList.filter(service => service.id === vm.lesson.serviceId)[0];
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
                                field.text = ZnkLessonNotesSrv.capitalizeFirstLetter(LessonStatusEnum[vm.lesson.status]);
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
                        studentsNames += vm.ZnkLessonNotesSrv.getUserFullName(student);
                        studentsNames += index !== (studentsKeys.length - 1) ? ', ' : '';
                    });

                    return studentsNames;
                }

                function transformDate(timestamp, dateType) {
                    let pattern;
                    let transformedDate;
                    switch (dateType) {
                        case 'DATE':
                            pattern = 'yMMMd';
                            transformedDate = $filter('date')(timestamp, pattern);
                            break;
                        case 'START_TIME':
                            pattern = 'jm';
                            transformedDate = $filter('date')(timestamp, pattern);
                            break;
                        case 'DURATION':
                            let convertedDuration = vm.utilsService.convertMS(timestamp);
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

                this.$onInit = function () {
                    $log.debug('lessonNotesPopup: Init');
                    ZnkLessonNotesSrv.getLessonById(vm.lessonId).then(lesson => {
                        vm.lesson = lesson;
                    });
                    vm.closeModal = $mdDialog.cancel;
                    vm.showSpinner = false;
                    vm.save = save;
                };

                function save() {
                    vm.showSpinner = true;
                    ZnkLessonNotesSrv.updateLesson(vm.lesson)
                        .then(updatedLesson => {
                            vm.lesson = updatedLesson;
                            vm.showSpinner = false;
                            vm.closeModal();
                        })
                        .catch(err => $log.error('lessonNotesPopup: updateLesson failed. Error: ', err));
                }
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonRating', {
            bindings: {
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonInfo/lessonInfo.component.html',
            controllerAs: 'vm',
            controller: ["$log", "$translate", function ($log, $translate) {
                'ngInject';

                let vm = this;

                vm.MIN_STATR_FOR_RATING_FEEDBACK = 2;
                vm.MAX_STARS = 5;
                vm.starArr = [];
                vm.onHover = onHover;
                vm.ratingChanged = ratingChanged;

                this.$onInit = function () {
                    $log.debug('znkLessonRating: Init');
                    vm.lesson.lessonNotes = vm.lesson.lessonNotes || {};
                    initStarsArr();
                    if (!vm.lesson.lessonNotes.rating) {
                        ratingChanged(vm.lesson.lessonNotes.rating);
                    }
                    vm.lesson.lessonNotes.ratingFeedback = vm.lesson.lessonNotes.ratingFeedback || '';
                };

                function initStarsArr() {
                    for (let i = 0; i < vm.MAX_STARS; i++) {
                        let starNum = i + 1;
                        vm.starArr[i] = {
                            title: $translate.instant(`LESSON.LESSON_NOTES_POPUP.RATING.TITLE${starNum}`),
                            active: (starNum === vm.lesson.lessonNotes.rating),  // boolean
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
                    vm.lesson.lessonNotes.rating = rating;
                }

            }]
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonSummaryNote', {
            bindings: {
                lesson: '='
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
                vm.studentsProfiles = [];
                vm.userTypeContextEnum = UserTypeContextEnum;
                vm.emailSelected = emailSelected;
                vm.sendEmail = sendEmail;

                this.$onInit = function () {
                    $log.debug('znkLessonSummaryNote: Init');
                    vm.lesson.lessonNotes = vm.lesson.lessonNotes || {};
                    initSummaryNote();
                    getStudentProfiles();
                };

                function initSummaryNote() {
                    if (!vm.lesson.lessonNotes.educatorNotes) {
                        ZnkLessonNotesSrv.getGlobals().then(globals => {
                            vm.lesson.lessonNotes.educatorNotes = globals.lessonEducatorNotesTemplate;
                        });
                    }
                }

                function getStudentProfiles() {
                    let studentsIdArr = Object.keys(vm.lesson.students);
                    ZnkLessonNotesSrv.getUserProfiles(studentsIdArr)
                        .then(studentsProfiles => {
                            $log.debug(' studentsProfiles loaded: ', studentsProfiles);
                            vm.studentsProfiles = studentsProfiles;
                            vm.studentsProfiles.forEach(profile => {
                                let studentMail = profile.email || profile.userEmail || profile.authEmail;
                                vm.studentsMails.push(studentMail);
                                if (profile.studentInfo.parentInfo && profile.studentInfo.parentInfo.email) {
                                    vm.parentsMails.push(profile.studentInfo.parentInfo.email);
                                }
                            });
                        });
                }

                function emailSelected(mailGroup, bool) {
                    if (mailGroup === UserTypeContextEnum.student) {
                        vm.mailsToSend = bool ? vm.mailsToSend.concat(vm.studentsMails) :
                            vm.mailsToSend.filter( item => !vm.studentsMails.includes( item ));
                    } else {
                        vm.mailsToSend = bool ? vm.mailsToSend.concat(vm.parentsMails) :
                            vm.mailsToSend.filter( item => !vm.parentsMails.includes( item ));
                    }
                }

                function sendEmail() {
                    vm.sentDate = new Date().getTime();
                    $log.debug('mailsToSend: ', vm.mailsToSend);
                }
            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes').service('ZnkLessonNotesSrv',
        ["$http", "ENV", "$mdDialog", "InfraConfigSrv", function ($http, ENV, $mdDialog, InfraConfigSrv) {
            'ngInject';

            let _this = this;
            let schedulingApi = `${ENV.znkBackendBaseUrl}/scheduling`;
            let serviceBackendUrl = `${ENV.znkBackendBaseUrl}/service`;
            let globalBackendUrl = `${ENV.znkBackendBaseUrl}/global`;
            let userProfileEndPoint = `${ENV.znkBackendBaseUrl}/userprofile`;
            let liveSessionDurationPath = '/settings/liveSessionDuration/';
            let ZnkLessonNotesSrv = {};

            function openLessonNotesPopup(lessonId, userContext) {
                _this.lessonId = lessonId;
                _this.userContext = userContext;
                $mdDialog.show({
                    template: '<lesson-notes-popup lesson-id="_this.lessonId" user-context="_this.userContext"></lesson-notes-popup>',
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

            function getLessonsByQuery(query) {
                return $http.post(`${schedulingApi}/getLessonsByQuery`, query);
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
                return InfraConfigSrv.getGlobalStorage().then(function (storage) {
                    return storage.get(liveSessionDurationPath);
                });
            }

            ZnkLessonNotesSrv.openLessonNotesPopup = openLessonNotesPopup;
            ZnkLessonNotesSrv.getLessonById = getLessonById;
            ZnkLessonNotesSrv.getLessonsByQuery = getLessonsByQuery;
            ZnkLessonNotesSrv.updateLesson = updateLesson;
            ZnkLessonNotesSrv.getServiceList = getServiceList;
            ZnkLessonNotesSrv.getGlobals = getGlobals;
            ZnkLessonNotesSrv.getUserProfiles = getUserProfiles;
            ZnkLessonNotesSrv.enumToArray = enumToArray;
            ZnkLessonNotesSrv.getUserFullName = getUserFullName;
            ZnkLessonNotesSrv.getLiveSessionDuration = getLiveSessionDuration;

            return ZnkLessonNotesSrv;

        }]
    );
})(angular);

angular.module('znk.infra-web-app.znkLessonNotes').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/znkLessonNotes/lessonNotesPopup/lessonInfo/lessonInfo.component.html",
    "<div class=\"lesson-info\" ng-if=\"vm.fields.length\" translate-namespace=\"LESSON_NOTES.LESSON_NOTES_POPUP\">\n" +
    "    <div class=\"field\" ng-repeat=\"field in vm.fields\">\n" +
    "        <div class=\"label\">{{field.label}}</div>\n" +
    "        <div class=\"text\" ng-switch=\"field.label !== 'Status'\" ng-switch-when=\"true\">{{field.text}}</div>\n" +
    "        <select class=\"lesson-status\" ng-switch-when=\"false\"\n" +
    "                ng-options=\"status in lessonStatusArr\"\n" +
    "                ng-model=\"status\"\n" +
    "                ng-change=\"field.text = status\">\n" +
    "        </select>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lessonNotesPopup/lessonNotesPopup.template.html",
    "<div class=\"lesson-notes-popup znk-scrollbar\" *ngIf=\"lesson\" translate-namespace=\"LESSON_NOTES.LESSON_NOTES_POPUP\">\n" +
    "    <znk-lesson-info lesson=\"vm.lesson\"></znk-lesson-info>\n" +
    "    <div class=\"divider\"></div>\n" +
    "    <znk-lesson-rating lesson=\"vm.lesson\"></znk-lesson-rating>\n" +
    "    <div class=\"divider\"></div>\n" +
    "    <znk-lesson-summary-note lesson=\"vm.lesson\"></znk-lesson-summary-note>\n" +
    "    <button type=\"button\" class=\"btn-type-1\" ng-click=\"vm.save()\">\n" +
    "        <span class=\"btn-text\" translate=\".SAVE\"></span>\n" +
    "        <span class=\"spinner\" ng-if=\"showSpinner\"></span>\n" +
    "    </button>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lessonNotesPopup/lessonRating/lessonRating.component.html",
    "<div class=\"lesson-rate\" translate-namespace=\"LESSON_NOTES.LESSON_NOTES_POPUP.RATING\">\n" +
    "  <div class=\"lato-18-n znk-uppercase\" translate=\".TITLE\"></div>\n" +
    "  <div class=\"rating\">\n" +
    "    <svg-icon class=\"star-icon\" name=\"znkLessonNotes-star\" ng-repeat=\"star in vm.starArr\"\n" +
    "         ng-mouseenter=\"vm.onHover(star, true)\" ng-mouseleave=\"vm.onHover(star, false)\" title=\"{{star.title}}\"\n" +
    "         ng-class=\"{'active': star.active, 'hover': star.hover}\" ng-click=\"vm.ratingChanged(star.value)\">\n" +
    "    </svg-icon>\n" +
    "  </div>\n" +
    "\n" +
    "  <textarea class=\"lato-14-n note-txt\" ng-model=\"vm.lesson.lessonNotes.ratingFeedback\"\n" +
    "            ng-if=\"vm.lesson.lessonNotes.rating <= vm.MIN_STATR_FOR_RATING_FEEDBACK\"></textarea>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/znkLessonNotes/lessonNotesPopup/lessonSummaryNote/lessonSummaryNote.component.html",
    "<div class=\"lesson-summary-notes\">\n" +
    "    <div class=\"lato-18-n znk-uppercase\" translate=\"LESSON_NOTES.LESSON_NOTES_POPUP.SUMMARY_NOTES.TITLE\"></div>\n" +
    "\n" +
    "    <textarea class=\"lato-14-n note-txt\" ng-modal=\"vm.lesson.lessonNotes.educatorNotes\"></textarea>\n" +
    "\n" +
    "    <div class=\"email-section\">\n" +
    "        <div class=\"lato-16-n\">\n" +
    "            {{'LESSON.LESSON_NOTES_POPUP.SUMMARY_NOTES.SEND_NOTES' | translate}} ({{vm.mailsToSend.length}})\n" +
    "        </div>\n" +
    "        <div class=\"checkbox-group\" ng-if=\"vm.studentsProfiles.length\">\n" +
    "            <div class=\"input-wrap\">\n" +
    "                <input id=\"studensMail\" type=\"checkbox\"\n" +
    "                       ng-change=\"vm.emailSelected(vm.userTypeContextEnum.student, $event.currentTarget.checked)\">\n" +
    "                <label for=\"studensMail\" ng-switch=\"studentsProfiles.length < 2\" ng-switch-when=\"true\">\n" +
    "                    {{'LESSON.LESSON_NOTES_POPUP.SUMMARY_NOTES.STUDENT_MAIL' | translate}}</label>\n" +
    "\n" +
    "                <label for=\"studensMail\" ng-switch-when=\"false\">\n" +
    "                    {{'LESSON.LESSON_NOTES_POPUP.SUMMARY_NOTES.ALL_STUDENTS_MAIL' | translate}}</label>\n" +
    "            </div>\n" +
    "            <div class=\"input-wrap\">\n" +
    "                <input id=\"parentsMail\" type=\"checkbox\"\n" +
    "                       ng-change=\"vm.emailSelected(vm.userTypeContextEnum.parent, $event.currentTarget.checked)\">\n" +
    "                <label for=\"parentsMail\" ng-switch=\"studentsProfiles.length < 2\" ng-switch-when=\"true\">\n" +
    "                    {{'LESSON.LESSON_NOTES_POPUP.SUMMARY_NOTES.PARENT_MAIL' | translate}}</label>\n" +
    "                <label for=\"parentsMail\" ng-switch-when=\"false\">{{'LESSON.LESSON_NOTES_POPUP.SUMMARY_NOTES.ALL_PARENTS_MAIL'\n" +
    "                    |\n" +
    "                    translate}}</label>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"button-wrapper\">\n" +
    "            <button type=\"button\" class=\"btn-type-2\" ng-click=\"vm.sendEmail()\">\n" +
    "                {{'LESSON.LESSON_NOTES_POPUP.SUMMARY_NOTES.SEND' | translate}}\n" +
    "            </button>\n" +
    "            <div class=\"text-muted\" ng-if=\"vm.sentDate\">\n" +
    "                {{'LESSON.LESSON_NOTES_POPUP.SUMMARY_NOTES.SENT_ON' | translate}} {{vm.sentDate | date:'MMM d,'}}\n" +
    "                {{sentDate | date:'jm'}}\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
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
}]);
