(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .component('esLink', {
            bindings: {},
            templateUrl: 'components/adminDashboard/components/esLink/templates/esLink.template.html',
            controllerAs: 'vm',
            controller: function ($filter, AdminSearchService, ESLinkService, $log, ZnkToastSrv) {
                'ngInject';

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
                   return AdminSearchService.getSearchResults(queryTerm, true).then(_educatorsSearchResults);
                };
                self.getStudentsSearchResults = function (queryTerm) {
                   return AdminSearchService.getSearchResults(queryTerm).then(_studentsSearchResults);
                };

                self.resetUserData = function () {
                    self.startResetBtnLoader = true;
                    self.fillResetBtnLoader = undefined;
                    var appName = self.currentAppKey.toLowerCase()+'_app';
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
                    var invitationObj = ESLinkService.createInvitationFactory(educator.uid, student.uid, educator.name, student.email, educator.email, student.name,
                        studentEducatorAppNames.educator, studentEducatorAppNames.student);

                    ESLinkService.link(invitationObj).then(_linkSuccess, _linkError);

                };
                function _linkSuccess() {
                    _endLoading();
                    var msg = translateFilter('ADMIN.ESLINK.LINK_SUCCEEDED');
                    _showNotification('success', msg);
                    self.selectedStudent = null;
                    self.selectedEducator = null;
                    self.studentsSearchQuery = "";
                    self.educatorSearchQuery = "";
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

            }
        });
})(angular);

