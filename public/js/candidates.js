'use strict';

//create a file-specific context via a function
(function(piv) {

var view = piv.view
view.setHeader("Candidates")

piv.anchorListDiv(view.workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var edititems = piv.html(view.workspace, "ol", "", {"id": "edititems", "class": "itemlist incrementsCounter"})
var drake = dragula([document.getElementById("edititems")])
// drake.on('drop', function (el) { onCandidateDrop(el); })

piv.div(view.workspace, "AddCandidate", "button1Item", "+ Add Candidates", "", ["click"], addCandidate);
piv.div(view.workspace, "SaveElection", "button1Item", "Save Election", "", ["click"], saveCandidates, election);

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
function displayCandidate(parent, id, description, cost, tie) {
  var candidateLiAtts = {"class": "row1"}
  if (id) { candidateLiAtts["data-id"] = id}
  var box = piv.html(parent, "li", "", candidateLiAtts);
  piv.div(box, "", "grabbable", "#");
  piv.div(box, "", "grabbable", "^v");
  var input = piv.html(box, "input", "", {"class": "text1 w75", "type": "text", "value": (description || ""), "placeholder": "Budget item title/description"});
  piv.div(box, "", "clickable1", "X", "", ["click"], removeCandidate, box);
  return input
}
function addCandidate() {
  var itemContainer = document.getElementById("edititems");
  displayCandidate(edititems).focus()
}
function removeCandidate(el) {
  if (el.hasAttribute(["data-id"])) {console.log("I don't think there's currently an api to get rid of old candidates"); return}
  el.parentElement.removeChild(el)
}
function saveCandidates(electionId) {
  var newCandidates = gatherNewCandidates(electionId)
}
function saveCandidate(electionId, candidateData, candidateHtmlEl) {
  axios.post('/api/election/' + electionId + "/candidate", candidateData)
    .then(response => {
        candidateHtmlEl.setAttribute("data-id", response.data.id)
    });
}
function makeCandidatesArray () {
  var candidates = [];
  candidateDefinitionsToArray(document.querySelectorAll("#edititems .candidate"), candidates);
  return candidates
}
function gatherNewCandidates(electionId) {
  var newCandidates = []
  var candidateHtmlEls = document.querySelectorAll("#edititems li:not([data-id])")
  for (var i = 0; i < candidateHtmlEls.length; i++) {
    var candidateDef = {};
    candidateDef.name = candidateHtmlEls[i].querySelector("input").value
    saveCandidate(electionId, candidateDef, candidateHtmlEls[i])
  }
};

// close the self-executing function and feed the piv library to it
})(piv)
