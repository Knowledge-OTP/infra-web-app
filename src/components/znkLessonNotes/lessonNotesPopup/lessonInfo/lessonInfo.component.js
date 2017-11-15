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
            controller: function ($http, $q, $log, $filter, ENV, $translate, LessonStatusEnum, ZnkLessonNotesSrv, UserTypeContextEnum) {
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

            }
        });
})(angular);
