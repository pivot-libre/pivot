'use strict';

//create a file-specific context via a function
(function(piv) {

var view = piv.view
view.setHeader("Electorate")

piv.anchorListDiv(view.workspace, "", {
    "Election details": "/administer/" + election,
    "Add/Edit candidates": "/candidates/" + election,
    "Manage electorate": "/electorate/" + election
  }
)

piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var edititems = piv.html(view.workspace, "ol", "", {"id": "edititems", "class": "itemlist"})
var containerdivs = {}
containerdivs.electorate = piv.html(view.workspace, "ol", "", {"id": "electorateUl", "class": "itemlist hasLabelFrame"});
containerdivs.pending = piv.html(view.workspace, "ul", "", {"id": "pendingUl", "class": "itemlist hasLabelFrame"});
containerdivs.unsent = piv.html(view.workspace, "ul", "", {"id": "unsentUl", "class": "itemlist hasLabelFrame"});

piv.div(view.workspace, "AddCandidate", "button1Item", "+ New Invite", "", ["click"], addElector)
piv.div(view.workspace, "SaveElection", "button1Item", "Save Invites", "", ["click"], saveElectorate)

loadElectorateAndInvites(election, displayElectorateAndInvites)

var unsentInvites = {}
var deletingInvites = {}
var pendingInvites = {}
function electorEl(parent, uniq, email, inviteStatus) {
  var checked
  var electorLiAtts = {"class": "w100"}
  if (uniq) { electorLiAtts["data-id"] = uniq }
  var box = piv.html(parent, "li", "", electorLiAtts);


  if ("unsent" == inviteStatus) {
    var lastInvite = Object.keys(unsentInvites)[Object.keys(unsentInvites).length - 1] || 0
    var emailInput = piv.html(box, "input", "", {"type": "text", "name": "email", "class": "w50"});
    unsentInvites[++lastInvite] = {"email": emailInput, "domel": box}
    piv.div(box, "", "clickable1", "X", "", ["click"], removeInvite, {"domel": box, "inviteKey": lastInvite})
  }
  else if ("pending" == inviteStatus) {
    pendingInvites[email] = box
    piv.div(box, "", "", email + "(" + uniq + ")", {"class": "w50 text1"});
    piv.div(box, "", "clickable1", "X", "", ["click"], deleteInvite, {"domel": box, "code": uniq, "email": email})
  }
  else {
    piv.div(box, "", "", uniq + "(" + email + ")", {"class": "w50 text1"});
    piv.div(box, "", "hidden clickable1", "X")
  }
}
function deleteInvite(params) {
  params.domel.parentElement.removeChild(params.domel)
  deletingInvites[params.email] = params.code
  delete pendingInvites[params.email]
}
function removeInvite(params) {
  params.domel.parentElement.removeChild(params.domel)
  delete unsentInvites[params.inviteKey]
}
function addElector() {
  electorEl(containerdivs.unsent, "", "", "unsent")
}
function saveElectorate() {
  var invite, email
  //send new invites
  for (var i in unsentInvites) {
    if (!unsentInvites.hasOwnProperty(i)) continue
    invite = unsentInvites[i]
    email = invite.email.value
    invite.domel.parentElement.removeChild(invite.domel)
    if (pendingInvites[email] || deletingInvites[email]) {  //prevent attempts to create duplicate invites or create invites for emails that are also being deleted in this request
      delete unsentInvites[i]
      continue
    }
    pendingInvites[email] = true
    piv.postToResource('/api/election/' + election + '/invite', {"email": email},
      function(data){
        electorEl(containerdivs.pending, data.code, data.email, "pending")
      })
    delete unsentInvites[i]
  }
  //delete those marked for deletion
  for (var i in deletingInvites) {
    if (!deletingInvites.hasOwnProperty(i)) continue
    piv.deleteResource('/api/election/' + election + '/invite/' + deletingInvites[i])
    delete deletingInvites[i]
  }
}

function loadElectorateAndInvites(electionId, onSuccessFunction) {
  piv.getMultResources(['/api/election/' + electionId + '/elector', '/api/election/' + electionId + '/invite'], onSuccessFunction)
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

// close the self-executing function and feed the piv library to it
})(piv)
