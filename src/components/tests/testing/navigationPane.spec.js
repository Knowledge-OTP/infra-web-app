// describe('testing directive "NavigationPaneController":', function () {
//     // Load  the module, which contains the directive
//     beforeEach(angular.mock.module('actWebApp', 'pascalprecht.translate', 'auth.mock'));
//
//     beforeEach(angular.mock.module('pascalprecht.translate', function ($translateProvider) {
//         $translateProvider.translations('en', {
//             TESTS_ROADMAP: {
//                 TESTS_FULL_TITLE: 'Full Tests',
//                 TESTS_MINI_TITLE: 'Mini Tests'
//             }
//         });
//     }));
//
//     var $rootScope, $compile, $controller;
//     beforeEach(inject([
//         '$injector',
//         function ($injector) {
//             $rootScope = $injector.get('$rootScope');
//             $compile = $injector.get('$compile');
//             $controller = $injector.get('$controller');
//         }
//     ]));
//
//     var exams = [
//         {
//             id: 39,
//             name: 'Test 1',
//             order: 0,
//             sections: [],
//             typeId: 0
//         },
//         {
//             id: 45,
//             name: 'Mini Test 1',
//             order: 0,
//             sections: [],
//             typeId: 1
//         },
//         {
//             id: 52,
//             name: 'Test 2',
//             order: 0,
//             sections: [],
//             typeId: 0
//         },
//         {
//             id: 34,
//             name: 'Mini Test 2',
//             order: 0,
//             sections: [],
//             typeId: 1
//         }
//     ];
//
//     var examsResultsNull = [
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         }
//     ];
//
//     var examsResultsIsCompleted = [
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             isComplete: true
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         },
//         {
//             $id: '588f5577-5b7f-4221-7c32-12dc64b33c1a',
//             $priority: null,
//             $value: null
//         }
//     ];
//
//     var titles = "{ mini: \'.TESTS_MINI_TITLE\', full: \'.TESTS_FULL_TITLE\' }";
//
//     // added data option for this directive to simulate diffren binds for each test
//     function createDirectiveHtml(data, contentObj, $scopeObj, ctrlObj) {
//         if (!$scopeObj) {
//             $scopeObj = $rootScope.$new();
//             angular.extend($scopeObj, data);
//         }
//
//         if (!contentObj) {
//             contentObj = '<navigation-pane exams="exams" exams-results="examsResults" on-exam-click="onExamClick(exam)" titles="{ mini: \'.TESTS_MINI_TITLE\', full: \'.TESTS_FULL_TITLE\' }"></navigation-pane>';
//         }
//
//         contentObj = $compile(contentObj)($scopeObj);
//
//         if (!ctrlObj) {
//             ctrlObj = $controller('NavigationPaneController', {
//                 $scope: $scopeObj
//             }, data);
//         }
//
//         $scopeObj.$digest();
//
//         return {
//             scope: $scopeObj,
//             content: contentObj,
//             ctrl: ctrlObj
//         };
//     }
//
//     it('should have a property called vm', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function (exam) {
//                 expect(exam).toEqual(jasmine.any(Object));
//             }
//         });
//         var scope = scopeContent.scope;
//         var ctrl = scopeContent.ctrl;
//         scope.$digest();
//         expect(ctrl).toBeDefined();
//     });
//
//     it('should take the exams and exams results then create on vm an exam object with two arrays: fullExams and miniExams', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var scope = scopeContent.scope;
//         var ctrl = scopeContent.ctrl;
//         scope.$digest();
//         expect(ctrl.activeId).toEqual(45);
//         expect(ctrl.exams.fullExams).toEqual(jasmine.any(Array));
//         expect(ctrl.exams.miniExams).toEqual(jasmine.any(Array));
//         expect(ctrl.exams.fullExams.length).toEqual(2);
//         expect(ctrl.exams.miniExams.length).toEqual(2);
//         angular.forEach(ctrl.exams.fullExams, function (exam) {
//             expect(exam.isCompleted).toEqual(false);
//         });
//         angular.forEach(ctrl.exams.miniExams, function (exam) {
//             expect(exam.isCompleted).toEqual(false);
//         });
//     });
//
//     it('should take the exams and exams results then create on vm an exam object with two arrays: fullExams and miniExams', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsIsCompleted,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var scope = scopeContent.scope;
//         var ctrl = scopeContent.ctrl;
//         scope.$digest();
//         expect(ctrl.activeId).toEqual(34);
//         expect(ctrl.exams.miniExams[0].isCompleted).toEqual(true);
//         expect(ctrl.exams.miniExams[1].isCompleted).toEqual(false);
//         angular.forEach(ctrl.exams.fullExams, function (exam) {
//             expect(exam.isCompleted).toEqual(false);
//         });
//     });
//
//     it('when invoke changeActive with new id the activeId should change', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var scope = scopeContent.scope;
//         var ctrl = scopeContent.ctrl;
//         scope.$digest();
//         expect(ctrl.activeId).toEqual(45);
//         ctrl.changeActive(10);
//         expect(ctrl.activeId).toEqual(10);
//     });
//
//     it('when all exams are not completed, the status-icon-wrapper should not appear, 4 md-list-item should be present', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var content = scopeContent.content;
//         expect(content[0].querySelectorAll('md-list-item').length).toBe(4);
//         expect(content[0].querySelectorAll('.status-icon-wrapper').length).toBe(0);
//     });
//
//     it('when one exam are completed, the status-icon-wrapper should appear once, 4 md-list-item should be present', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsIsCompleted,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var content = scopeContent.content;
//         expect(content[0].querySelectorAll('md-list-item').length).toBe(4);
//         expect(content[0].querySelectorAll('.status-icon-wrapper').length).toBe(1);
//     });
//
//     it('when all exams are not completed, the active class should be on the first full test', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsNull,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var content = scopeContent.content;
//         expect(content[0].querySelectorAll('md-list-item')[1].classList.contains('active')).toBe(false);
//         expect(content[0].querySelectorAll('md-list-item')[0].classList.contains('active')).toBe(true);
//     });
//
//     it('when one exam are completed, the done class should be on the first full test', function () {
//         var scopeContent = createDirectiveHtml({
//             exams: exams,
//             examsResults: examsResultsIsCompleted,
//             titles: titles,
//             onExamClick: function () {}
//         });
//         var content = scopeContent.content;
//         expect(content[0].querySelectorAll('md-list-item')[1].classList.contains('done')).toBe(false);
//         expect(content[0].querySelectorAll('md-list-item')[0].classList.contains('done')).toBe(true);
//     });
// });
