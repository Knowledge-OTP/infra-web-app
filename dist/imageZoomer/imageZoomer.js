(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.imageZoomer', [
        'znk.infra.svgIcon',
        'ngMaterial'
    ]).config(["SvgIconSrvProvider", function(SvgIconSrvProvider){
        'ngInject';
        var svgMap = {
            'image-zoomer-full-screen-icon': 'components/imageZoomer/svg/full-screen-icon.svg',
            'image-zoomer-close-popup': 'components/imageZoomer/svg/image-zoomer-close-popup.svg'
        };
        SvgIconSrvProvider.registerSvgSources(svgMap);
    }]);
})(angular);

(function (angular) {
    'use strict';

    angular.module('znk.infra-web-app.imageZoomer').directive('imageZoomer', ["$timeout", "$mdDialog", "$document", "$compile", function($timeout, $mdDialog, $document, $compile) {
       'ngInject';

        function compileFn() {
            function preFn(scope, element) {
                DialogController.$inject = ["$scope"];
                var MAX_WIDTH = 400;
                var MAX_HEIGHT = 500;
                var MIN_SIZE_TO_ZOOM = 100;
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

                function DialogController($scope) {
                    $scope.closeDialog = function () {
                        $mdDialog.hide();
                    };
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
                    imageParent.append(imageNewParent);
                    imageParent[0].replaceChild(imageNewParent[0], image);
                    imageNewParent.append(image);
                    
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
    }]);

})(angular);


angular.module('znk.infra-web-app.imageZoomer').run(['$templateCache', function($templateCache) {
  $templateCache.put("components/imageZoomer/svg/full-screen-icon.svg",
    "<svg version=\"1.1\"\n" +
    "     x=\"0px\" y=\"0px\"\n" +
    "	 viewBox=\"-645.7 420.9 200.9 199\"\n" +
    "     class=\"full-screen-icon\">\n" +
    "<path class=\"st0\"/>\n" +
    "\n" +
    "    <style type=\"text/css\">\n" +
    "        .full-screen-icon {\n" +
    "            width: 100%; height: auto\n" +
    "        }\n" +
    "    </style>\n" +
    "<g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-580.6\" y1=\"486.4\" x2=\"-641.7\" y2=\"425.4\"/>\n" +
    "		<polyline class=\"st1\" points=\"-642.7,462.5 -642.7,423.9 -605.1,423.9 \"/>\n" +
    "	</g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-509.8\" y1=\"486.4\" x2=\"-448.7\" y2=\"425.4\"/>\n" +
    "		<polyline class=\"st1\" points=\"-447.7,462.5 -447.7,423.9 -485.4,423.9 \"/>\n" +
    "	</g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-580.6\" y1=\"554.3\" x2=\"-641.7\" y2=\"615.3\"/>\n" +
    "		<polyline class=\"st1\" points=\"-642.7,578.2 -642.7,616.8 -605.1,616.8 \"/>\n" +
    "	</g>\n" +
    "	<g>\n" +
    "		<line class=\"st1\" x1=\"-509.8\" y1=\"554.3\" x2=\"-448.7\" y2=\"615.3\"/>\n" +
    "		<polyline class=\"st1\" points=\"-447.7,578.2 -447.7,616.8 -485.4,616.8 \"/>\n" +
    "	</g>\n" +
    "</g>\n" +
    "</svg>\n" +
    "");
  $templateCache.put("components/imageZoomer/svg/image-zoomer-close-popup.svg",
    "<svg\n" +
    "    x=\"0px\"\n" +
    "    y=\"0px\"\n" +
    "    viewBox=\"-596.6 492.3 133.2 133.5\" class=\"image-zoomer-close-popup\">\n" +
    "    <style>\n" +
    "        .image-zoomer-close-popup{\n" +
    "        width:15px;\n" +
    "        height:15px;\n" +
    "        }\n" +
    "    </style>\n" +
    "    <path class=\"st0\"/>\n" +
    "    <g>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"496.5\" x2=\"-467.4\" y2=\"621.8\"/>\n" +
    "        <line class=\"st1\" x1=\"-592.6\" y1=\"621.5\" x2=\"-467.4\" y2=\"496.3\"/>\n" +
    "    </g>\n" +
    "</svg>\n" +
    "");
}]);
