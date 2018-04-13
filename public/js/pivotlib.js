'use strict';
console.log("pivotlib.js")

// initialize the object for our library
var piv = piv = piv || {};  //(need the ; in order to do this syntax)

//add properties to our object within the context of a self-executing function
(function(lib) {

//pivot-specific view stuff
var view = lib.view = {};
view.workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
view.setHeader = function(text, election, delim) {
  mainheader.innerHTML = text
  if (election) {
    delim = delim || ": "
    http.get(["/api/election/" + election], function(electionDetails) {
      mainheader.innerHTML = text + delim + electionDetails.name
    })
  }
}


//load ballot
var loadBallot = lib.loadBallot = function(electionId, onSuccessFunction, perCandidateFunc, rankeditems, unrankeditems) {
  var onLoadBallotDataFunc = function(ballotDef, userRankings) {
    onSuccessFunction(ballotDef, userRankings, perCandidateFunc)
  }
  getMultResources(['/api/election/' + electionId + '/candidate', '/api/election/' + electionId + '/batchvote'], onLoadBallotDataFunc)
}
var displayBallot = lib.displayBallot = function(ballotDefinition, rankedBallot, perCandidateFunc) {
  var candidate, sortedDefinitions = {}, sortedCandidates = {}

  // make sure the containers are clear before adding candidates to them
  removeAllChildren(rankeditems)

  //if the user hasn't looked at this ballot before, we can simply display the ballot definition
  if (0 == rankedBallot.length) { dispayCandidatesWithRank("", ballotDefinition, rankeditems, unrankeditems, perCandidateFunc); return}

  //build a list of candidate definitions
  for (var key in ballotDefinition) {
    candidate = ballotDefinition[key]
    sortedDefinitions[candidate.id] = candidate
  }

  //build lists of all the candidates that were previously given each rank
  for (var key in rankedBallot) {
    candidate = rankedBallot[key]
    if (!sortedCandidates[candidate.rank]) { sortedCandidates[candidate.rank] = [] }
    sortedCandidates[candidate.rank].push(sortedDefinitions[candidate.candidate_id])
    delete sortedDefinitions[candidate.candidate_id]
  }

  //add any candidates that are new since the user last reviewed this ballot
  for (var key in sortedDefinitions) {
    candidate = sortedDefinitions[key]
    if (!sortedCandidates[""]) { sortedCandidates[""] = [] }
    sortedCandidates[""].push(candidate)
  }
  for (var rank in sortedCandidates) {
    dispayCandidatesWithRank(rank, sortedCandidates[rank], rankeditems, unrankeditems, perCandidateFunc)
  }
}
var dispayCandidatesWithRank = lib.dispayCandidatesWithRank = function(rank, candidates, rankeditems, unrankeditems, perCandidateFunc) {
  var candidate
  for (var key in candidates) {
    candidate = candidates[key]
    //if not ranked, it goes in the unranked group
    if (!rank || 0 == rank) { perCandidateFunc(unrankeditems, candidate.id, candidate.name, "", ("" == rank ? "new": "")); continue }

    //if length is 1, it is not a tie
    if (1 == candidates.length) { perCandidateFunc(rankeditems, candidate.id, candidate.name); continue }

    //handle ties:
    //if length is greater than 1 and this is the first key, we are at the start of a tie
    if (0 == key) { perCandidateFunc(rankeditems, candidate.id, candidate.name, "start"); continue }

    //if this is not the last key, we are in the middle of a tie
    if (key < candidates.length - 1) { perCandidateFunc(rankeditems, candidate.id, candidate.name, "middle"); continue }

    //if we've gotten this far, we must be at the end of a tie
    perCandidateFunc(rankeditems, candidate.id, candidate.name, "end")
  }
}

var evmanage = lib.evmanage = {};
(function(evmanage) {
  var handlers = {}
  evmanage.listen = function(domel, ename, func, args) {
    if (!(domel instanceof Element)) return
    if (!ename) return
    if (!(func instanceof Function)) return
    domel.setAttribute("data-elisten-" + ename, true)
    var domelDataKey = domeldata.getKey(domel)
    handlers[domelDataKey] = handlers[domelDataKey] || {}
    handlers[domelDataKey][ename] = {}
    handlers[domelDataKey][ename].func = func
    handlers[domelDataKey][ename].args = args
  }
  evmanage.bubble = function(e) {
    var currentTarget = e.target, etype = e.type, eContext = {}, log
    eContext.log = []
    do {
      currentTarget = currentTarget.closest("[data-elisten-" + etype + "]")
      if (currentTarget) {
        var func = handlers[domeldata.getKey(currentTarget)][etype].func
        var args = handlers[domeldata.getKey(currentTarget)][etype].args
        if (args) {
          log = func.apply({"event": e, "domel": currentTarget, "eContext": eContext}, args)
        }
        else {
          log = func()
        }
        eContext.log.push(log || func)
      }
      if (currentTarget && currentTarget === currentTarget) currentTarget = currentTarget.parentElement  //noe - hacky way to avoid an infinite loop
    }
    while (currentTarget != null);
  }
  // sets actual js event listeners
  evmanage.setJsListeners = function(domel, evnames, evhandler, data) {
    // if (arguments.length < 3) { return }
    // var handler = function() { evhandler.call(domel, data) }
    var handler = function(e) { evhandler.call(domel, e, data) }
    for (var i = 0; i < evnames.length; i++) {
      domel.addEventListener(evnames[i], handler)
    }
  }
  evmanage.setManager = function(domel, evnames, handler) {
    if (!evnames) return
    domel == domel || document
    handler = handler || function(e) { evmanage.bubble(e) }
    evmanage.setJsListeners(domel , evnames, handler )
  }
})(evmanage)

// dom manipulation
// var libElProtoKey = lib.libElProtoKey = "pivot";
// Element.prototype[libElProtoKey] = {}
// var domelData = lib.domelData = "pivot";
// Element.prototype[domelData] = {}
var domeldata = lib.domeldata = {};
(function(domeldata) {
  var key, data = [], evt = new CustomEvent("domelData")

  // bindDomelToKey: creates a way for getKey() to look up a key to data[], given a domel
  var bindDomelToKey = domeldata.bindDomelToKey = function(domel, domelDataKey) {
    //data-addribute based:
    domel.setAttribute("data-datakey", domelDataKey)
    // //event-based
    // domel.addEventListener("domelData", function() {
    //   key = domelDataKey || undefined
    // })
    return domelDataKey
  }
  //     getkey: gets key
  //side effect: sets key
  var getKey = domeldata.getKey = function(domel) {
    //data-addribute based:
    key = domel.getAttribute("data-datakey") || undefined
    // //event-based
    // key = undefined
    // domel.dispatchEvent(evt)

    return key || bindDomelToKey(domel, data.push({}) - 1) //if key is undefined, push to data[], and bind to the new key
  }
  domeldata.set = function(domel, val, prop) {
    key = getKey(domel)
    if (prop) {
      if (data[key] !== Object(data[key])) data[key] = {}  //set it to an object if it was previously a primitive
      data[key][prop] = val
    }
    else {
      data[key] = val
    }
  }
  domeldata.get = function(domel, prop) {
    key = getKey(domel)
    if (prop) {return data[key][prop]}
    else {return data[key]}
  }
  domeldata.data = function() {
    console.log(data)
    console.log(key)
  }
})(domeldata)

var div = lib.div = function(parent, id, classes, innerHtml, attributes, evnames, evhandler, evargs) {
  attributes = attributes || {}
  if (id) attributes.id = id
  if (classes) attributes.class = classes
  return html(parent, "div", innerHtml, attributes, evnames, evhandler, evargs)
}
var html = lib.html = function(parent, tag, innerHtml, attributes, evnames, evhandler, evargs) {
  var i, attString, html, attribute
  html = document.createElement(tag)

  // if (evnames) { doOnEvents(html, evnames, evhandler, evargs) }
  if (evnames) { evmanage.listen(html, evnames, evhandler, evargs) }

  if (innerHtml instanceof Element) { html.appendChild(innerHtml) }
  else { html.innerHTML = (innerHtml || innerHtml === 0) ? innerHtml : "" }

  for (attribute in attributes) {
    if (!attributes.hasOwnProperty(attribute)) continue
    html.setAttribute(attribute, attributes[attribute])
  }
  if (parent) parent.appendChild(html)
  return html
}

//helpers
var removeHrefsForCurrentLoc = lib.removeHrefsForCurrentLoc = function(removeContainer) {
  var isUrlMatch = false
  var hrefEls = document.querySelectorAll("[href]")
  var currentHref = window.location.href
  for (var i = 0; i < hrefEls.length; i++) {
    isUrlMatch = (canonicalize(hrefEls[i].href) == currentHref) || (window.location.pathname == "/" && window.location.protocol + "//" + window.location.host + "/myElections" == canonicalize(hrefEls[i].href))

    if (!isUrlMatch) continue  //skip this anchor if the url doesn't match

    if (removeContainer) { hrefEls[i].parentElement.removeChild(hrefEls[i]) }
    else { hrefEls[i].removeAttribute("href") }
  }
}
var anchorListDiv = lib.anchorListDiv = function(parent, classes, labelsAndHrefs) {
  var stepNavigator = div(parent, "", classes);
  for (var label in labelsAndHrefs) {
    var href = labelsAndHrefs[label]
    html(stepNavigator, "a", label, {"href": href});
  }
}
var ordinalSuffix = lib.ordinalSuffix = function(i) {
  //(got this here: https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number)
  var j = i % 10, k = i % 100;
  if (j == 1 && k != 11) { return i + "st"; }
  if (j == 2 && k != 12) { return i + "nd"; }
  if (j == 3 && k != 13) { return i + "rd"; }
  return i + "th";
}
var insertAfter = lib.insertAfter = function(el, afterEl) {
  if (afterEl.nextElementSibling) { afterEl.parentNode.insertBefore(el, afterEl.nextElementSibling); }
  else {afterEl.parentNode.appendChild}
}
var canonicalize = lib.canonicalize = function(url) {
  //(got this here: https://stackoverflow.com/questions/14780350/convert-relative-path-to-absolute-using-javascript)
  var div = document.createElement('div');
  div.innerHTML = "<a></a>";
  div.firstChild.href = url; // Ensures that the href is properly escaped
  div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
  return div.firstChild.href;
}

var http = lib.http = {}
// lib.http.post1('/api/election/2/invite', {"email": "nathan.eckberg@gmail.com"})
// lib.http.post1('/api/invite/accept', {"code": "e2562a8a"})
var httpMultiple = lib.http.send = function(method, resources, payloads, onSuccess, onFail) {

  var exFuncAry = function() {
    var funcReturns = []
    for (var i in resources) { funcReturns.push( axios[method](resources[i], payloads[i]) ) }
    return funcReturns
  }

  //default onSuccess and onFail functions
  onSuccess = onSuccess || function() {
    console.group("httpMultiple:");
    for (var i in arguments) { console.log(arguments[i]) }
    console.groupEnd()
  };
  onFail = onFail || function(error) {
      console.group("httpMultiple error:");
      console.log(error);
      console.groupEnd()
  }

  var thenFunc = function () {
    var responseData = []
    for (var i in arguments){ responseData.push(arguments[i].data) }
    onSuccess.apply(null, responseData)
  }

  axios.all(exFuncAry())
    .then(axios.spread(thenFunc))
    .catch(onFail);
}
var getMultResources = lib.http.get = function(resources, onSuccess, onFail) {
  httpMultiple("get", resources, "", onSuccess, onFail)
}
var postToMultResources = lib.http.post = function(resources, payloads, onSuccess, onFail) {
  httpMultiple("post", resources, payloads, onSuccess, onFail)
}
var deleteMultResources = lib.http.delete = function(resources, onSuccess, onFail) {
  httpMultiple("delete", resources, "", onSuccess, onFail)
}
var onAxiosError = function(resource, payload, onSuccess, error) {
  console.group("error");
  console.log(resource);
  console.log(payload);
  console.log(onSuccess);
  console.log(error);
  console.groupEnd()
}

var hasClass = lib.hasClass = function(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
var addClass = lib.addClass = function(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}
var removeClass = lib.removeClass = function(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}
var getStyle = lib.getStyle = function(className) {
    var classes = document.styleSheets[0].rules || document.styleSheets[0].cssRules;
    for (var x = 0; x < classes.length; x++) {
        if (classes[x].selectorText == className) {
            (classes[x].cssText) ? console.log(classes[x].cssText) : console.log(classes[x].style.cssText);
        }
    }
}
var removeAllChildren = lib.removeAllChildren = function(domel) {
  while (domel.lastChild) { domel.removeChild(domel.lastChild) }
}

var makeVobjectCollection = lib.makeVobjectCollection = function() {
  var collection = {}
  collection.list = []
  collection.indexes = {}
  collection.push = function(vobject, status) {
    status = (status || vobject.status) || "current"
    vobject.index = collection.list.push(vobject) - 1
    vobject.status = status
    lib.setTreeData(collection, ["indexes", status, vobject.index], vobject)
    return vobject.index
  }
  collection.status = function(vobject, status) {
    if (!status) return vobject.status  //don't do anything if the status is unchanged
    if (status == vobject.status) return status  //don't do anything if the status is the same as before
    delete collection.indexes[vobject.status][vobject.index]  //delete the entry for this vobject in the old index
    lib.setTreeData(collection, ["indexes", status, vobject.index], vobject)  //add an entry for this vobject in the new index
    vobject.status = status  //update the status field on the vobject
    return status
  }
  collection.remove = function(vobject) {
    var status = vobject.status
    if (!status) return
    delete collection.indexes[vobject.status][vobject.index]  //delete the entry for this vobject in whatever index it's in
    vobject.status = false  //noe this needs to be improved
  }
  collection.reset = function() {
    collection.list = []
    collection.indexes = {}
  }
  collection.length = function(status) {
    if (!status) return collection.list.length
    if (!collection.indexes[status]) return undefined
    return Object.keys(collection.indexes[status]).length
  }
  return collection
}

var setTreeData = lib.setTreeData = function(obj, keys, value, push) {
  var keyName, key, keysLength = keys.length
  if (!obj) obj = {}
  var objCursor = obj;  //keep our reference to the original obj
  //make sure all of the keys are populated (except for the last one, since we can set that directly afterwards)
  for (key = 0; key < keysLength - 1; key++) {
    keyName = keys[key];
    if (!objCursor[keyName]) {objCursor[keyName] = {};}
    objCursor = objCursor[keyName];
  }

  //set the actual value on the last key
  //check if we are wanting to just set the value, or if we want to push to an array
  if ("push" != push) {objCursor[keys[key]] = value; return obj;}

  //if an array doesn't already exist, create it
  if (!Array.isArray(objCursor[keys[key]])) {objCursor[keys[key]] = [];}
  objCursor[keys[key]].push(value);

  return obj;
}

lib.checkbox = function(parent, id, name, size, checked, labelatts, evhandler, evargs) {
  var vobject = {}, label, input, atts = {}, ui
  label = vobject.label = html("", "label", "", labelatts)
  atts.type = "checkbox"
  atts.style = "display:none;"
  if (id) atts.id = id
  if (name) atts.name = name
  input = vobject.input = html(label, "input", "", atts, "click", evhandler, evargs)
  if (checked) input.checked = true
  ui = html(label, "div", "", {"class": "checkboxUI0"})
  // size = size || "16px";
  if (size) {
    ui.style.width = size
    ui.style.height = size
    ui.style["line-height"] = size
    ui.style["font-size"] = size
  }
  parent.appendChild(label)
  return vobject
}

lib.table = function(parent, columnHeaders, atts) {
  var table = div(parent, "", "", "", atts)  // create the table
  addClass(table, "table")
  div(parent, "", "row1", div("", "", "", table))  //add the table to a row in the workspace
  if (!columnHeaders || columnHeaders.length < 1) return table
  var row0 = div(table)
  for (var i = 0; i < columnHeaders.length; i++) { row0.appendChild(columnHeaders[i]) }
  return table
}

//feed our object to the function so that we can populate it with properties
})(piv)
