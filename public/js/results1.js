'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {
    var View = Piv.view

    // keep these snapshot versions in sync with ResultsSnapshotController.php
    var VERSION_TEST = 1;
    var VERSION_ADD_RESULTS = 2;
    var VERSION_ADD_DEBUG = 3;
    var VERSION_ADD_ERROR_INFO = 4;
    var VERSION_ADD_ELECTOR_INFO = 5;
    var VERSION_SURFACE_CANDIDATE_TIES = 6;
    var SNAPSHOT_FORMAT_VERSION = VERSION_SURFACE_CANDIDATE_TIES;

    // page state
    var debug_mode = false // hide/show certain elements
    var current_snapshot = null
    var candidateIdToName = null
    var electorIdToName = null

    // page components
    var OptionsDiv;
    var humanNamesCheckbox
    var showElectorNamesCheckbox
    var SnapshotsDiv
    var FilesDiv
    var exportButton
    var importBox
    var CandidatesDiv
    var BallotsDiv
    var TiePartialDiv
    var TieTotalDiv
    var ResultsDiv
    var DebugResultsDiv
    var TableDiv
    var PlotDiv

    function main() {
	debug_mode = (getUrlParameter("debug") == "1")
	console.log("Debugging: " + debug_mode)

        // generic setup
        Piv.evmanage.setManager(View.workspace, ["click"])
        View.setHeader("Election Results", ElectionId)
        View.statusbar.innerHTML = ""
        Piv.electionsMenu(ElectionId)
        // Piv.removeHrefsForCurrentLoc()

        // Piv.html(View.workspace, "a", "Print", {"class": "clickable1", "href": "/results-printable/" + ElectionId});
        Piv.div(View.workspace, "", "clickable1 no-print", "Print", "", "click", togglePrintable, []);

	// populate page components
	var headerStyle = {"class": "font-size-1", "style": "break-before: always;"}
	debug_element(Piv.html(View.workspace, "h1", "Options", headerStyle))
	debug_element(OptionsDiv = Piv.div(View.workspace, "Options", "text1"))
	humanNamesCheckbox = piv.html(OptionsDiv, "input", "", {"type": "checkbox", "checked": true})
	humanNamesCheckbox.onchange = refreshResults
	piv.html(OptionsDiv, "span", " Use Human-Readable Candidate Names<br>")
	showElectorNamesCheckbox = piv.html(OptionsDiv, "input", "", {"type": "checkbox", "checked": true})
	showElectorNamesCheckbox.onchange = refreshResults
	piv.html(OptionsDiv, "span", " Show Elector Names<br>")

	Piv.html(View.workspace, "h1", "Load a Snapshot", headerStyle)
	SnapshotsDiv = Piv.div(View.workspace, "Snapshots", "text1")

	Piv.html(View.workspace, "h1", "Import/Export a Snapshot", headerStyle)
	FilesDiv = Piv.div(View.workspace, "Files", "text1")
	exportButton = piv.html(FilesDiv, "button", "Export Snapshot")
	piv.html(FilesDiv, "span", "<br><br><b>OR</b><br>")
	exportButton.onclick = exportSnapshot
	piv.html(FilesDiv, "span", "<b>Import:</b> ")
	importBox = piv.html(FilesDiv, "input", "", {"type": "file"})
	importBox.onchange = importSnapshot
	piv.html(FilesDiv, "span", "<br>")

	Piv.html(View.workspace, "h1", "Results", headerStyle)
	ResultsDiv = Piv.div(View.workspace, "Results", "text1")

	debug_element(Piv.html(View.workspace, "h1", "Candidates", headerStyle))
	debug_element(CandidatesDiv = Piv.div(View.workspace, "Candidates", "text1"))

	Piv.html(View.workspace, "h1", "Ballots", headerStyle)
	BallotsDiv = Piv.div(View.workspace, "Ballots", "text1")

	debug_element(Piv.html(View.workspace, "h1", "Tie-Breaker (Partial Order)", headerStyle))
	debug_element(TiePartialDiv = Piv.div(View.workspace, "TiePartial", "text1"))

	debug_element(Piv.html(View.workspace, "h1", "Tie-Breaker (Total Order)", headerStyle))
	debug_element(TieTotalDiv = Piv.div(View.workspace, "TieTotal", "text1"))

	debug_element(Piv.html(View.workspace, "h1", "Debug Results", headerStyle))
	debug_element(DebugResultsDiv = Piv.div(View.workspace, "DebugResults", "text1"))

	Piv.html(View.workspace, "h1", "Head-to-Head Stats", headerStyle)
	TableDiv = Piv.div(View.workspace, "Table", "text1")

	Piv.html(View.workspace, "h1", "Head-to-Head Graph", headerStyle)
	PlotDiv = Piv.div(View.workspace, "Plot", "plot_area text1")

        // start workflow(s)
	var snapshotId = getUrlParameter("snap")
	if (snapshotId) {
	    getSnapshot(snapshotId)
	}
        getSnapshots()
    }

    // unless we're in debug mode, hide the element
    function debug_element(element) {
	if (!debug_mode) {
	    element.style.display = "none"
	}
    }

    function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    function getSnapshots() {
        // fetch snapshots
        Piv.http.get(["/api/elections/" + ElectionId + "/result_snapshots"],
                     gotSnapshots, showErrorMessage)
    }

    function gotSnapshots(snapshots) {

      // => not supported in IE
        // snapshots.forEach(snapshot => {
        //     var button = piv.html(SnapshotsDiv, "button", snapshot.id)
        //     button.onclick = function() {
        //         getSnapshot(snapshot.id)
        //     }
        // })

      snapshots.forEach( function(snapshot) {
        var button = piv.html(SnapshotsDiv, "button", snapshot.id)
        button.onclick = function() {
          getSnapshot(snapshot.id)
        }
      })
    }

    function getSnapshot(SnapshotId) {
        Piv.http.get(["/api/elections/" + ElectionId + "/result_snapshots/" + SnapshotId],
                     gotSnapshot, showErrorMessage)
    }

    // return list of candidate, and list of relations
    function ballotSplit(ballot_text) {
	var parts = []
	var delims = []
	var split_chars = [">", "="]
	while (true) {
    // var indexes = split_chars.map(delim => ballot_text.indexOf(delim)).filter(idx => idx >= 0)  // => not supported in IE
    var indexes = split_chars.map(function(delim){ return ballot_text.indexOf(delim) }).filter( function(idx){ return idx >= 0 })

	    if (indexes.length == 0) {
		// no delims found
		parts.push(ballot_text)
		break
	    }

      // var min_idx = Math.min(...indexes)  //... not supported in IE
      var min_idx = Math.min.apply(null, indexes)
	    delims.push(ballot_text[min_idx])
	    parts.push(ballot_text.substr(0, min_idx))
	    ballot_text = ballot_text.substr(min_idx+1)
	}

	return {parts:parts, delims:delims}
    }

    // apply function to each candidate in the ballot
    function ballotMap(ballot_text, fn) {
	var split = ballotSplit(ballot_text)
	split.parts = split.parts.map(fn)
	var new_text = split.parts[0]
	for (var i=0; i<split.delims.length; i++) {
	    new_text += split.delims[i] + split.parts[i+1]
	}
	return new_text
    }

    function gotSnapshot(snapshot) {
        console.log(snapshot)
	var version = parseInt(snapshot.format_version)
	var required = VERSION_SURFACE_CANDIDATE_TIES
        if (version != required) {
            alert("You can only debug snapshots with version " + required + " or greater.  This one was version " +
		  snapshot.format_version + ".  Please take a new snapshot.")
            return
        } else if (snapshot.result_blob.error != null) {
	    alert(snapshot.result_blob.error)
	    return
	}

	// refresh state
	current_snapshot = snapshot
	candidateIdToName = {}
	snapshot.result_blob.debug_private.candidates.forEach(function(candidate) {
	    candidateIdToName[candidate.id] = candidate.name
	})
	electorIdToName = {}
	snapshot.result_blob.debug_private.electors.forEach(function(elector) {
	    electorIdToName[elector.id] = (elector.name != null) ? elector.name : ("<"+elector.email+">")
	})

	// refresh display
	refreshResults()
    }

    // based on settings, apply transformations to ballot text (e.g.,
    // make it bold, or replace an ID with a name)
    function getCandidateFormatFn(snapshot) {
	var fn
	if (humanNamesCheckbox.checked) {
    // fn = (x => " "+candidateIdToName[x]+" ")
    fn = function(x) { return " "+candidateIdToName[x]+" " }
	} else {
    // fn = (x => x)
    fn = function(x) { return x}
	}

	return fn
    }

    // populate all divs with snapshot results
    function refreshResults() {
	console.log("attempt refresh")
	if (current_snapshot == null) {
	    return
	}
	var snapshot = current_snapshot
	var debug = snapshot.result_blob.debug
	var debug_private = snapshot.result_blob.debug_private
	var candidateFormatFn = getCandidateFormatFn(snapshot)
  // var formatCandidates = (x => ballotMap(x, candidateFormatFn))
	var formatCandidates = function(x) { return ballotMap(x, candidateFormatFn) }

	// candidates
        CandidatesDiv.innerHTML = ""
	piv.html(CandidatesDiv, "span", "<b>Candidate ID: Candidate Name</b><br>")
        // debug_private.candidates.forEach(candidate => {
        //     piv.html(CandidatesDiv, "span", candidate.id + ": " + candidate.name + "<br>")
        // })
        debug_private.candidates.forEach( function(candidate) {
            piv.html(CandidatesDiv, "span", candidate.id + ": " + candidate.name + "<br>")
        })

	// ballots
        BallotsDiv.innerHTML = ""
	var ballots = debug.ballots
    //     Object.keys(ballots).forEach(elector_id => {
	  //   var ballot_text = ''
	  //   if (showElectorNamesCheckbox.checked) {
		// ballot_text += "<b>"+electorIdToName[elector_id] + "</b>: "
	  //   }
	  //   ballot_text += formatCandidates(ballots[elector_id])
	  //   ballot_text += "<br>"
    //         piv.html(BallotsDiv, "span", ballot_text)
    //     })

      Object.keys(ballots).forEach( function(elector_id) {
    var ballot_text = ''
    if (showElectorNamesCheckbox.checked) {
	ballot_text += "<b>"+electorIdToName[elector_id] + "</b>: "
    }
    ballot_text += formatCandidates(ballots[elector_id])
    ballot_text += "<br>"
          piv.html(BallotsDiv, "span", ballot_text)
      })

	// tie breaker, partial and total order
	TiePartialDiv.innerHTML = formatCandidates(debug.tie_breaker)
	TieTotalDiv.innerHTML = formatCandidates(debug.tie_breaker_total)

	// debug results (text only)
	var ranks = Array.from(snapshot.result_blob.order.keys())
	ranks.sort()
  // var order = ranks.map(rank => snapshot.result_blob.order[rank].map(candidate => candidate.id))
	var order = ranks.map(function(rank) { return snapshot.result_blob.order[rank].map( function(candidate) {return candidate.id }) })
  // var order_text = order.map(ties => ties.join("=")).join(">")
	var order_text = order.map( function(ties) { return ties.join("=")} ).join(">")
	DebugResultsDiv.innerHTML = formatCandidates(order_text)

	// user-friendly results
	showResults()

	// table + plot
	var alchemy_data = ballotsToAlchemyGraph(debug.ballots)
	showPlot(alchemy_data)
	showTable(alchemy_data)
    }

    function ballotsToAlchemyGraph(ballots) {
	var nodes = new Set()
	var edge_counts = new Map()

	// compute votes each way, between each pair
	// Object.keys(ballots).forEach(elector_id => {
	//     var ballot_text = ballots[elector_id]
	//     console.log(ballot_text)
	//     var ballot = ballot_text.split(">").map(x => x.split("="))
  //
	//     for (var i=0; i<ballot.length; i++) {
	// 	var group1 = ballot[i]
	// 	group1.forEach(function(A){
	// 	    nodes.add(A)
	// 	    ballot.slice(i+1).forEach(function(group2) {
	// 		group2.forEach(function(B){
	// 		    var key = [A,B].toString() // A beats B in this ballot
	// 		    var count = edge_counts.has(key) ? edge_counts.get(key) : 0
	// 		    count += 1
	// 		    edge_counts.set(key, count)
	// 		})
	// 	    })
	// 	})
	//     }
  //       })

  Object.keys(ballots).forEach(function(elector_id) {
      var ballot_text = ballots[elector_id]
      console.log(ballot_text)
      var ballot = ballot_text.split(">").map( function(x) { return x.split("=") } )

      for (var i=0; i<ballot.length; i++) {
    var group1 = ballot[i]
    group1.forEach(function(A){
        nodes.add(A)
        ballot.slice(i+1).forEach(function(group2) {
      group2.forEach(function(B){
          var key = [A,B].toString() // A beats B in this ballot
          var count = edge_counts.has(key) ? edge_counts.get(key) : 0
          count += 1
          edge_counts.set(key, count)
      })
        })
    })
      }
        })

	// generate list of alchemy edges
	var edges = []
	nodes.forEach(function(A) {
	    nodes.forEach(function(B) {
		// compute margin
		var margin = 0
		var key = [A,B].toString()
		if (edge_counts.has(key)) {
		    margin += edge_counts.get(key)
		}
		var key = [B,A].toString()
		if (edge_counts.has(key)) {
		    margin -= edge_counts.get(key)
		}

		// add edge (if margin!=0) in appropriate direction
		if (margin > 0) {
		    edges.push({source:A, target:B, caption:margin})
		} else if (margin < 0) {
		    edges.push({source:B, target:A, caption:-margin})
		}
	    })
	})

	// generate list of alchemy nodes
	nodes = Array.from(nodes)
	nodes = nodes.map(function(id) {
	    var caption = (humanNamesCheckbox.checked ? candidateIdToName[id] : id)
	    return {id:id, caption:caption}
	})

	var alchemy_data = {nodes:nodes, edges:edges}
	return alchemy_data
    }

    function displayCandidateGroup(rank, candidates) {
	if (ResultsDiv.innerHTML != "") {
	    piv.html(ResultsDiv, "span", "<br><br>")
	}

	var group = Piv.div(ResultsDiv, "", "border-color-6 bg-color-7")
	candidates.forEach (function(candidate) {
	    var name = candidate.name
	    group.innerHTML += ("<b>Rank " + rank + ":</b> " + name + "<br>")
	})
    }

    function showResults() {
	var candidateOrder = current_snapshot.result_blob.order
	ResultsDiv.innerHTML = ""
	var rank = 1
	for (var key in candidateOrder) {
	    displayCandidateGroup(rank, candidateOrder[key])
	    rank += 1
	}
    }

    function showPlot(alchemy_data) {
	PlotDiv.innerHTML = ""
	var AlchemyDiv = Piv.div(PlotDiv, "alchemy")

	var config = {
            dataSource: alchemy_data,

            directedEdges: true,
            backgroundColour: "white",
            nodeCaptionsOnByDefault: true,

            edgeStyle: {"all":{
		"color": "black",
		"opacity": 1,
		"width": 2,
            }},

            nodeStyle: {"all":{
		"borderColor": "black",
		"borderWidth": 2,
		"color": "white",
		"radius": 30,
            }},
	};

	var alchemy = new Alchemy(config)
    }

    function verticalText(parent, innerHTML) {
	var vpadding = 2
    	var inner = document.createElement("div")
	var outer = document.createElement("div")
	parent.appendChild(outer)
	outer.appendChild(inner)
	inner.style.whiteSpace = "nowrap"
	inner.innerHTML = innerHTML

	var width = inner.offsetWidth
	var height = inner.offsetHeight

	outer.style.display = "inline-block"
	outer.style.height = (width+vpadding)+"px"
	outer.style.width = height+"px"
	outer.margin = "auto"

	inner.style.transformOrigin = "top left"
	inner.style.transform = "rotate(-90.0deg)"
	inner.style.top = (width+vpadding/2) + "px"

	return inner
    }

    function addBorder(element) {
	element.style.borderStyle = "solid"
	element.style.borderWidth = "1px"
    }

    function showTable(alchemy_data) {
	TableDiv.innerHTML = ""

	var cellWidth = "3em"

	piv.html(TableDiv, "p", "Each would-be victory in a head-to-head matchup is represented by a \
number in the following table.  Start with a candidate along the \
vertical axis.  The numbers in that row indicate the strengths of \
the victories that the candidate would have in head-to-head matchups \
against each candidate along the horizontal axis.")

	var table = piv.html(TableDiv, "table", "")
	// TODO: move this to a style sheet
	table.style.borderCollapse = "collapse"
	table.style.textAlign = "center"

  // var nodes = alchemy_data.nodes.map(node => node.id).sort()
	var nodes = alchemy_data.nodes.map(function(node) {return node.id}).sort()
	var edges = alchemy_data.edges
	var row, cell, text

	// x-axis header
	row = table.insertRow(-1)
	row.insertCell(-1)
	nodes.forEach(function(B) {
	    cell = row.insertCell(-1)
	    cell.style.verticalAlign = "bottom"
	    cell.style.align = "center"
	    cell.style.width = cellWidth
	    text = (humanNamesCheckbox.checked ? candidateIdToName[B] : B)
	    verticalText(cell, "<b>"+text+"</b>")
	})

	// cells[A][B] = stats about A beating B
	var cells = {}

	// y-axis
	nodes.forEach(function (A) {
	    row = table.insertRow(-1)
	    cell = row.insertCell(-1)
	    text = (humanNamesCheckbox.checked ? candidateIdToName[A] : A)
	    cell.innerHTML = "<b>"+text+"</b>"
	    cell.style.textAlign = "right"
	    cells[A] = {}
	    nodes.forEach(function(B) {
		// TODO: move this to a style sheet
		cell = row.insertCell(-1)
		cell.style.borderStyle = "solid"
		cell.style.borderWidth = "1px"
		text = "-"
		cell.innerHTML = text
		cells[A][B] = cell
	    })
	})

	edges.forEach(function(edge) {
	    cells[edge.source][edge.target].innerHTML = edge.caption
	})
    }

    // borrowed from here: https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
    function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
    }

    function importSnapshot(event) {
	var reader = new FileReader();

	reader.onload = function(){
	    var snapshot = JSON.parse(reader.result)
	    gotSnapshot(snapshot)
	};

	reader.readAsText(event.target.files[0])
    }

    function exportSnapshot() {
	if (current_snapshot == null) {
	    alert("please open a snapshot first")
	    return
	}
	download("election.json", JSON.stringify(current_snapshot, null, 2))
    }

    function showErrorMessage(error) {
	console.log(error)
        Piv.div(View.workspace, "", "w100 text3", "Debug for this election are not currently available.")
        if (!error) return
        Piv.div(View.workspace, "", "100 text3", error.response.data.message)
    }
    function togglePrintable() {
      console.log("hi")
      console.log(this)
      if (Piv.hasClass(View.body, "printable")) {
        Piv.removeClass(View.body, "printable")
        this.domel.innerHTML = "Print"
        return
      }
      Piv.addClass(View.body, "printable")
      this.domel.innerHTML = "Back"
    }

    main(piv, election)
})(piv, election)
