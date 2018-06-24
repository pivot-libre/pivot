'use strict';

//create a file-specific context via a function
(function(Piv, ElectionId) {
    var View = Piv.view

    var headerStyle = {"class": "font-size-1"}

    // page layout
    Piv.html(View.workspace, "h1", "Snapshots", headerStyle)
    var SnapshotsDiv = Piv.div(View.workspace, "Snapshots", "text1")
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

    function gotSnapshot(snapshot) {
        if (snapshot.format_version < 3) {
            alert("You can only debug snapshots with version 3 or greater.  This one was version " + snapshot.format_version + ".")
            return
        }
        console.log(snapshot)
	var debug = snapshot.result_blob.debug
	var debug_private = snapshot.result_blob.debug_private

	// candidates
        CandidatesDiv.innerHTML = ""
        debug_private.candidates.forEach(candidate => {
            piv.html(CandidatesDiv, "span", candidate.id + ": " + candidate.name + "<br>")
        })

	// ballots
        BallotsDiv.innerHTML = ""
	var ballots = debug.ballots
        Object.keys(ballots).forEach(elector_id => {
	    var ballot_text = ballots[elector_id]
            piv.html(BallotsDiv, "span", ballot_text + "<br>")
        })

	// tie breaker, partial and total order
	TiePartialDiv.innerHTML = debug.tie_breaker
	TieTotalDiv.innerHTML = debug.tie_breaker_total

	// results
	var ranks = Array.from(snapshot.result_blob.order.keys())
	console.log(ranks)
	ranks.sort()
	var winners = ranks.map(rank => snapshot.result_blob.order[rank].id)
	ResultsDiv.innerHTML = winners.join(">")

	// plotting
	showPlot()
    }

    function showPlot() {
	PlotDiv.innerHTML = ""
	var AlchemyDiv = Piv.div(PlotDiv, "alchemy")
	
	var graph_data = {
	    "nodes": [
		{
		    "id": 0,
		    "caption": "TO",
		},
		{
		    "id": 1,
		    "caption": "FROM",
		},
	    ],
	    "edges": [
		{
		    "source": 1,
		    "target": 0,
		},
	    ]
	}

	var config = {
            dataSource: graph_data,

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

    function showErrorMessage(error) {
        alert(error)
        Piv.div(View.workspace, "", "w100 text3", "Debug for this election are not currently available.")
        if (!error) return
        Piv.div(View.workspace, "", "100 text3", error.response.data.message)
    }

    main(piv, election)
})(piv, election)