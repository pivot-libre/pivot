'use strict';

//create a file-specific context via a function
(function(piv) {

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var view = piv.view
view.setHeader("Create an Election")

var newElectionForm = piv.html(view.workspace, "form", "", {"action": "javascript:;", "class": "createOrLogin"})
newElectionForm.addEventListener("submit", function() {createElection(newElectionForm)})
piv.html(newElectionForm, "input", "", {"type": "text", "name": "electionName", "placeholder": "Election name"}).focus();
piv.html(newElectionForm, "input", "", {"type": "submit", "value": "Create"});

function createElection(form) {
  var name = form.elements.electionName.value
  axios.post('/api/election', {"name": name})
    .then(response => {
      window.location.href = "/administer/" + response.data.id
    });
}

// close the self-executing function and feed the piv library to it
})(piv)
