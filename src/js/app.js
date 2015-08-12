var baymsApp = angular.module('baymsApp', []);

// Authentication & Tabs
baymsApp.controller('baymsController', function($scope) {
   $scope.user_type = sessionStorage.getItem('user_type');
   $scope.user_name = sessionStorage.getItem('user_name');
   $scope.user_pass = sessionStorage.getItem('user_pass');

   $scope.tab = 0;
   if (sessionStorage.getItem('tab')) $scope.tab = sessionStorage.getItem('tab');
   $scope.$watch('tab',function(){ sessionStorage.setItem('tab', $scope.tab); })
});

// Profile
baymsApp.controller('profileController', function($scope) {
   $scope.isError = false;
   $scope.isWorking = true;
   $.ajax({
      method: "POST",
      url: "./api/api.php?x=get_user",
      dataType: "json",
      data: {
         "user_name": $scope.user_name,
         "user_pass": $scope.user_pass
      }
   }).done(function(data) {
      $scope.isWorking = false;
      if (data) {
         $scope.profile = data;
         $scope.isError = false;
      } else {
         $scope.isError = true;
      }
      $scope.$apply();
   }).error(function(err) {
      $scope.isError = true;
      $scope.isWorking = false;
      $scope.$apply();
   });
   $scope.updateProfile = function() {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=update_user",
         dataType: "json",
         data: $.extend({}, $scope.profile, {
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass
         })
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         $scope.$apply();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.$apply();
      });
   };
});

// Events
baymsApp.controller('eventsController', function($scope) {
});

// Members
baymsApp.controller('membersController', function($scope) {
});
