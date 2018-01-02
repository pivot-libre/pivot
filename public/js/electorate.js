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
var containerdivs = {}
containerdivs.electorate = div(edititems, "", "w100", "Current Electorate")
containerdivs.pending = div(edititems, "", "w100", "Pending Invites")
containerdivs.unsent = div(edititems, "", "w100", "Unsent Invites")

div(workspace, "AddCandidate", "button1Item", "+ New Invite", "onclick=addElector()");
div(workspace, "SaveElection", "button1Item", "Save Invites", "onclick=saveElectorate()");
// checkboxWithLabel(workspace, "checked=checked", "sendEmails", "Send emails to new users", "checkLabel2 button1Item");

loadElectorateAndInvites(election, displayElectorateAndInvites)
// loadElectorate(election, displayElectorate)
// loadInvites(election, displayInvites)

var unsentInvites = {}
var deletingInvites = {}
var pendingInvites = {}
function electorEl(parent, uniq, email, inviteStatus) {
  var checked
  var id = uniq ? "data-id=" + uniq : ""
  var box = html(parent, "li", "", "class=candidate", id);

  var details = html(box, "form", "", "class=candidateDetails", "action=javascript:;");

  var candidateDescription = div(details, "", "userDescription");
  // var email = html(candidateDescription, "input", "", "type=text", "value=" + description, "placeholder=email", "name=email");

  if ("unsent" == inviteStatus) {
    var lastInvite = Object.keys(unsentInvites)[Object.keys(unsentInvites).length - 1] || 0
    var emailInput = html(candidateDescription, "input", "", "type=text", "name=email");
    unsentInvites[++lastInvite] = {"email": emailInput, "domel": box}
    div(box, "", "banish", "", "onclick=removeInvite(this.parentElement, " + lastInvite + ")");
  }
  else if ("pending" == inviteStatus) {
    pendingInvites[email] = box
    html(candidateDescription, "input", "", "type=text", "value=" + email + "(" + uniq + ")", "placeholder=email", "name=email", "disabled=true");
    div(box, "", "banish", "", "onclick=deleteInvite(this.parentElement, '" + uniq + "', '" + email + "')");
  }
  else {
    html(candidateDescription, "input", "", "type=text", "value=" + uniq + "(" + email + ")", "placeholder=email", "name=email", "disabled=true");
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
function checkboxWithLabel(parent, checked, name, label, labelClass = "checkLabel button1Item") {
  label = html(parent, "label", label, "class=" + labelClass);
  html(label, "input", "", "type=checkbox", checked, "name=" + name);
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
    console.log(election)
    console.log(email)
    postToResource('/api/election/' + election + '/invite', {"email": email},
      function(data){
        console.log(data)
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

// function loadElectorate(electionId, onSuccessFunction) {
//   if (!electionId) {return}
//   axios.get('/api/election/' + electionId + "/elector")
//     .then(response => {
//       // console.log(response.data);
//       onSuccessFunction(response.data)
//     });
// }
function displayElectorateAndInvites(electorate, invites) {
  displayElectorate(electorate)
  displayInvites(invites)
}
function displayElectorate(electorate) {
  console.log(electorate);
  if (!electorate.length) return
  // div(containerdivs.electorate, "", "", "Current Electorate")
  var elector
  for (var key in electorate) {
    elector = electorate[key]
    // electorEl(containerdivs.electorate, "", elector.name + " (" + elector.email + ")")
    electorEl(containerdivs.electorate, elector.name, elector.email)
  }
}

// function loadInvites(electionId, onSuccessFunction) {
//   if (!electionId) {return}
//   axios.get('/api/election/' + electionId + "/invite")
//     .then(response => {
//       // console.log(response.data);
//       onSuccessFunction(response.data)
//     });
// }
function displayInvites(invites) {
  console.log(invites);
  // if (!invites.length) {
  //   div(containerdivs.unsent, "", "", "Unsent Invites")
  //   return
  // }
  // div(containerdivs.pending, "", "", "Pending Invites")
  var invite, code, email
  for (var key in invites) {
    invite = invites[key]
    code = invite.code
    email = invite.email
    // pendingInvites[email] = electorEl(containerdivs.pending, code, email + " (" + code + ")", "pending")
    electorEl(containerdivs.pending, code, email, "pending")
  }
  // div(containerdivs.unsent, "", "", "Unsent Invites")
}
