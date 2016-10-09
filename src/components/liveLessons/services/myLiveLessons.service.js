(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').service('MyLiveLessons',
        function ($mdDialog, UserProfileService, $http, $q, $log, ENV, $filter) {
            'ngInject';

            var self = this;
            var dataAsString;
            var teachworksIdUrl = ENV.backendEndpoint + ENV.teachworksDataUrl;
            var teachworksId;
            var userId;

            function getLiveLessonsSchedule() {
                var liveLessonsArr = [];
                return $q.all([_getTeachworksData(), UserProfileService.getCurrUserId()]).then(function (res) {
                    dataAsString = res[0];
                    userId = res[1];
                    return UserProfileService.getUserTeachWorksId(userId).then(function (teachworksIdObj) {
                        // teachworksId = angular.isDefined(teachworksIdObj) ? teachworksIdObj.id : undefined;
                        teachworksId = 'Samantha Puterman';
                        if (teachworksId && dataAsString) {
                            teachworksId = teachworksId.replace(/\s/g, '').toLowerCase();
                            var allRecordsData = dataAsString.match(/.*DTSTART(.|[\r\n])*?UID/g);
                            for (var i = 0; i < allRecordsData.length; i++) {
                                if (isTeachworksIdMatch(allRecordsData[i])) {
                                    var liveLessonObject = _buildLiveLessonObj(allRecordsData[i]);
                                    if (angular.isDefined(liveLessonObject.educatorName) && angular.isDefined(liveLessonObject.startTime)) {
                                        liveLessonsArr.push(liveLessonObject);
                                    }
                                }
                            }
                        }
                        return liveLessonsArr;
                    });
                });
            }

            function _getTeachworksData() {
                return $http({
                    method: 'GET',
                    url: teachworksIdUrl,
                    cache: true
                }).then(function successCallback(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug('myLiveLessons:' + response);
                });
            }

            self.getRelevantLiveLessons = function () {
                return getLiveLessonsSchedule().then(function (liveLessonsArr) {
                    var currentTimestamp = new Date().getTime();
                    var relevantLiveLessonsArr = [];

                    angular.forEach(liveLessonsArr, function (value) {
                        if ((angular.isDefined(value.endTime) & value.endTime > currentTimestamp) || value.startTime > currentTimestamp) {
                            relevantLiveLessonsArr.push(value);
                        }
                    });
                    return relevantLiveLessonsArr;
                });
            };

            self.getClosestLiveLesson = function () {
                return self.getRelevantLiveLessons().then(function (liveLessonsArr) {
                    var closestLiveLessonObj = {};

                    angular.forEach(liveLessonsArr, function (value) {
                        if (value.startTime < closestLiveLessonObj.startTime || angular.isUndefined(closestLiveLessonObj.startTime)) {
                            closestLiveLessonObj = value;
                        }
                    });
                    return closestLiveLessonObj;
                });
            };

            self.liveLessonsScheduleModal = function () {
                return self.getRelevantLiveLessons().then(function (liveLessonsArr) {
                    return $mdDialog.show({
                        templateUrl: 'components/liveLessons/templates/myLiveLessonsModal.template.html',
                        disableParentScroll: false,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        controller: ctrl,
                        controllerAs: 'vm'
                    });

                    function ctrl() {
                        this.liveLessonsArr = liveLessonsArr;
                        this.closeDialog = $mdDialog.cancel;
                        var currDate = new Date();
                        this.currentTime = $filter('date')(currDate, 'fullDate') + ' ' + currDate.toTimeString();
                        this.openRescheduleModal = function (lessonObj) {
                            self.rescheduleModal(lessonObj);
                        };
                    }
                });
            };

            self.rescheduleModal = function (lessonObj) {
                UserProfileService.getProfile().then(function (studentProfile) {
                    $mdDialog.show({
                        templateUrl: 'components/liveLessons/templates/rescheduleLessonModal.template.html',
                        disableParentScroll: false,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        controller: 'RescheduleLessonController',
                        controllerAs: 'vm',
                        locals: {
                            lessonData: lessonObj,
                            studentData: {
                                studentProfile: studentProfile,
                                userId: userId
                            }
                        }
                    });
                });
            };

            // -------------------------------------parsing data------------------------------- //

            function isTeachworksIdMatch(recordString) {
                var rawId = recordString.match(/SUMMARY.*/);
                if (rawId !== null) {
                    rawId = rawId[0].replace(/SUMMARY:|END/g, '');
                    var id = rawId.replace(/\s/g, '').toLowerCase();
                    return teachworksId === id;
                }
                return false;
            }

            function _buildLiveLessonObj(recordString) {
                var liveLessonObj = {};
                liveLessonObj.startTime = _getStartTime(recordString);
                liveLessonObj.originStartTime = _getOriginalDate(recordString);
                liveLessonObj.endTime = _getEndTime(recordString);
                liveLessonObj.educatorName = _getTeacherName(recordString);
                return liveLessonObj;
            }

            function _getStartTime(recordString) {
                var startTime = recordString.match(/DTSTART.*?\d+T\d+/);
                startTime = startTime[0].match(/\d+T\d+/);
                if (startTime !== null) {
                    return _convertDateToMilliseconds(startTime[0]);
                }
            }

            function _getOriginalDate(recordString) {
                var startTime = recordString.match(/DTSTART.*?\d+T\d+/);
                startTime = startTime[0].match(/\d+T\d+/);
                return _parseDate(startTime[0]);
            }

            function _getEndTime(recordString) {
                var endTime = recordString.match(/DTEND.*?\d+T\d+/);
                endTime = endTime !== null ? endTime[0].match(/\d+T\d+/)[0] : undefined;
                return endTime;
            }

            function _getTeacherName(recordString) {
                var teacherName = recordString.match(/DESCRIPTION:Employee.*/);
                if (teacherName !== null && teacherName[0]) {
                    teacherName = teacherName[0].match(/-.*/);
                    teacherName = teacherName[0].replace(/-/g, '');
                    teacherName = teacherName.match(/\w+\s*\w+/, '');
                    return teacherName !== null ? teacherName[0] : null;
                }
            }

            function _convertDateToMilliseconds(startTimeString) {
                var timeZone = self.getCdtOrCst();
                var originalDate = _parseDate(startTimeString) + ' ' + timeZone;
                var localFullDate = new Date(originalDate).toString();  // convert CST/CDT timezone to local timezone.
                return new Date(localFullDate).getTime();
            }

            function _parseDate(startTimeString) { // convert 20160720T160030 to 07/20/2016 16:00:30 and return as milliseconds.
                var YEAR = 4, MONTH = 6, DAY = 8, T = 9, HOUR = 11, MINUTE = 13, SECOND = 15;
                var day = startTimeString.slice(MONTH, DAY),
                    month = startTimeString.slice(YEAR, MONTH),
                    year = startTimeString.slice(0, YEAR),
                    hour = startTimeString.slice(T, HOUR),
                    minute = startTimeString.slice(HOUR, MINUTE),
                    second = startTimeString.slice(MINUTE, SECOND);

                var originalDate = month + '/' + day + '/' + year + ' ' + hour + ':' + minute + ':' + second;
                return originalDate;
            }

            self.getCdtOrCst = function () {
                var today = new Date;
                var date = $filter('date')(today, 'medium', 'CST'); // calculate by cst time zone.
                var yr = new Date(date).getFullYear();

                var cdtStart = new Date('March 13, ' + yr + ' 02:00:00'); // 2nd Sunday in March can't occur after the 14th
                var cdtEnd = new Date('November 07, ' + yr + ' 02:00:00'); // 1st Sunday in November can't occur after the 7th

                var day;
                day = cdtStart.getDay(); // day of week of 14th
                cdtStart.setDate(14 - day); // Calculate 2nd Sunday in March of this year
                day = cdtEnd.getDay(); // day of the week of 7th
                cdtEnd.setDate(7 - day); // Calculate first Sunday in November of this year
                if (today.getTime() >= cdtStart.getTime() && today.getTime() < cdtEnd.getTime()) {
                    return 'CDT';
                }
                return 'CST';
            };

            self.getLocalTimeZone = function () {
                var date = new Date();
                var localTimeString = date.toTimeString();
                var localTimeZone = localTimeString.replace(/([^\s]+)/, '');
                if (angular.isUndefined(date) || date === null) {
                    return '';
                }
                return localTimeZone;
            };

            // -------------------------------------parsing data------------------------------- //
        }
    );
})(angular);
