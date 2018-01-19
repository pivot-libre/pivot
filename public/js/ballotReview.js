'use strict';

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Review Ballot"

anchorListDiv(workspace, "", {
    "Rank Candidates": "/ballot/" + election,
    "Review ballot": "/ballotReview/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var rankeditems = html(workspace, "ol", "", {"id": "rankeditems", "class": "itemlist incrementsCounter"});
var unrankeditems = html(workspace, "ol", "", {"id": "unrankeditems", "class": "itemlist"});

loadBallot(election, displayBallot, li1)

function li1(parent, uniq, description, cost, tie, isNew) {
  var candidateLiAtts = {"class": "row1"}
  if (tie) { candidateLiAtts["data-tie"] = tie }
  var box = html(parent, "li", "", candidateLiAtts);

  div(box, "", "text1square orderdisplay");
  div(box, "", "text1 w75", description);
}
