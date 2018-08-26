'use strict';

//create a file-specific context via a function
(function(Piv) {

  //script-level variables
  var Email = document.getElementById("email")
  var GetTokenButton = document.getElementById("getTokenButton")
  var GetTokenInstructions = document.getElementById("getTokenInstructions")
  var RegisterStep1 = document.getElementById("registerStep1")

  Piv.removeHrefsForCurrentLoc("removeContainer")
  Piv.view.setHeader("Register")

  console.log("addEventListener")
  GetTokenButton.addEventListener("click", function() {
    console.log("getTokenButton")
    GetTokenInstructions.innerHTML = "Sending Email..."
    verifyEmail(Email.value, GetTokenInstructions)
  })

  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  if (getUrlParameter("debug") != "1") {
    if (getUrlParameter("token") != "") {
      RegisterStep1.style.display = "none";
    }
  }

  // function verifyEmail(email, statusEl, instructionsEl) {
  function verifyEmail(email, instructionsEl) {
    Piv.http.post(["/open/send_verify_email"], [{"email": email}], function(response) {
      if ("confirmation email sent" == response) {

        instructionsEl.innerHTML = "Token created! <br> An email has been sent to " + email + " containing a verification token. Use the token from the Email in the Verification Token field to continue with your registration."
      }
      else {
        instructionsEl.innerHTML = "Token not sent <br>" + response
      }
    })
  }

  // close the self-executing function and feed the piv library to it
})(piv)
