(function (angular) {

    angular.module('demo', ['znk.infra-web-app.adminDashboard'])
        .config([
            '$stateProvider',
            'SvgIconSrvProvider',
            function ($stateProvider) {
                $stateProvider
                    .state('eslink', {
                        url: '/eslink',
                        templateUrl: '/templates/esLink.template.html',
                        controller: 'ESLinkController',
                        controllerAs: 'vm'
                    })
                    .state('emetadata', {
                        url: '/emetadata',
                        templateUrl: '/templates/eMetadata.template.html',
                        controller: 'EMetadataController',
                        controllerAs: 'vm'
                    });
            }
        ])
        .constant('ENV', {
            firebaseAppScopeName: "sat_app",
            fbDataEndPoint: "https://sat-dev.firebaseio.com/",
            appContext: 'student',
            studentAppName: 'sat_app',
            dashboardAppName: 'sat_dashboard',
            videosEndPoint: "//dfz02hjbsqn5e.cloudfront.net/sat_app/",
            mediaEndPoint: "//dfz02hjbsqn5e.cloudfront.net/",
            fbGlobalEndPoint: 'https://znk-dev.firebaseio.com/'
        })
        .service('DemoEMetadataService',function($mdDialog, $http, ENV, $q, InfraConfigSrv, $log){
            'ngInject';


            var self = this;
            //  var profilePath = ENV.backendEndpoint + "/teachworks/zinkerzTeacher/all";
            var profilePath = "http://localhost:3009/teachworks/zinkerzTeacher/all";
            var globalStorageProm = InfraConfigSrv.getGlobalStorage();

            var satURL = "https://sat-dev.firebaseio.com";
            var actURL = "https://act-dev.firebaseio.com";
            var tofelURL = "https://znk-toefl-dev.firebaseio.com";

            if (!ENV.debug) {
                // satURL = "https://sat-dev.firebaseio.com/";
                // actURL = "https://act-dev.firebaseio.com/";
                // tofelURL = "https://znk-toefl-dev.firebaseio.com/";
            }


            self.showEducatorProfile = function (userProfile) {
                $q.all([getTimezonesList(), getLocalTimezone()]).then(function (values) {
                    var timezonesList = values[0];
                    var localTimezone = values[1];
                    $mdDialog.show({
                        locals: {
                            userProfile: userProfile,
                            timezonesList: obj2Array(timezonesList),
                            localTimezone: localTimezone
                        },
                        controller: 'AdminProfileController',
                        controllerAs: 'vm',
                        templateUrl: '/templates/educatorProfile.template.html',
                        clickOutsideToClose: true,
                        escapeToClose: true
                    });
                });

            };

            self.updateProfile = function (newProfile) {
                var fullPath = "users/" + newProfile.uid + "/profile";
                return InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
                    return globalStorage.update(fullPath, newProfile);
                });
            };
            self.setZinkerzTeacher = function (uid, subject, isZinkerzTeacher) {
                if (!uid) {
                    $log.error('setZinkerzTeacher: no uid');
                    return;
                }
                if (!subject) {
                    $log.error('setZinkerzTeacher: no subject');
                    return;
                }
                var profile = {
                    userId: uid,
                    isZinkerzTeacher: !!isZinkerzTeacher,
                    teachingSubject: subject,
                    fbUrls: [satURL, actURL, tofelURL]
                };
                return $http.post(profilePath, profile);
            };

            function obj2Array(obj) {
                return Object.keys(obj).map(function (key) {
                    return obj[key];
                });
            }

            function getTimezonesList() {
                return globalStorageProm.then(function (globalStorage) {
                    return globalStorage.get('timezones');
                });
            }
            function getLocalTimezone() {
                var localTimezone;
                var dateArray = new Date().toString().split(' ');
                var timezoneCity = dateArray.find(function (item) {
                    return (item.indexOf('(') !== -1);
                });

                timezoneCity = timezoneCity ? timezoneCity.replace('(', '') : null;

                return getTimezonesList().then(function (timezonesList) {
                    if (timezoneCity) {
                        timezonesList = obj2Array(timezonesList);
                        localTimezone = timezonesList.find(function (timezone) {
                            return (timezone.indexOf(timezoneCity) !== -1);
                        });
                    } else {
                        if (!localTimezone) {
                            var timezoneGMT = dateArray.find(function (item) {
                                return (item.indexOf('GMT') !== -1);
                            });
                            localTimezone = timezonesList.find(function (timezone) {
                                timezone = timezone.replace(':', '');
                                return (timezone.indexOf(timezoneGMT) !== -1);
                            });
                        }
                    }

                    return localTimezone;
                });
            }

        })
        .controller('Main', function ($state) {
            var self = this;

            if (!$state.current.name) {
                $state.go('eslink');
            }
        })
        .controller('ESLinkController', function ($filter, AdminSearchService, ESLinkService, $log, ZnkToastSrv) {
            var self = this;

            self.uiGridState = {
                student: {
                    initial: true,
                    noData: false
                },
                educator: {
                    initial: true,
                    noData: false
                }
            };

            var commonGridOptions = {
                enableColumnMenus: false,
                enableRowSelection: false,
                enableRowHeaderSelection: false,
                multiSelect: false,
                rowHeight: 35,
                selectionRowHeaderWidth: 35
            };
            var translateFilter = $filter('translate');

            _initGrid();

            self.selectEducatorRow = function (rowData) {
                if (self.gridEducatorApi.selection.selectRow) {
                    self.gridEducatorApi.selection.selectRow(rowData);
                    self.selectedEducator = rowData;
                }
            };
            self.selectStudentRow = function (rowData) {
                if (self.gridStudentApi.selection.selectRow) {
                    self.gridStudentApi.selection.selectRow(rowData);
                    self.selectedStudent = rowData;
                }
            };
            self.getEducatorsSearchResults = function (queryTerm) {
                AdminSearchService.getSearchResultsByTerm(queryTerm).then(_educatorsSearchResults);
            };
            self.getStudentsSearchResults = function (queryTerm) {
                AdminSearchService.getSearchResults(queryTerm).then(_studentsSearchResults);
            };

            self.link = function () {
                self.startLoader = true;
                if (!(self.selectedEducator && self.selectedStudent)) {
                    $log.error("Must select student and educator");
                    return;
                }
                var studentEducatorAppNames = _getStudentEducatorAppNames();
                if (!studentEducatorAppNames) {
                    $log.error("Must provide educator and student app data");
                    return;
                }
                var student = self.selectedStudent;
                var educator = self.selectedEducator;
                var invitationObj = ESLinkService.createInvitationFactory(educator.uid, student.uid, educator.name, student.email, educator.email, student.name,
                    studentEducatorAppNames.educator, studentEducatorAppNames.student);

                ESLinkService.link(invitationObj).then(_linkSuccess, _linkError);

            };
            function _linkSuccess() {
                _endLoading();
                var msg = translateFilter('ADMIN.ESLINK.LINK_SUCCEEDED');
                _showNotification('success', msg);
            }

            function _linkError(err) {
                _endLoading();
                // var msg = "<span>translateFilter('ADMIN.ESLINK.LINK_FAILED')</span></br>+err";
                var msg = err;
                _showNotification('error', msg);
            }

            function _endLoading() {
                self.startLoader = self.fillLoader = false;
            }

            function _educatorsSearchResults(data) {
                self.gridEducatorsOptions.data = data;
                self.uiGridState.educator.initial = false;
                if (!self.gridEducatorsOptions.data.length) {
                    self.uiGridState.educator.noData = true;
                    self.educatorSearchNoData = self.educatorSearchQuery;
                }
                else {
                    self.uiGridState.educator.noData = false;
                }
            }

            function _studentsSearchResults(data) {
                self.gridStudentsOptions.data = data;
                self.uiGridState.student.initial = false;
                if (!self.gridStudentsOptions.data.length) {
                    self.uiGridState.student.noData = true;
                    self.studentSearchNoData = self.studentsSearchQuery;
                }
                else {
                    self.uiGridState.student.noData = false;
                }
            }

            function _initGrid() {
                self.gridStudentsOptions = {
                    columnDefs: [
                        {
                            field: 'id',
                            width: "60",
                            displayName: '',
                            cellTemplate: '<div class="ui-grid-cell-contents" ><input type="radio" ng-click="grid.appScope.selectStudentRow(row.entity)" name="studentSelection" value="{{row.entity.uid}}"></div>'
                        },
                        {field: 'name', width: 300, displayName: translateFilter('ADMIN.ESLINK.UIGRID_NAME')},
                        {field: 'email', width: 300, displayName: translateFilter('ADMIN.ESLINK.UIGRID_EMAIL')},
                        {field: 'uid', width: 300, displayName: 'UID'}
                        // {field: 'zinkerzTeacher', displayName: translateFilter('ADMIN.ESLINK.IS_ZINKERZ_EDUCATOR'),
                        //     cellTemplate: '<div class="ui-grid-cell-contents" >' +
                        //     '<div  >' +
                        //     '<span ng-if="row.entity.zinkerzTeacher" translate="ADMIN.ESLINK.ZINKERZ_EDUCATOR"></span>' +
                        //     '<a ng-click="grid.appScope.setZinkerzTeacher(row.entity)" href= "#" ng-if="!row.entity.zinkerzTeacher" class="esLink-set-zinkerz-teacher" translate="ADMIN.ESLINK.SET_AS_ZINKERZ_EDUCATOR"></a>' +
                        //     '</div>' +
                        //     '</div>'
                        // }
                    ]
                };
                self.gridEducatorsOptions = {
                    columnDefs: [
                        {
                            field: 'id',
                            width: "60",
                            displayName: '',
                            cellTemplate: '<div class="ui-grid-cell-contents" ><input type="radio" ng-click="grid.appScope.selectEducatorRow(row.entity)" name="educatorSelection" value="{{row.entity.uid}}"></div>'
                        },
                        {field: 'name', width: 300, displayName: 'Name'},
                        {field: 'email', width: 300, displayName: 'Email'},
                        {field: 'uid', width: 300, displayName: 'UID'}
                    ]
                };
                angular.extend(self.gridStudentsOptions, commonGridOptions);
                angular.extend(self.gridEducatorsOptions, commonGridOptions);
                self.gridStudentsOptions.appScopeProvider = self;
                self.gridEducatorsOptions.appScopeProvider = self;
                self.gridStudentsOptions.onRegisterApi = function (gridApi) {
                    self.gridStudentApi = gridApi;
                };
                self.gridEducatorsOptions.onRegisterApi = function (gridApi) {
                    self.gridEducatorApi = gridApi;
                };
            }

            function _getStudentEducatorAppNames() {
                if (!self.currentAppKey) {
                    return null;
                }
                var appName = self.currentAppKey.toLowerCase();
                return {
                    student: appName + "_app",
                    educator: appName + "_dashboard"
                };
            }

            function _showNotification(type, msg) {
                ZnkToastSrv.showToast(type, msg);
            }
        })
        .controller('EMetadataController', function ($scope, AdminSearchService, $mdDialog, $timeout, $filter, DemoEMetadataService) {
            var self = this;

            var ROW_HEIGHT = 35;

            var commonGridOptions = {
                enableColumnMenus: false,
                enableRowSelection: true,
                enableRowHeaderSelection: false,
                multiSelect: false,
                rowHeight: ROW_HEIGHT,
                selectionRowHeaderWidth: ROW_HEIGHT
            };
            var translateFilter = $filter('translate');


            _initGrid();

            self.uiGridState = {
                educator: {
                    initial: true,
                    noData: false
                }
            };

            self.getEducatorsSearchResults = function (queryTerm) {
                AdminSearchService.getSearchResults(queryTerm).then(_educatorsSearchResults);
            };
            self.getTableHeight = function () {
                var rowHeight = ROW_HEIGHT;
                var headerHeight = ROW_HEIGHT;
                return {
                    height: (self.gridEducatorsOptions.data.length * rowHeight + headerHeight) + "px"
                };
            };

            function _educatorsSearchResults(data) {
                self.gridEducatorsOptions.data = data;
                self.uiGridState.educator.initial = false;
                if (!self.gridEducatorsOptions.data.length) {
                    self.uiGridState.educator.noData = true;
                    self.educatorSearchNoData = self.educatorSearchQuery;
                }
                else {
                    self.uiGridState.educator.noData = false;
                }
            }

            function _initGrid() {
                self.gridEducatorsOptions = {
                    columnDefs: [
                        {
                            field: 'name', displayName: translateFilter('ADMIN.ESLINK.UIGRID_NAME'),
                            cellTemplate: '<div class="ui-grid-cell-contents admin-ui-grid-cell-text" >{{row.entity.name}}</div>'
                        },
                        {field: 'email', displayName: translateFilter('ADMIN.ESLINK.UIGRID_EMAIL')},
                        {field: 'uid', displayName: 'UID'},
                        {
                            field: 'zinkerzTeacher',
                            width: 150,
                            displayName: translateFilter('ADMIN.ESLINK.IS_ZINKERZ_EDUCATOR'),
                            cellTemplate: '<div class="ui-grid-cell-contents" >' +
                            '<div >' +
                            '<span ng-if="row.entity.zinkerzTeacher" translate="ADMIN.ESLINK.ZINKERZ_EDUCATOR"></span></div>' +
                            '</div>'
                        }
                    ]
                };
                angular.extend(self.gridEducatorsOptions, commonGridOptions);
                self.gridEducatorsOptions.appScopeProvider = self;
                self.gridEducatorsOptions.onRegisterApi = function (gridApi) {
                    self.gridEducatorApi = gridApi;
                    self.gridEducatorApi.selection.on.rowSelectionChanged($scope, _rowSelectedEvent);
                };
            }

            function _rowSelectedEvent(row) {
                DemoEMetadataService.showEducatorProfile(row.entity);
            }
        })
        .controller('AdminProfileController', function ($mdDialog, $timeout, userProfile, timezonesList, localTimezone, ZnkToastSrv, EMetadataService, $filter) {
            'ngInject';
            var self = this;
            var translateFilter = $filter('translate');

            self.timezonesList = timezonesList;
            self.profileData = userProfile;
            self.profileData.educatorTeachworksName = self.profileData.name;
            self.profileData.timezone = localTimezone;
            self.profileData.educatorAvailabilityHours = translateFilter("ADMIN.EMETADATA.FROM_TO");
            self.isTimezoneManual = false;


            self.closeDialog = function () {
                $mdDialog.cancel();
            };

            self.updateProfileTimezone = function () {
                if (!self.profileData.isTimezoneManual) {
                    self.profileData.timezone = localTimezone;
                }
            };
            self.updateProfile = function (profileform) {
                var type, msg;

                if (profileform.$valid && profileform.$dirty) {
                    EMetadataService.updateProfile(self.profileData).then(function () {
                        $timeout(function () {
                            type = 'success';
                            msg = 'MY_PROFILE.PROFILE_SAVE_SUCCESS';
                            _showNotification(type, msg);
                        });
                    }, function (err) {
                        $timeout(function () {
                            type = 'error';
                            if (err.code === 'NETWORK_ERROR') {
                                msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                _showNotification(type, msg);
                            } else {
                                type = 'error';
                                msg = 'MY_PROFILE.ERROR_OCCURRED';
                                _showNotification(type, msg);
                            }
                        });
                    });
                }
            };

            self.setZinkerzTeacher = function (profileZinkerzTeacherform) {
                var type, msg;

                if (profileZinkerzTeacherform.$valid && profileZinkerzTeacherform.$dirty) {
                    EMetadataService.setZinkerzTeacher(self.profileData.uid, self.profileData.zinekrzTeacherSubject,self.profileData.zinkerzTeacher).then(function () {
                        $timeout(function () {
                            type = 'success';
                            msg = 'MY_PROFILE.PROFILE_SAVE_SUCCESS';
                            _showNotification(type, msg);
                        });
                    }, function (err) {
                        $timeout(function () {
                            type = 'error';
                            if (err.code === 'NETWORK_ERROR') {
                                msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                                _showNotification(type, msg);
                            } else {
                                type = 'error';
                                msg = 'MY_PROFILE.ERROR_OCCURRED';
                                _showNotification(type, msg);
                            }
                        });
                    });
                }
            };


            function _showNotification(type, msg) {
                ZnkToastSrv.showToast(type, msg);
            }
        })

})(angular);
