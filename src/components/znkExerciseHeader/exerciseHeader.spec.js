describe('testing directive "znkExerciseHeader":', function () {
    // Load  the module, which contains the directive
    beforeEach(angular.mock.module('actWebApp', 'pascalprecht.translate', 'auth.mock'));

    beforeEach(angular.mock.module('pascalprecht.translate', function ($translateProvider) {
        $translateProvider.translations('en', {
            CONTAINER_HEADER: {
                QUIT_BTN_TEXT: 'Quit'
            }
        });
    }));

    var $rootScope, $compile, $controller;
    beforeEach(inject([
        '$injector',
        function ($injector) {
            $rootScope = $injector.get('$rootScope');
            $compile = $injector.get('$compile');
            $controller = $injector.get('$controller');
        }
    ]));

    // added data option for this directive to simulate diffren binds for each test
    function createDirectiveHtml(data, contentObj, $scopeObj, ctrlObj) {
        if (!$scopeObj) {
            $scopeObj = $rootScope.$new();
            $scopeObj.d = {};
        }

        if (!contentObj) {
            contentObj = '<znk-exercise-header subject-id="5" side-text="Diagnostic Test: English" options="{ showQuit: true }" on-clicked-quit="vm.onClickedQuit()"></znk-exercise-header>';
        }

        contentObj = $compile(contentObj)($scopeObj);


        if (!ctrlObj) {
            if (!data) {
                data = {
                    subjectId: '5',
                    sideText: 'Diagnostic Test: English',
                    options: { showQuit: true },
                    onClickedQuit: 'vm.onClickedQuit()'
                };
            }
            ctrlObj = $controller('exerciseHeaderController', {
                $scope: $scopeObj
            }, data);
        }

        $scopeObj.$digest();

        return {
            scope: $scopeObj,
            content: contentObj,
            ctrl: ctrlObj
        };
    }

    it('should have a property called vm', function () {
        var scopeContent = createDirectiveHtml();
        var scope = scopeContent.scope;
        var ctrl = scopeContent.ctrl;
        scope.$digest();
        expect(ctrl).toBeDefined();
    });

    it('when not passing a subjectId, then it should throw an error', function () {
        expect(function () {
            createDirectiveHtml({}, '<znk-exercise-header></znk-exercise-header>');
        }).toThrow(new Error('Error: exerciseHeaderController: subjectId is required!'));
    });

    it('should have the side text attribute text in the div with the side-text class', function () {
        var scopeContent = createDirectiveHtml();
        var content = scopeContent.content;
        expect(content[0].querySelector('.side-text').innerText).toBe('Diagnostic Test: English');
    });

    it('should have the div with quit-back-button class with text Quit', function () {
        var scopeContent = createDirectiveHtml();
        var content = scopeContent.content;
        expect(content[0].querySelector('.quit-back-button').innerText).toBe('Quit');
    });

    it('when there\'s no options or no showQuit : true in options so quit-back-button should not be present', function () {
        var scopeContent = createDirectiveHtml({
            subjectId: '5',
            sideText: 'Diagnostic Test: English'
        },
            '<znk-exercise-header subject-id="5" side-text="Diagnostic Test: English"></znk-exercise-header>'
        );
        var content = scopeContent.content;
        expect(content[0].querySelector('.quit-back-button')).toBeNull();
    });
});
