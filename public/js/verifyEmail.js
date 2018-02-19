'use strict';

//create a file-specific context via a function
(function(piv) {

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var view = piv.view
view.setHeader("Verify Email")

var verifyEmailForm = piv.html(view.workspace, "form", "", {"action": "javascript:;", "class": "createOrLogin"})
verifyEmailForm.addEventListener("submit", function() {verifyEmail(verifyEmailForm)})
piv.html(verifyEmailForm, "input", "", {"type": "text", "name": "email", "placeholder": "email"}).focus();
piv.html(verifyEmailForm, "input", "", {"type": "submit", "value": "Verify"});

function verifyEmail(form) {
    var email = form.elements.email.value;
    axios.post('/open/send_verify_email', {"email": email})
	.then(response => {
	    alert(response.data);
	});
}

// close the self-executing function and feed the piv library to it
})(piv)
