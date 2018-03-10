#!/usr/bin/env python
import os, sys, json, requests, time, re, argparse
from collections import defaultdict as ddict

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
    def __init__(self, url, curltrace):
        self.latency_stats = LatencyStats()
        self.url = url
        self.curl = open(curltrace, 'w') if curltrace else None
        self.next_should_fail = False

    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_value, traceback):
        if self.curl:
            self.curl.close()
        
    def load_users(self):
        with open('users.json') as f:
            return json.loads(f.read())["users"]

    def dump(self, out):
        with open('dump.html', 'w') as f:
            f.write(out)

    def dump_stats(self):
        print "\n============= LATENCY STATUS ============\n"
        self.latency_stats.dump()

    def dump_curl(self, method, headers, url, data=None):
        if not self.curl:
            return
        h = ''
        for k,v in headers.iteritems():
            h += '-H "%s: %s"' % (k,v)
        cmd = 'curl -X %s %s %s' % (method, self.url + '/' + url, h)
        if data:
            cmd += ' -d \'%s\'' % data
        cmd += ' -w "@curl-format.txt" -L -v'
        
        self.curl.write(cmd + '\n\n')
        self.curl.flush()

    def expect_fail(self):
        self.next_should_fail = True
        
    # generic API
    def user_get(self, user, url):
        print 'GET '+url
        headers = {'Authorization': 'Bearer '+user['token']}

        # add curl equivalent to trace
        self.dump_curl('GET', headers, url)

        # issue request and record latency
        t0 = time.time()
        r = requests.get(url = self.url + '/' + url, headers=headers)
        d = r.content
        t1 = time.time()
        self.latency_stats.add('GET '+url, t1-t0)

        # dump response to file if there was an error
        try:
            return_data = json.loads(d)
        except:
            if self.next_should_fail:
                self.next_should_fail = False
                return
            else:
                print 'could not parse: ' + d[:100] + ' (%d bytes)...' % len(d)
                self.dump(d)
                assert(0)
        # no failure detected
        assert(not self.next_should_fail)
        return return_data

    def user_post(self, user, url, body):
        print 'POST '+url
        headers = {'Authorization': 'Bearer '+user['token']}
        data = json.dumps(body)

        # add curl equivalent to trace
        self.dump_curl('POST', headers, url, data)

        # issue request and record latency
        t0 = time.time()
        r = requests.post(url = self.url + '/' + url, headers=headers, data=data)
        d = r.content
        t1 = time.time()
        self.latency_stats.add('POST '+url, t1-t0)

        # dump response to file if there was an error
        try:
            return_data = json.loads(d)
        except:
            if self.next_should_fail:
                self.next_should_fail = False
                return
            else:
                print 'could not parse: ' + d[:100] + ' (%d bytes)...' % len(d)
                self.dump(d)
                assert(0)
        # no failure detected
        assert(not self.next_should_fail)
        return return_data

    def user_delete(self, user, url):
        print 'DELETE '+url
        headers = {'Authorization': 'Bearer '+user['token']}

        # add curl equivalent to trace
        self.dump_curl('DELETE', headers, url)

        # issue request and record latency
        t0 = time.time()
        r = requests.delete(url = self.url + '/' + url, headers=headers)
        d = r.content
        t1 = time.time()
        self.latency_stats.add('DELETE '+url, t1-t0)

        # dump response to file if there was an error
        try:
            return_data = json.loads(d)
        except:
            if self.next_should_fail:
                self.next_should_fail = False
                return
            else:
                print 'could not parse: ' + d[:100] + ' (%d bytes)...' % len(d)
                self.dump(d)
                assert(0)
        # no failure detected
        assert(not self.next_should_fail)
        return return_data

    # pivot API wrappers
    def get_elections(self, user):
        return self.user_get(user, 'election')

    def create_election(self, user, name):
        return self.user_post(user, 'election', {"name": name})

    def delete_election(self, user, election):
        url = 'election/%d' % election['id']
        return self.user_delete(user, url)

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
        return self.user_get(user, url)

    def election_result(self, user, election):
        url = 'election/%d/result' % election['id']
        return self.user_get(user, url)

    def batchvote(self, user, election, votes):
        url = 'election/%d/batchvote' % election['id']
        return self.user_post(user, url, {'votes': votes})

    def batchvote_view(self, user, election):
        url = 'election/%d/batchvote' % election['id']
        return self.user_get(user, url)

    def add_elector(self, election, admin, user):
        invite_status = self.invite(admin, election, user['email'])
        code = invite_status['code']
        self.accept(user, code)

    def get_ready(self, user, election):
        url = 'election/%d/get_ready' % election['id']
        return self.user_get(user, url)

    def set_ready(self, user, election, version):
        url = 'election/%d/set_ready' % election['id']
        return self.user_post(user, url, {'approved_version': version})

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
    code = invite_status['code']
    print code
    api.accept(userA, code)
    invite_status = api.invite(userA, election, userB['email'])
    code = invite_status['code']
    electors = api.get_electors(userA, election)
    assert(len(electors) == 1)
    acceptables = api.acceptable(userB)
    codes = [inv['code'] for inv in acceptables]
    assert (code in codes)
    api.accept(userB, code)
    electors = api.get_electors(userA, election)
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

def test3(api):
    """
    This tests verifies that an elector can view other electors
    """
    print "\n============= TEST 3 ============\n"
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test3-election')
    api.add_elector(election, userA, userB)
    print api.get_electors(userA, election)
    # an elector may view the list of electors
    print api.get_electors(userB, election)

def test4(api):
    """
    This verifies a user cannot accept an invitation not associated with their email
    """
    print "\n============= TEST 4 ============\n"
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test4-election')
    invite_status = api.invite(userA, election, userA['email'])
    code = invite_status['code']

    # it should not be possible to accept an invitation that was not sent to you,
    # so this should fail
    api.expect_fail()
    api.accept(userB, code)

def test5(api):
    """
    This verifies an admin can delete an election
    """
    print "\n============= TEST 5 ============\n"
    users = api.load_users()
    userA = users[0]
    election = api.create_election(userA, 'test5-election')
    print api.delete_election(userA, election)

def test6(api):
    """
    This checks for double invitations/accepts
    """
    print "\n============= TEST 6 ============\n"
    users = api.load_users()
    userA = users[0]
    userB = users[1]
    election = api.create_election(userA, 'test6-election')
    # should not be able to create duplicate invites
    invite1 = api.invite(userA, election, userB['email'])
    invite2 = api.invite(userA, election, userB['email'])
    assert(invite1['id'] == invite2['id'])
    code = invite1['code']
    print api.accept(userB, code)
    api.expect_fail() # cannot accept twice
    api.accept(userB, code)
    # should not be able to create duplicate invites even after accepting a prior invite
    invite3 = api.invite(userA, election, userB['email'])
    assert(invite1['id'] == invite3['id'])
    api.expect_fail() # cannot accept twice
    api.accept(userB, code)

def test7(api):
    """
    This tests exercises the API that votes use to finalize their ballot
    """
    print "\n============= TEST 7 ============\n"
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test3-election')
    api.add_elector(election, userA, userB)
    ready = api.get_ready(userB, election)
    assert(ready['is_latest'] == False)
    assert(ready['approved_version'] == None)
    assert(ready['latest_version'] == 1)
    ready = api.set_ready(userB, election, ready['latest_version'])
    assert(ready['is_latest'] == True)
    assert(ready['approved_version'] == 1)
    assert(ready['latest_version'] == 1)
    ready = api.get_ready(userB, election)
    assert(ready['is_latest'] == True)
    assert(ready['approved_version'] == 1)
    assert(ready['latest_version'] == 1)
    ready = api.set_ready(userB, election, None)
    assert(ready['is_latest'] == False)
    assert(ready['approved_version'] == None)
    assert(ready['latest_version'] == 1)
    ready = api.get_ready(userB, election)
    assert(ready['is_latest'] == False)
    assert(ready['approved_version'] == None)
    assert(ready['latest_version'] == 1)

def main(url, curltrace):
    with API(url=url, curltrace=curltrace) as api:
        test1(api)
        test2(api)
        test3(api)
        test4(api)
        test5(api)
        test6(api)
        test7(api)
        api.dump_stats()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run some tests.')
    parser.add_argument('--url', help='where to direct API calls', default='http://homestead.test/api')
    parser.add_argument('--curltrace', help='dumps a curl trace to given file', default='')
    args = parser.parse_args()
    main(url=args.url, curltrace=args.curltrace)
