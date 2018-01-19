'use strict';

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Electorate"

anchorListDiv(workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var edititems = html(workspace, "ol", "", {"id": "edititems", "class": "itemlist"})
var containerdivs = {}
// containerdivs.electorate = div(edititems, "", "text1", "Current Electorate")
// containerdivs.pending = div(edititems, "", "text1", "Pending Invites")
// containerdivs.unsent = div(edititems, "", "text1", "Unsent Invites")
containerdivs.electorate = html(workspace, "ol", "", {"id": "electorateUl", "class": "itemlist hasLabelFrame"});
containerdivs.pending = html(workspace, "ul", "", {"id": "pendingUl", "class": "itemlist hasLabelFrame"});
containerdivs.unsent = html(workspace, "ul", "", {"id": "unsentUl", "class": "itemlist hasLabelFrame"});


div(workspace, "AddCandidate", "button1Item", "+ New Invite", {"onclick": "addElector()"});
div(workspace, "SaveElection", "button1Item", "Save Invites", {"onclick": "saveElectorate()"});

loadElectorateAndInvites(election, displayElectorateAndInvites)

var unsentInvites = {}
var deletingInvites = {}
var pendingInvites = {}
function electorEl(parent, uniq, email, inviteStatus) {
  var checked
  var electorLiAtts = {"class": "w100"}
  if (uniq) { electorLiAtts["data-id"] = uniq }
  var box = html(parent, "li", "", electorLiAtts);

  // var candidateDescription = div(details, "", "userDescription");

  if ("unsent" == inviteStatus) {
    // var candidateDescription = html(box, "form", "", {"action": "javascript:;"});
    var lastInvite = Object.keys(unsentInvites)[Object.keys(unsentInvites).length - 1] || 0
    var emailInput = html(box, "input", "", {"type": "text", "name": "email", "class": "w50"});
    unsentInvites[++lastInvite] = {"email": emailInput, "domel": box}
    div(box, "", "clickable1", "X", {"onclick": "removeInvite(this.parentElement, " + lastInvite + ")"});
    // div(box, "", "xIcon", "", {"onclick": "removeInvite(this.parentElement, " + lastInvite + ")"});
  }
  else if ("pending" == inviteStatus) {
    // var candidateDescription = div(box, "", "", "", {"class": "w100"});
    pendingInvites[email] = box
    div(box, "", "", email + "(" + uniq + ")", {"class": "w50 text1"});
    div(box, "", "clickable1", "X", {"onclick": "deleteInvite(this.parentElement, '" + uniq + "', '" + email + "')"});
  }
  else {
    // var candidateDescription = div(box, "", "", "", {"class": "w100"});
    div(box, "", "", uniq + "(" + email + ")", {"class": "w50 text1"});
    div(box, "", "hidden clickable1", "X")
  }
}
function deleteInvite(domel, code, email) {
  console.log(domel)
  console.log(code)
  domel.parentElement.removeChild(domel)
  deletingInvites[email] = code
  // delete pendingInvites[inviteCode]
  delete pendingInvites[email]
}
function removeInvite(domel, inviteKey) {
  console.log(domel)
  console.log(inviteKey)
  domel.parentElement.removeChild(domel)
  delete unsentInvites[inviteKey]
}
function addElector() {
  // var itemContainer = document.getElementById("edititems");
  electorEl(containerdivs.unsent, "", "", "unsent")
}
function saveElectorate(el) {
  var invite, email
  //send new invites
  for (var i in unsentInvites) {
    if (!unsentInvites.hasOwnProperty(i)) continue
    // console.log(unsentInvites[i])
    invite = unsentInvites[i]
    // console.log(invite)
    email = invite.email.value
    // console.log(email)
    invite.domel.parentElement.removeChild(invite.domel)
    if (pendingInvites[email] || deletingInvites[email]) {  //prevent attempts to create duplicate invites or create invites for emails that are also being deleted in this request
      delete unsentInvites[i]
      continue
    }
    pendingInvites[email] = true
    // console.log(election)
    // console.log(email)
    postToResource('/api/election/' + election + '/invite', {"email": email},
      function(data){
        // console.log(data)
        // electorEl(containerdivs.pending, data.code, data.email + " (" + data.code + ")", "pending")
        electorEl(containerdivs.pending, data.code, data.email, "pending")
      })
    delete unsentInvites[i]
  }
  //delete those marked for deletion
  for (var i in deletingInvites) {
    if (!deletingInvites.hasOwnProperty(i)) continue
    deleteResource('/api/election/' + election + '/invite/' + deletingInvites[i])
    delete deletingInvites[i]
  }
}

function loadElectorateAndInvites(electionId, onSuccessFunction) {
  //define functions that we will use to get both the candidate definitions and the user's ranked ballot
  var loadElectorate = function() { return axios.get('/api/election/' + electionId + '/elector') }
  var loadInvites = function() { return axios.get('/api/election/' + electionId + '/invite') }

  axios.all([loadElectorate(), loadInvites()])
    .then(axios.spread(function (electorate, invites) {
      onSuccessFunction(electorate.data, invites.data)
    }));
}

function displayElectorateAndInvites(electorate, invites) {
  displayElectorate(electorate)
  displayInvites(invites)
}
function displayElectorate(electorate) {
  if (!electorate.length) return
  var elector
  for (var key in electorate) {
    elector = electorate[key]
    electorEl(containerdivs.electorate, elector.name, elector.email)
  }
}

function displayInvites(invites) {
  var invite, code, email
  for (var key in invites) {
    invite = invites[key]
    code = invite.code
    email = invite.email
    electorEl(containerdivs.pending, code, email, "pending")
  }
}
