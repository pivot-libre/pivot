'use strict';
console.log("pivotlib.js")

// initialize the object for our library
var piv = piv = piv || {};  //(need the ; in order to do this syntax)

//add properties to our object within the context of a self-executing function
(function(lib) {

//pivot-specific view stuff
var view = lib.view = {};
view.workspace = document.querySelector(".workspace")
view.statusbar = document.querySelector("#statusbar")
view.sidenav = document.querySelector("#sidenav")
var mainheader = document.querySelector(".mainheader")
view.setHeader = function(text, election, delim) {
  mainheader.innerHTML = text
  if (election) {
    delim = delim || ": "
    http.get(["/api/elections/" + election], function(electionDetails) {
      mainheader.innerHTML = text + delim + electionDetails.name
    })
  }
}


//load ballot
var loadBallot = lib.loadBallot = function(electionId, onSuccessFunction, perCandidateFunc, rankeditems, unrankeditems) {
  var onLoadBallotDataFunc = function(ballotDef, userRankings) {
    onSuccessFunction(ballotDef, userRankings, perCandidateFunc, rankeditems, unrankeditems)
  }
  getMultResources(['/api/elections/' + electionId + '/candidates', '/api/elections/' + electionId + '/batchvote'], onLoadBallotDataFunc)
}
var displayBallot = lib.displayBallot = function(ballotDefinition, rankedBallot, perCandidateFunc, rankeditems, unrankeditems) {
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
var electionsMenu = lib.electionsMenu = function(parent, electionId) {
  navitem(parent, "Add/Edit candidates", "/candidates/" + electionId, '<svg width="200pt" height="200pt" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg"><g><path d="M 93.55 0 L 106.44 0 C 113.91 0.96 121.5 1.28 128.78 3.37 C 149.09 8.41 168.49 18.75 182.3 34.7 C 192.26 46.05 198.69 60.47 200 75.56 L 200 83.46 C 199.02 98.45 192.91 112.83 183.32 124.33 C 170.39 139.85 152.16 150.53 132.74 155.7 C 128.49 156.96 123.66 157.15 120.18 160.2 C 107.18 170.86 94.03 181.33 80.98 191.94 C 77.74 194.48 74.5 197.05 71.61 200 L 70.89 200 C 71.01 185.74 71.15 171.45 70.85 157.2 C 67.43 155.64 63.67 155.07 60.15 153.78 C 41.51 147.16 24.23 135.56 12.79 119.22 C 5.59 108.99 1.18 96.89 0 84.43 L 0 74.58 C 1.5 61.54 6.52 48.95 14.56 38.56 C 27.8 21.32 47.45 9.77 68.26 4.17 C 76.48 1.65 85.08 1.04 93.55 0 Z M 55.39 93.61 C 59.05 97.77 64.46 99.68 69.85 100.2 C 70.35 108.82 69.63 117.48 70.2 126.11 C 76.53 113.61 81.76 100.56 88.06 88.04 C 89.99 84.41 90.39 80.14 89.64 76.13 C 87.95 67.07 79.3 59.76 70 60.02 C 61.76 59.79 53.99 65.49 51.18 73.13 C 48.63 80.04 50.24 88.3 55.39 93.61 Z M 115.39 93.61 C 119.05 97.77 124.45 99.69 129.85 100.2 C 130.36 108.82 129.62 117.49 130.2 126.11 C 136.63 113.38 141.98 100.1 148.38 87.35 C 152.42 78.88 148.64 68.1 140.83 63.21 C 132.87 57.75 121.05 59.49 114.91 66.91 C 108.26 74.21 108.4 86.57 115.39 93.61 Z"/></g></svg>')
  navitem(parent, "Manage electorate", "/electorate/" + electionId, '<svg width="200pt" height="200pt" viewBox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d=" M 90.44 17.62 C 98.91 15.50 108.10 16.28 116.04 19.95 C 125.76 24.35 133.51 32.84 137.06 42.90 C 140.16 51.50 140.10 61.20 136.80 69.73 C 132.84 80.22 124.20 88.83 113.68 92.72 C 102.38 97.00 89.09 95.68 78.96 89.07 C 73.61 85.52 69.09 80.73 65.84 75.20 C 59.26 64.02 59.24 49.53 65.05 38.04 C 70.05 28.00 79.55 20.33 90.44 17.62 Z"/><path d=" M 36.43 65.50 C 48.37 61.21 62.61 69.06 65.49 81.37 C 68.80 92.86 61.28 105.82 49.78 108.89 C 41.87 111.23 32.84 108.81 27.16 102.84 C 21.52 97.15 19.51 88.36 21.72 80.71 C 23.70 73.62 29.42 67.73 36.43 65.50 Z"/><path d=" M 149.43 65.48 C 161.38 61.20 175.56 69.12 178.44 81.41 C 181.70 92.87 174.23 105.78 162.78 108.87 C 154.64 111.34 145.31 108.65 139.65 102.34 C 135.17 97.46 133.01 90.57 133.94 84.01 C 134.99 75.54 141.32 68.06 149.43 65.48 Z"/><path d=" M 49.69 112.73 C 55.38 110.00 61.69 108.24 68.03 108.32 C 70.25 109.04 71.81 110.99 73.67 112.33 C 84.72 121.41 100.60 123.82 114.00 119.02 C 120.39 117.04 125.48 112.64 130.59 108.56 C 135.74 107.77 141.02 109.48 145.89 111.10 C 150.71 112.67 154.61 116.03 159.15 118.12 C 163.36 118.11 166.13 114.51 169.40 112.42 C 181.38 109.86 194.42 118.79 196.07 131.01 C 196.61 137.64 196.12 144.31 196.17 150.96 C 189.54 151.08 182.91 150.92 176.28 151.08 C 176.44 161.91 176.75 172.76 176.17 183.58 C 125.18 183.50 74.18 183.51 23.19 183.57 C 22.98 172.73 23.17 161.89 23.12 151.05 C 16.52 150.93 9.91 151.11 3.31 150.91 C 3.76 142.67 2.04 134.01 5.06 126.11 C 8.42 117.75 17.07 112.03 26.06 112.03 C 31.76 111.03 34.55 117.77 39.98 118.15 C 43.48 116.88 46.31 114.28 49.69 112.73 Z"/></svg>')
  navitem(parent, "Administer", "/administer/" + electionId, '<svg viewBox="23.285306930541992 6.5975542068481445 153.3827667236328 186.71531677246094" width="153.3827667236328" height="186.71531677246094" xmlns="http://www.w3.org/2000/svg"><path d=" M 83.30 7.19 C 89.24 4.92 96.82 9.45 96.62 16.06 C 96.70 42.05 96.66 68.04 96.63 94.04 C 96.76 95.79 96.49 97.83 97.75 99.26 C 99.08 100.15 100.90 100.16 102.23 99.25 C 103.47 97.82 103.23 95.79 103.36 94.04 C 103.37 82.04 103.23 70.05 103.36 58.06 C 103.28 53.97 106.30 50.27 110.17 49.15 C 115.99 47.11 123.46 51.47 123.27 57.96 C 123.47 66.97 123.25 75.99 123.33 85.00 C 123.46 89.43 122.87 93.93 123.71 98.30 C 125.07 101.06 129.99 100.16 129.85 96.92 C 130.34 86.60 129.69 76.25 130.07 65.93 C 130.12 59.87 136.93 55.92 142.45 57.40 C 146.45 58.25 149.82 61.82 149.91 65.99 C 150.30 76.29 149.65 86.63 150.13 96.92 C 149.91 100.56 155.94 101.02 156.46 97.58 C 157.20 89.42 156.08 81.19 156.92 73.04 C 157.68 68.00 163.19 64.87 168.01 65.60 C 172.65 66.06 176.84 70.14 176.64 74.95 C 176.69 98.66 176.66 122.36 176.65 146.07 C 176.66 156.12 173.17 166.10 166.97 173.99 C 158.16 185.32 144.29 192.41 129.99 193.19 C 113.31 194.26 96.31 188.30 84.03 176.94 C 65.15 159.16 46.37 141.28 27.46 123.53 C 25.61 121.71 23.49 119.70 23.33 116.93 C 22.87 112.77 26.02 108.73 30.05 107.86 C 34.38 106.91 38.88 108.19 42.68 110.29 C 51.71 115.30 60.78 120.22 69.80 125.24 C 71.42 125.92 73.42 127.43 75.12 126.15 C 76.89 125.10 76.58 122.80 76.70 121.06 C 76.61 86.37 76.68 51.66 76.66 16.97 C 76.30 12.62 79.12 8.43 83.30 7.19 Z" transform="matrix(1, 0, 0, 1, -1.7763568394002505e-15, 0)"/></svg>')
}
var navitem = lib.navitem = function(parent, label, href, svg) {
  var a = html(parent, "a", "", {"href": href, "class": "clickable4"})
  if (svg) div(a, "", "w100 textCenter", div("", "", "w15", svg))
  div(a, "", "", label)
  return a
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
// lib.http.post1('/api/elections/2/invite', {"email": "nathan.eckberg@gmail.com"})
// lib.http.post1('/api/invite/accept', {"code": "e2562a8a"})
var httpMultiple = lib.http.send = function(method, resources, payloads, onSuccess, onFail) {

  var exFuncAry = function() {
    var funcReturns = []
    for (var i in resources) { funcReturns.push( axios[method](resources[i], payloads[i]) ) }
    return funcReturns
  }

  //default onSuccess and onFail functions
  onSuccess = onSuccess || function() {
    console.group("httpMultiple:")
    for (var i in arguments) { console.log(arguments[i]) }
    console.groupEnd()
  };
  onFail = onFail || function(error) {
      console.group("httpMultiple error:")
      console.log(resources)
      console.log(payloads)
      console.log(error)
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
