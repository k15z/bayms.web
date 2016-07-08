var baymsApp = angular.module('baymsApp', ['ng-context-menu','ngSanitize']);

// Authentication & Tabs
baymsApp.controller('baymsController', function($scope) {
   $scope.required = {"done": $('input:invalid').length <= 0};
   $scope.auth = {}; // Sent to server with almost every request
   $scope.user_type = sessionStorage.getItem('user_type');
   if (sessionStorage.getItem('user_name')) {
      // Traditional username/password authentication
      $scope.auth.user_name = sessionStorage.getItem('user_name');
      $scope.auth.user_pass = sessionStorage.getItem('user_pass');
   }
   else if (sessionStorage.getItem('google_token')) {
      // Google Sign-In authentication
      $scope.auth.google_token = sessionStorage.getItem('google_token');
   }

   // Restore current tab (or set to default)
   if ($scope.user_type > 0)
       $scope.tab = 1;
   else
       $scope.tab = 0; 
   if (sessionStorage.getItem('tab'))
      $scope.tab = sessionStorage.getItem('tab');
   // Save the current tab in sessionStorage
   $scope.$watch('tab',function(){
      sessionStorage.setItem('tab', $scope.tab);
   });
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
      data: $scope.auth
   }).done(function(data) {
      $scope.isWorking = false;
      if (data) {
         sessionStorage.setItem('user_type', data.user_type);
         $scope.$root.user_id = data.user_id;
         $scope.profile = data;
         $scope.isError = false;
      } else {
         $scope.isError = true;
         sessionStorage.clear();
         window.location.href = "login.htm";
      }
      $scope.$apply();
      $scope.required.done = $('input:invalid').length <= 0;
      $scope.$apply();
   }).error(function(err) {
      $scope.isError = true;
      $scope.isWorking = false;
      $scope.$apply();
      sessionStorage.clear();
      window.location.href = "login.htm";
   });

   // $scope.profile -> update_user
   $scope.updateProfile = function() {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=update_user",
         dataType: "json",
         data: $.extend({}, $scope.profile, $scope.auth)
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         $scope.$apply();
         $scope.required.done = $('input:invalid').length <= 0;
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

   // Save event_id in sessionStorage
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
         data: $scope.auth
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.events = data;
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         $scope.$apply();

         // Restore current event from sessionStorage
         if (sessionStorage.hasOwnProperty('eid'))
            $('button[eid='+sessionStorage.getItem('eid')+']').click();
         else if ($scope.user_type >= 2)
            $('button[eid=0]').click();

         // If admin, mark pieces as sortable
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
         data: $.extend({}, $scope.auth, $scope.create_event)
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
         data: $.extend({}, $scope.auth, current_event)
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
         data: $.extend({}, $scope.auth, {
            "event_id": event_id
         })
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
   
   // source_event, target_event -> clone_event
   $scope.cloneEvent = function(source_event, target_event) {
	  if (!source_event || !target_event)
		 return;
      if (!confirm("Are you sure you want to clone this event?"))
         return;
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=clone_event",
         dataType: "json",
         data: $.extend({}, $scope.auth, {
            "source_event": source_event,
            "target_event": target_event
         })
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
         }
      }
      var sched = setInterval(printAndClose, 200);
   }

   // event_id -> order_piece
   $scope.saveOrder = function(event_id) {
      var pieces = $('#sortable-'+event_id).find('tr');
      var data = {};
      for (var i = 0; i < pieces.length; i++) {
    	  data[$(pieces[i]).attr('pid')] = i*10;
	  }
      {
	    $scope.isError = false;
	    $scope.isWorking = true;
	    $scope.$apply();
	    $.ajax({
	       method: "POST",
	       url: "./api/api.php?x=order_pieces",
	       dataType: "json",
	       data: $.extend({}, $scope.auth, {
	    	   "piece_orders": data
	       })
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
      }		         
   };

   // piece_id, approved -> approve_piece; event_id -> order_piece
   $scope.approvePiece = function(piece_id, approved) {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=approve_piece",
         dataType: "json",
         data: $.extend({}, $scope.auth, {
            "piece_id": piece_id,
            "approved": approved
         })
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         // Also save order after approving/disapproving pieces
         $scope.saveOrder(sessionStorage.getItem('eid'));
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.saveOrder(sessionStorage.getItem('eid'));
      });
   }

   // piece_id -> update_piece
   $scope.updatePiece = function(piece) {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=update_piece",
         dataType: "json",
         data: $.extend({}, $scope.auth, {
            "piece_id": piece.piece_id,
            "piece_name": (val = prompt('Piece name?', piece.piece_name)) ? val : piece.piece_name,
            "piece_composer": (val = prompt('Composer?', piece.piece_composer)) ? val : piece.piece_composer,
            "piece_performer": (val = prompt('Performer?', piece.piece_performer)) ? val : piece.piece_performer,
            "piece_length": (val = prompt('Length?', piece.piece_length)) ? val : piece.piece_length,
            "piece_information": (val = prompt('Link?', piece.piece_information)) ? val : piece.piece_information
         })
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

   // piece_id -> delete_piece; event_id -> order_piece
   $scope.deletePiece = function(piece_id) {
      if (!confirm('Are you sure you want to delete this piece?'))
         return;
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=delete_piece",
         dataType: "json",
         data: $.extend({}, $scope.auth, {
            "piece_id": piece_id
         })
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
      if ($scope.submit_piece.piece_information) {
         var link = $scope.submit_piece.piece_information;
         if (link.indexOf(".") >= 0) {
            // probably a link
            link = link.trim();
            if (link.substr(0,4) != "http")
               link = "http://" + link;
         }
         $scope.submit_piece.piece_information = link;
      }
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=submit_piece",
         dataType: "json",
         data: $.extend({}, $scope.auth, {
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
         data: $scope.auth
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            for (var i = 0; i < data.length; i++) {
               data[i].interests = "";
               if (data[i].ensemble_solo >= 1)
                  data[i].interests += "solo ";
               if (data[i].ensemble_ensemble >= 1)
                  data[i].interests += "ensemble ";
               if (data[i].ensemble_choir >= 1)
                  data[i].interests += "choir ";
               if (data[i].ensemble_woodwind >= 1)
                  data[i].interests += "woodwind ";
               if (data[i].ensemble_orchestra >= 1)
                  data[i].interests += "orchestra ";
            }
            $scope.users = data;
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         $scope.$apply();

         // Restore selected user from sessionStorage
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
      if ($scope.user && $scope.user.user_id == user.user_id) {
         $('button[uid]').removeClass('button-primary');
         sessionStorage.removeItem('uid');
         $scope.user = false;
         return;
      }
      $scope.user = user;
      // Save selected user to sessionStorage
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
         data: $.extend({}, $scope.auth, {
            "user_id": user_id,
            "admitted": admitted
         })
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
         data: $.extend({}, $scope.auth, {
            "user_id": user_id,
            "admin": admin
         })
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
      if (!confirm('Are you sure you want to delete the user?'))
         return;
      $scope.isError = false;
      $scope.isWorking = true;
      $scope.user = false;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=delete_user",
         dataType: "json",
         data: $.extend({}, $scope.auth, {
            "user_id": user_id
         })
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

// News
baymsApp.controller('newsController', ['$scope', '$sce', function($scope, $sce) {
   $scope.isError = false;
   $scope.isWorking = true;

   // Save news_id in sessionStorage
   $scope.$watch('nid', function(newNID, oldNID) {
      if (newNID >= 0)
         sessionStorage.setItem('nid', newNID);
   });

   // get_news -> $scope.all_news
   function loadNews() {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=get_news",
         dataType: "json",
         data: $scope.auth
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.all_news = data;
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         $scope.$apply();

         // Restore current news from sessionStorage
         if (sessionStorage.hasOwnProperty('nid'))
            $('button[nid='+sessionStorage.getItem('nid')+']').click();
         else if ($scope.user_type >= 2)
            $('button[nid=0]').click();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         $scope.$apply();
      });
   }; loadNews();

   // $scope.create_news -> insert_news
   $scope.createNews = function() {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=insert_news",
         dataType: "json",
         data: $.extend({}, $scope.auth, $scope.create_news)
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadNews();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         loadNews();
      });
   };

   // current_news -> update_news
   $scope.updateNews = function(current_news) {
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=update_news",
         dataType: "json",
         data: $.extend({}, $scope.auth, current_news)
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadNews();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         loadNews();
      });
   };

   // news_id -> delete_news
   $scope.deleteNews = function(news_id) {
      if (!confirm("Are you sure you want to delete this news?"))
         return;
      $scope.isError = false;
      $scope.isWorking = true;
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=delete_news",
         dataType: "json",
         data: $.extend({}, $scope.auth, {
            "news_id": news_id
         })
      }).done(function(data) {
         $scope.isWorking = false;
         if (data) {
            $scope.isError = false;
         } else {
            $scope.isError = true;
         }
         loadNews();
      }).error(function(err) {
         $scope.isError = true;
         $scope.isWorking = false;
         loadNews();
      });
   };

   // markdown text
   $scope.markdownString = function(text) {
      var converter = new showdown.Converter({tables:true, strikethrough:true});
      return $sce.trustAsHtml(converter.makeHtml(text));
   }
}]);

baymsApp.controller('calendarController', function($scope) {
	   $scope.isError = false;
	   $scope.isWorking = true;
});
baymsApp.controller('publicController', function($scope) {
      $scope.tab=0;
});
