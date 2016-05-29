import { exerciseHeaderDrv } from './exerciseHeader.directive.js';
import { exerciseHeaderController } from './exerciseHeader.controller.js';

angular.module('actWebApp')
    .directive('znkExerciseHeader', exerciseHeaderDrv)
    .controller('exerciseHeaderController', exerciseHeaderController);
