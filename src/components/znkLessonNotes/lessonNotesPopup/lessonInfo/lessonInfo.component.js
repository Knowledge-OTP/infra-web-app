(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.znkLessonNotes')
        .component('znkLessonInfo', {
            bindings: {
                lesson: '='
            },
            templateUrl: 'components/znkLessonNotes/lessonNotesPopup/lessonInfo/lessonInfo.component.html',
            controllerAs: 'vm',
            controller: function ($http, $q, $log, $filter, ENV, $translate, LessonStatusEnum, znkLessonNotesSrv) {
                'ngInject';

                const vm = this;

                this.$onInit = function () {
                    $log.debug('znkLessonInfo: Init');
                    vm.nameSpace = 'LIVE_SESSION.LESSON_NOTES_POPUP';
                    vm.fields = [];
                    vm.dataPromMap.translate = getTranslations();
                    vm.lessonStatusArr = znkLessonNotesSrv.enumToArray(LessonStatusEnum, true);
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
                    vm.dataPromMap.serviceList = znkLessonNotesSrv.getServiceList();
                    $q.all(vm.dataPromMap).then((dataMap) => {
                        vm.translate = dataMap.translate;
                        vm.serviceList = dataMap.serviceList;
                        buildViewModal();
                    });
                }



                function buildViewModal() {
                    Object.keys(vm.translate).forEach(translateKey => {
                        const field = {label: vm.translate[translateKey], text: null};
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
                                field.text = znkLessonNotesSrv.capitalizeFirstLetter(LessonStatusEnum[vm.lesson.status]);
                                break;
                        }
                        vm.fields.push(field);
                    });
                }

                function getStudentsNames() {
                    let studentsNames = '';
                    const studentsKeys = Object.keys(vm.lesson.students);
                    studentsKeys.forEach((studentId, index) => {
                        const student = vm.lesson.students[studentId];
                        studentsNames += vm.znkLessonNotesSrv.getUserFullName(student);
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
                            const convertedDuration = vm.utilsService.convertMS(timestamp);
                            let hourOrMinText;
                            if (convertedDuration.hour >= 1) {
                                const translatePath = convertedDuration.hour > 1 ? `${vm.nameSpace}.HOURS` : `${vm.nameSpace}.HOUR`;
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

            }
        });
})(angular);
