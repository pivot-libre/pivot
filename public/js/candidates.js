'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Candidates"

anchorListDiv(workspace, "tealButton", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var edititems = html(workspace, "ol", "", "id=edititems", "class=itemlist incrementsCounter")
var drake = dragula([document.getElementById("edititems")])
drake.on('drop', function (el) { onReorder(el); })

// displayCandidate(edititems, "", "description 1", "$1")
// displayCandidate(edititems, "", "description 2", "$2")

div(workspace, "AddCandidate", "tealButtonItem", "+ Add Candidate", "onclick=addCandidate()");
div(workspace, "SaveElection", "tealButtonItem", "Save Election", "onclick=saveCandidates(election)");

loadCandidates(election, displayCandidates)

function loadCandidates(electionId, onSuccessFunction) {
  if (!electionId) {return}
  axios.get('/api/election/' + electionId + "/candidate")
    .then(response => {
      // console.log(response.data);
      onSuccessFunction(response.data)
    });
}
function displayCandidates(candidates) {
  // console.log(candidates);
  var candidate
  for (var key in candidates) {
    candidate = candidates[key]
    displayCandidate(edititems, candidate.id, candidate.name, "", "")
  }
}
function displayCandidate(parent, uniq, description, cost, tie) {
  var id = uniq ? "data-id=" + uniq : ""
  var box = html(parent, "li", "", "class=candidate", id);

  div(box, "", "banish", "", "onclick=removeCandidate(this.parentElement)");
  div(box, "", "rankdisplay");

  var details = div(box, "", "candidateDetails");
  div(details, "", "grippy");
  var candidateDescription = div(details, "", "candidateDescription");
  html(candidateDescription, "input", "", "type=text", "value=" + (description || ""), "placeholder=Budget item title/description");
  var candidateCost = div(details, "", "candidateCost");
  html(candidateCost, "input", "", "type=text", "value=" + (cost || ""), "placeholder=cost");
}
function addCandidate() {
  var itemContainer = document.getElementById("edititems");
  displayCandidate(edititems)
}
function saveCandidates(electionId) {
  var newCandidates = gatherNewCandidates(electionId)
  // for (var i = 0; i < newCandidates.length; i++) {
  //   saveCandidate(electionId, newCandidates[i])
  // }
}
function saveCandidate(electionId, candidateData, candidateHtmlEl) {
  // console.log(candidateData)
  // console.log('/api/election/' + electionId + "/candidate")
  axios.post('/api/election/' + electionId + "/candidate", candidateData)
    .then(response => {
      // function() {
        // console.log(response.data)
        candidateHtmlEl.setAttribute("data-id", response.data.id)
      // }
  //     // console.log(response.data);
  //     onSuccessFunction(response.data)
    });
}
function makeCandidatesArray () {
  var candidates = [];
  candidateDefinitionsToArray(document.querySelectorAll("#edititems .candidate"), candidates);
  return candidates
}
function gatherNewCandidates(electionId) {
  var newCandidates = []
  var candidateHtmlEls = document.querySelectorAll("#edititems .candidate:not([data-id])")
  for (var i = 0; i < candidateHtmlEls.length; i++) {
    var candidateDef = {};
    candidateDef.name = candidateHtmlEls[i].querySelector(".candidateDescription > input").value
    // candidateDef.cost = candidateHtmlEls[i].querySelector(".candidateCost > input").value
    // candidateDef.id = candidateHtmlEls[i].getAttribute("data-id") || ""
    // newCandidates.push(candidateDef);
    saveCandidate(electionId, candidateDef, candidateHtmlEls[i])
  }
  // return newCandidates
};

// loadElection(1, showElectionDetails)
//
// function loadElection(electionId, onSuccessFunction) {
//   if (!electionId) {return}
//   axios.get('/api/election/' + electionId)
//     .then(response => {
//       // console.log(response.data);
//       onSuccessFunction(response.data)
//     });
// }
// function showElectionDetails(details) {
//   // console.log(details)
//   // var detailsSpace = div(workspace, "", "")
//   appendNewHtmlEl(workspace, "br")
//   div(workspace, "", "", "election name: " + details.name)
// }
