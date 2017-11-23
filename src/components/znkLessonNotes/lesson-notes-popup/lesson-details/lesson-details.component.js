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
            controller: function ($http, $q, $log, $filter, ENV, $translate, LessonStatusEnum, ZnkLessonNotesSrv,
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
                                field.text = this.transformDate(this.lesson.startTime, 'START_TIME');
                                break;
                            case `${this.nameSpace}.DURATION`:
                                field.text = this.transformDate(this.lesson.endTime - this.lesson.startTime, 'DURATION');
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

            }
        });
})(angular);
