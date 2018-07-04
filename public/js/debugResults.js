'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {
    var View = Piv.view

    // page state
    var current_snapshot = null
    var candidateIdToName = null
    var electorIdToName = null
    
    // page components
    var headerStyle = {"class": "font-size-1"}
    Piv.html(View.workspace, "h1", "Options", headerStyle)
    var OptionsDiv = Piv.div(View.workspace, "Options", "text1")
    var humanNamesCheckbox = piv.html(OptionsDiv, "input", "", {"type": "checkbox"})
    humanNamesCheckbox.onchange = refreshResults
    piv.html(OptionsDiv, "span", " Use Human-Readable Candidate Names<br>")
    var showElectorNamesCheckbox = piv.html(OptionsDiv, "input", "", {"type": "checkbox"})
    showElectorNamesCheckbox.onchange = refreshResults
    piv.html(OptionsDiv, "span", " Show Elector Names<br>")
    
    Piv.html(View.workspace, "h1", "Snapshots", headerStyle)
    var SnapshotsDiv = Piv.div(View.workspace, "Snapshots", "text1")

    Piv.html(View.workspace, "h1", "Import/Export", headerStyle)
    var FilesDiv = Piv.div(View.workspace, "Files", "text1")
    var exportButton = piv.html(FilesDiv, "button", "Export Snapshot")
    piv.html(FilesDiv, "span", "<br><br><b>OR</b><br>")
    exportButton.onclick = exportSnapshot
    piv.html(FilesDiv, "span", "<b>Import:</b> ")
    var importBox = piv.html(FilesDiv, "input", "", {"type": "file"})
    importBox.onchange = importSnapshot
    piv.html(FilesDiv, "span", "<br>")

    Piv.html(View.workspace, "h1", "Candidates", headerStyle)
    var CandidatesDiv = Piv.div(View.workspace, "Candidates", "text1")

    Piv.html(View.workspace, "h1", "Ballots", headerStyle)
    var BallotsDiv = Piv.div(View.workspace, "Ballots", "text1")

    Piv.html(View.workspace, "h1", "Tie-Breaker (Partial Order)", headerStyle)
    var TiePartialDiv = Piv.div(View.workspace, "TiePartial", "text1")

    Piv.html(View.workspace, "h1", "Tie-Breaker (Total Order)", headerStyle)
    var TieTotalDiv = Piv.div(View.workspace, "TieTotal", "text1")

    Piv.html(View.workspace, "h1", "Results", headerStyle)
    var ResultsDiv = Piv.div(View.workspace, "Results", "text1")
    
    Piv.html(View.workspace, "h1", "Plot", headerStyle)
    var PlotDiv = Piv.div(View.workspace, "Plot", "plot_area text1")

    function main() {
        // generic setup
        View.setHeader("Election Debugger", ElectionId)
        View.statusbar.innerHTML = ""
        Piv.electionsMenu(View.sidenav, ElectionId)
        Piv.removeHrefsForCurrentLoc()
	
        // start workflow
        getSnapshots()
    }

    function getSnapshots() {
        // fetch snapshots
        Piv.http.get(["/api/elections/" + ElectionId + "/result_snapshots"],
                     gotSnapshots, showErrorMessage)
    }

    function gotSnapshots(snapshots) {
        snapshots.forEach(snapshot => {
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
	    var indexes = split_chars.map(delim => ballot_text.indexOf(delim)).filter(idx => idx >= 0)

	    if (indexes.length == 0) {
		// no delims found
		parts.push(ballot_text)
		break
	    }

	    var min_idx = Math.min(...indexes)
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
        if (snapshot.format_version < 5) {
            alert("You can only debug snapshots with version 5 or greater.  This one was version " +
		  snapshot.format_version + ".")
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
	    fn = (x => candidateIdToName[x])
	} else {
	    fn = (x => x)
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
	var formatCandidates = (x => ballotMap(x, candidateFormatFn))

	// candidates
        CandidatesDiv.innerHTML = ""
	piv.html(CandidatesDiv, "span", "<b>Candidate ID: Candidate Name</b><br>")
        debug_private.candidates.forEach(candidate => {
            piv.html(CandidatesDiv, "span", candidate.id + ": " + candidate.name + "<br>")
        })

	// ballots
        BallotsDiv.innerHTML = ""
	var ballots = debug.ballots
        Object.keys(ballots).forEach(elector_id => {
	    var ballot_text = ''
	    if (showElectorNamesCheckbox.checked) {
		ballot_text += electorIdToName[elector_id] + ": "
	    }
	    ballot_text += formatCandidates(ballots[elector_id])
	    ballot_text += "<br>"
            piv.html(BallotsDiv, "span", ballot_text)
        })

	// tie breaker, partial and total order
	TiePartialDiv.innerHTML = formatCandidates(debug.tie_breaker)
	TieTotalDiv.innerHTML = formatCandidates(debug.tie_breaker_total)

	// results
	var ranks = Array.from(snapshot.result_blob.order.keys())
	ranks.sort()
	var winners = ranks.map(rank => snapshot.result_blob.order[rank].id)
	ResultsDiv.innerHTML = formatCandidates(winners.join(">"))

	// plotting
	var alchemy_data = ballotsToAlchemyGraph(debug.ballots)
	showPlot(alchemy_data)
    }

    function ballotsToAlchemyGraph(ballots) {
	var nodes = new Set()
	var edge_counts = new Map()

	// compute votes each way, between each pair
	Object.keys(ballots).forEach(elector_id => {
	    var ballot_text = ballots[elector_id]
	    console.log(ballot_text)
	    var ballot = ballot_text.split(">").map(x => x.split("="))

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
		    edges.push({source:A, target:B})
		} else if (margin < 0) {
		    edges.push({source:B, target:A})
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

    main(piv, election)
})(piv, election)
