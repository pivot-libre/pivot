'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {

// script-level variables
var View = Piv.view
var InviteList = {}
var FilteredStatuses = {}
var Electors, Invites
var ElectorateTable
var StatusMap = {
  "approved_current": {"icon": "&#x2705;"},
  "approved_previous": {"icon": "&#x1F55D;"},
  "approved_none": {"icon": "&#x2B55;"},
  "outstanding_invites": {"icon": "&#x270B;"}
}

// actions (do stuff)
Piv.evmanage.setManager(View.workspace, ["click", "keyup", "paste"])
View.setHeader("Electorate")

Piv.anchorListDiv(View.workspace, "", {
    "Election details": "/administer/" + ElectionId,
    "Add/Edit candidates": "/candidates/" + ElectionId,
    "Manage electorate": "/electorate/" + ElectionId
  }
)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

function newInvite(table) {
  var row = Piv.div(table)
  var input = Piv.html("", "input", "", {"class": "w100", "type": "text", "placeholder": "email"})
  Piv.evmanage.listen(input, "keyup", newInviteMaybe, [table])
  Piv.evmanage.listen(input, "paste", newInviteMaybe, [table])
  // var inviteKey = InviteList.push({"input": input, "row":row}) - 1
  // var inviteKey = Object.keys(InviteList)[Object.keys(InviteList).length - 1] + 1
  var lastKey = Number(Object.keys(InviteList)[Object.keys(InviteList).length - 1])
  var inviteKey = isNaN(lastKey) ? 0 : lastKey + 1
  InviteList[inviteKey] = {"input": input, "row":row}

  Piv.div(row)
  Piv.div(row, "", "textLeft", input)
  Piv.div(row, "", "clickable2", "X", "", "click", removeInviteVobject, [inviteKey])
  // TheTable.insertBefore(row, ElectorateHeaderRow)
}
function newInviteMaybe(table) {
  var input = this.domel, lastrow
  var lastKey = Number(Object.keys(InviteList)[Object.keys(InviteList).length - 1])
  if (this.domel.value) {
    if (input == InviteList[lastKey].input) newInvite(table)
    // if (input == InviteList[InviteList.length - 1].input) newInvite()
  }
  else {
    if (Object.keys(InviteList).length < 2) return
    // if (InviteList.length < 2) return
    var nextToLastKey = Number(Object.keys(InviteList)[Object.keys(InviteList).length - 2])
    if (this.domel == InviteList[nextToLastKey].input) {
    // if (this.domel == InviteList[InviteList.length - 2].input) {
      lastrow = InviteList[lastKey].row
      // lastrow = InviteList[InviteList.length - 1].row
      lastrow.parentElement.removeChild(lastrow)
      delete InviteList[lastKey]
      // InviteList.pop()
    }
  }
}

loadElectorateAndInvites(ElectionId, displayElectorateAndInvites)

function removeInviteVobject(inviteKey) {
  var invite = InviteList[inviteKey]
  var invitesLength = Object.keys(InviteList).length
  if (invitesLength < 2) return

  if (!invite) return
  if (!invite.input.value) return  // don't delete the last input box if it is blank, because people might be confused about how to get it back
  delete InviteList[inviteKey]
  // InviteList.splice(inviteKey, 1)
  // if (invitesLength < 2) return
  // if (InviteList.length < 2) return
  invite.row.parentElement.removeChild(invite.row)
}

var SendInProgress
function sendInvites() {
  if (SendInProgress) {
    console.log("Send in progress")
    return
  }
  if (Piv.hasClass(this.domel, "disabled")) return
  SendInProgress = true
  Piv.addClass(SendInvitesButton, "disabled")
  var innerHtml = SendInvitesButton.innerHTML
  SendInvitesButton.innerHTML = "Sending Invites..."

  var email, emails = {}
  var resources = [], payloads = [], inviteKeys = []
  for (var key in InviteList) {
    email = InviteList[key].input.value
    if (!email) continue
    if (emails[email] || ElectorVobjects[email]) {
      removeInviteVobject(key)
      continue
    }
    emails[email] = true
    resources.push("/api/election/" + ElectionId + "/invite")
    payloads.push({"email": email})
    inviteKeys.push(key)
  }

  Piv.postToMultResources(resources, payloads, function() {
    for (var i = 0; i < arguments.length; i++) {
      removeInviteVobject(inviteKeys[i])
      makeElectorVobject("", arguments[i].email, arguments[i].code, "outstanding_invites")
    }
    repopulateElectorateStatusTable()
    SendInProgress = false
    SendInvitesButton.innerHTML = innerHtml
    Piv.removeClass(SendInvitesButton, "disabled")
  })
}

function loadElectorateAndInvites(electionId, onSuccessFunction) {
  Piv.getMultResources([
    '/api/election/' + electionId + '/voter_details',
    '/api/election/' + electionId + '/invite',
    // '/api/election/' + electionId + '/elector',
  ], onSuccessFunction)
}
function electorFilters(parent, StatusMap, table) {
  for (var key in StatusMap) {
    var button = Piv.html(parent, "label", "", {"class": "clickable1"})
    // var button = Piv.div(row, "", "clickable1")
    var checkbox = Piv.html(button, "input", "", {"type": "checkbox"})
    checkbox.checked = FilteredStatuses[key] = true;
    // Piv.div(button, "", "checkbox1", "&#9745; ")
    // Piv.div(button, "", "", key + "(" + StatusMap[key].number + ")" + StatusMap[key].icon)
    Piv.div(button, "", "", key + StatusMap[key].icon)
    Piv.evmanage.listen(checkbox, "click", filterElectorate, [checkbox, key, table])
  }
}
function table(parent, columnHeaders) {
  var table = Piv.div("", "", "table")  // create the table
  Piv.div(parent, "", "row1", Piv.div("", "", "", table))  //add the table to a row in the worspace
  if (!columnHeaders || columnHeaders.length < 1) return
  var row0 = Piv.div(table)
  for (var i = 0; i < columnHeaders.length; i++) { row0.appendChild(columnHeaders[i]) }
  return table
}
function filterElectorate(checkbox, key, table) {
  FilteredStatuses[key] = checkbox.checked
  // populateElectorateStatusTable(table, Electors, Invites)
  repopulateElectorateStatusTable(table)
}
function repopulateElectorateStatusTable() {
  var table = ElectorateTable, header = table.firstChild
  Piv.removeAllChildren(table)
  if (header) table.appendChild(header)
  var electorVobject
  for (var key in ElectorVobjects) {
    electorVobject = ElectorVobjects[key]
    if (!FilteredStatuses[electorVobject.status]) continue
    renderElectorVobject(electorVobject, table)
  }
}
function populateElectorateStatusTable(table, electors, invites) {
  // var header = table.firstChild
  // Piv.removeAllChildren(table)
  // if (header) table.appendChild(header)

  if (FilteredStatuses["approved_current"] != false) displayElectorGroup(table, electors.approved_current, "approved_current")
  if (FilteredStatuses["approved_previous"] != false) displayElectorGroup(table, electors.approved_previous, "approved_previous")
  if (FilteredStatuses["approved_none"] != false) displayElectorGroup(table, electors.approved_none, "approved_none")
  // displayElectorGroup(TheTable, electors.outstanding_invites, "outstanding_invites")
  if (FilteredStatuses["outstanding_invites"] != false) displayInvites(table, invites)
}
var SendInvitesButton, DeleteSelectedElectorsButton
function displayElectorateAndInvites(electors, invites) {
  if (!Electors) { Electors = electors, Invites = invites }

  SendInvitesButton = Piv.div("", "", "clickable1", "Send Invites", "", "click", sendInvites, ["noe"])
  var invitesTable = table(View.workspace, [
    Piv.div(),
    Piv.div("" , "", "text3 textLeft mainheader", "Invite"),
    Piv.div(),
    SendInvitesButton
  ])
  newInvite(invitesTable)

  Piv.div(View.workspace, "", "text1square")
  var electorFiltersRow = Piv.div(View.workspace, "", "row1", "hey")
  DeleteSelectedElectorsButton = Piv.div("", "", "clickable1 disabled", "Delete Selected", "", "click", deleteSelectedElectors, ["noe"])
  var electorateTable = ElectorateTable = table(View.workspace, [
      Piv.div("", "", "text3 textRight", ""),
      Piv.div("", "", "text3 textLeft mainheader", "Electors"),
      Piv.div("", "", "text3", ""),
      DeleteSelectedElectorsButton
  ])

  StatusMap["approved_current"].number = electors["approved_current"].length
  StatusMap["approved_previous"].number = electors["approved_previous"].length
  StatusMap["approved_none"].number = electors["approved_none"].length
  StatusMap["outstanding_invites"].number = electors["outstanding_invites"].length
  electorFilters(electorFiltersRow, StatusMap, electorateTable)
  populateElectorateStatusTable(electorateTable, electors, invites)

  //prevent column widths from resizing when the user adds or deletes electors
  var child
  for (var i = 0; i < electorateTable.firstChild.children.length; i++) {
    child = electorateTable.firstChild.children[i]
    child.style.width = child.offsetWidth + "px"
  }
}
function displayElectorGroup(table, electors, status) {
  if (!electors.length) return
  var elector
  for (var key in electors) {
    elector = electors[key]
    renderElectorVobject(makeElectorVobject(elector.name || "", elector.email, "", status), table)
  }
}
function displayInvites(table, invites) {
  var invite, code, email
  for (var key in invites) {
    invite = invites[key]
    code = invite.code
    email = invite.email
    renderElectorVobject(makeElectorVobject("", email, code, "outstanding_invites"), table)
  }
}
// var ElectorVobjects = []
var ElectorVobjects = {}
function makeElectorVobject(name, email, code, status) {
  var vobject = {
    "name": name,
    "email": email,
    "code": code,
    "status": status
  }
  // vobject.key = ElectorVobjects.push(vobject) - 1
  vobject.key = email
  ElectorVobjects[vobject.key] = vobject
  var row = vobject.domel = Piv.div()

  Piv.div(row, "", "text3 textRight", StatusMap[status].icon)
  Piv.div(row, "", "text3 textLeft", name ? name + " (" + email + ")" : email)
  if (code) Piv.html(row, "input", "", {"type": "checkbox"}, "click", clickElectorCheckbox, [vobject])
  return vobject
}
function renderElectorVobject(vobject, parent) {
  if (parent) {
    parent.appendChild(vobject.domel)
    vobject.parent = parent
  }
  else if (vobject.parent) { vobject.parent.appendChild(vobject.domel) }
}
function removeElectorVobject(vobject) {
  delete CheckedElectorCheckboxes[vobject.key]
  delete ElectorVobjects[vobject.key]
  if (vobject.domel.parentElement) vobject.domel.parentElement.removeChild(vobject.domel)
}
var CheckedElectorCheckboxes = {}
Piv.CheckedElectorCheckboxes = CheckedElectorCheckboxes
function clickElectorCheckbox(vobject) {
  if (this.domel.checked) { CheckedElectorCheckboxes[vobject.key] = vobject }
  else { delete CheckedElectorCheckboxes[vobject.key] }
  updateDeleteSelectedElectorsButton()
}
function updateDeleteSelectedElectorsButton() {
  if (Object.keys(CheckedElectorCheckboxes).length < 1) { Piv.addClass(DeleteSelectedElectorsButton, "disabled") }
  else { Piv.removeClass(DeleteSelectedElectorsButton, "disabled") }
}
var DeletionInProgress
function deleteSelectedElectors() {
  if (DeletionInProgress) {
    console.log("Deletion in progress")
    return
  }
  if (Piv.hasClass(this.domel, "disabled")) return
  DeletionInProgress = true
  Piv.addClass(DeleteSelectedElectorsButton, "disabled")
  var innerHtml = DeleteSelectedElectorsButton.innerHTML
  DeleteSelectedElectorsButton.innerHTML = "Deleting..."

  var resources = [], electorVobjectKeys = []
  for (var key in CheckedElectorCheckboxes) {
    resources.push("/api/election/" + ElectionId + "/invite/" + CheckedElectorCheckboxes[key].code)
    electorVobjectKeys.push(key)
  }
  Piv.deleteMultResources(resources, function() {
    for (var i = 0; i < arguments.length; i++) {
      removeElectorVobject(CheckedElectorCheckboxes[electorVobjectKeys[i]])
    }
    updateDeleteSelectedElectorsButton()
    DeletionInProgress = false
    DeleteSelectedElectorsButton.innerHTML = innerHtml
  })
}

// close the self-executing function and feed the piv library to it
})(piv, election)
