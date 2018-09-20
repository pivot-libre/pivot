<span class="candidateRanking">
   @foreach($candidateRanking as $candidateList)
        @foreach($candidateList as $candidate)
            <span class="candidateName">{{ $candidate['name'] }}</span>
            @if(!$loop->last)
                <span class="candidateSeparator">&nbsp;=&nbsp;</span>
            @endif
        @endforeach
        @if(!$loop->last)
            <span class="candidateSeparator">&nbsp;&gt;&nbsp;</span>
        @endif
    @endforeach
</span>
