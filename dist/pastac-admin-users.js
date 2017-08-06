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
    mayEdit: '<',
    currentUser: '<',
    jwt: '<'
  },
  //templateUrl: 'dist/example-component.html'
  templateUrl: pastacalExampleComponent_templateUrl
});


function PastacAdminUsersController($scope, $http) {
  var ctrl = this;

  ctrl.$onInit = function() {
    $scope.users = loadUsers();

  };

  ctrl.$onChanges = function(changesObj) {
    // alert('$onChanges()', changesObj)
    // console.log('$onChanges()', changesObj)
    // console.log('\n\nCURRENT USER: ', ctrl.currentUser);
    if (ctrl.jwt) {
      ctrl._showUsers = ctrl.currentUser && ctrl.currentUser.isAdmin;
      ctrl._editable = ctrl.mayEdit && ctrl.currentUser && ctrl.currentUser.isAdmin;
      ctrl._message = ''
      if (ctrl._jwt && ctrl.jwt == ctrl._jwt) {
        return;
      }
      console.log('   1: ', ctrl._jwt);
      console.log('   2: ', ctrl.jwt);
      ctrl._jwt = ctrl.jwt;
      // alert('Current user changed')
    } else {

      // Not logged in
      ctrl._showUsers = false;
      ctrl._editable = false;
      ctrl._message = 'User details are only available to admin users.'
    }
  }

  ctrl.$doCheck = function() {
  }

  ctrl.toggleAdmin = function(user) {
    user.is_admin = (user.is_admin ? 0 : 1);
    saveUser(user);
  }

  ctrl.onchange = function(user) {
    //console.log('onchange()');
    user._changed = true;
  }

  ctrl.onblur = function(user) {
    //console.log('onblur()');
    if (user._changed) {
      saveUser(user);
    }
  }


  /*
   *  Functions to access the server API.
   */
  function loadUsers() {
    //alert('loadUsers()')
    var url = 'http://' + AUTHSERVICE_HOST + ':' + AUTHSERVICE_PORT + '/v1/' + AUTHSERVICE_TENANT + '/admin/getUser';
    var params = {
      selectAll: true
    };
    console.log('url=' + url);
    console.log('params=', params);
    $http({
      method: 'POST',
      url: url,
      data: params
      // params: 'limit=10, sort_by=created:desc',
      // headers: {'Authorization': 'Token token=xxxxYYYYZzzz'}
    }).then(function(data){ // Success

      // With the data succesfully returned, call our callback
      console.log('loadUsers(): ', data);
      ctrl.users = data.data;
    }, handleError);
  }//- loadUsers()


  function saveUser(user) {
    console.log('saveuser(' + user.userId + ', ' + user.privileges + ', ' + user.is_admin + ')');

    var url = 'http://' + AUTHSERVICE_HOST + ':' + AUTHSERVICE_PORT + '/v1/' + AUTHSERVICE_TENANT + '/user';
    var req = {
      method: 'POST',
      url: url,
      data: {
        id: user.id,
        is_admin: user.is_admin ? true : false,
        privileges: user.privileges
      },
      // params: 'limit=10, sort_by=created:desc',
      headers: {
        'Authorization': 'Bearer jwt=' + ctrl.jwt,
        'Content-Type': 'application/json',
	      'Accept': 'application/json'
      }
    }
    console.log('url=' + url);
    console.log('req=', req);

    $http(req).then(function(data) {
      user._changed = false;
    }, handleError);
  }//- saveUser


  function handleError(response) {
    // Error during API call.
    console.log('response:', response)
    var err = 'An error occurred updating the user details'
    if (response.data && response.data.Error) {
      err += ':\n' + response.data.Error;
    }
    alert(err)
  }//- handleError
}
