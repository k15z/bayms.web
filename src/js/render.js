// This handles showing/hiding the ".only.members" and ".only.admins" objects.
$(document).ready(function() {
   $('.only').hide();
   if (sessionStorage.getItem('user_name')) {
      (function() {
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
               if (data.user_type >= 1)
                  $('.only.members').show();
               if (data.user_type >= 2)
                  $('.only.admins').show();
               }
         })
      })();
   }
});
