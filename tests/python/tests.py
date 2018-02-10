#!/usr/bin/env python
import os, sys, json, requests, time, re
from collections import defaultdict as ddict

URL = 'http://homestead.test/api'

class LatencyStats:
    def __init__(self):
        self.latencies = ddict(list)

    def add(self, name, latency):
        name = re.sub(r'\d+', '<N>', name)
        self.latencies[name].append(latency)

    def dump(self):
        avg = {}
        for k, values in self.latencies.iteritems():
            avg[k] = sum(values) / len(values)
        keys = sorted(avg.keys(), key=lambda k: -avg[k])
        for k in keys:
            print str(int(avg[k]*1000)).rjust(4) + ' ms   ' + k + ' [%d calls]' % len(self.latencies[k])

class API:
    def __init__(self):
        self.latency_stats = LatencyStats()
    
    def load_users(self):
        with open('users.json') as f:
            return json.loads(f.read())["users"]

    def dump(self, out):
        with open('dump.html', 'w') as f:
            f.write(out)

    def dump_stats(self):
        self.latency_stats.dump()

    # generic API
    def user_get(self, user, url):
        global URL
        print 'GET '+url
        headers = {'Authorization': 'Bearer '+user['token']}
        t0 = time.time()
        r = requests.get(url = URL + '/' + url, headers=headers)
        d = r.content
        t1 = time.time()
        self.latency_stats.add('GET '+url, t1-t0)
        try:
            return json.loads(d)
        except:
            print 'could not parse: ' + d[:100] + '...'
            dump(d)
            assert(0)

    def user_post(self, user, url, body):
        global URL
        print 'POST '+url
        headers = {'Authorization': 'Bearer '+user['token']}
        t0 = time.time()
        r = requests.post(url = URL + '/' + url, headers=headers, data=json.dumps(body))
        d = r.content
        t1 = time.time()
        self.latency_stats.add('POST '+url, t1-t0)
        try:
            return json.loads(d)
        except:
            print 'could not parse: ' + d[:100] + '...'
            dump(d)
            assert(0)

    # pivot API wrappers
    def get_elections(self, user):
        return self.user_get(user, 'election')

    def create_election(self, user, name):
        return self.user_post(user, 'election', {"name": name})

    def get_candidates(self, user, election):
        url = 'election/%d/candidate' % election['id']
        return self.user_get(user, url)

    def get_electors(self, user, election):
        url = 'election/%d/elector' % election['id']
        return self.user_get(user, url)

    def create_candidate(self, user, election, name):
        url = 'election/%d/candidate' % election['id']
        return self.user_post(user, url, {"name": name})

    def set_rank(self, user, election, candidate, rank):
        url = 'election/%d/candidate/%d/rank' % (election['id'], candidate['id'])
        return self.user_post(user, url, {"rank": rank})

    def invite(self, user, election, email):
        url = 'election/%d/invite' % (election['id'])
        return self.user_post(user, url, {"email": email})

    def accept(self, user, code):
        url = 'invite/accept'
        return self.user_post(user, url, {"code": code})

    def acceptable(self, user):
        url = 'invite/acceptable'
        return self.user_post(user, url, {})

    def election_result(self, user, election):
        url = 'election/%d/result' % election['id']
        return self.user_get(user, url)

    def batchvote(self, user, election, votes):
        url = 'election/%d/batchvote' % election['id']
        return self.user_post(user, url, {'votes': votes})

    def batchvote_view(self, user, election):
        url = 'election/%d/batchvote' % election['id']
        return self.user_get(user, url)

def test1(api):
    print "\n============= TEST 1 ============\n"
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    # election (A's view)
    len1A = len(api.get_elections(userA))
    len1B = len(api.get_elections(userB))
    election = api.create_election(userA, 'test-election')
    len2A = len(api.get_elections(userA))
    len2B = len(api.get_elections(userB))
    assert(len2A == len1A + 1)
    assert(len2B == len1B)

    # election (B's view)
    len1 = len(api.get_elections(userA))
    election = api.create_election(userA, 'test-election')
    len2 = len(api.get_elections(userA))
    assert(len2 == len1 + 1)

    # electors
    invite_status = api.invite(userA, election, userA['email'])
    print 'invite_status: %s' % str(invite_status)
    code = invite_status['code']
    print code
    api.accept(userA, code)
    invite_status = api.invite(userA, election, userB['email'])
    print 'invite_status: %s' % str(invite_status)
    code = invite_status['code']
    electors = api.get_electors(userA, election)
    assert(len(electors) == 1)
    acceptables = api.acceptable(userB)
    codes = [inv['code'] for inv in acceptables]
    assert (code in codes)
    api.accept(userB, code)
    electors = api.get_electors(userA, election)
    assert(len(electors) == 2)
    electors = api.get_electors(userB, election)
    assert(len(electors) == 2)

    # verify B can now see it after being added
    len3B = len(api.get_elections(userB))
    assert(len3B == len2B + 1)

    # candidates
    A = api.create_candidate(userA, election, 'candidate-A')
    B = api.create_candidate(userA, election, 'candidate-B')
    C = api.create_candidate(userA, election, 'candidate-C')
    assert(len(api.get_candidates(userA, election)) == 3)

    # vote
    batch = True
    votes = [
        {'candidate_id': A['id'], 'rank': 2},
        {'candidate_id': B['id'], 'rank': 1},
        {'candidate_id': C['id'], 'rank': 3},
    ]
    bv1 = api.batchvote(userA, election, votes)
    bv2 = api.batchvote_view(userA, election)
    assert(len(bv1)) == len(votes)
    assert(len(bv2)) == len(votes)

    # result
    print api.election_result(userA, election)
    print api.election_result(userB, election)

def test2(api):
    """
    This tests one user voting on their own election.
    """
    print "\n============= TEST 2 ============\n"
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'Triceritops Rex')
    invite_status = api.invite(userA, election, userA['email'])
    code = invite_status['code']
    api.accept(userA, code)

    A = api.create_candidate(userA, election, 'candidate-A')
    B = api.create_candidate(userA, election, 'candidate-B')
    C = api.create_candidate(userA, election, 'candidate-C')
    D = api.create_candidate(userA, election, 'candidate-D')

    votes = [
        {'candidate_id': A['id'], 'rank': 1},
        {'candidate_id': B['id'], 'rank': 2},
        {'candidate_id': C['id'], 'rank': 3},
        {'candidate_id': D['id'], 'rank': 4},
    ]
    bv1 = api.batchvote(userA, election, votes)
    results = api.election_result(userA, election)
    result_names = [result['name'] for result in results['order']]
    assert(result_names == [u'candidate-A', u'candidate-B', u'candidate-C', u'candidate-D'])
    print result_names

def main(url = ''):
    global URL
    if len(url) > 0:
        URL = url
    else:
        print "\n no url specified. Using default " + URL
    api = API()
    test1(api)
    test2(api)

    print "\n============= LATENCY STATUS ============\n"
    api.dump_stats()

if __name__ == '__main__':
    main(*sys.argv[1:])
