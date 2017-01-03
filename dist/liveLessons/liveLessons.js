(function (window, angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons', [
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.user',
        'znk.infra.mailSender',
        'znk.infra.storage',
        'ngMaterial'
    ]).config([
        'SvgIconSrvProvider',
        function (SvgIconSrvProvider) {
            var svgMap = {
                'close-popup': 'components/liveLessons/svg/close-popup.svg',
                'reschedule-icon': 'components/liveLessons/svg/reschedule-icon.svg',
                'calendar-icon': 'components/liveLessons/svg/calendar-icon.svg'
            };
            SvgIconSrvProvider.registerSvgSources(svgMap);
        }
    ])
        .run(["$mdToast", "MyLiveLessons", function ($mdToast, MyLiveLessons) {
            'ngInject';
            MyLiveLessons.getClosestLiveLesson().then(function (closestLiveLessonObj) {
                if (angular.isUndefined(closestLiveLessonObj.startTime)) {
                    return;
                }

                var optionsOrPreset = {
                    templateUrl: 'components/liveLessons/templates/upcomingLessonToast.template.html',
                    hideDelay: false,
                    controller: 'UpcomingLessonToasterController',
                    controllerAs: 'vm',
                    locals: {
                        closestLiveLesson: closestLiveLessonObj
                    }
                };

                $mdToast.cancel().then(function () {
                    $mdToast.show(optionsOrPreset);
                });
            });
        }]);
})(window, angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').controller('RescheduleLessonController',
        ["$mdDialog", "lessonData", "educatorProfileData", "studentData", "$filter", "ENV", "$translate", "MailSenderService", "MyLiveLessons", function ($mdDialog, lessonData, educatorProfileData, studentData, $filter, ENV, $translate, MailSenderService, MyLiveLessons) {
            'ngInject';

            var self = this;
            self.closeDialog = $mdDialog.cancel;
            self.teacherAvailabilityHours = educatorProfileData.educatorAvailabilityHours;
            self.teacherName = lessonData.educatorName;

            var currentTimeStamp = new Date().getTime();
            var FORTY_EIGHT_HOURS = 172800000;
            var MAIL_TO_SEND = 'zoe@zinkerz.com';
            var TEMPLATE_KEY = 'reschedule';

            if (currentTimeStamp + FORTY_EIGHT_HOURS > lessonData.startTime) {
                self.islessonInNextFortyEightHours = true;
            }

            var localTimeZone = MyLiveLessons.getLocalTimeZone();

            var studentName = studentData.studentProfile.nickname || '';
            var studentEmail = studentData.studentProfile.email || '';
            var localStartTimeLesson = $filter('date')(lessonData.startTime, 'MMMM d, h:mma') + localTimeZone;
            var emailBodyMessageVars = {
                teacherName: lessonData.educatorName,
                lessonDate: localStartTimeLesson,
                studentName: studentName
            };

            $translate('RESCHEDULE_LESSON_MODAL.MESSAGE', emailBodyMessageVars).then(function (message) {
                self.message = message;
            });

            var rescheduleRequest = '';
            $translate('RESCHEDULE_LESSON_MODAL.RESCHEDULE_REQUEST', emailBodyMessageVars).then(function (rescheduleRequestText) {
                rescheduleRequest = rescheduleRequestText;
            });

            // add to message body student email, uid and original lesson time
            var originStartTime = lessonData.originStartTime;
            var originTimeZone = MyLiveLessons.getCdtOrCst();
            var ADD_TO_MESSAGE = '\r\n\r\n' + 'email: ' + studentData.studentProfile.email + ' | ';
            ADD_TO_MESSAGE += '\r\n' + 'uid: ' + studentData.userId + ' | ';
            ADD_TO_MESSAGE += '\r\n' + 'original time: ' + originStartTime;
            ADD_TO_MESSAGE += ' ' + originTimeZone;

            self.send = function () {
                // subject format: Resquedule Request- [Student Name] | [Teacher Name] | [Lesson Time]
                var emailSubject = rescheduleRequest;
                emailSubject += ' - ' + studentName;
                emailSubject += ' | ' + lessonData.educatorName;
                emailSubject += ' | ' + localStartTimeLesson;

                var message = self.message + ADD_TO_MESSAGE;

                var dataToSend = {
                    emails: [MAIL_TO_SEND],
                    message: message,
                    subject: emailSubject,
                    appName: ENV.firebaseAppScopeName,
                    templateKey: TEMPLATE_KEY,
                    fromEmail: studentEmail,
                    fromName: studentName
                };

                MailSenderService.postMailRequest(dataToSend).then(function () {
                    self.requestWasSent = true;
                });
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').controller('UpcomingLessonToasterController',
        ["$mdToast", "MyLiveLessons", "closestLiveLesson", "$timeout", function ($mdToast, MyLiveLessons, closestLiveLesson, $timeout) {
        'ngInject';

            var self = this;

            $timeout(function () {
                self.animateToast = true;
            });

            self.closeToast = function () {
                $mdToast.hide();
            };

            self.closestLiveLesson = closestLiveLesson;

            self.openMyLessonsPopup = function () {
                $mdToast.hide();
                MyLiveLessons.liveLessonsScheduleModal();
            };

            self.openRescheduleModal = function (lessonObj) {
                $mdToast.hide();
                MyLiveLessons.rescheduleModal(lessonObj);
            };
        }]
    );
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.liveLessons').service('MyLiveLessons',
        ["$mdDialog", "UserProfileService", "$http", "$q", "$log", "ENV", "$filter", "InfraConfigSrv", "StudentContextSrv", "InvitationService", function ($mdDialog, UserProfileService, $http, $q, $log, ENV, $filter, InfraConfigSrv, StudentContextSrv, InvitationService) {
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
                        teachworksId = angular.isDefined(teachworksIdObj) ? teachworksIdObj.id : undefined;
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

            function _getEducatorProfileByTeachworksName(name) {
                var connectedEducatorsList = _getApprovedEducatorsProfile();
                var educators = Object.keys(connectedEducatorsList).map(function (keyItem) {
                    return connectedEducatorsList[keyItem];
                }).filter(function (EducatorObj) {
                    return EducatorObj.educatorTeachworksName === name;
                });
                return educators.length ? educators[0] : {};
            }


            function _getApprovedEducatorsProfile() {
                return InvitationService.getMyTeachers();

            }

            self.getRelevantLiveLessons = function () {
                return getLiveLessonsSchedule().then(function (liveLessonsArr) {
                    var currentTimestamp = new Date().getTime();
                    var relevantLiveLessonsArr = [];

                    angular.forEach(liveLessonsArr, function (value) {
                        if ((angular.isDefined(value.endTime) && value.endTime > currentTimestamp) || value.startTime > currentTimestamp) {
                            relevantLiveLessonsArr.push(value);
                        }
                    });
                    // relevantLiveLessonsArr.push({
                    //     "startTime": 1482181200000,
                    //     "originStartTime": "12/19/2017 16:00:00",
                    //     "endTime": "20161219T170000",
                    //     "educatorName": "Alex Choroshin"
                    // });
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

                    var liveLessonsScheduleController = function () {
                        this.liveLessonsArr = liveLessonsArr;
                        this.closeDialog = $mdDialog.cancel;
                        var currDate = new Date();
                        this.currentTime = $filter('date')(currDate, 'fullDate') + ' ' + currDate.toTimeString();
                        this.openRescheduleModal = function (lessonObj) {
                            self.rescheduleModal(lessonObj);
                        };
                    };
                    return $mdDialog.show({
                        templateUrl: 'components/liveLessons/templates/myLiveLessonsModal.template.html',
                        disableParentScroll: false,
                        clickOutsideToClose: true,
                        fullscreen: false,
                        controller: liveLessonsScheduleController,
                        controllerAs: 'vm'
                    });
                });
            };

            self.rescheduleModal = function (lessonObj) {
                var educatorProfile = _getEducatorProfileByTeachworksName(lessonObj.educatorName);
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
                            educatorProfileData: educatorProfile,
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
                var timeZone = 'CDT';
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

            self.getLocalTimeZone = function () {
                var date = new Date();
                var localTimeString = date.toTimeString();
                var localTimeZone = localTimeString.replace(/([^\s]+)/, '');
                if (angular.isUndefined(date) || date === null) {
                    return '';
                }
                return localTimeZone;
            };

            self.getCdtOrCst = function () {
                return 'CDT';
            };
            // -------------------------------------parsing data------------------------------- //
        }]
    );
})(angular);

angular.module('znk.infra-web-app.liveLessons').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/liveLessons/svg/calendar-icon.svg",
    "<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" class=\"calendar-icon\"\n" +
    "     viewBox=\"0 0 176.3 200\">\n" +
    "    <style>\n" +
    "        .calendar-icon{\n" +
    "        enable-background:new 0 0 176.3 200;\n" +
    "        width:35px;\n" +
    "        height: auto;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <g id=\"XMLID_40_\">\n" +
    "        <path id=\"XMLID_138_\" d=\"M164.1,200c-50.7,0-101.3,0-152,0C3.1,196-0.1,189.1,0,179.3c0.3-36.5,0.1-73,0.1-109.5c0-1.9,0-3.8,0-5.6\n" +
    "		c59,0,117.3,0,176,0c0,2,0,3.8,0,5.6c0,36.5-0.2,73,0.1,109.5C176.4,189.1,173.2,196,164.1,200z M163.9,156.3\n" +
    "		c-10.8,0-21.1,0-31.4,0c0,10.7,0,21.1,0,31.4c10.6,0,20.9,0,31.4,0C163.9,177.2,163.9,166.9,163.9,156.3z M123.9,156.2\n" +
    "		c-10.8,0-21.1,0-31.5,0c0,10.6,0,21,0,31.4c10.7,0,21.1,0,31.5,0C123.9,177,123.9,166.7,123.9,156.2z M52.4,187.7\n" +
    "		c10.8,0,21.1,0,31.5,0c0-10.6,0-21,0-31.4c-10.7,0-21.1,0-31.5,0C52.4,166.9,52.4,177.2,52.4,187.7z M12.5,156.2\n" +
    "		c0,10.7,0,21.1,0,31.4c10.7,0,21.1,0,31.4,0c0-10.6,0-20.9,0-31.4C33.4,156.2,23.1,156.2,12.5,156.2z M163.8,147.7\n" +
    "		c0-10.8,0-21.1,0-31.4c-10.7,0-21.1,0-31.4,0c0,10.7,0,20.9,0,31.4C142.9,147.7,153.2,147.7,163.8,147.7z M123.9,147.7\n" +
    "		c0-10.8,0-21.1,0-31.5c-10.6,0-21,0-31.4,0c0,10.7,0,21.1,0,31.5C103.1,147.7,113.4,147.7,123.9,147.7z M52.4,147.6\n" +
    "		c10.8,0,21.2,0,31.4,0c0-10.7,0-21.1,0-31.4c-10.7,0-20.9,0-31.4,0C52.4,126.7,52.4,137,52.4,147.6z M43.9,116.3\n" +
    "		c-10.7,0-21.1,0-31.4,0c0,10.7,0,21.1,0,31.4c10.6,0,20.9,0,31.4,0C43.9,137.2,43.9,127,43.9,116.3z M132.5,76.1\n" +
    "		c0,10.9,0,21.3,0,31.5c10.7,0,20.9,0,31.3,0c0-10.6,0-21,0-31.5C153.3,76.1,143,76.1,132.5,76.1z M92.5,76.2c0,10.8,0,21.1,0,31.4\n" +
    "		c10.7,0,21.1,0,31.4,0c0-10.7,0-20.9,0-31.4C113.4,76.2,103.1,76.2,92.5,76.2z M83.9,76.3c-10.8,0-21.1,0-31.4,0\n" +
    "		c0,10.7,0,21.1,0,31.4c10.6,0,20.9,0,31.4,0C83.9,97.2,83.9,86.9,83.9,76.3z M43.9,76.3c-10.8,0-21.2,0-31.4,0\n" +
    "		c0,10.7,0,21.1,0,31.4c10.7,0,20.9,0,31.4,0C43.9,97.1,43.9,86.9,43.9,76.3z\"/>\n" +
    "        <path id=\"XMLID_119_\" d=\"M176.1,55.8c-58.9,0-117.1,0-175.7,0c0-6.4-0.6-12.7,0.2-18.9c1-7.6,7.6-12.7,15.5-12.9\n" +
    "		c4.3-0.1,8.7,0,13,0c4.1,0,8.3,0,13,0c0-5.8-0.1-11.2,0-16.6c0.1-4.7,2.5-7.7,6.2-7.3c4.3,0.4,5.8,3.2,5.8,7.3\n" +
    "		c-0.1,5.3,0,10.6,0,16.3c22.6,0,45,0,68,0c0-5.4,0.1-10.8,0-16.3c-0.1-4.1,1.4-6.9,5.8-7.3c3.7-0.4,6.2,2.6,6.2,7.3\n" +
    "		c0.1,5.3,0,10.6,0,16.6c7.8,0,15.4,0,23,0c12.9,0,19,6.1,19,18.9C176.1,47,176.1,51.1,176.1,55.8z M122.2,29.9\n" +
    "		c-5.7,4.3-7.2,9.1-5.1,14.4c2,5.2,7.3,8.3,12.7,7.6c5.2-0.7,9.5-4.9,10.3-10.1c0.8-4.9-1.5-9.2-5.9-11.2c0,3.1,0.1,6.1,0,9\n" +
    "		c-0.1,3.7-2.1,6.1-5.8,6.2c-4,0.1-6-2.4-6.1-6.3C122.1,36.6,122.2,33.6,122.2,29.9z M42.2,29.9c-5.7,4.3-7.2,9-5.2,14.3\n" +
    "		c2,5.2,7.2,8.3,12.7,7.6c5.2-0.7,9.5-4.9,10.4-10.1c0.8-4.8-1.4-9.2-5.9-11.2c0,3.3,0.2,6.4,0,9.5c-0.2,3.4-2.3,5.6-5.7,5.7\n" +
    "		c-3.7,0.1-5.9-2.1-6.1-5.8C42,36.9,42.2,33.8,42.2,29.9z\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveLessons/svg/close-popup.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\" class=\"close-popup\">\n" +
    "    <style>\n" +
    "        .close-popup{\n" +
    "        width:15px;\n" +
    "        height:15px;\n" +
    "        }\n" +
    "    </style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveLessons/svg/reschedule-icon.svg",
    "<svg version=\"1.1\" id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 172 188\"\n" +
    "     style=\"enable-background:new 0 0 172 188;\"\n" +
    "     class=\"reschedule-icon\"\n" +
    "     xml:space=\"preserve\">\n" +
    "    <style type=\"text/css\">\n" +
    "    svg.reschedule-icon{\n" +
    "        width:12px;\n" +
    "    	.st0{fill:none;stroke:#000000;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}\n" +
    "    }\n" +
    "</style>\n" +
    "<path id=\"XMLID_65_\" d=\"M12,63.7c49.6,0,98.6,0,147.9,0c0-9,0.3-17.8-0.1-26.6c-0.2-5.4-4.5-8.8-10.1-9.2c-2.8-0.2-6,0.7-8.4-0.3\n" +
    "	c-2.2-0.9-4.7-3.5-5-5.6c-0.2-1.8,2.4-5.5,4-5.7c6.7-0.7,13.7-1.5,20,2.1c7.3,4.2,11.6,10.5,11.6,19.1c0.1,42.8,0.1,85.6,0,128.5\n" +
    "	c0,12.3-9.6,21.8-21.9,21.8c-42.7,0.1-85.3,0.1-128,0c-12.5,0-22-9.6-22-22.2c0-42.5,0-85,0-127.5c0-12.6,9.5-22.1,22-22.2\n" +
    "	c2.5,0,5,0,7.5,0c4,0.1,6.4,2.1,6.4,6.1c-0.1,4-2.6,5.9-6.6,5.9c-2.5,0-5-0.1-7.5,0.1c-5.6,0.5-9.5,4-9.7,9.5\n" +
    "	C11.8,46.2,12,54.8,12,63.7z M12,76.2c0,29.4,0,58.2,0,87c0,9.4,3.5,12.8,13.1,12.8c40.7,0,81.3,0,122,0c9.5,0,13-3.5,13-13\n" +
    "	c0-27.3,0-54.6,0-82c0-1.6-0.1-3.2-0.2-4.9C110.4,76.2,61.5,76.2,12,76.2z\"/>\n" +
    "<path id=\"XMLID_58_\" d=\"M86,27.9c-7.7,0-15.3,0-23,0c-4.7,0-7.6-2.5-7.3-6.2c0.4-4.3,3.1-5.8,7.2-5.8C78.3,16,93.6,16,109,16\n" +
    "	c4.1,0,6.9,1.7,6.9,6c0,4.3-2.8,6-6.9,6C101.3,27.9,93.7,27.9,86,27.9z\"/>\n" +
    "<path id=\"XMLID_4_\" d=\"M46.7,58.8C38,58.8,31,51.8,31,43.1S38,27.3,46.7,27.3s15.8,7.1,15.8,15.8S55.4,58.8,46.7,58.8z M46.7,34.3\n" +
    "	c-4.8,0-8.8,3.9-8.8,8.8s3.9,8.8,8.8,8.8s8.8-3.9,8.8-8.8S51.6,34.3,46.7,34.3z\"/>\n" +
    "<path id=\"XMLID_5_\" d=\"M46.7,34.3c-1.9,0-3.5-1.6-3.5-3.5V4.4c0-1.9,1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5v26.4\n" +
    "	C50.2,32.8,48.7,34.3,46.7,34.3z\"/>\n" +
    "<path id=\"XMLID_6_\" d=\"M127.2,57.9c-8.7,0-15.8-7.1-15.8-15.8s7.1-15.8,15.8-15.8s15.7,7.1,15.7,15.8S135.8,57.9,127.2,57.9z\n" +
    "	 M127.2,33.4c-4.8,0-8.8,3.9-8.8,8.8s3.9,8.8,8.8,8.8c4.8,0,8.7-3.9,8.7-8.8S132,33.4,127.2,33.4z\"/>\n" +
    "<path id=\"XMLID_7_\" d=\"M127.2,33.4c-1.9,0-3.5-1.6-3.5-3.5V3.5c0-1.9,1.6-3.5,3.5-3.5c1.9,0,3.5,1.6,3.5,3.5v26.4\n" +
    "	C130.7,31.8,129.1,33.4,127.2,33.4z\"/>\n" +
    "<path id=\"XMLID_26_\" d=\"M56.4,130.4c-1.9,0-3.5-1.5-3.5-3.4c0-1.5,0.1-3,0.2-4.6c2.2-18.5,19-31.7,37.5-29.5\n" +
    "	c13.3,1.6,24.4,10.9,28.3,23.7c0.6,1.8-0.5,3.8-2.3,4.4c-1.8,0.6-3.8-0.5-4.4-2.3c-3.1-10.2-11.9-17.5-22.5-18.8\n" +
    "	c-14.7-1.7-28,8.8-29.7,23.4c-0.1,1.2-0.2,2.4-0.2,3.6C59.9,128.7,58.4,130.3,56.4,130.4C56.4,130.4,56.4,130.4,56.4,130.4z\"/>\n" +
    "<polygon id=\"XMLID_13_\" points=\"122.2,106.1 118.8,121.6 118.7,122.9 102.7,115.2 \"/>\n" +
    "<path id=\"XMLID_27_\" d=\"M89.1,163c-13.6,0-25.8-8.1-31.1-20.6c-0.8-1.8,0.1-3.8,1.9-4.6c1.8-0.8,3.8,0.1,4.6,1.9\n" +
    "	c4.2,9.9,13.9,16.3,24.7,16.3c13.9,0,25.3-10.4,26.6-24.2c0.2-1.9,1.9-3.3,3.8-3.2c1.9,0.2,3.3,1.9,3.2,3.8\n" +
    "	C121,149.8,106.6,163,89.1,163z\"/>\n" +
    "<polygon id=\"XMLID_3_\" points=\"54.6,150.1 55.4,134.9 55.4,133.5 72.2,139.3 \"/>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/liveLessons/templates/myLiveLessonsModal.template.html",
    "<md-dialog ng-cloak class=\"my-lessons-schedule-wrapper base\" translate-namespace=\"MY_LIVE_LESSONS_POPUP\">\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"calendar-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"close-popup-wrap\">\n" +
    "        <svg-icon name=\"close-popup\" ng-click=\"vm.closeDialog()\"></svg-icon>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-dialog-content>\n" +
    "        <div class=\"md-dialog-content\">\n" +
    "            <div class=\"live-lessons-title\" translate=\".LIVE_LESSONS_SCHEDULE\"></div>\n" +
    "            <div class=\"upcoming-lesson-title\" translate=\".UPCOMING_LESSON\"></div>\n" +
    "\n" +
    "            <div class=\"live-lessons-wrapper znk-scrollbar\">\n" +
    "                <div class=\"live-lesson-repeater\" ng-repeat=\"lesson in vm.liveLessonsArr | orderBy: 'startTime'\">\n" +
    "                    <div class=\"live-lesson\" >\n" +
    "                        <div class=\"date\">{{lesson.startTime | date:'d MMM' | uppercase}}</div>\n" +
    "                        <div class=\"hour\">{{lesson.startTime | date:'h:mm a'}}</div>\n" +
    "                        <div class=\"educator-name\">{{lesson.educatorName}}</div>\n" +
    "                    </div>\n" +
    "                    <div class=\"reschedule-wrapper\">\n" +
    "                        <md-tooltip md-direction=\"top\" class=\"reschedule-tooltip\">\n" +
    "                            <div translate=\".RESCHEDULE_LESSON\"></div>\n" +
    "                        </md-tooltip>\n" +
    "                        <svg-icon name=\"reschedule-icon\" ng-click=\"vm.openRescheduleModal(lesson)\"></svg-icon>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"no-live-lessons-text\" translate=\".NO_LIVE_LESSONS\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"current-time\" translate=\".CURRENT_TIME\"\n" +
    "                 translate-values=\"{ currentTime: {{'vm.currentTime'}} }\"></div>\n" +
    "            <div class=\"btn-wrapper\">\n" +
    "                <md-button\n" +
    "                    aria-label=\"{{'MY_LIVE_LESSONS_POPUP.OK' | translate}}\"\n" +
    "                    class=\"ok-button success drop-shadow\"\n" +
    "                    ng-click=\"vm.closeDialog()\">\n" +
    "                    <span translate=\".OK\"></span>\n" +
    "                </md-button>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/liveLessons/templates/rescheduleLessonModal.template.html",
    "<md-dialog ng-cloak class=\"my-lessons-schedule-wrapper base\" translate-namespace=\"RESCHEDULE_LESSON_MODAL\">\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"reschedule-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"close-popup-wrap\">\n" +
    "        <svg-icon name=\"close-popup\" ng-click=\"vm.closeDialog()\"></svg-icon>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-dialog-content>\n" +
    "        <div ng-switch=\"!!vm.requestWasSent\">\n" +
    "            <div class=\"md-dialog-content\">\n" +
    "                <div class=\"reschedule-lesson-title\" translate=\".RESCHEDULE_LESSON\"></div>\n" +
    "                <div class=\"availability-hours\">\n" +
    "                    <div class=\"name\">{{vm.teacherName}}</div>\n" +
    "                    <div class=\"date\">{{vm.teacherAvailabilityHours}}</div>\n" +
    "                </div>\n" +
    "                <div class=\"email-container\" ng-switch-when=\"false\">\n" +
    "                    <div class=\"note-wrapper\" ng-if=\"vm.islessonInNextFortyEightHours\">\n" +
    "                        <span class=\"red-color-text\" translate=\".NOTE\"></span>\n" +
    "                        <span class=\"warning-text\" translate=\".RESCHEDULING_FEE_PART1\"></span>\n" +
    "                        <span class=\"red-color-text\" translate=\".HOURS\"></span>\n" +
    "                        <div class=\"warning-text\" translate=\".RESCHEDULING_FEE_PART2\"></div>\n" +
    "                    </div>\n" +
    "\n" +
    "                    <textarea class=\"reschedule-container\"\n" +
    "                              required\n" +
    "                              ng-model=\"vm.message\"\n" +
    "                              md-select-on-focus>\n" +
    "                </textarea>\n" +
    "                    <div class=\"bottom-lesson\" translate=\".WE_WILL_CONTACT_YOU\"></div>\n" +
    "                    <div class=\"buttons-wrapper\">\n" +
    "                        <md-button\n" +
    "                            aria-label=\"{{'RESCHEDULE_LESSON_MODAL.CANCEL' | translate}}\"\n" +
    "                            class=\"md-button cancel-btn\"\n" +
    "                            translate=\".CANCEL\"\n" +
    "                            ng-click=\"vm.closeDialog()\">\n" +
    "                        </md-button>\n" +
    "                        <md-button\n" +
    "                            aria-label=\"{{'RESCHEDULE_LESSON_MODAL.SEND' | translate}}\"\n" +
    "                            class=\"md-button send-btn\"\n" +
    "                            translate=\".SEND\"\n" +
    "                            ng-click=\"vm.send()\">\n" +
    "                        </md-button>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "\n" +
    "                <div class=\"big-success-msg\" ng-switch-when=\"true\">\n" +
    "                    <svg-icon class=\"completed-v-icon-wrap\" name=\"completed-v-icon\"></svg-icon>\n" +
    "                    <div translate=\".SUCCESS_SHARED\"></div>\n" +
    "                    <div class=\"done-btn-wrap\">\n" +
    "                        <md-button\n" +
    "                            aria-label=\"{{'RESCHEDULE_LESSON_MODAL.DONE' | translate}}\"\n" +
    "                            class=\"success lg drop-shadow\"\n" +
    "                            ng-click=\"vm.closeDialog()\">\n" +
    "                            <span translate=\".DONE\"></span>\n" +
    "                        </md-button>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </md-dialog-content>\n" +
    "\n" +
    "</md-dialog>\n" +
    "");
  $templateCache.put("components/liveLessons/templates/upcomingLessonToast.template.html",
    "<div class=\"upcoming-lesson-toast-wrapper base-border-radius\" translate-namespace=\"UPCOMING_LESSON_TOAST\"\n" +
    "     ng-class=\"{'animate-toast': vm.animateToast}\">\n" +
    "    <svg-icon name=\"close-popup\" ng-click=\"vm.closeToast()\"></svg-icon>\n" +
    "\n" +
    "    <div class=\"left-side-container\" ng-click=\"vm.openMyLessonsPopup()\">\n" +
    "        <svg-icon name=\"calendar-icon\"></svg-icon>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"right-side-container\" >\n" +
    "        <div class=\"closest-lesson-details\" ng-click=\"vm.openMyLessonsPopup()\">\n" +
    "            <div class=\"top-title\" translate=\".YOUR_UPCOMING_LESSON_WITH\"></div>\n" +
    "            <div class=\"teacher-name\">{{vm.closestLiveLesson.educatorName}}</div>\n" +
    "            <div class=\"lesson-date\">{{vm.closestLiveLesson.startTime | date: 'EEEE, MMMM d'}}</div>\n" +
    "            <div class=\"lesson-hour\">{{vm.closestLiveLesson.startTime | date:'h:mm a'}}</div>\n" +
    "        </div>\n" +
    "        <div class=\"bottom-container\">\n" +
    "            <div class=\"bottom-clickable-text\" translate=\".MY_LIVE_LESSONS_SCHEDULE\" ng-click=\"vm.openMyLessonsPopup()\"></div>\n" +
    "            <div class=\"reschedule-wrapper\" ng-click=\"vm.openRescheduleModal(vm.closestLiveLesson)\">\n" +
    "                <svg-icon name=\"reschedule-icon\"></svg-icon>\n" +
    "                <div class=\"reschedule-text\" translate=\".RESCHEDULE\"></div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);
