'use strict';

// We need to get the template from the same location as this script
// See https://stackoverflow.com/questions/21103724/angular-directive-templateurl-relative-to-js-file
var pastacalExampleComponent_scripts = document.getElementsByTagName("script")
var pastacalExampleComponent_currentScriptPath = pastacalExampleComponent_scripts[pastacalExampleComponent_scripts.length-1].src;
var pastacalExampleComponent_templateUrl = pastacalExampleComponent_currentScriptPath.replace('/pastac-admin-users.js', '/pastac-admin-users.html');


angular.module('pastac-admin-users', [])

.component('pastacAdminUsers', {
  controller: PastacAdminUsersController,
  controllerAs: 'ctrl',
  bindings: {
    // Bind parameters from the HTML element that invokes this
    initialName: '@',
    onDone: '&'
  },
  //templateUrl: 'dist/example-component.html'
  templateUrl: pastacalExampleComponent_templateUrl
});


function PastacAdminUsersController($scope) {
  var ctrl = this;

  // Set a default name in this component
  ctrl.hero = {
    name: 'Donkey'
  };

  // If we were given an initial-name="xxxx" in the HTML element
  // then use that name to replace our default initial name.
  ctrl.$onInit = function() {
    if (ctrl.initialName) {
	    ctrl.hero.name = ctrl.initialName;
    }
  };

  // The button has been pressed. Call the function specified
  // by on-done="myfunc(name)" in the HTML element that invokes
  // this component.
  ctrl.callOnDone = function() {
    ctrl.onDone({ name: ctrl.hero.name });
  };
}
