(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard', [
        'ngMaterial',
        'pascalprecht.translate',
        'znk.infra.svgIcon',
        'znk.infra.general',
        'znk.infra.storage',
        'znk.infra.user',
        'ui.router',
        'znk.infra.utility',
        'znk.infra-web-app.znkToast',
        'znk.infra-web-app.elasticSearch',
        'znk.infra-web-app.myProfile',
        'ui.grid',
        'ui.grid.selection',
        'ui.grid.autoResize',
        'znk.infra.znkTooltip'
    ])
        .config([
            'SvgIconSrvProvider',
            function (SvgIconSrvProvider) {
                var svgMap = {
                    'adminProfile-icon': 'components/adminDashboard/components/eMetadata/svg/admin-profile-icon.svg',
                    'adminProfile-close-popup': 'components/adminDashboard/components/eMetadata/svg/admin-profile-close-popup.svg',
                    'admin-correct-icon': 'components/adminDashboard/svg/correct-icon.svg'
                };
                SvgIconSrvProvider.registerSvgSources(svgMap);
            }
        ]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .controller('EducatorProfileController',
            ["$mdDialog", "$timeout", "userProfile", "timezonesList", "localTimezone", "ZnkToastSrv", "EMetadataService", "$filter", "AccountStatusEnum", function ($mdDialog, $timeout, userProfile, timezonesList, localTimezone, ZnkToastSrv, EMetadataService,
                      $filter, AccountStatusEnum) {
            'ngInject';
            var self = this;
            var translateFilter = $filter('translate');

            self.timezonesList = timezonesList;
            self.profileData = userProfile;
            self.profileData.educatorTeachworksName = self.profileData.educatorTeachworksName || self.profileData.nickname;
            self.profileData.timezone = localTimezone;
            self.profileData.educatorAvailabilityHours = self.profileData.educatorAvailabilityHours || translateFilter("ADMIN.EMETADATA.FROM_TO");
            self.isTimezoneManual = false;
            self.isZinkerzTeacher = self.profileData && self.profileData.teacherInfo && self.profileData.teacherInfo.accountStatus === AccountStatusEnum.ACTIVE.enum;

            self.closeDialog = function () {
                $mdDialog.cancel();
            };

            self.updateProfileTimezone = function () {
                if (!self.profileData.isTimezoneManual) {
                    self.profileData.timezone = localTimezone;
                }
            };

            self.updateProfile = function (profileForm) {
                if (profileForm.$valid && profileForm.$dirty) {
                    EMetadataService.updateProfile(self.profileData).then(_profileSuccess, _profileError);
                }
            };

            self.toggleZinkerzTeacher = function (isZinkerzTeacher) {
                if (!self.profileData.teacherInfo) {
                    self.profileData.teacherInfo = {};
                }
                self.profileData.teacherInfo.accountStatus = isZinkerzTeacher ? AccountStatusEnum.ACTIVE.enum : AccountStatusEnum.INACTIVE.enum;
            };

            function _profileSuccess() {
                var type, msg;
                type = 'success';
                msg = 'MY_PROFILE.PROFILE_SAVE_SUCCESS';
                _showNotification(type, msg);
            }

            function _profileError(error) {
                var type, msg;

                type = 'error';
                if (error.code === 'NETWORK_ERROR') {
                    msg = 'MY_PROFILE.NO_INTERNET_CONNECTION_ERR';
                    _showNotification(type, msg);
                } else {
                    type = 'error';
                    msg = 'MY_PROFILE.ERROR_OCCURRED';
                    _showNotification(type, msg);
                }
            }

            function _showNotification(type, msg) {
                ZnkToastSrv.showToast(type, msg);
            }

        }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .component('eMetadata', {
            bindings: {},
            templateUrl: 'components/adminDashboard/components/eMetadata/templates/eMetadata.template.html',
            controllerAs: 'vm',
            controller: ["$scope", "AdminSearchService", "$mdDialog", "$timeout", "$filter", "EMetadataService", function ($scope, AdminSearchService, $mdDialog, $timeout, $filter, EMetadataService) {
                'ngInject';
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
                _initGrid();

                self.uiGridState = {
                    educator: {
                        initial: true,
                        noData: false
                    }
                };

                self.getEducatorsSearchResults = function (queryTerm) {
                   return AdminSearchService.getSearchResults(queryTerm).then(_educatorsSearchResults);
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
                                field: 'nickname', displayName: "Name",
                                cellTemplate: '<div class="ui-grid-cell-contents admin-ui-grid-cell-text" >{{row.entity.nickname}}</div>'
                            },
                            {field: 'email', displayName: "Email"},
                            {field: 'uid', displayName: 'UID'},
                            {
                                field: 'zinkerzTeacher',
                                width: 150,
                                displayName: "Is Zinkerz Educator",
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
                    EMetadataService.showEducatorProfile(row.entity);
                }

            }]
        });
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('EMetadataService',
            ["$mdDialog", "$http", "ENV", "$q", "InfraConfigSrv", "$log", "MyProfileSrv", "UtilitySrv", function ($mdDialog, $http, ENV, $q, InfraConfigSrv, $log, MyProfileSrv, UtilitySrv) {
                'ngInject';


                var self = this;

                self.showEducatorProfile = function (userProfile) {
                    if (!userProfile) {
                        $log.error('showEducatorProfile: userProfile object is not undefined');
                        return;
                    }
                    $q.all([MyProfileSrv.getTimezonesList(), MyProfileSrv.getLocalTimezone()]).then(function (values) {
                        var timezonesList = values[0];
                        var localTimezone = values[1];
                        $mdDialog.show({
                            locals: {
                                userProfile: userProfile,
                                timezonesList: UtilitySrv.object.convertToArray(timezonesList),
                                localTimezone: localTimezone
                            },
                            controller: 'EducatorProfileController',
                            controllerAs: 'vm',
                            templateUrl: 'components/adminDashboard/components/eMetadata/templates/educatorProfile.template.html',
                            clickOutsideToClose: true,
                            escapeToClose: true
                        });
                    });

                };

                self.updateProfile = function (newProfile) {
                    var deferred = $q.defer();
                    var copiedProfile = angular.copy(newProfile);
                    var uid = copiedProfile.uid;
                    if (uid) {
                        delete copiedProfile.uid;
                    }
                    var fullPath = "users/" + uid + "/profile";
                    InfraConfigSrv.getGlobalStorage().then(function (globalStorage) {
                        globalStorage.update(fullPath, copiedProfile).then(function (data) {
                            deferred.resolve(data);
                        }).catch(function (error) {
                            deferred.reject(error);
                        });
                    });
                    return deferred.promise;
                };

            }]
        );
})(angular);



/* eslint new-cap: 0 */


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.adminDashboard').directive('appSelect',
        function () {

            AppSelectController.$inject = ["$scope", "ENV", "$translate", "$q"];
            var directive = {
                templateUrl: 'components/adminDashboard/components/esLink/directives/app-select.template.html',
                restrict: 'E',
                controllerAs: 'vm',
                controller: AppSelectController,
                scope: {
                    currentApp: "="
                },
                bindToController: true
            };

            function AppSelectController($scope, ENV, $translate, $q) {
                'ngInject';

                var self = this;
                var currentAppName = ENV.firebaseAppScopeName;

                function _setCurrentAppName() {
                    var key = Object.keys(self.appName).filter(function (item) {
                        return currentAppName.indexOf(item.toLowerCase()) > -1;
                    })[0];
                    self.selectApp(key);
                }

                var translationsPromMap = {};
                translationsPromMap.SAT = $translate('ADMIN.ESLINK.SAT');
                translationsPromMap.ACT = $translate('ADMIN.ESLINK.ACT');
                translationsPromMap.TOEFL = $translate('ADMIN.ESLINK.TOEFL');
                translationsPromMap.SATSM = $translate('ADMIN.ESLINK.SATSM');
                $q.all(translationsPromMap).then(function (translatedData) {
                    self.appName = {
                        SAT: translatedData.SAT,
                        ACT: translatedData.ACT,
                        TOEFL: translatedData.TOEFL,
                        SATSM: translatedData.SATSM
                    };
                    _setCurrentAppName();
                });

                self.selectApp = function (key) {
                    self.selectedApp = self.appName[key];
                    self.currentApp = key;
                    $scope.$emit('ADMIN_SELECTED_APP_KEY', key);
                };
                self.expandIcon = 'expand_more';

                self.znkOpenModal = function () {
                    self.expandIcon = 'expand_less';
                };

                $scope.$on('$mdMenuClose', function () {
                    self.expandIcon = 'expand_more';
                });
            }

            return directive;
        });

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .component('esLink', {
            bindings: {},
            templateUrl: 'components/adminDashboard/components/esLink/templates/esLink.template.html',
            controllerAs: 'vm',
            controller: ["$scope", "$filter", "AdminSearchService", "ESLinkService", "$log", "ZnkToastSrv", function ($scope, $filter, AdminSearchService, ESLinkService, $log, ZnkToastSrv) {
                'ngInject';

                var self = this;
                var currentSelectedAppKey = '';
                self.generatedKey = '';
                self.selectedStudent = null;
                self.selectedEducator = null;
                self.selectedAppHash = {};
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
                        _setSelectedAppHash();
                    }
                };
                self.selectStudentRow = function (rowData) {
                    if (self.gridStudentApi.selection.selectRow) {
                        self.gridStudentApi.selection.selectRow(rowData);
                        self.selectedStudent = rowData;
                        _setSelectedAppHash();
                    }
                };
                self.getEducatorsSearchResults = function (queryTerm) {
                    return AdminSearchService.getSearchResults(queryTerm, true).then(_educatorsSearchResults);
                };
                self.getStudentsSearchResults = function (queryTerm) {
                    return AdminSearchService.getSearchResults(queryTerm).then(_studentsSearchResults);
                };

                self.resetUserData = function () {
                    self.startResetBtnLoader = true;
                    self.fillResetBtnLoader = undefined;
                    var appName = self.currentAppKey.toLowerCase() + '_app';
                    var data = {
                        appName: appName,
                        uid: self.selectedStudent.uid
                    };
                    ESLinkService.resetUserData(data).then(function success() {
                        self.fillResetBtnLoader = false;
                        $log.debug('user data successfully reset');
                    }, function error() {
                        self.fillResetBtnLoader = false;
                    });
                };

                self.link = function () {
                    self.startLoader = true;
                    self.fillLoader = undefined;
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
                    var invitationObj = ESLinkService.createInvitationFactory(educator.uid, student.uid, educator.nickname, student.email, educator.email, student.nickname,
                        studentEducatorAppNames.educator, studentEducatorAppNames.student);

                    ESLinkService.link(invitationObj).then(_linkSuccess, _linkError);

                };
                var selectedAppListener = $scope.$on('ADMIN_SELECTED_APP_KEY', function (event, key) {
                    currentSelectedAppKey = key;
                    _setSelectedAppHash();

                });
                $scope.$on("$destroy", function () {
                    selectedAppListener();
                });
                function _linkSuccess() {
                    _endLoading();
                    var msg = translateFilter('ADMIN.ESLINK.LINK_SUCCEEDED');
                    _setSelectedAppHash();
                    _showNotification('success', msg);
                }

                function _linkError(err) {
                    _endLoading();
                    var msg = err.data.error;
                    _showNotification('error', msg);
                }

                function _endLoading() {
                    self.fillLoader = false;
                    self.startLoader = false;
                }

                function _setSelectedAppHash() {
                    if (self.selectedEducator && self.selectedStudent) {
                        self.generatedKey = self.selectedEducator.uid + '_' + self.selectedStudent.uid + '_' + currentSelectedAppKey;
                        self.selectedAppHash[self.generatedKey] = !self.selectedAppHash[self.generatedKey];
                    }
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
                                width: "40",
                                displayName: '',
                                cellTemplate: '<div class="ui-grid-cell-contents" ><input type="radio" ng-click="grid.appScope.selectStudentRow(row.entity)" name="studentSelection" value="{{row.entity.uid}}"></div>'
                            },
                            {field: 'nickname', width: 150, displayName: "Name"},
                            {
                                field: 'email',
                                width: 250,
                                displayName: "Email",
                                cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.email}}<md-tooltip znk-tooltip class="md-fab name-tooltip admin-tooltip" md-direction="top"  md-visible="false">{{row.entity.email}}</md-tooltip></div>'
                            },
                            {field: 'uid', width: 300, displayName: 'UID'},
                            {
                                field: 'zinkerzSatPro',
                                width: 50, displayName: 'SAT',
                                cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.purchase.sat_app"><svg-icon name="admin-correct-icon"></svg-icon></div>'
                            },
                            {
                                field: 'zinkerzActPro',
                                width: 50, displayName: 'ACT',
                                cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.purchase.act_app"><svg-icon name="admin-correct-icon"></svg-icon></div>'
                            },
                            {
                                field: 'zinkerzToeflPro',
                                width: 50, displayName: 'TOEFL',
                                cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.purchase.toefl_app"><svg-icon name="admin-correct-icon"></svg-icon></div>'
                            },
                            {
                                field: 'zinkerzSatsmPro',
                                width: 50, displayName: 'SATSM',
                                cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.purchase.satsm_app"><svg-icon name="admin-correct-icon"></svg-icon></div>'
                            }
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
                            {
                                field: 'nickname',
                                width: 300,
                                displayName: "Name"
                            },
                            {
                                field: 'email',
                                width: 300,
                                displayName: "Email",
                                cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.email}}<md-tooltip znk-tooltip class="md-fab name-tooltip admin-tooltip" md-direction="top"  md-visible="false">{{row.entity.email}}</md-tooltip></div>'
                            },
                            {
                                field: 'uid',
                                width: 300,
                                displayName: 'UID'
                            }
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

            }]
        });
})(angular);


(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('ESLinkService',
            ["$q", "$log", "$http", "ENV", function ($q, $log, $http, ENV) {
                'ngInject';

                var apiPath = ENV.backendEndpoint + "/invitation/assosciate_student";
                var resetUserDataPath = ENV.backendEndpoint + "/userModule/delete";

                this.createInvitationFactory = function (senderUid, receiverUid, senderName, receiverEmail, senderEmail, receiverName, senderAppName, receiverAppName) {
                    return new Invitation(senderUid, receiverUid, senderName, receiverEmail, senderEmail, receiverName, senderAppName, receiverAppName);
                };

                this.resetUserData = function(data) {
                    if(!data || !data.appName || !data.uid) {
                        $log.error('Both appName and uid is required');
                        return;
                    }
                    return $http.post(resetUserDataPath, data);
                };

                this.link = function (data) {
                    if (!(data && angular.isObject(data))) {
                        $log.error('Invitation object is not defined');
                        return;
                    }
                    if (!(data instanceof Invitation)) {
                        $log.error('Invitation object must be an instance of class Invitation');
                    }
                    return $http.post(apiPath, data);
                };

                function Invitation(senderUid, receiverUid, senderName, receiverEmail, senderEmail, receiverName, senderAppName, receiverAppName) {
                    this.senderUid = senderUid;
                    this.receiverUid = receiverUid;
                    this.senderName = _getName(senderName, senderEmail);
                    this.receiverEmail = receiverEmail;
                    this.receiverName = _getName(receiverName, receiverEmail);
                    this.senderAppName = senderAppName;
                    this.receiverAppName = receiverAppName;
                    this.senderEmail = senderEmail;
                }

                function _getName(name, email) {
                    return name || email.split("@")[0];
                }
            }]
        );
})(angular);

/* eslint new-cap: 0 */


(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.adminDashboard').directive('adminSearch',
        ["$timeout", "$log", function ($timeout, $log) {
            'ngInject';

            var directive = {
                templateUrl: 'components/adminDashboard/directives/admin-search.template.html',
                restrict: 'EA',
                controllerAs: 'vm',
                controller: AdminSearchController,
                scope: {
                    searchQuery: "=",
                    searchResults: "=",
                    state: "=",
                    data: "=",
                    key: "@",
                    placeholder: "@",
                    minlength: "@"
                },
                bindToController: true,
                link: linkFunc
            };

            function linkFunc(scope, elm, attr, ctrl) {
                var currentElement = angular.element(elm);
                var input = currentElement.find('input');
                input.on('input', function (e) {
                    if (e.target.value === "") {
                        scope.$apply(function () {
                            ctrl.data = [];
                            ctrl.state[ctrl.key].initial = true;
                        });
                    }

                });
            }

            function AdminSearchController() {
                var self = this;
                self.minlength = self.minlength || '3';

                self.searchResultsFunc = function (query) {
                    self.startLoader = true;
                    self.fillLoader = undefined;
                    if (typeof (self.searchResults) !== "function") {
                        $log.error("adminSearch: searchResultsFunc - 'searchResults' must be a function");
                        return;
                    }
                    self.searchResults(query).then(function () {
                        $timeout(function () {
                            self.startLoader = false;
                            self.fillLoader = false;
                        });
                    }, function () {
                        $timeout(function () {
                            self.startLoader = false;
                            self.fillLoader = false;
                        });
                    });
                };
            }

            return directive;
        }]);

})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .service('AdminSearchService',
            ["$mdDialog", "$http", "ENV", "UserProfileService", "$q", "$log", "ElasticSearchSrv", "StorageSrv", "InfraConfigSrv", "AccountStatusEnum", function ($mdDialog, $http, ENV, UserProfileService, $q, $log, ElasticSearchSrv, StorageSrv, InfraConfigSrv, AccountStatusEnum) {
                'ngInject';

                var sizeLimit = 10000;
                var upwardBoundKey = ENV.upwardBoundKey;
                var PROMO_CODES_PATH = StorageSrv.variables.appUserSpacePath + '/promoCodes';
                var query = {
                    index: ENV.elasticSearchIndex,
                    type: "user",
                    body: {
                        "from": 0,
                        "size": sizeLimit
                    }
                };

                this.getSearchResults = function (queryTerm, hasTeacher) {
                    return _getSearchResults(queryTerm, hasTeacher);
                };

                function _getSearchResults(queryTerm, hasTeacher) {
                    var deferred = $q.defer();
                    hasUBPromoCode().then(function (hasUB) {
                        _buildQuery(query.body, queryTerm.toLowerCase(), hasUB, hasTeacher);
                        ElasticSearchSrv.search(query).then(function (response) {
                            deferred.resolve(_searchResults(response.data.hits));
                        }, function (err) {
                            $log.error(err.message);
                            deferred.reject(err.message);
                        });
                    }, function (err) {
                        $log.error(err.message);
                        deferred.reject(err.message);
                    });

                    return deferred.promise;
                }

                function _searchResults(data) {
                    var mappedData = [];
                    if (!(data && data.hits)) {
                        return mappedData;
                    }
                    mappedData = data.hits.map(function (item) {
                        var source = item._source.user;
                        if (!source) {
                            return mappedData;
                        }
                        var zinkerzTeacher = source && source.teacherInfo && source.teacherInfo.accountStatus === AccountStatusEnum.ACTIVE.enum;
                        source.uid = item._id;
                        source.zinkerzTeacher = zinkerzTeacher;
                        return source;
                    });
                    return mappedData;
                }

                function _buildQuery(body, term, hasUB, hasTeacher) {
                    body.query = {
                        "bool": {
                            "should": [
                                {
                                    "query_string": {
                                        "fields": ["user.teacherInfo.accountStatus", "user.nickname", "user.email", "user.promoCodes", "user.purchase"],
                                        "query": _makeTerm(term)
                                    }
                                },
                                {"query": {"ids": {"values": [term]}}}
                            ],
                            "must": [],
                            "minimum_should_match": 1
                        }
                    };
                    if (hasTeacher) {
                        body.query.bool.must.push({
                            "term": {
                                "user.teacherInfo.accountStatus": AccountStatusEnum.ACTIVE.enum
                            }
                        });
                    }
                    if (hasUB) {
                        body.query.bool.must.push(_buildQueryForUB());
                    }
                }

                function _makeTerm(term) {
                    var newTerm = _escape(term);
                    if (!newTerm.match(/^\*/)) {
                        newTerm = '*' + newTerm;
                    }
                    if (!newTerm.match(/\*$/)) {
                        newTerm += '*';
                    }
                    return newTerm;
                }

                function _buildQueryForUB() {
                    var promoCodeKey = "user.promoCodes." + ENV.studentAppName + "." + ENV.upwardBoundKey;
                    var nestedObj = {
                        nested: {
                            path: "user.promoCodes",
                            "filter": {
                                "exists": {"field": promoCodeKey}
                            }
                        }
                    };
                    return nestedObj;
                }

                function _escape(text) {
                    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                }

                function hasUBPromoCode() {
                    return InfraConfigSrv.getTeacherStorage().then(function (TeacherStorageSrv) {
                        return TeacherStorageSrv.get(PROMO_CODES_PATH).then(function (promoCodeData) {
                            var hasUB = false;
                            if (promoCodeData) {
                                hasUB = Object.keys(promoCodeData).indexOf(upwardBoundKey) > -1;
                            }
                            return $q.when(hasUB);
                        });
                    }).catch(function (err) {
                        $log.debug('AdminSearchService - getPromoCodes: failed to get getTeacherStorage', err);
                    });
                }
            }]
        );
})(angular);

angular.module('znk.infra-web-app.adminDashboard').run(['$templateCache', function ($templateCache) {
  $templateCache.put("components/adminDashboard/components/eMetadata/svg/admin-profile-close-popup.svg",
    "<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-596.6 492.3 133.2 133.5\" xml:space=\"preserve\" class=\"close-pop-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.close-pop-svg {width: 100%; height: auto;}\n" +
    "	.close-pop-svg .st0{fill:none;enable-background:new    ;}\n" +
    "	.close-pop-svg .st1{fill:none;stroke:#ffffff;stroke-width:8;stroke-linecap:round;stroke-miterlimit:10;}\n" +
    "</style>\n" +
    "<path class=\"st0\"/>\n" +
    "<g>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "	<line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/adminDashboard/components/eMetadata/svg/admin-profile-icon.svg",
    "<svg version=\"1.1\" id=\"Layer_1\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"0 0 140.7 171.1\" xml:space=\"preserve\" class=\"profile-svg\">\n" +
    "<style type=\"text/css\">\n" +
    "	.profile-svg {width: 100%; height: auto;}\n" +
    "	.profile-svg .st0{fill:#000000;}\n" +
    "</style>\n" +
    "\n" +
    "<g>\n" +
    "	<path class=\"st0\" d=\"M0.2,171.1c-0.9-10.2,0.8-19.6,3.6-28.9c2.9-9.6,9.3-14.6,19.1-15.7c4.1-0.5,8.3-1.1,12.3-2.1c6.1-1.5,10.7-5.1,13.7-11.2\n" +
    "		c-7.7-7.5-13.2-16.5-16.9-26.6c-0.3-0.7-0.9-1.7-1.5-1.8c-6.2-0.8-7.3-5.8-8.4-10.4c-0.9-3.7-0.9-7.6-0.9-11.4\n" +
    "		c0-1.7,0.7-4.4,1.8-4.9c5.5-2.5,3.5-7.2,4.1-11.3c1.3-9.1,2.8-18.3,4.8-27.3c1.8-8.4,7.8-13.3,15.7-16c13.1-4.6,26.4-4,39.9-1.9\n" +
    "		c7.9,1.3,16,1.9,24,2.8c-3.3,10.2-0.9,21.2,1.5,32.2c0.8,3.5,0.9,7.2,1.1,10.9c0.2,3.9-0.4,7.3,3.3,11c5.5,5.5,1.1,22.2-5.8,26.1\n" +
    "		c-1,0.6-2.1,1.6-2.6,2.7c-3.8,9.9-9.2,18.8-17.1,26.2c3.7,7.6,10.2,10.7,17.8,11.9c4.3,0.7,8.9,0.6,12.7,2.3\n" +
    "		c4.2,1.9,9,4.6,11.2,8.3c6.2,10.6,7.4,22.5,7,35C93.7,171.1,47.2,171.1,0.2,171.1z\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/adminDashboard/components/eMetadata/templates/educatorProfile.template.html",
    "<md-dialog ng-cloak class=\"admin-dashboard admin-profile\" translate-namespace=\"ADMIN\">\n" +
    "    <div class=\"top-icon-wrap\">\n" +
    "        <div class=\"top-icon\">\n" +
    "            <div class=\"round-icon-wrap\">\n" +
    "                <svg-icon name=\"adminProfile-icon\"></svg-icon>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <md-toolbar>\n" +
    "        <div class=\"close-popup-wrap\" ng-click=\"vm.closeDialog()\">\n" +
    "            <svg-icon name=\"adminProfile-close-popup\"></svg-icon>\n" +
    "        </div>\n" +
    "    </md-toolbar>\n" +
    "    <div class=\"content-wrapper\">\n" +
    "        <div class=\"main-title\" translate=\".EMETADATA.EDUCATOR_PROFILE\"></div>\n" +
    "\n" +
    "        <md-dialog-content>\n" +
    "            <form name=\"profileform\" novalidate class=\"auth-form\" ng-submit=\"vm.updateProfile(profileform)\"\n" +
    "            >\n" +
    "                <div class=\"znk-input-group\"\n" +
    "                     ng-class=\"profileform.educatorTeachworksName.$invalid && profileform.$submitted ? 'invalid' : 'valid'\">\n" +
    "                    <label>{{'ADMIN.EMETADATA.EDUCATOR_TEACH_WORKS_NAME' | translate}}</label>\n" +
    "                    <div class=\"znk-input\">\n" +
    "                        <input\n" +
    "                            type=\"text\"\n" +
    "                            autocomplete=\"on\"\n" +
    "                            name=\"educatorTeachworksName\"\n" +
    "                            ng-required=\"true\"\n" +
    "                            ng-model=\"vm.profileData.educatorTeachworksName\">\n" +
    "                        <span ng-if=\"profileform.$submitted && profileform.educatorTeachworksName.$invalid\"\n" +
    "                              role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"profileform.educatorTeachworksName.$error.required\"\n" +
    "                              translate=\"MY_PROFILE.REQUIRED_FIELD\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"znk-input-group\"\n" +
    "                     ng-class=\"profileform.email.$invalid && profileform.$submitted ? 'invalid' : 'valid'\">\n" +
    "                    <label>{{'MY_PROFILE.EMAIL' | translate}}</label>\n" +
    "                    <div class=\"znk-input\">\n" +
    "                        <input\n" +
    "                            type=\"email\"\n" +
    "                            autocomplete=\"on\"\n" +
    "                            name=\"email\"\n" +
    "                            ng-required=\"true\"\n" +
    "                            disabled=\"true\"\n" +
    "                            ng-model=\"vm.profileData.email\">\n" +
    "\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"znk-input-group\">\n" +
    "                    <label for=\"timezone\">{{'MY_PROFILE.TIMEZONE' | translate}}</label>\n" +
    "                    <div class=\"znk-input\">\n" +
    "                        <select id=\"timezone\" name=\"timezone\"\n" +
    "                                ng-options=\"time as time for time in vm.timezonesList\"\n" +
    "                                ng-model=\"vm.profileData.timezone\"\n" +
    "                                ng-disabled=\"!vm.profileData.isTimezoneManual\">\n" +
    "                        </select>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"timezone-manual\">\n" +
    "                    <input type=\"checkbox\"\n" +
    "                           id=\"timezoneManual\" name=\"timezoneManual\"\n" +
    "                           ng-model=\"vm.profileData.isTimezoneManual\"\n" +
    "                           ng-change=\"vm.updateProfileTimezone()\">\n" +
    "                    <label for=\"timezoneManual\">{{'MY_PROFILE.SET_MANUALLY' | translate}}</label>\n" +
    "                </div>\n" +
    "                <div class=\"znk-input-group\"\n" +
    "                     ng-class=\"profileform.educatorAvailabilityHours.$invalid && profileform.$submitted ? 'invalid' : 'valid'\">\n" +
    "                    <label>{{'ADMIN.EMETADATA.AVAILABILITY_HOURS' | translate}}</label>\n" +
    "                    <div class=\"znk-input\">\n" +
    "                        <textarea\n" +
    "                            type=\"text\"\n" +
    "                            autocomplete=\"on\"\n" +
    "                            name=\"educatorAvailabilityHours\"\n" +
    "                            ng-required=\"true\"\n" +
    "                            rows=\"4\" cols=\"50\"\n" +
    "                            ng-model=\"vm.profileData.educatorAvailabilityHours\">\n" +
    "                        </textarea>\n" +
    "                        <span ng-if=\"profileform.$submitted && profileform.educatorAvailabilityHours.$invalid\"\n" +
    "                              role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"profileform.educatorAvailabilityHours.$error.required\"\n" +
    "                              translate=\"MY_PROFILE.REQUIRED_FIELD\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"btn-wrap\">\n" +
    "                    <button class=\"save-pass-btn\"><span translate=\"MY_PROFILE.SAVE\"></span></button>\n" +
    "                </div>\n" +
    "            </form>\n" +
    "\n" +
    "            <div class=\"msg-wrap\" ng-class=\"{'show-error': vm.showError}\" ng-if=\"vm.showError\">\n" +
    "                <div class=\"error-msg\">\n" +
    "                    <svg-icon name=\"adminProfile-danger-red-icon\" class=\"adminProfile-danger-red-icon\"></svg-icon>\n" +
    "                    <div translate=\"{{vm.generalError}}\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </div>\n" +
    "    <div class=\"content-wrapper\">\n" +
    "\n" +
    "        <md-dialog-content>\n" +
    "            <div class=\"container-title md-subheader\" translate=\".EMETADATA.ZINKERZ_EDUCATOR\"></div>\n" +
    "            <form name=\"profileZinkerzTeacherForm\" novalidate class=\"auth-form\">\n" +
    "                <div class=\"znk-input-group\">\n" +
    "                    <label for=\"zinkerzTeacher\">{{'ADMIN.ESLINK.IS_ZINKERZ_EDUCATOR' | translate}}</label>\n" +
    "                    <div class=\"znk-input\">\n" +
    "                        <input type=\"checkbox\"\n" +
    "                               id=\"zinkerzTeacher\" name=\"zinkerzTeacher\"\n" +
    "                               ng-change=\"toggleZinkerzTeacher($event.checked)\">\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"znk-input-group\"\n" +
    "                     ng-class=\"profileZinkerzTeacherForm.zinkerzTeacherSubject.$invalid && profileZinkerzTeacherForm.$submitted ? 'invalid' : 'valid'\">\n" +
    "                    <label>{{'ADMIN.EMETADATA.SUBJECT' | translate}}</label>\n" +
    "                    <div class=\"znk-input\">\n" +
    "                        <input\n" +
    "                            type=\"text\"\n" +
    "                            autocomplete=\"on\"\n" +
    "                            name=\"zinkerzTeacherSubject\"\n" +
    "                            ng-required=\"true\"\n" +
    "                            ng-model=\"vm.profileData.zinkerzTeacherSubject\">\n" +
    "                        <span\n" +
    "                            ng-if=\"profileZinkerzTeacherForm.$submitted && profileZinkerzTeacherForm.zinkerzTeacherSubject.$invalid\"\n" +
    "                            role=\"alert\">\n" +
    "                    <span class=\"validationBox\">\n" +
    "                        <span ng-show=\"profileZinkerzTeacherForm.zinkerzTeacherSubject.$error.required\"\n" +
    "                              translate=\"MY_PROFILE.REQUIRED_FIELD\"></span>\n" +
    "                    </span>\n" +
    "                </span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"btn-wrap\">\n" +
    "                    <button class=\"save-pass-btn\"><span translate=\"MY_PROFILE.SAVE\"></span></button>\n" +
    "                </div>\n" +
    "            </form>\n" +
    "\n" +
    "            <div class=\"msg-wrap\" ng-class=\"{'show-error': vm.showError}\" ng-if=\"vm.showError\">\n" +
    "                <div class=\"error-msg\">\n" +
    "                    <svg-icon name=\"adminProfile-danger-red-icon\" class=\"adminProfile-danger-red-icon\"></svg-icon>\n" +
    "                    <div translate=\"{{vm.generalError}}\"></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </md-dialog-content>\n" +
    "    </div>\n" +
    "</md-dialog>\n" +
    "\n" +
    "\n" +
    "\n" +
    "");
  $templateCache.put("components/adminDashboard/components/eMetadata/templates/eMetadata.template.html",
    "<div class=\"admin-dashboard admin-eMetadata\" translate-namespace=\"ADMIN\">\n" +
    "\n" +
    "    <div class=\"admin-main-container-overlay\">\n" +
    "        <div class=\"admin-search-container\">\n" +
    "            <div class=\"admin-search-label\" translate=\"ADMIN.ESLINK.SEARCH_EDUCATOR\"></div>\n" +
    "            <div admin-search placeholder=\"{{'ADMIN.ESLINK.SEARCH_EDUCATOR' | translate}}\" data=\"vm.gridEducatorsOptions.data\" key=\"educator\" state=\"vm.uiGridState\" minlength=\"3\" search-query=\"vm.educatorSearchQuery\" search-results=\"vm.getEducatorsSearchResults\"></div>\n" +
    "            <div class=\"admin-search-msg\" translate=\"ADMIN.MIN_SEARCH_LENGTH\"></div>\n" +
    "            <div ui-grid-selection ui-grid=\"vm.gridEducatorsOptions\" class=\"admin-grid\" >\n" +
    "                <div class=\"admin-ui-grid-msg\" ng-if=\"vm.uiGridState.educator.initial\">\n" +
    "                    <div class=\"admin-msg\">\n" +
    "                        <div translate=\"ADMIN.ESLINK.EDUCATOR_INITIAL_MSG\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"admin-ui-grid-msg\" ng-if=\"vm.uiGridState.educator.noData\">\n" +
    "                    <div class=\"admin-msg\">\n" +
    "                        <span>{{'ADMIN.ESLINK.EDUCATOR_NODATA_MSG' | translate}} '{{vm.educatorSearchNoData}}'</span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/adminDashboard/components/esLink/directives/app-select.template.html",
    "<div class=\"znk-app-select\">\n" +
    "    <div class=\"selected-item\" ng-bind=\"vm.selectedApp\"></div>\n" +
    "    <md-menu md-offset=\"-150 60\">\n" +
    "        <md-button  ng-click=\"$mdOpenMenu($event); vm.znkOpenModal();\"\n" +
    "                   class=\"md-icon-button profile-open-modal-btn\"\n" +
    "                   aria-label=\"Open sample menu\">\n" +
    "            <div></div>\n" +
    "            <md-icon class=\"material-icons\">{{vm.expandIcon}}</md-icon>\n" +
    "        </md-button>\n" +
    "        <md-menu-content class=\"md-menu-content-znk-app-select\">\n" +
    "            <md-list>\n" +
    "                <md-list-item md-ink-ripple class=\"app-select-item\">\n" +
    "                    <span  ng-click=\"vm.selectApp('SAT')\" ng-class=\"{'selected':vm.selectedApp===vm.appName.SAT}\"\n" +
    "                          ng-bind=\"::vm.appName.SAT\"></span>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item\n" +
    "                    md-ink-ripple\n" +
    "                    class=\"app-select-item\">\n" +
    "                    <span ng-click=\"vm.selectApp('ACT')\" ng-class=\"{'selected':vm.selectedApp===vm.appName.ACT}\" ng-bind=\"::vm.appName.ACT\"></span>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item\n" +
    "                    md-ink-ripple\n" +
    "                    class=\"app-select-item\">\n" +
    "                    <span ng-click=\"vm.selectApp('TOEFL')\" ng-class=\"{'selected':vm.selectedApp===vm.appName.TOEFL}\" ng-bind=\"::vm.appName.TOEFL\"></span>\n" +
    "                </md-list-item>\n" +
    "                <md-list-item\n" +
    "                    md-ink-ripple\n" +
    "                    class=\"app-select-item\">\n" +
    "                    <span ng-click=\"vm.selectApp('SATSM')\" ng-class=\"{'selected':vm.selectedApp===vm.appName.SATSM}\" ng-bind=\"::vm.appName.SATSM\"></span>\n" +
    "                </md-list-item>\n" +
    "            </md-list>\n" +
    "        </md-menu-content>\n" +
    "    </md-menu>\n" +
    "</div>\n" +
    "\n" +
    "");
  $templateCache.put("components/adminDashboard/components/esLink/templates/esLink.template.html",
    "<div class=\"admin-dashboard admin-esLink\" translate-namespace=\"ADMIN\">\n" +
    "    <div class=\"admin-main-container-overlay\">\n" +
    "        <div class=\"admin-search-container\">\n" +
    "            <div class=\"admin-search-label\" translate=\"ADMIN.ESLINK.SEARCH_STUDENT\"></div>\n" +
    "            <div admin-search placeholder=\"{{'ADMIN.ESLINK.SEARCH_STUDENT' | translate}}\"\n" +
    "                 data=\"vm.gridStudentsOptions.data\" minlength=\"3\" key=\"student\" state=\"vm.uiGridState\"\n" +
    "                 search-query=\"vm.studentsSearchQuery\" search-results=\"vm.getStudentsSearchResults\"></div>\n" +
    "            <div class=\"admin-search-msg\" translate=\"ADMIN.MIN_SEARCH_LENGTH\"></div>\n" +
    "            <div ui-grid-selection ui-grid=\"vm.gridStudentsOptions\" class=\"admin-grid\">\n" +
    "                <div class=\"admin-ui-grid-msg\" ng-if=\"vm.uiGridState.student.initial\">\n" +
    "                    <div class=\"admin-msg\">\n" +
    "                        <span translate=\"ADMIN.ESLINK.STUDENT_INITIAL_MSG\"></span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"admin-ui-grid-msg\" ng-if=\"vm.uiGridState.student.noData\">\n" +
    "                    <div class=\"admin-msg\">\n" +
    "                        <span>{{'ADMIN.ESLINK.STUDENT_NODATA_MSG' | translate}} '{{vm.studentSearchNoData}}'</span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <hr>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"admin-search-container\">\n" +
    "            <div class=\"admin-search-label\" translate=\"ADMIN.ESLINK.SEARCH_EDUCATOR\"></div>\n" +
    "            <div admin-search placeholder=\"{{'ADMIN.ESLINK.SEARCH_EDUCATOR' | translate}}\"\n" +
    "                 data=\"vm.gridEducatorsOptions.data\" key=\"educator\" state=\"vm.uiGridState\" minlength=\"3\"\n" +
    "                 search-query=\"vm.educatorSearchQuery\" search-results=\"vm.getEducatorsSearchResults\"></div>\n" +
    "\n" +
    "            <div class=\"admin-search-msg\" translate=\"ADMIN.MIN_SEARCH_LENGTH\"></div>\n" +
    "            <div ui-grid-selection ui-grid=\"vm.gridEducatorsOptions\" class=\"admin-grid\">\n" +
    "                <div class=\"admin-ui-grid-msg\" ng-if=\"vm.uiGridState.educator.initial\">\n" +
    "                    <div class=\"admin-msg\">\n" +
    "                        <div translate=\"ADMIN.ESLINK.EDUCATOR_INITIAL_MSG\"></div>\n" +
    "                        <div class=\"admin-msg-note\" translate=\"ADMIN.ESLINK.EDUCATOR_INITIAL_MSG_NOTE\"></div>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"admin-ui-grid-msg\" ng-if=\"vm.uiGridState.educator.noData\">\n" +
    "                    <div class=\"admin-msg\">\n" +
    "                        <span>{{'ADMIN.ESLINK.EDUCATOR_NODATA_MSG' | translate}} '{{vm.educatorSearchNoData}}'</span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <hr>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "    </div>\n" +
    "    <div class=\"esLink-link-container\">\n" +
    "        <div class=\"esLink-select-container\">\n" +
    "            <span class=\"esLink-link-text\" translate=\"ADMIN.ESLINK.LINK_MSG\"></span>\n" +
    "            <app-select current-app=\"vm.currentAppKey\"></app-select>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"btn-wrap\">\n" +
    "            <button element-loader\n" +
    "                    ng-disabled=\"!vm.selectedStudent\"\n" +
    "                    fill-loader=\"vm.fillResetBtnLoader\"\n" +
    "                    show-loader=\"vm.startResetBtnLoader\"\n" +
    "                    bg-loader=\"'#037684'\"\n" +
    "                    precentage=\"50\"\n" +
    "                    font-color=\"'#FFFFFF'\"\n" +
    "                    bg=\"'#0a9bad'\"\n" +
    "                    ng-click=\"vm.resetUserData()\"\n" +
    "                    class=\"md-button link-btn drop-shadow\"\n" +
    "                    name=\"submit\">\n" +
    "                <span translate=\"ADMIN.ESLINK.LINK_RST_BTN\"></span>\n" +
    "            </button>\n" +
    "           2: {{!vm.selectedAppHash[vm.generatedKey]}}\n" +
    "            <button element-loader\n" +
    "                    ng-disabled=\" !vm.selectedAppHash[vm.generatedKey]\"\n" +
    "                    fill-loader=\"vm.fillLoader\"\n" +
    "                    show-loader=\"vm.startLoader\"\n" +
    "                    bg-loader=\"'#037684'\"\n" +
    "                    precentage=\"50\"\n" +
    "                    font-color=\"'#FFFFFF'\"\n" +
    "                    bg=\"'#0a9bad'\"\n" +
    "                    ng-click=\"vm.link()\"\n" +
    "                    class=\"md-button link-btn drop-shadow\"\n" +
    "                    name=\"submit\">\n" +
    "                <span translate=\"ADMIN.ESLINK.LINK_BTN\"></span>\n" +
    "            </button>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/adminDashboard/directives/admin-search.template.html",
    "<div class=\"admin-search-pane\">\n" +
    "    <div class=\"search-wrap\">\n" +
    "        <div class=\"znk-input-group\">\n" +
    "            <input type=\"search\"\n" +
    "                   minlength=\"{{::vm.minlength}}\"\n" +
    "                   placeholder=\"{{vm.placeholder}}\"\n" +
    "                   name=\"search-box\"\n" +
    "                   ng-model=\"vm.searchQuery\">\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <!--<button class=\"admin-search-btn\" ng-click=\"vm.searchResults(vm.searchQuery)\"-->\n" +
    "            <!--ng-disabled=\"!vm.searchQuery\" translate=\".SEARCH\">-->\n" +
    "    <!--</button>-->\n" +
    "\n" +
    "    <button element-loader\n" +
    "            ng-disabled=\"!vm.searchQuery\"\n" +
    "            fill-loader=\"vm.fillLoader\"\n" +
    "            show-loader=\"vm.startLoader\"\n" +
    "            bg-loader=\"'#037684'\"\n" +
    "            precentage=\"50\"\n" +
    "            font-color=\"'#FFFFFF'\"\n" +
    "            bg=\"'#0a9bad'\"\n" +
    "            ng-click=\"vm.searchResultsFunc(vm.searchQuery)\"\n" +
    "            class=\"admin-search-btn\"\n" +
    "            name=\"submit\">\n" +
    "        <span translate=\".SEARCH\"></span>\n" +
    "    </button>\n" +
    "\n" +
    "</div>\n" +
    "");
  $templateCache.put("components/adminDashboard/svg/correct-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     class=\"correct-icon-svg\"\n" +
    "     xmlns=\"http://www.w3.org/2000/svg\"\n" +
    "     x=\"0px\"\n" +
    "     y=\"0px\"\n" +
    "	 viewBox=\"0 0 188.5 129\"\n" +
    "     style=\"enable-background:new 0 0 188.5 129;\"\n" +
    "     xml:space=\"preserve\">\n" +
    "<style type=\"text/css\">\n" +
    "	.correct-icon-svg .st0 {\n" +
    "        fill: none;\n" +
    "        stroke: #231F20;\n" +
    "        stroke-width: 15;\n" +
    "        stroke-linecap: round;\n" +
    "        stroke-linejoin: round;\n" +
    "        stroke-miterlimit: 10;\n" +
    "    }\n" +
    "</style>\n" +
    "<g>\n" +
    "	<line class=\"st0\" x1=\"7.5\" y1=\"62\" x2=\"67\" y2=\"121.5\"/>\n" +
    "	<line class=\"st0\" x1=\"67\" y1=\"121.5\" x2=\"181\" y2=\"7.5\"/>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
}]);
