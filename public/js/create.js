'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")
removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Create an Election"

var newElectionForm = html(workspace, "form", "", "action=javascript:;", "onsubmit=createElection(this)", "class=createOrLogin");
html(newElectionForm, "input", "", "type=text", "name=electionName", "placeholder=Election name").focus();
html(newElectionForm, "input", "", "type=submit", "value=Create");


// axios.get('/api/election')
//   .then(response => {
//     // console.log("create.js!");
//     // console.log(response.data);
//     showElections(response.data)
//   });


function createElection(form) {
  var name = form.elements.electionName.value
  axios.post('/api/election', {"name": name})
    .then(response => {
      // console.log(response.data);
      window.location.href = "/administer/" + response.data.id
    });
}
