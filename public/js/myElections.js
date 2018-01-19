'use strict';

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "My Elections"
var elections = html(workspace, "ol", "", {"class": "w100"});

axios.get('/api/election')
  .then(response => {
    showElections(response.data)
  });

function showElections(myElections) {
  var electn
  for (var key in myElections) {
    electn = myElections[key]
    showElection(elections, electn.name, electn.id, electn.can_vote, "canViewResults", electn.can_edit)
  }
}
function showElection(parent, name, id, canVote, canViewResults, canEdit) {
  var hiddenStyle = "visibility:hidden;", hiddenAttObj = {"style": hiddenStyle}, resultsButton, defaultHref = ""

  var box = html(parent, "li", "", {"class": "electionListing"});

  if (canEdit) {
    defaultHref = "administer/" + id
    html(box, "a", "Administer", {"href": defaultHref})
  }
  else { html(box, "a", "Administer", hiddenAttObj) }

  if (canVote) {
    defaultHref = "ballot/" + id
    html(box, "a", "Vote", {"href": defaultHref}) }
  else { html(box, "a", "Vote", hiddenAttObj) }

  html(box, "a", name, {"class": "electionName", "href": defaultHref});

  if (canViewResults) { resultsButton = html(box, "a", "View Results", {"href": "results/" + id, "style": hiddenStyle}) }
  else { resultsButton = html(box, "a", "View Results", hiddenAttObj) }

  loadResults(id, function() {
    resultsButton.style.visibility = null
  })
}
function loadResults(electionId, onSuccessFunction) {
  if (!electionId) {return}
  axios.get('/api/election/' + electionId + '/result')
    .then(response => {
      onSuccessFunction(response.data)
    })
    .catch(error => {
    })
}
