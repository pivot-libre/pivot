<?php

namespace App\Util;

use App\Election;
use App\ResultSnapshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PivotLibre\Tideman\BallotParser;
use PivotLibre\Tideman\Ballot;
use PivotLibre\Tideman\Candidate;
use PivotLibre\Tideman\CandidateList;

class ResultSnapshotViewConverter
{
    /**
     * @param string $tieBreakerString the BFF format string describing the ballot
     * @param array $candidateIdPairs an array whose entries are each associative arrays with keys 'id' and 'name' and whose values describe candidates.
     * @return a list of lists describing a partial ordering of candidates
     */
    public function convertTieBreaker(string $tieBreakerString, array $candidateIdPairs)
    {
        $ballotParser = new BallotParser();
        $tieBreaker = $ballotParser->parse($tieBreakerString); 
        $candidateIdToNameMap = $this->convertCandidateIdPairsToMap($candidateIdPairs);
        $namedCandidates = $this->convertBallotsToNamedCandidateArrays($candidateIdToNameMap, [$tieBreaker])[0];
        return $namedCandidates;
    }

    /**
     * @param array $snapshotBlob the native representation of a snapshot
     * @return array whose elements each contain info on an elector and their ballot
     */
    public function getElectorsAndBallots(array $snapshotBlob)
    {
        $candidateIdPairs = $snapshotBlob['debug_private']['candidates'];
        $candidateIdToNameMap = $this->convertCandidateIdPairsToMap($candidateIdPairs);
        $electorIdToBallotStringMaps = $snapshotBlob['debug']['ballots'];
        $electorIdToBallot = $this->convertBallotStringsToBallots($electorIdToBallotStringMaps);
        $electorIdToBallot = $this->convertBallotsToNamedCandidateArrays($candidateIdToNameMap, $electorIdToBallot);
        $electorIdPairs = $snapshotBlob['debug_private']['electors'];
        $electorIdToNameMap = $this->convertElectorIdPairsToMap($electorIdPairs);

        $electorsAndBallots = $this->associateElectorNamesWithBallots($electorIdToNameMap, $electorIdToBallot);
        return $electorsAndBallots;
    }

    public function associateElectorNamesWithBallots(array $electorIdToNameMap, array $electorIdToBallot)
    {
        $electorsAndBallots = [];
        foreach($electorIdToBallot as $electorId => $ballot) {
            $electorName = $electorIdToNameMap[$electorId];
            $electorAndBallot = [
                'elector' => [
                    'id' => $electorId,
                    'name' => $electorName
                ],
                'ballot' => $ballot
            ];
            $electorsAndBallots[] = $electorAndBallot;
        }
        return $electorsAndBallots;
    }

    /**
     * converts a numerically-indexed array into an associative array mapping elector ids to 
     * elector names
     * @param array $electorIdPairs a list of associative arrays that have an 'id' and 'name' keys.
     * @return array an associative array whose keys are elector ids and whose values are the 
     * corresponding elector name
     */

    public function convertElectorIdPairsToMap(array $electorIdPairs)
    {
        return $this->convertPairsToMap($electorIdPairs, 'id', 'name');
    }
    
    /**
     * converts a numerically-indexed array into an associative array mapping candidate ids to 
     * candidate names
     * @param array $candidateIdPairs a list of associative arrays that have an 'id' and 'name' keys.
     * @return array an associative array whose keys are candidate ids and whose values are the 
     * corresponding candidate name
     */
    public function convertCandidateIdPairsToMap(array $candidateIdPairs)
    {
        return $this->convertPairsToMap($candidateIdPairs, 'id', 'name');
    }
     
    /**
     * This function returns a re-keyed associative array
     * @param array $array the associative array to re-key.
     * @param array $oldKeyToNewKey the associative array that maps old keys to new keys
     * @return an associative array whose keys have been uniformly transformed according
     * to the associations in $oldKeyToNewKey
     */
    public function reKeyArray(array $array, array $oldKeyToNewKey)
    {
        $newArray = [];
        foreach($array as $oldKey => $value) {
            $newKey = $oldKeyToNewKey[$oldKey];
            $newArray[$newKey] = $value;
        }
        return $newArray;
    }

    /**
     * Converts a numerically-indexed array of associative arrays into a single associative array.
     * The returned associative array's keys are taken from $pair[<n>][$keyName]. 
     * The returned associative array's keys are taken from $pair[<n>][$valueName]. 
     * @param array $pairs a numerically-indexed array of associative arrays.
     * @param string $keyName the name of the associative array member in $pairs that should be used as the key
     *               in the returned associative array
     * @param string $valueName the name of the associative array memver in $pairs that should be used as the value in the returned associative array
     * @return an associative array that maps the $keyName to $valueName
     */
    public function convertPairsToMap(array $pairs, string $keyName, string $valueName)
    {
        $keyToValue = [];
        foreach($pairs as $pair) {
            $key = $pair[$keyName];
            $value = $pair[$valueName];
            $keyToValue[$key] = $value;
        }
        return $keyToValue;
    }
    
    /**
     * @param array $ballotArrays an array whose keys are voter ids and whose values are the associated
     * ballot strings
     * @return array whose keys are voter ids and whose values are Ballot objects
     */
    public function convertBallotStringsToBallots(array $ballotArrays)
    {
        $voterIdToBallotMap = [];
        $ballotParser = new BallotParser();
        foreach($ballotArrays as $id => $ballotString) {
            $voterIdToBallotMap[$id] = $ballotParser->parse($ballotString);
        }
        return $voterIdToBallotMap;
    }
    
    /**
     * @param $idToCandidateNameMap array whose keys are candidate ids and whose values are the associated candidate names
     * @param $voterIdToBallotMap array whose keys are voter ids and whose values are Ballot objects without candidate names.
     * @return array whose keys are voter ids and whose values are nested arrays describing a partially ordered list of candidates.
     */
    public function convertBallotsToNamedCandidateArrays(array $idToCandidateNameMap, array $voterIdToBallotMap)
    {
        $nameCandidate = function(Candidate $candidate) use ($idToCandidateNameMap) {
            $candidateId = $candidate->getId();
            $candidateName = $idToCandidateNameMap[$candidateId];
            $candidate = [
                'id' => $candidateId,
                'name' => $candidateName
            ];
            return $candidate;
        };

        $recreateCandidateList = function($candidateList) use ($nameCandidate) {
            return array_map($nameCandidate, $candidateList->toArray());
        };

        $recreateBallot = function($ballot) use ($recreateCandidateList) {
            return array_map($recreateCandidateList, $ballot->toArray());
        };

        $voterIdToBallotMap = array_map($recreateBallot, $voterIdToBallotMap);
        return $voterIdToBallotMap;
    }

}
