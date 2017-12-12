'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")
removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "My Elections"
var elections = html(workspace, "ol", "", "class=electionlist");

axios.get('/api/election')
  .then(response => {
    // console.log("create.js!");
    // console.log(response.data);
    showElections(response.data)
  });

// axios.post('/api/election', {"name":"Nathan 1"})
//   .then(response => {
//     console.log("create.js!");
//     console.log(response.data);
//   });

function showElections(myElections) {
  // console.log(myElections)
  var electn
  for (var key in myElections) {
    electn = myElections[key]
    // showElection(elections, electn.name, electn.id, electn.vote, electn.results, electn.admin)
    showElection(elections, electn.name, electn.id, electn.can_vote, "canViewResults", electn.can_edit)
  }
}
function showElection(parent, name, id, canVote, canViewResults, canEdit) {
  var box = html(parent, "li", "", "class=electionListing");
  var href = "";
  var hiddenStyle = "style=visibility:hidden;";
  var nameHref = "";
  if (canEdit) {
    href = "href=administer/" + id;
    hiddenStyle = "";
    nameHref = href;
  }
  html(box, "a", "Administer", href, hiddenStyle);
  hiddenStyle = "style=visibility:hidden;";
  if (canVote) {
    href = "href=ballot/" + id;
    hiddenStyle = "";
    nameHref = href;
  }
  html(box, "a", "Vote", href, hiddenStyle);
  html(box, "a", name, nameHref, "class=electionName");

  hiddenStyle = "style=visibility:hidden;";
  if ("canViewResults" == canViewResults) {
    var href = "href=results/" + id;
    // hiddenStyle = "";
    nameHref = href;
  }
  var resultsButton = html(box, "a", "View Results", href, hiddenStyle);
  loadResults(id, function() {
    // console.log(resultsButton)
    // console.log(resultsButton.style.visibility)
    resultsButton.style.visibility = null
  })
}
function loadResults(electionId, onSuccessFunction) {
  if (!electionId) {return}
  axios.get('/api/election/' + electionId + '/result')
    .then(response => {
      // console.log(response.data);
      onSuccessFunction(response.data)
    })
    .catch(error => {
      // console.log(error);
    })
}
