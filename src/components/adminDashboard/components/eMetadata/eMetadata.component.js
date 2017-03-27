(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard')
        .component('eMetadata', {
            bindings: {},
            templateUrl: 'components/adminDashboard/components/eMetadata/templates/eMetadata.template.html',
            controllerAs: 'vm',
            controller: function ($scope, AdminSearchService, $mdDialog, $timeout, $filter, EMetadataService) {
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

            }
        });
})(angular);
