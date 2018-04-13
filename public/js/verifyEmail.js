'use strict';

//create a file-specific context via a function
(function(Piv) {

// script-level variables
var View = Piv.view
var VerifyEmailForm = Piv.html(View.workspace, "form", "", {"action": "javascript:;"})

// actions (do stuff)
Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page
View.setHeader("Verify Email")

VerifyEmailForm.addEventListener("submit", function() {verifyEmail(VerifyEmailForm)})
Piv.html(VerifyEmailForm, "input", "", {"type": "text", "name": "email", "placeholder": "email"}).focus();
Piv.html(VerifyEmailForm, "input", "", {"type": "submit", "value": "Verify"});

// function definitions
function verifyEmail(form) {
  var email = form.elements.email.value;
  Piv.http.post(["/open/send_verify_email"], [{"email": email}], function(response) {
    alert(response);
  })
}

// close the self-executing function and feed the piv library to it
})(piv)
