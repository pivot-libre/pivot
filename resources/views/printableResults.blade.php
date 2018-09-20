<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Pivot Libre Election Result - {{ $election->getAttribute('name') }}</title>
  </head>
  <body>
        <h1>Pivot Libre Election Result</h1>
      <h2>Election</h2>
        <dl>
            <dt>Election Name</dt>
            <dd>{{ $election->getAttribute('name') }}</dd>
            <dt>Results Date</dt>
            <dd>{{ $snapshotTime->format(DateTime::ATOM) }}</dd>
        </dl>
        <h2>Electors</h2>
        <div>
            @foreach($electorNames as $electorName)
                <span class="electorName">{{ $electorName }}</span>
                @if(!$loop->last)
                <span class="electorSeparator">,</span>
                @endif
            @endforeach
        </div>
       <h2>Ballots</h2>
            @foreach($electorsAndBallots as $electorAndBallot)
	        <div>
                    <span class="electorName">{{ $electorAndBallot['elector']['name'] }}</span>
                    @include('candidateRanking', ['candidateRanking' => $electorAndBallot['ballot']])
                </div>
            @endforeach
        <h2>Tie Breaking</h2>
        <dl>
            <dt>Partially-Ordered Tie-Breaking Ballot</dt>
            <dd>
                @include('candidateRanking', ['candidateRanking' => $partiallyOrderedTieBreaker])
            </dd>
            <dt>Totally-Ordered Tie-Breaking Ballot</dt>
            <dd>
                @include('candidateRanking', ['candidateRanking' => $totallyOrderedTieBreaker])
           </dd>
 
        <h2>Results</h2>
            @include('candidateRanking', ['candidateRanking' => $result ])
  </body>
</html>

