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
            controller: function ($scope, $http, $q, $log, $filter, ENV, $translate, LessonStatusEnum, ZnkLessonNotesSrv,
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
                        `${this.nameSpace}.START_TIME`,
                        `${this.nameSpace}.DURATION`,
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
                        startTime: this.getStartTimeField(),
                        duration: this.getDurationField(),
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

                this.getStartTimeField = () => {
                    const field = {label: null, val: null};
                    field.label = this.translate[`${this.nameSpace}.START_TIME`] || null;
                    if (this.lessonSummary.startTime) {
                        field.val = this.transformDate(this.lessonSummary.startTime, 'START_TIME');
                    }
                    return field;
                };

                this.getDurationField = () => {
                    const field = {label: null, val: null};
                    field.label = this.translate[`${this.nameSpace}.DURATION`] || null;
                    if (this.lessonSummary.startTime && this.lessonSummary.endTime) {
                        const duration = this.lessonSummary.endTime - this.lessonSummary.startTime;
                        field.val = this.transformDate(duration, 'DURATION');
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

                this.statusChanged = (status) => {
                    this.lesson.status = status ? Number(status): null;
                    $scope.$emit('LESSON_CHANGED');
                };

            }
        });
})(angular);
