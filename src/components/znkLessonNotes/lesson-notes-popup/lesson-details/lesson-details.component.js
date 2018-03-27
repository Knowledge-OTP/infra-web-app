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

            }
        });
})(angular);
