'use strict';

//create a file-specific context via a function
(function(piv) {

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var email = document.getElementById("email")
var getTokenButton = document.getElementById("getTokenButton")
var getTokenStatus = document.getElementById("getTokenStatus")
var getTokenInstructions = document.getElementById("getTokenInstructions")

getTokenButton.addEventListener("click", function() {
  console.log("getTokenButton")
  getTokenStatus.innerHTML = "Sending email..."
  verifyEmail(email.value, getTokenStatus, getTokenInstructions)
})

function verifyEmail(email, statusEl, instructionsEl) {
  piv.postToResource('/open/send_verify_email', {"email": email}, function(response) {
    if ("confirmation email sent" == response) {
      statusEl.innerHTML = "Token created!"
      instructionsEl.innerHTML = "An email has been sent to " + email + " containing a verification token. Use the token from the email in the Verification Token field to continue with your registration."
    }
    else {
      statusEl.innerHTML = "Token not sent"
      instructionsEl.innerHTML = "An issue occurred when generating the token. Check that you have supplied a valid email address."
    }
  })
}

// close the self-executing function and feed the piv library to it
})(piv)
