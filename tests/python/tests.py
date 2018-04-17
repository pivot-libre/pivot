#!/usr/bin/env python
import os, sys, json, requests, time, re, argparse, inspect, re, random
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

    def delete_candidate(self, user, election, candidate):
        url = 'election/%d/candidate/%d' % (election['id'], candidate['id'])
        return self.user_delete(user, url)

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

    def batch_candidates(self, user, election, candidates):
        url = 'election/%d/batch_candidates' % election['id']
        return self.user_post(user, url, {'candidates': candidates})

    def batch_candidates_view(self, user, election):
        url = 'election/%d/batch_candidates' % election['id']
        return self.user_get(user, url)

    def add_elector(self, election, admin, user):
        invite_status = self.invite(admin, election, user['email'])
        code = invite_status['election_id']
        self.accept(user, code)

    def get_ready(self, user, election):
        url = 'election/%d/get_ready' % election['id']
        return self.user_get(user, url)

    def set_ready(self, user, election, version):
        url = 'election/%d/set_ready' % election['id']
        return self.user_post(user, url, {'approved_version': version})

    def voter_stats(self, user, election):
        url = 'election/%d/voter_stats' % election['id']
        return self.user_get(user, url)

    def voter_details(self, user, election):
        url = 'election/%d/voter_details' % election['id']
        return self.user_get(user, url)

def test1(api):
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
    code = invite_status['election_id']
    print code
    api.accept(userA, code)
    invite_status = api.invite(userA, election, userB['email'])
    code = str(invite_status['election_id'])
    electors = api.get_electors(userA, election)
    print(electors)
    assert(len(electors) == 1)
    acceptables = api.acceptable(userB)
    print acceptables
    codes = [inv['code'] for inv in acceptables]
    assert (code in codes)
    api.accept(userB, code)
    electors = api.get_electors(userA, election)
    print(electors)
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
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'Triceritops Rex')
    invite_status = api.invite(userA, election, userA['email'])
    code = invite_status['election_id']
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
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test4-election')
    invite_status = api.invite(userA, election, userA['email'])
    code = invite_status['election_id']

    # it should not be possible to accept an invitation that was not sent to you,
    # so this should fail
    api.expect_fail()
    api.accept(userB, code)

def test5(api):
    """
    This verifies an admin can delete an candidates and  elections
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]
    election = api.create_election(userA, 'test5-election')
    A = api.create_candidate(userA, election, 'candidate-A')
    api.add_elector(election, userA, userB)
    votes = [
        {'candidate_id': A['id'], 'rank': 1},
    ]
    api.batchvote(userB, election, votes)
    print api.delete_candidate(userA, election, A)
    print api.delete_election(userA, election)

def test6(api):
    """
    This checks for double invitations/accepts
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]
    election = api.create_election(userA, 'test6-election')
    # should not be able to create duplicate invites
    invite1 = api.invite(userA, election, userB['email'])
    invite2 = api.invite(userA, election, userB['email'])
    assert(invite1['id'] == invite2['id'])
    code = invite1['election_id']
    # multiple accepts should return the same first timestamp
    accept1 = api.accept(userB, code)
    print accept1
    accept2 = api.accept(userB, code)
    print accept1
    print accept2
    assert(accept1['id'] == accept2['id'])
    print accept1['invite_accepted_at'], accept2['invite_accepted_at']
    assert(accept1['invite_accepted_at'] == accept2['invite_accepted_at'])
    # should not be able to create duplicate invites even after accepting a prior invite
    invite3 = api.invite(userA, election, userB['email'])
    assert(invite1['id'] == invite3['id'])
    accept3 = api.accept(userB, code)
    assert(accept1['id'] == accept3['id'])
    assert(accept1['invite_accepted_at'] == accept3['invite_accepted_at'])

def test7(api):
    """
    This tests exercises the API that votes use to finalize their ballot
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test7-election')
    api.add_elector(election, userA, userB)

    # exercise flipping reading on/off
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

    # exercise readiness reset that happens when the admin modifies the election
    ready = api.set_ready(userB, election, ready['latest_version'])
    assert(ready['is_latest'] == True)
    assert(ready['approved_version'] == 1)
    assert(ready['latest_version'] == 1)
    A = api.create_candidate(userA, election, 'candidate-A')
    ready = api.get_ready(userB, election)
    assert(ready['is_latest'] == False)
    assert(ready['approved_version'] == 1)
    assert(ready['latest_version'] == 2)
    ready = api.set_ready(userB, election, ready['latest_version'])
    assert(ready['is_latest'] == True)
    assert(ready['approved_version'] == 2)
    assert(ready['latest_version'] == 2)
    ready = api.get_ready(userB, election)
    assert(ready['is_latest'] == True)
    assert(ready['approved_version'] == 2)
    assert(ready['latest_version'] == 2)

def test8(api):
    """
    This tests voter readiness stats
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    def verify_voterB_status(expected_status):
        stats = api.voter_stats(userA, election)
        details = api.voter_details(userA, election) # TODO
        for key in ['outstanding_invites', 'approved_none', 'approved_current', 'approved_previous']:
            count = stats.pop(key)
            voters = details.pop(key)
            if key == expected_status:
                assert(count == 1)
                assert(len(voters) == 1)
                assert(voters[0]['email'] == userB['email'])
                assert('name' in voters[0])
            else:
                assert(count == 0)
                assert(len(voters) == 0)
        assert(len(stats) == 0)
        assert(len(details) == 0)
    
    # create election
    election = api.create_election(userA, 'test8-election')
    verify_voterB_status(None)
    
    # invite
    invite_status = api.invite(userA, election, userB['email'])
    code = invite_status['election_id']
    verify_voterB_status('outstanding_invites')

    # accept
    api.accept(userB, code)
    verify_voterB_status('approved_none')
    
    # mark ready
    ready = api.get_ready(userB, election)
    api.set_ready(userB, election, ready['latest_version'])
    verify_voterB_status('approved_current')

    # modify ballot
    api.create_candidate(userA, election, 'candidate-A')
    verify_voterB_status('approved_previous')

def test9(api):
    """
    This tests candidate batch edit/view APIs
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    # create election
    election = api.create_election(userA, 'test9-election')
    api.add_elector(election, userA, userB)

    set1 = ['candidate-A', 'candidate-B']
    set2 = ['candidate-C', 'candidate-D']

    for name in set1:
        api.create_candidate(userA, election, name)

    # test simple batch view
    candidates = sorted(api.batch_candidates_view(userA, election), key=lambda c: c['name'])
    names = set([c['name'] for c in candidates])
    assert(len(names) == len(set1))
    for name in set1:
        assert(name in names)

    # test simple batch edit
    candidates[0]['name'] = set1[0] = 'candidate-A2'
    candidates = sorted(api.batch_candidates(userA, election, candidates), key=lambda c: c['name'])
    names = set([c['name'] for c in candidates])
    assert(len(names) == len(set1))
    for name in set1:
        assert(name in names)

    # test batch view after edits
    candidates = sorted(api.batch_candidates_view(userA, election), key=lambda c: c['name'])
    names = set([c['name'] for c in candidates])
    assert(len(names) == len(set1))
    for name in set1:
        assert(name in names)

    # test simple batch insert
    for name in set2:
        candidates.append({'name': name})
    candidates = sorted(api.batch_candidates(userA, election, candidates), key=lambda c: c['name'])
    names = set([c['name'] for c in candidates])
    assert(len(names) == len(set1+set2))
    for name in set1+set2:
        assert(name in names)

    # test batch view after inserts
    candidates = sorted(api.batch_candidates_view(userA, election), key=lambda c: c['name'])
    names = set([c['name'] for c in candidates])
    assert(len(names) == len(set1+set2))
    for name in set1+set2:
        assert(name in names)
        
def create_users(url):
    from selenium import webdriver
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    user_count = 2
    users = {"users": []}

    for i in range(1,user_count+1):
        chrome_options = ChromeOptions()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("window-size=1024,768")
        driver = webdriver.Chrome(chrome_options=chrome_options)
        driver.implicitly_wait(30)


        name = 'User %d' % i
        email = 'user%d-%06d@pivot.vote' % (i, random.randint(0,999999))
        password = 'abcabc'
        driver.get(url + '/register')
        driver.find_element_by_name("name").send_keys(name)
        driver.find_element_by_name("email").send_keys(email)
        driver.find_element_by_name("password").send_keys(password)
        driver.find_element_by_name("password_confirmation").send_keys(password)
        driver.find_element_by_name("password_confirmation").submit()
        driver.get(url + '/profile')
        driver.find_element_by_link_text('Create New Token').click()
        driver.find_element_by_name("name").send_keys("my token")

        # Create Button
        found_button = False
        for btn in driver.find_elements_by_xpath("//button[contains(text(), 'Create')]"):
            if btn.is_displayed():
                found_button = True
                btn.click()
                break
        assert(found_button)
        
        time.sleep(3)
        print 'grab token'
        found_code = False
        for code in driver.find_elements_by_xpath("//code"):
            if code.is_displayed():
                found_code = True
                token = code.text
                break
        assert(found_code)
        print token

        # Close Button
        found_button = False
        for btn in driver.find_elements_by_xpath("//button[contains(text(), 'Close')]"):
            if btn.is_displayed():
                found_button = True
                btn.click()
                break
        assert(found_button)
        driver.close()

        users['users'].append({'email': email, 'token': token})

    with open('users.json', 'w') as f:
        f.write(json.dumps(users, indent=2, sort_keys=True))
        
def main(url, genusers, curltrace, regex):
    if genusers:
        create_users(url)
    
    # scan this Python file for things that look like tests
    tests_fns = []
    predicate = lambda f: inspect.isfunction(f) and f.__module__ == __name__
    for name, fn in inspect.getmembers(sys.modules[__name__], predicate = predicate):
        if name.startswith('test'):
            tests_fns.append(fn)
    tests_fns.sort(key=lambda fn: fn.func_name)

    # execute each test
    with API(url=url+'/api', curltrace=curltrace) as api:
        for test_fn in tests_fns:
            print "\n============= %s ============\n" % test_fn.func_name
            if re.match(regex, test_fn.func_name):
                test_fn(api)
            else:
                print 'SKIP '
        api.dump_stats()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run some tests.')
    parser.set_defaults(genusers=False)
    parser.add_argument('--url', help='where to direct API calls', default='http://homestead.test')
    parser.add_argument('--genusers', help='generates users and tokens for use in tests', dest='genusers', action='store_true')
    parser.add_argument('--curltrace', help='dumps a curl trace to given file', default='')
    parser.add_argument('--regex', help='filter tests that run', default=r'.*')
    args = parser.parse_args()
    main(url=args.url, genusers=args.genusers, curltrace=args.curltrace, regex=args.regex)
