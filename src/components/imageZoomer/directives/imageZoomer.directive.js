(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.imageZoomer').directive('imageZoomer', function($timeout, $mdDialog, $document, $compile) {
       'ngInject';

        function compileFn() {
            function preFn(scope, element) {
                var MAX_WIDTH = 400;
                var MAX_HEIGHT = 500;
                var MIN_SIZE_TO_ZOOM = 200;
                var zoomableImgElemArr = [];

                $timeout(function () {
                    var imageElements = element[0].querySelectorAll('img');

                    angular.forEach(imageElements, function (imgElement) {
                        var clickableIconElement = addIconToImage(imgElement);
                        var clickableImageElement = imgElement;
                        addImageHandler(clickableIconElement, imgElement);  // clickable icon
                        addImageHandler(clickableImageElement, imgElement); // clickable image
                    });
                });


                function addImageHandler(imgElement, image) {
                    if (_shouldImageBeZoomed(image)) {
                        return;
                    }
                    if (_getImageWidth(image) > 400) {
                        image.style.width = MAX_WIDTH + 'px';
                        image.style.height = 'auto';
                    }
                    image.className = 'img-to-zoom';
                    angular.element(imgElement).on('click', function () {
                        zoomImage(image);
                    });
                    zoomableImgElemArr.push(imgElement);
                }

                function zoomImage(image) {
                    var parentEl = angular.element($document.body);
                    $mdDialog.show({
                        clickOutsideToClose: true,
                        parent: parentEl,
                        template: '<div class="zoom-image-modal">' +
                        '<svg-icon ng-click="closeDialog()" name="image-zoomer-close-popup"></svg-icon>' +
                        '<md-dialog ng-click="closeDialog()">' +
                        '<md-dialog-content>' +
                        '<img src="' + image.src + '" style="width:' + image.width * 2 + 'px; ' + 'height:' + image.height * 2 + 'px">' +
                        '</md-dialog-content>' +
                        '</md-dialog>' +
                        '</div>',
                        controller: DialogController
                    });

                    function DialogController($scope) {
                        $scope.closeDialog = function () {
                            $mdDialog.hide();
                        };
                    }
                }

                function addIconToImage(image) {
                    if (_shouldImageBeZoomed(image)) {
                        return image;
                    }

                    if (_getImageWidth(image) > MAX_WIDTH) {
                        image.style.width = MAX_WIDTH + 'px';
                        image.style.height = 'auto';
                    }
                    var imageParent = angular.element(image.parentNode);
                    var imageNewParent = angular.element('<div class="zoomable-image-with-icon"></div>');   // wrap img and icon with one div element
                    imageNewParent.css('position', 'relative');
                    imageNewParent.css('margin', '0 auto');
                    imageNewParent.css('textAlign', 'center');
                    imageNewParent.css('width', image.style.width);
                    imageNewParent.css('height', image.style.height);
                    imageNewParent.append(image);
                    imageParent.append(imageNewParent);

                    var svgIconTemplate = '<div class="zoom-icon-wrapper">' +
                        '<svg-icon name="image-zoomer-full-screen-icon"></svg-icon>' +
                        '</div>';

                    imageNewParent.append(svgIconTemplate);
                    var iconElement = imageNewParent[0].querySelector('.zoom-icon-wrapper');
                    $compile(iconElement)(scope);
                    return iconElement;
                }

                function _shouldImageBeZoomed(image) {
                    return image.style.width === null || _getImageWidth(image) < MIN_SIZE_TO_ZOOM || _getImageHeight(image) < MIN_SIZE_TO_ZOOM || _getImageHeight(image) > MAX_HEIGHT;
                }

                function _getImageWidth(image) {
                    return + image.style.width.replace('px', '');
                }

                function _getImageHeight(image) {
                    var width = _getImageWidth(image);
                    var height = +image.style.height.replace('px', '');
                    return width > MAX_WIDTH ? (height * MAX_WIDTH) / width : height;
                }

                scope.$on('$destroy', function () {
                    for (var i = 0; i < zoomableImgElemArr.length; i++) {
                        angular.element(zoomableImgElemArr[i]).off('click');
                    }
                    zoomableImgElemArr = [];
                });
            }

            return {
                post: preFn
            };
        }

        var directive = {
            priority: -1000,
            restrict: 'A',
            scope: {},
            compile: compileFn
        };

        return directive;
    });

})(angular);

