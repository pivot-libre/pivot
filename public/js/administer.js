'use strict';

//create a file-specific context via a function
(function(Piv) {

// script-level variables
var View = Piv.view

// actions (do stuff)
Piv.evmanage.setManager(View.workspace, ["click"])

View.setHeader("Administer")

Piv.anchorListDiv(View.workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

Piv.getResource('/api/election/' + election, showElectionDetails)

// function definitions
function showElectionDetails(details) {
  var row = Piv.div(View.workspace, "", "w100")
  Piv.div(row, "", "text1", "election name: " + details.name)
  // Piv.div(row, "", "clickable1", "Delete Election", {"onclick": "deleteElection(" + details.id + ")"})
  Piv.div(row, "", "clickable1", "Delete Election", "", "click", deleteElection, [details.id])
}
function deleteElection(electionId) {
  if (!electionId) {return}
  axios.delete('/api/election/' + electionId)
    .then(response => {
      // console.log(response.data);
      window.location.href = "/myElections"
    });
}

// close the self-executing function and feed the piv library to it
})(piv)
