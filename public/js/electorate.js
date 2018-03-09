'use strict';

//create a file-specific context via a function
(function(Piv) {

// script-level variables
var View = Piv.view
var Edititems
var UnsentInvites = {}
var DeletingInvites = {}
var PendingInvites = {}
var Containerdivs = {}

// actions (do stuff)
Piv.evmanage.setManager(View.workspace, ["click"])
View.setHeader("Electorate")

Piv.anchorListDiv(View.workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

Edititems = Piv.html(View.workspace, "ol", "", {"id": "Edititems", "class": "itemlist"})

Containerdivs.electorate = Piv.html(View.workspace, "ol", "", {"id": "electorateUl", "class": "itemlist hasLabelFrame"});
Containerdivs.pending = Piv.html(View.workspace, "ul", "", {"id": "pendingUl", "class": "itemlist hasLabelFrame"});
Containerdivs.unsent = Piv.html(View.workspace, "ul", "", {"id": "unsentUl", "class": "itemlist hasLabelFrame"});

Piv.div(View.workspace, "AddCandidate", "button1Item", "+ New Invite", "", ["click"], addElector)
Piv.div(View.workspace, "SaveElection", "button1Item", "Save Invites", "", ["click"], saveElectorate)

loadElectorateAndInvites(election, displayElectorateAndInvites)

// function definitions
function electorEl(parent, uniq, email, inviteStatus) {
  var checked
  var electorLiAtts = {"class": "w100"}
  if (uniq) { electorLiAtts["data-id"] = uniq }
  var box = Piv.html(parent, "li", "", electorLiAtts);


  if ("unsent" == inviteStatus) {
    var lastInvite = Object.keys(UnsentInvites)[Object.keys(UnsentInvites).length - 1] || 0
    var emailInput = Piv.html(box, "input", "", {"type": "text", "name": "email", "class": "w50"});
    UnsentInvites[++lastInvite] = {"email": emailInput, "domel": box}
    Piv.div(box, "", "clickable1", "X", "", ["click"], removeInvite, {"domel": box, "inviteKey": lastInvite})
  }
  else if ("pending" == inviteStatus) {
    PendingInvites[email] = box
    Piv.div(box, "", "", email + "(" + uniq + ")", {"class": "w50 text1"});
    Piv.div(box, "", "clickable1", "X", "", ["click"], deleteInvite, {"domel": box, "code": uniq, "email": email})
  }
  else {
    Piv.div(box, "", "", uniq + "(" + email + ")", {"class": "w50 text1"});
    Piv.div(box, "", "hidden clickable1", "X")
  }
}
function deleteInvite(params) {
  params.domel.parentElement.removeChild(params.domel)
  DeletingInvites[params.email] = params.code
  delete PendingInvites[params.email]
}
function removeInvite(params) {
  params.domel.parentElement.removeChild(params.domel)
  delete UnsentInvites[params.inviteKey]
}
function addElector() {
  electorEl(Containerdivs.unsent, "", "", "unsent")
}
function saveElectorate() {
  var invite, email
  //send new invites
  for (var i in UnsentInvites) {
    if (!UnsentInvites.hasOwnProperty(i)) continue
    invite = UnsentInvites[i]
    email = invite.email.value
    invite.domel.parentElement.removeChild(invite.domel)
    if (PendingInvites[email] || DeletingInvites[email]) {  //prevent attempts to create duplicate invites or create invites for emails that are also being deleted in this request
      delete UnsentInvites[i]
      continue
    }
    PendingInvites[email] = true
    Piv.postToResource('/api/election/' + election + '/invite', {"email": email},
      function(data){
        electorEl(Containerdivs.pending, data.code, data.email, "pending")
      })
    delete UnsentInvites[i]
  }
  //delete those marked for deletion
  for (var i in DeletingInvites) {
    if (!DeletingInvites.hasOwnProperty(i)) continue
    Piv.deleteResource('/api/election/' + election + '/invite/' + DeletingInvites[i])
    delete DeletingInvites[i]
  }
}

function loadElectorateAndInvites(electionId, onSuccessFunction) {
  Piv.getMultResources(['/api/election/' + electionId + '/elector', '/api/election/' + electionId + '/invite'], onSuccessFunction)
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
    electorEl(Containerdivs.electorate, elector.name, elector.email)
  }
}

function displayInvites(invites) {
  var invite, code, email
  for (var key in invites) {
    invite = invites[key]
    code = invite.code
    email = invite.email
    electorEl(Containerdivs.pending, code, email, "pending")
  }
}

// close the self-executing function and feed the piv library to it
})(piv)
