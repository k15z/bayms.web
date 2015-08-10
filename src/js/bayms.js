var BAYMS = (function() {
   var exports = {};

   exports.isLoggedIn = function() {
      return !!sessionStorage.getItem("user_name");
   }

   exports.login = function(user_name, user_pass, do_next) {
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=get_user",
         dataType: "json",
         data: { "user_name": user_name, "user_pass": user_pass
         }
      }).done(function(data) {
         if (data) {
            console.log(data.user_type);
            sessionStorage.setItem('user_type', data.user_type);
            sessionStorage.setItem('user_name', user_name);
            sessionStorage.setItem('user_pass', user_pass);
            do_next(true);
         } else {
            do_next(false);
         }
      }).error(function(err) {
         do_next(false)
      });
   }

   exports.apply = function(user_name, user_pass, do_next) {
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=apply",
         dataType: "json",
         data: { "user_name": user_name, "user_pass": user_pass
         }
      }).done(function(data) {
         if (data) {
            sessionStorage.setItem('user_type', 0);
            sessionStorage.setItem('user_name', user_name);
            sessionStorage.setItem('user_pass', user_pass);
            do_next(true);
         } else {
            do_next(false);
         }
      }).error(function(err) {
         do_next(false)
      });
   }

   exports.logOut = function() {
      sessionStorage.clear();
   }

   exports.render = function() {
      $('.only').hide();
      if (exports.isLoggedIn) {
         var user_type = sessionStorage.getItem('user_type');
         if (user_type == 1)
            $('.only.members').show();
         if (user_type == 2)
            $('.only.admins').show();
      }
   }

   exports.getUser = function(do_next) {
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=get_user",
         dataType: "json",
         data: {
            "user_name": sessionStorage.getItem('user_name'),
            "user_pass": sessionStorage.getItem('user_pass')
         }
      }).done(function(data) {
         if (data) {
            do_next(data);
         } else {
            do_next(false);
         }
      }).error(function(err) {
         do_next(false);
      });
   }

   exports.updateUser = function(user, do_next) {
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=update_user",
         dataType: "json",
         data: $.extend({}, user, {
            "user_name": sessionStorage.getItem('user_name'),
            "user_pass": sessionStorage.getItem('user_pass')
         })
      }).done(function(data) {
         if (data) {
            do_next(data);
         } else {
            do_next(false);
         }
      }).error(function(err) {
            do_next(false);
      });
   }

   return exports;
})();

$(document).ready(function() {
   BAYMS.render()
});
