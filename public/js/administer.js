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

Piv.getMultResources(['/api/election/' + election, '/api/election/' + election + '/voter_stats'], showElectionDetails)
// Piv.getResource('/api/election/' + election, showElectionDetails)
// Piv.getResource('/api/election/' + election + '/voter_stats',
//   function(response){
//     console.log(response)
//   }
// )

// function definitions
function showElectionDetails(details, stats) {
  Piv.div(View.workspace, "", "text3 row1", "Election name: " + details.name)

  // stats
  Piv.div(View.workspace, "", "text3 row1", "Outstanding invites: " + stats.outstanding_invites)
  Piv.div(View.workspace, "", "text3 row1", "Approved ballots: " + stats.approved_current)
  Piv.div(View.workspace, "", "text3 row1", "Unapproved ballots: " + stats.approved_none)
  Piv.div(View.workspace, "", "text3 row1", "Previously approved ballots: " + stats.approved_previous)

  //delete button
  Piv.div(View.workspace, "", "clickable1", "Delete Election", "", "click", deleteElection, [details.id])
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
