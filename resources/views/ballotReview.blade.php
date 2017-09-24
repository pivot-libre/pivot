@extends('layouts.ballot')

<?php
//$user = Auth::user()->id;
//noe incomplete: get this information via the API. The following is just for mockup purposes!!
// $rankingsJson = <<<'EOT'
// {"ranked":[],"unranked":[{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"Participatory Budgeting experiment","tie":null},{"description":"Approve RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"adsfas RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"Approve RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"and 1-year seed-funding for Participatory Budgeting experiment","tie":null}]}
// EOT;
$rankingsJson = '{"ranked":[],"unranked":[{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"funding for Participatory Budgeting experiment","tie":null},{"description":"Participatory Budgeting experiment","tie":null},{"description":"Approve RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"adsfas RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"Approve RFP and 1-year seed-funding for Participatory Budgeting experiment","tie":null},{"description":"and 1-year seed-funding for Participatory Budgeting experiment","tie":null}]}';
$rankings = json_decode($rankingsJson, true);

// // GET Request
// $request = Request::create('/some/url/1', 'GET');
// $response = Route::dispatch($request);
//
// // POST Request
// $request = Request::create('/some/url/1', 'POST', Request::all());
// $response = Route::dispatch($request);
//
// // Create a new election
// POST /election
// Request Body: {"name": "First Election"}
// $request = Request::create('/election', 'POST', Request::all());
// $request = Request::create('/api/election', 'POST', ['name' => 'noe First Election']);
// $response = Route::dispatch($request);

// // Return a single election
// GET /election/{id}
$request = Request::create('/election/1', 'GET');
$response = Route::dispatch($request);


?>

@section('content')

<div id="pagecontent">
  <div id="ballotdiv">
    <!-- <div class="ballotheader">City of Madison Operating Budget - 2018</div> -->
    <div class="ballotheader"><?php echo $response; ?></div>
    <div class="stepnav">
      <a href="ballot">Rank items</a>
      <a>Review</a>
    </div>
    <div class="ballotspace">
      <div id="ballotspaceheader">
        <div id="ballotspaceheaderline1">Select your 1st choice</div>
      </div>
      <ol id="rankeditems" class="ballotselections">

        <?php
        $rank = 0;
        $uniq = 0;
        foreach ($rankings["ranked"] as $item) {
            ballotselection(++$uniq, $item["description"], "(-$225,000)", $item["tie"]);
        }
        // ballotselection(++$rank, "Approve RFP and 1-year seed-funding for Participatory Budgeting experiment", "(-$225,000)");
        // ballotselection(++$rank, "and 1-year seed-funding for Participatory Budgeting experiment", "(-$225,000)");
        // ballotselection(++$rank, "adsfas RFP and 1-year seed-funding for Participatory Budgeting experiment", "(-$125,000)");
        // ballotselection(++$rank, "Approve RFP and 1-year seed-funding for Participatory Budgeting experiment", "(-$225,000)");
        // ballotselection(++$rank, "funding for Participatory Budgeting experiment", "(-$225,000)");
        ?>
      </ol>
      <ol id="unrankeditems" class="ballotselections">
        <?php
        foreach ($rankings["unranked"] as $item) {
            ballotselection(++$uniq, $item["description"], "(-$225,000)");
        }
        // ballotselection(++$rank, "funding for Participatory Budgeting experiment", "(-$225,000)");
        // ballotselection(++$rank, "Participatory Budgeting experiment", "(-$225,000)");
        // ballotselection(++$rank, "funding for Participatory Budgeting experiment", "(-$225,000)");
        ?>
      </ol>
    </div>
  </div>
</div>
@endsection


<?php
function ballotselection($uniq, $description, $cost, $tie = "") {
  if (!$tie) { $tie = ""; }
  else { $tie = ' data-tie="' . $tie . '"'; }
echo <<<HTML
  <li class="candidate" onclick="candidateClick(this)"$tie>
  <div class="rankingTools">
    <input type="checkbox" name="ballotcheck" id="ballotcheck-$uniq">
    <div class="banish" onclick="processSelected(event,banish)"></div>
    <div class="tie" onclick="processSelected(event,tieSelected)"></div>
    <label class="check" for="ballotcheck-$uniq"></label>
    <div class="rankdisplay"></div>
  </div>
  <div class="candidateDetails">
    <div class="grippy"></div>
    <div class="candidateDescription">$description</div>
    <div class="candidateCost">$cost</div>
  </div>
</li>
HTML;
  }

    // <li class="ballotselection" onclick="ballotItemClick(this)"$tie>
    //   <label class="ballotrank" for="ballotcheck-$uniq">
    //     <input type="checkbox" name="ballotcheck" id="ballotcheck-$uniq"></input>
    //     <div class="tie" onclick="processSelected(event,tieSelected)"></div>
    //     <div class="banish" onclick="processSelected(event,banish)"></div>
    //     <div class="rankdisplay"></div>
    //   </label>
    //   <div class="grippy"></div>
    //   <div class="ballotdescription">$description</div>
    //   <div class="ballotcost">$cost</div>
    // </li>
?>
