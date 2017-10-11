'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Electorate"

anchorListDiv(workspace, "tealButton", {
    "Election details": "administer",
    "Add/Edit candidates": "candidates",
    "Manage electorate": "electorate"
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var edititems = html(workspace, "ol", "", "id=edititems", "class=itemlist")
elector(edititems, "", "nathan", "yes", "yes", "yes")
elector(edititems, "", "lucas", "yes", "yes", "yes")
elector(edititems, "", "carl", "yes", "yes", "yes")

// people = pivot["elections"][election]["people"];

// foreach(people as username => privileges) {
//   candidate(edititems, "", username, privileges["vote"], privileges["results"], privileges["admin"]);
// }

div(workspace, "AddCandidate", "tealButtonItem", "+ Add Person", "onclick=addElector()");
div(workspace, "SaveElection", "tealButtonItem", "Save Election", "onclick=saveElectorate()");
checkboxWithLabel(workspace, "checked=checked", "sendEmails", "Send emails to new users", "checkLabel2");

// httpRequest("get", "getCandidates", {"election": election}, showCandidates)

function elector(parent, uniq, description, canVote, canViewResults, isAdmin) {
  var checked
  var id = uniq ? "data-id=" + uniq : ""
  var box = html(parent, "li", "", "class=candidate", id);
  div(box, "", "banish", "", "onclick=removeCandidate(this.parentElement)");

  var details = html(box, "form", "", "class=candidateDetails", "action=javascript:;");
  div(details, "", "grippy");

  var candidateDescription = div(details, "", "userDescription");
  html(candidateDescription, "input", "", "type=text", "value=" + description, "placeholder=username", "name=username");
  var electorChecks = div(details, "", "electorChecks");
  if (canVote == "yes") {checked = "checked=checked";}
  else {checked = "";}
  checkboxWithLabel(electorChecks, checked, "canVote", "Can Vote");
  if (canViewResults == "yes") {checked = "checked=checked";}
  else {checked = "";}
  checkboxWithLabel(electorChecks, checked, "canViewResults", "Can View Results");
  if (isAdmin == "yes") {checked = "checked=checked";}
  else {checked = "";}
  checkboxWithLabel(electorChecks, checked, "isAdmin", "Is Admin");
}
function checkboxWithLabel(parent, checked, name, label, labelClass = "checkLabel") {
  label = html(parent, "label", label, "class=" + labelClass);
  html(label, "input", "", "type=checkbox", checked, "name=" + name);
}
function addElector() {
  var itemContainer = document.getElementById("edititems");
  elector(itemContainer, "", "", "yes", "yes", "")
}
function saveElectorate(el) {
  // var request = {}
  // request.data = makeElectorateArray()
  // // console.log(request.data)
  // request.api = "electorate"
  // request.record = election
  // saveElectorateToServer(request);
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
