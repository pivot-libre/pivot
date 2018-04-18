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
View.setHeader("Electorate", ElectionId)

Piv.anchorListDiv(View.workspace, "", {
    "Add/Edit candidates": "/candidates/" + ElectionId,
    "Manage electorate": "/electorate/" + ElectionId,
    "Election details": "/administer/" + ElectionId
  }
)

Piv.removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

function newInvite(table) {
  var row = Piv.div(table, "", "w100")
  var input = Piv.html(row, "input", "", {"class": "textInput1 w75", "type": "text", "placeholder": "email"})
  Piv.evmanage.listen(input, "keyup", newInviteMaybe, [table])
  Piv.evmanage.listen(input, "paste", newInviteMaybe, [table])
  // var inviteKey = InviteList.push({"input": input, "row":row}) - 1
  // var inviteKey = Object.keys(InviteList)[Object.keys(InviteList).length - 1] + 1
  var lastKey = Number(Object.keys(InviteList)[Object.keys(InviteList).length - 1])
  var inviteKey = isNaN(lastKey) ? 0 : lastKey + 1
  InviteList[inviteKey] = {"input": input, "row":row}

  // Piv.div(row, "", "textLeft", input)
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

loadElectorate(ElectionId, displayElectorate)

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
    resources.push("/api/elections/" + ElectionId + "/invite")
    payloads.push({"email": email})
    inviteKeys.push(key)
  }

  Piv.http.post(resources, payloads, function() {
    for (var i = 0; i < arguments.length; i++) {
      removeInviteVobject(inviteKeys[i])
      var elector = arguments[i]
      makeElectorVobject(elector.invite_email, elector.invite_email, elector.id, "outstanding_invites")
    }
    repopulateElectorateStatusTable()
    SendInProgress = false
    SendInvitesButton.innerHTML = innerHtml
    Piv.removeClass(SendInvitesButton, "disabled")
  })
}

function loadElectorate(electionId, onSuccessFunction) {
  Piv.http.get([
    '/api/elections/' + electionId + '/voter_details',
  ], onSuccessFunction)
}

function electorFilters(parent, StatusMap, table) {
  for (var key in StatusMap) {
    var button = Piv.html(parent, "label", "", {"class": "clickable1"})
    if (StatusMap[key].number < 1) button.style.display = "none"
    StatusMap[key].button = button
    var checkbox = Piv.checkbox(button, "", "", "", "checked", {"class": "marginR1"})
    FilteredStatuses[key] = true;
    Piv.div(button, "", "", key + StatusMap[key].icon)
    Piv.evmanage.listen(checkbox.input, "click", filterElectorate, [checkbox.input, key, table])
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
  repopulateElectorateStatusTable(table)
}

function repopulateElectorateStatusTable() {
  var table = ElectorateTable, header = table.firstChild
  Piv.removeAllChildren(table)

  var electorVobject
  for (var key in ElectorVobjects) {
    electorVobject = ElectorVobjects[key]
    if (!FilteredStatuses[electorVobject.status]) continue
    renderElectorVobject(electorVobject, table)
  }
}

function populateElectorateStatusTable(table, electors, invites) {
  console.log(electors)

  if (FilteredStatuses["approved_current"] != false) displayElectorGroup(table, electors.approved_current, "approved_current")
  if (FilteredStatuses["approved_previous"] != false) displayElectorGroup(table, electors.approved_previous, "approved_previous")
  if (FilteredStatuses["approved_none"] != false) displayElectorGroup(table, electors.approved_none, "approved_none")
  if (FilteredStatuses["outstanding_invites"] != false) displayElectorGroup(table, electors.outstanding_invites, "outstanding_invites")
}

var SendInvitesButton, DeleteSelectedElectorsButton
function displayElectorate(electors) {
  if (!Electors) { Electors = electors }

  SendInvitesButton = Piv.div("", "", "clickable1", "Send Invites", "", "click", sendInvites, ["noe"])
  Piv.div(View.workspace, "", "textRight w75", SendInvitesButton)
  var invitesTable = Piv.div("", "invites", "incrementsCounter grabbable hasLabelFrame w100")
  Piv.div(View.workspace, "", "w100 marginB1", Piv.div("", "", "w75 textLeft", invitesTable))

  // var invitesTable = table(View.workspace, [
  //   Piv.div(),
  //   Piv.div("" , "", "text3 textLeft mainheader", "Invite"),
  //   Piv.div(),
  //   // SendInvitesButton
  // ])
  newInvite(invitesTable)

  Piv.div(View.workspace, "", "text1square")
  var electorFiltersRow = Piv.div(View.workspace, "", "row1")

  DeleteSelectedElectorsButton = Piv.div("", "", "clickable1 disabled", "Delete Selected", "", "click", deleteSelectedElectors, ["noe"])
  Piv.div(View.workspace, "", "textRight w75", DeleteSelectedElectorsButton)
  var electorateTable = ElectorateTable = Piv.div("", "electorate", "incrementsCounter hasLabelFrame w100")
  Piv.div(View.workspace, "", "w100 marginB1", Piv.div("", "", "w75 textLeft", electorateTable))

  // var electorateTable = ElectorateTable = table(View.workspace, [
  //     Piv.div("", "", "text3 textRight", ""),
  //     Piv.div("", "", "text3 textLeft mainheader", "Electors"),
  //     Piv.div("", "", "text3", ""),
  //     // DeleteSelectedElectorsButton
  // ])

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
  var elector
  for (var key in electors) {
    elector = electors[key]
    renderElectorVobject(makeElectorVobject(elector.name || elector.email, elector.email, elector.elector_id, status), table)
  }
}

// var ElectorVobjects = []
var ElectorVobjects = {}
function makeElectorVobject(name, email, elector_id, status) {
  var vobject = {
    "name": name,
    "email": email,
    "status": status,
    "elector_id": elector_id
  }
  // vobject.key = ElectorVobjects.push(vobject) - 1
  vobject.key = email
  ElectorVobjects[vobject.key] = vobject
  var row = vobject.domel = Piv.div("", "", "w100")

  Piv.div(row, "", "text3 textRight", StatusMap[status].icon)
  Piv.div(row, "", "text3 textLeft w75", name ? name + " (" + email + ")" : email)

  if ("outstanding_invites" == status) Piv.checkbox(row, "", "", "", "", {"class": "marginR1"},  clickElectorCheckbox, [vobject])

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
    resources.push("/api/elections/" + ElectionId + "/electors/" + CheckedElectorCheckboxes[key].elector_id)
    electorVobjectKeys.push(key)
  }
  Piv.http.delete(resources, function() {
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
