'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Electorate"

anchorListDiv(workspace, "button1", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
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

div(workspace, "AddCandidate", "button1Item", "+ Add Person", "onclick=addElector()");
div(workspace, "SaveElection", "button1Item", "Save Election", "onclick=saveElectorate()");
checkboxWithLabel(workspace, "checked=checked", "sendEmails", "Send emails to new users", "checkLabel2 button1Item");

loadElectorate(election, displayElectorate)

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
function checkboxWithLabel(parent, checked, name, label, labelClass = "checkLabel button1Item") {
  label = html(parent, "label", label, "class=" + labelClass);
  html(label, "input", "", "type=checkbox", checked, "name=" + name);
}
function addElector() {
  var itemContainer = document.getElementById("edititems");
  elector(itemContainer, "", "", "yes", "yes", "")
}
function saveElectorate(el) {
}
function loadElectorate(electionId, onSuccessFunction) {
  if (!electionId) {return}
  axios.get('/api/election/' + electionId + "/elector")
    .then(response => {
      console.log(response.data);
      // onSuccessFunction(response.data)
    });
}
function displayElectorate(electorate) {
  console.log(electorate);
  var elector
  for (var key in electorate) {
    electorate = electorate[key]
    elector(edititems, "", "Nathan", "yes", "yes", "yes")
  }
}
