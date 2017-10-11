'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Candidates"

anchorListDiv(workspace, "tealButton", {
    "Election details": "administer",
    "Add/Edit candidates": "candidates",
    "Manage electorate": "electorate"
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var edititems = html(workspace, "ol", "", "id=edititems", "class=itemlist incrementsCounter")
var drake = dragula([document.getElementById("edititems")])
drake.on('drop', function (el) { onReorder(el); })

candidate(edititems, "", "description 1", "$1")
candidate(edititems, "", "description 2", "$2")

div(workspace, "AddCandidate", "tealButtonItem", "+ Add Candidate", "onclick=addCandidate()");
div(workspace, "SaveElection", "tealButtonItem", "Save Election", "onclick=saveCandidates()");

function candidate(parent, uniq, description, cost, tie) {
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
  candidate(edititems)
}
function saveCandidates(el) {
  // var request = {}
  // request.data = makeCandidatesArray()
  // // console.log(request.data)
  // request.api = "candidates"
  // request.record = election
  // saveCandidatesToServer(request);
}


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
