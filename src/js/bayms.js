var BAYMS = (function() {
   var exports = {};

   exports.isLoggedIn = function() {
      return !!sessionStorage.getItem("user_name");
   }

   exports.login = function(user_name, user_pass, do_next) {
      $.ajax({
         method: "POST",
         url: "./api/api.php?x=login",
         dataType: "json",
         data: { "user_name": user_name, "user_pass": user_pass
         }
      }).done(function(data) {
         if (data) {
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

   return exports;
})();
