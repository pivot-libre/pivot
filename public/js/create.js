'use strict';

//create a file-specific context via a function
(function(Piv) {

// script-level variables
var View = Piv.view
var NewElectionForm = Piv.html(View.workspace, "form", "", {"action": "javascript:;"})

// actions (do stuff)
Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

View.setHeader("Create an Election")

NewElectionForm.addEventListener("submit", function() {createElection(NewElectionForm)})
Piv.html(NewElectionForm, "input", "", {"type": "text", "name": "electionName", "placeholder": "Election name"}).focus();
Piv.html(NewElectionForm, "input", "", {"type": "submit", "value": "Create"});

// function definitions
function createElection(form) {
  var name = form.elements.electionName.value
  Piv.http.post(["/api/elections"], [{"name": name}], function(response) {
    window.location.href = "/candidates/" + response.id
  })
}

// close the self-executing function and feed the piv library to it
})(piv)
