'use strict';

//create a file-specific context via a function
(function(Piv) {

//script-level variables
var Email = document.getElementById("email")
var GetTokenButton = document.getElementById("getTokenButton")
var GetTokenStatus = document.getElementById("getTokenStatus")
var GetTokenInstructions = document.getElementById("getTokenInstructions")

Piv.removeHrefsForCurrentLoc("removeContainer")  //remove hrefs that link to the current page

Piv.view.setHeader("Register")

GetTokenButton.addEventListener("click", function() {
  GetTokenStatus.innerHTML = "Sending Email..."
  verifyEmail(Email.value, GetTokenStatus, GetTokenInstructions)
})

function verifyEmail(email, statusEl, instructionsEl) {
  Piv.postToResource('/open/send_verify_email', {"email": email}, function(response) {
    if ("confirmation Email sent" == response) {
      statusEl.innerHTML = "Token created!"
      instructionsEl.innerHTML = "An email has been sent to " + email + " containing a verification token. Use the token from the Email in the Verification Token field to continue with your registration."
    }
    else {
      statusEl.innerHTML = "Token not sent"
      instructionsEl.innerHTML = "An issue occurred when generating the token. Check that you have supplied a valid Email address."
    }
  })
}

// close the self-executing function and feed the piv library to it
})(piv)
