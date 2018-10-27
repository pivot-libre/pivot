'use strict';

//create a file-specific context via a function
(function(Piv) {

  //script-level variables
  var Email = document.getElementById("email");
  var GetTokenButton = document.getElementById("getTokenButton");
  var GetTokenInstructions = document.getElementById("getTokenInstructions");
  var RegisterStep1 = document.getElementById("registerStep1");

  Piv.removeHrefsForCurrentLoc("removeContainer");
  Piv.view.setHeader("Register");

  console.log("addEventListener");
  GetTokenButton.addEventListener("click", function() {
    console.log("getTokenButton");
    GetTokenInstructions.innerHTML = "Sending Email...";
    verifyEmail(Email.value, GetTokenInstructions);
  });

  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  if (getUrlParameter("debug") !== "1") {
    if (getUrlParameter("token") !== "") {
      RegisterStep1.style.display = "none";
    }
  }

  // function verifyEmail(email, statusEl, instructionsEl) {
  function verifyEmail(email, instructionsEl) {
    Piv.http.post(["/open/send_verify_email"], [{"email": email}], function(response) {
      if ("confirmation email sent" === response) {

        instructionsEl.innerHTML = "<p>Account registration started! </p><p>A confirmation email has been sent to " + email + ". Follow the link in the email to continue with your registration.</p>";
        var registrationEmailFields = document.getElementById("emailRegistrationGroup");
        registrationEmailFields.style.display = "none";
        var tokenRequestGroup = document.getElementById("tokenRequestGroup");
        tokenRequestGroup.style.display = "none";
      }
      else {
        instructionsEl.innerHTML = "<p>Confirmation message not sent. Did you enter a valid email address?</p><p>" + response + "</p>";
      }
    })
  }

  // close the self-executing function and feed the piv library to it
}(piv));
