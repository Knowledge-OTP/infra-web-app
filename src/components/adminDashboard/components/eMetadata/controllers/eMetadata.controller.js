(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.adminDashboard').controller('EMetadataController',
        function ($scope, AdminSearchService, $mdDialog, $timeout, $filter, EMetadataService) {
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
                EMetadataService.showEducatorProfile(row.entity);
            }
        }
    );
})(angular);
