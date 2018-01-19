'use strict';

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Candidates"

anchorListDiv(workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var edititems = html(workspace, "ol", "", {"id": "edititems", "class": "itemlist incrementsCounter"})
var drake = dragula([document.getElementById("edititems")])
// drake.on('drop', function (el) { onCandidateDrop(el); })

div(workspace, "AddCandidate", "button1Item", "+ Add Candidates", {"onclick": "addCandidate()"});
div(workspace, "SaveElection", "button1Item", "Save Election", {"onclick": "saveCandidates(election)"});

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
  // var candidateLiAtts = {"class": "candidate"}
  if (id) { candidateLiAtts["data-id"] = id}
  var box = html(parent, "li", "", candidateLiAtts);
  //
  // div(box, "", "banish", "", {"onclick": "removeCandidate(this.parentElement)"});
  // div(box, "", "orderdisplay");
  //
  // var details = div(box, "", "candidateDetails");
  // div(box, "", "grippy");
  // var candidateDescription = div(details, "", "candidateDescription");
  div(box, "", "grabbable", "#");
  div(box, "", "grabbable", "^v");
  html(box, "input", "", {"class": "text1 w75", "type": "text", "value": (description || ""), "placeholder": "Budget item title/description"});
  div(box, "", "clickable1", "X", {"onclick": "removeCandidate(this.parentElement)"});
}
function addCandidate() {
  var itemContainer = document.getElementById("edititems");
  displayCandidate(edititems)
}
function removeCandidate(el) {
  if (el.hasAttribute(["data-id"])) {console.log("I don't think there's currently an api to get rid of old candidates"); return}
  el.parentElement.removeChild(el)
}
function saveCandidates(electionId) {
  var newCandidates = gatherNewCandidates(electionId)
}
function saveCandidate(electionId, candidateData, candidateHtmlEl) {
  console.log(candidateData)
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
