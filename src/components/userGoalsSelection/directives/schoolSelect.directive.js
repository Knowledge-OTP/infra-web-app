/**
 *  attrs:
 *      events:
 *          onSave
 * */
(function (angular) {
    'use strict';
    angular.module('znk.infra-web-app.userGoalsSelection').directive('schoolSelect',
        function SchoolSelectDirective(userGoalsSelectionService, $translate, UtilitySrv, $timeout, $q) {
            'ngInject';

            var schoolList = [];

            var directive = {
                restrict: 'E',
                templateUrl: 'components/userGoalsSelection/templates/schoolSelect.template.html',
                scope: {
                    events: '=?',
                    getSelectedSchools: '&?'
                },
                link: function link(scope, element, attrs) {
                    var MIN_LENGTH_AUTO_COMPLETE = 3;
                    var MAX_SCHOOLS_SELECT = 3;
                    var userSchools;

                    function disableSearchOption() {
                        if (scope.d.userSchools.length >= MAX_SCHOOLS_SELECT) {
                            element.find('input').attr('disabled', true);
                        } else {
                            element.find('input').removeAttr('disabled');
                        }
                    }

                    function _getTagsInputModelCtrl() {
                        var tagsInputElement = element.find('tags-input');
                        if (tagsInputElement) {
                            var tagsInputElementData = tagsInputElement.data();
                            if (tagsInputElementData.$ngModelController) {
                                scope.d.tagsInputNgModelCtrl = tagsInputElementData.$ngModelController;
                            }
                        }
                    }

                    scope.d = {
                        minLengthAutoComplete: MIN_LENGTH_AUTO_COMPLETE,
                        loadOnEmpty: false,
                        actions: {}
                    };

                    if (!scope.events) {
                        scope.events = {};
                    }
                    var eventsDefault = {
                        onSave: angular.noop
                    };
                    UtilitySrv.object.extendWithoutOverride(scope.events, eventsDefault);

                    //  added in order to provide custom selected schools
                    var getSelectedSchoolsProm;
                    if (attrs.getSelectedSchools) {
                        getSelectedSchoolsProm = $q.when(scope.getSelectedSchools());
                    } else {
                        getSelectedSchoolsProm = userGoalsSelectionService.getDreamSchools();
                    }
                    getSelectedSchoolsProm.then(function (_userSchools) {
                        userSchools = _userSchools;
                        scope.d.userSchools = angular.copy(userSchools);
                        $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                            scope.d.placeholder = scope.d.userSchools.length ? ' ' : val;
                        });
                        disableSearchOption();
                    });

                    userGoalsSelectionService.getAppSchoolsList().then(function (schools) {
                        schoolList = schools.data;
                    });

                    scope.d.onTagAdding = function ($tag) {
                        if (!$tag.id) {
                            return false;
                        }
                        $tag.text = $tag.text.replace(/([-])/g, ' ');
                        scope.d.placeholder = ' ';
                        return scope.d.userSchools.length < MAX_SCHOOLS_SELECT;
                    };

                    scope.d.onTagAdded = function () {
                        disableSearchOption();
                        return true;
                    };

                    scope.d.onTagRemoved = function () {
                        if (!scope.d.userSchools.length) {
                            $translate('SCHOOL_SELECT.SELECT_3_SCHOOLS').then(function(val) {
                                scope.d.placeholder =  val;
                            });
                        }
                        disableSearchOption();
                        return true;
                    };

                    scope.d.querySchools = function ($query) {
                        if ($query.length < 3) {
                            return $q.when([]);
                        }
                        var resultsArr = schoolList.filter(function (school) {
                            return school.text.toLowerCase().indexOf($query.toLowerCase()) > -1;
                        });
                        if (!resultsArr.length) {
                            resultsArr = $translate('SCHOOL_SELECT.NO_RESULTS').then(function(val) {
                                return [{
                                    text: val
                                }];
                            });

                        }
                        return $q.when(resultsArr);
                    };

                    scope.d.save = function () {
                        if (!scope.d.tagsInputNgModelCtrl) {
                            _getTagsInputModelCtrl();
                        }
                        scope.d.tagsInputNgModelCtrl.$setPristine();

                        scope.events.onSave(scope.d.userSchools);
                    };

                    $timeout(function () {
                        _getTagsInputModelCtrl();
                    });
                }
            };

            return directive;
        });
})(angular);
