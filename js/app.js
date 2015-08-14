var baymsApp = angular.module('baymsApp', []);

// Authentication & Tabs
baymsApp.controller('baymsController', function($scope) {
   $scope.user_id = sessionStorage.getItem('user_id');
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

   // get_user -> $scope.profile
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

   // $scope.profile -> update_user
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
   $scope.isError = false;
   $scope.isWorking = true;
   $scope.$watch('eid', function(newEID, oldEID) {
      if (newEID >= 0)
         sessionStorage.setItem('eid', newEID);
   });

   // get_all_events -> $scope.events
   function loadEvents() {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=get_all_events",
         dataType: "json",
         data: {
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass
         }
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.events = data;
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         $scope.$apply();
         if (sessionStorage.hasOwnProperty('eid'))
            $('button[eid='+sessionStorage.getItem('eid')+']').click();
         else if ($scope.user_type >= 2)
            $('button[eid=0]').click();
         if ($scope.user_type >= 2) {
            var fixHelper = function(e, ui) {
            	ui.children().each(function() {
            		$(this).width($(this).width());
            	});
            	return ui;
            };
            $('.sortable').sortable({
            	helper: fixHelper
            }).disableSelection();
         }
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.$apply();
      });
   }; loadEvents();

   // $scope.create_event -> insert_event
   $scope.createEvent = function() {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=insert_event",
         dataType: "json",
         data: $.extend({
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass
         }, $scope.create_event)
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadEvents();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         loadEvents();
      });
   };

   // current_event -> update_event
   $scope.updateEvent = function(current_event) {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=update_event",
         dataType: "json",
         data: $.extend({
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass
         }, current_event)
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadEvents();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         loadEvents();
      });
   };

   // event_id -> delete_event
   $scope.deleteEvent = function(event_id) {
      if (!confirm("Are you sure you want to delete this event?"))
         return;
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=delete_event",
         dataType: "json",
         data: {
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass,
            "event_id": event_id
         }
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadEvents();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         loadEvents();
      });
   };

   // open window with program.htm#<event_id> and print
   $scope.printEvent = function(event_id) {
      var printWindow = window.open("program.htm#" + event_id, "print program");
      var printAndClose = function () {
         if (printWindow.document.readyState == 'complete') {
            clearInterval(sched);
            printWindow.print();
            printWindow.close();
         }
      }
      var sched = setInterval(printAndClose, 200);
   }

   // event_id -> order_piece
   $scope.saveOrder = function(event_id) {
      var pieces = $('#sortable-'+event_id).find('tr');
      for (var i = 0; i < pieces.length; i++) {
         var data = {
            piece_id: $(pieces[i]).attr('pid'),
            piece_order: i
         };
         setTimeout(function(data) {
            $scope.isError = false;
            $scope.isWorking = true;
            $.ajax({
               method: "POST",
               url: "./api/api.php?x=order_piece",
               dataType: "json",
               data: $.extend({
                  "user_name": $scope.user_name,
                  "user_pass": $scope.user_pass,
               }, data)
            }).done(function(data) {
               $scope.isWorking = false;
               if (data) {
                  $scope.isError = false;
               } else {
                  $scope.isError = true;
               }
            }).error(function(err) {
               $scope.isError = true;
               $scope.isWorking = false;
            });
         }, i*100, data)
      };
      setTimeout(loadEvents, pieces.length*100+1000);
   };

   // piece_id, approved -> approve_piece; event_id -> order_piece
   $scope.approvePiece = function(piece_id, approved) {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=approve_piece",
         dataType: "json",
         data: {
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass,
            "piece_id": piece_id,
            "approved": approved
         }
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         $scope.saveOrder(sessionStorage.getItem('eid'));
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.saveOrder(sessionStorage.getItem('eid'));
      });
   }

   // $scope.submit_piece -> submit_piece
   $scope.submitPiece = function(event_id) {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=submit_piece",
         dataType: "json",
         data: $.extend({
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass,
            "event_id": event_id
         }, $scope.submit_piece)
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
            $scope.submit_piece = {};
         } else {
            $scope.isError = true;
         }
         loadEvents();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         loadEvents();
      });
   }
});

// Members
baymsApp.controller('membersController', function($scope) {
   $scope.isError = false;
   $scope.isWorking = true;

   // get_all_users -> $scope.users
   function loadUsers() {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=get_all_users",
         dataType: "json",
         data: {
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass
         }
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.users = data;
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         $scope.$apply();
         if (sessionStorage.hasOwnProperty('uid'))
            $('button[uid='+sessionStorage.getItem('uid')+']').click();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.$apply();
      });
   }; loadUsers();

   // user -> $scope.user
   $scope.displayUser = function(user) {
      $scope.user = user;
      sessionStorage.setItem('uid', user.user_id);
      $('button[uid]').removeClass('button-primary');
      $('button[uid='+user.user_id+']').addClass('button-primary');
   }

   // user_id -> admit_user
   $scope.admitUser = function(user_id, admitted) {
      $scope.isError = false;
      $scope.isWorking = true;
      $scope.user = false;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=admit_user",
         dataType: "json",
         data: {
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass,
            "user_id": user_id,
            "admitted": admitted
         }
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadUsers();
         $scope.$apply();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.$apply();
      });
   }

   // user_id -> admin_user
   $scope.adminUser = function(user_id, admin) {
      $scope.isError = false;
      $scope.isWorking = true;
      $scope.user = false;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=admin_user",
         dataType: "json",
         data: {
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass,
            "user_id": user_id,
            "admin": admin
         }
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadUsers();
         $scope.$apply();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.$apply();
      });
   }

   // user_id -> delete_user
   $scope.deleteUser = function(user_id) {
      $scope.isError = false;
      $scope.isWorking = true;
      $scope.user = false;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=delete_user",
         dataType: "json",
         data: {
            "user_name": $scope.user_name,
            "user_pass": $scope.user_pass,
            "user_id": user_id
         }
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadUsers();
         $scope.$apply();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.$apply();
      });
   }
});
