#!/usr/bin/env python
import os, sys, json, requests, time, re, argparse, inspect, random, itertools
from pivot_api import API

def flatten_results(results):
    return list(itertools.chain(*results))

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
    code = invite_status['id']
    print(code)
    api.accept(userA, code)
    invite_status = api.invite(userA, election, userB['email'])
    code = str(invite_status['id'])
    electors = api.get_electors(userA, election)
    print(electors)
    assert(len(electors) == 1)
    acceptables = api.acceptable(userB)
    print(acceptables)
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

    ready = api.get_ready(userA, election)
    api.set_ready(userA, election, ready['latest_version'])

    # result
    print(api.election_result(userA, election))
    print(api.election_result(userB, election))

def test2(api):
    """
    This tests one user voting on their own election.
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'Triceritops Rex')
    invite_status = api.invite(userA, election, userA['email'])
    code = invite_status['id']
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
    ready = api.get_ready(userA, election)
    api.set_ready(userA, election, ready['latest_version'])
    results = api.election_result(userA, election)
    print(results)
    order = flatten_results(results['order'])
    result_names = [result['name'] for result in order]
    assert(result_names == [u'candidate-A', u'candidate-B', u'candidate-C', u'candidate-D'])
    print(result_names)

def test3(api):
    """
    This tests verifies that an elector can view other electors
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test3-election')
    print(api.add_elector(election, userA, userB))
    print(api.get_electors(userA, election))
    # an elector may view the list of electors
    print(api.get_electors(userB, election))

def test4(api):
    """
    This verifies a user cannot accept an invitation not associated with their email
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test4-election')
    invite_status = api.invite(userA, election, userA['email'])
    code = invite_status['id']

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
    print(api.delete_candidate(userA, election, A))
    print(api.delete_election(userA, election))

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
    code = invite1['id']
    # multiple accepts should return the same first timestamp
    accept1 = api.accept(userB, code)
    print(accept1)
    accept2 = api.accept(userB, code)
    print(accept1)
    print(accept2)
    assert(accept1['id'] == accept2['id'])
    print(accept1['invite_accepted_at'], accept2['invite_accepted_at'])
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
                assert('user_name' in voters[0])
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
    code = invite_status['id']
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

def test10(api):
    """
    This tests elector deletion
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    # create election
    election = api.create_election(userA, 'test10-election')
    electorB = api.add_elector(election, userA, userB)
    electors = api.get_electors(userA, election)
    assert(len(electors) == 1)
    print(api.get_elector(userA, election, electorB['id']))
    print(api.delete_elector(userA, election, electorB))
    electors = api.get_electors(userA, election)
    assert(len(electors) == 0)
    
def test11(api):
    """
    This tests result-snapshot storage, without considering actual results
    """
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test11-election')
    invite_status = api.invite(userA, election, userB['email'])
    code = invite_status['id']
    electorB = api.accept(userB, code)

    D = api.create_candidate(userA, election, 'candidate-D')
    A = api.create_candidate(userA, election, 'candidate-A')
    C = api.create_candidate(userA, election, 'candidate-C')
    B = api.create_candidate(userA, election, 'candidate-B')

    votes = [
        {'candidate_id': A['id'], 'rank': 1}, # worst
        {'candidate_id': B['id'], 'rank': 2},
        {'candidate_id': C['id'], 'rank': 3},
        {'candidate_id': D['id'], 'rank': 4}, # best
    ]
    bv1 = api.batchvote(userB, election, votes)

    ready = api.get_ready(userB, election)
    api.set_ready(userB, election, ready['latest_version'])

    # admin should be able to snapshot
    assert(len(api.list_result_snapshots(userA, election)) == 0)
    snap_id = api.create_result_snapshot(userA, election)['id']
    snap = api.get_result_snapshot(userA, election, snap_id)
    result = snap.get('result_blob')
    print('EXPECTED: ' + str(votes))
    order = flatten_results(result['order'])
    print('RESULTS: ' + str([c['id'] for c in order]))
    for i, candidate in enumerate(order):
        print(candidate)
        assert(candidate['id'] == votes[i]['candidate_id'])
    snaps = api.list_result_snapshots(userA, election)
    assert(len(snaps) == 1)
    assert(snaps[0]['id'] == snap_id)

    # other electors should not be able to
    api.expect_fail()
    api.create_result_snapshot(userB, election)
    assert(len(api.list_result_snapshots(userA, election)) == 1)
    api.expect_fail()
    api.delete_result_snapshot(userB, election, snap_id)
    assert(len(api.list_result_snapshots(userA, election)) == 1)

    # admin should be able to delete
    print(api.delete_result_snapshot(userA, election, snap_id))
    assert(len(api.list_result_snapshots(userA, election)) == 0)

def test12(api):
    # test ties
    users = api.load_users()
    userA = users[0]
    userB = users[1]

    election = api.create_election(userA, 'test-election')
    electorA = api.add_elector(election, userA, userA)
    
    A = api.create_candidate(userA, election, 'candidate-A')
    B = api.create_candidate(userA, election, 'candidate-B')

    # TODO: nothing expected yet, because nobody is ready
    # assert('order' in api.election_result(userA, election)) #1

    votes = [
        {'candidate_id': A['id'], 'rank': 1},
    ]
    api.batchvote(userA, election, votes)
    api.set_ready(userA, election, api.get_ready(userA, election)['latest_version']) # approve
    assert('order' in api.election_result(userA, election)) #2

    votes = [
        {'candidate_id': A['id'], 'rank': 1},
        {'candidate_id': B['id'], 'rank': 1},
    ]
    api.batchvote(userA, election, votes)
    api.set_ready(userA, election, api.get_ready(userA, election)['latest_version']) # approve
    assert('order' in api.election_result(userA, election)) #3
    
    electorB = api.add_elector(election, userA, userB)
    api.set_ready(userB, election, api.get_ready(userB, election)['latest_version']) # approve
    assert('order' in api.election_result(userA, election)) #4

    api.batchvote(userB, election, votes)
    api.set_ready(userB, election, api.get_ready(userB, election)['latest_version']) # approve
    assert('order' in api.election_result(userA, election)) #5

def test13(api):
    # test errors when there are no candidates
    users = api.load_users()
    userA = users[0]

    election = api.create_election(userA, 'test-election')
    electorA = api.add_elector(election, userA, userA)
    
    A = api.create_candidate(userA, election, 'candidate-A')
    B = api.create_candidate(userA, election, 'candidate-B')

    votes = [
        {'candidate_id': A['id'], 'rank': 1},
    ]
    result = api.election_result(userA, election)
    expected = 'there were 0 ballots ready for the election'
    assert(result['error'] == expected)

def test14(api):
    # test multiple electors controlled by same user
    users = api.load_users()
    userA = users[0]

    election = api.create_election(userA, 'test-election')
    elector0 = api.add_elector(election, userA, userA)
    elector1 = api.add_elector(election, userA, userA, 'voter1')
    elector2 = api.add_elector(election, userA, userA, 'voter2')
    elector3 = api.add_elector(election, userA, userA, 'voter3')
    electors = api.get_electors_for_self(userA, election)
    print electors
    assert(len(electors) == 4)

    # cannot add self twice
    api.add_elector(election, userA, userA)
    electors = api.get_electors_for_self(userA, election)
    print electors
    assert(len(electors) == 4)

    # cannot add another voter twice
    api.add_elector(election, userA, userA, 'voter1')
    electors = api.get_electors_for_self(userA, election)
    print electors
    assert(len(electors) == 4)

    acceptables_before = api.acceptable(userA)
    invite4 = api.invite(userA, election, userA['email'], 'voter4')
    print
    print(invite4)
    print
    invite5 = api.invite(userA, election, userA['email'], 'voter5')
    acceptables_after = api.acceptable(userA)
    assert(len(acceptables_after) == len(acceptables_before) + 2)

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
        print('grab token')
        found_code = False
        for code in driver.find_elements_by_xpath("//code"):
            if code.is_displayed():
                found_code = True
                token = code.text
                break
        assert(found_code)
        print(token)

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

    with open(os.path.dirname(os.path.realpath(__file__))+'/users.json', 'w') as f:
        f.write(json.dumps(users, indent=2, sort_keys=True))

def sort_test_functions(test_fns):
    def sort_key(name):
        parts = []
        for c in name:
            if len(parts)>0 and parts[-1].isdigit() and c.isdigit():
                parts[-1] += c
            else:
                parts.append(c)
        for i in range(len(parts)):
            if parts[i].isdigit():
                parts[i] = int(parts[i])
        return parts
    test_fns.sort(key=lambda fn: sort_key(fn.func_name))
        
def main(url, genusers, curltrace, regex):
    if genusers:
        create_users(url)
    
    # scan this Python file for things that look like tests
    test_fns = []
    predicate = lambda f: inspect.isfunction(f) and f.__module__ == __name__
    for name, fn in inspect.getmembers(sys.modules[__name__], predicate = predicate):
        if name.startswith('test'):
            test_fns.append(fn)
    sort_test_functions(test_fns)

    # execute each test
    skips = []
    with API(url=url+'/api', curltrace=curltrace) as api:
        for test_fn in test_fns:
            if re.match(regex, test_fn.func_name):
                print("\n============= %s ============\n" % test_fn.func_name)
                test_fn(api)
            else:
                skips.append(test_fn.func_name)
        api.dump_stats()
    if len(skips):
        print("\n============= SKIPPED ============\n")
        print(', '.join(skips))
        print()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run some tests.')
    parser.set_defaults(genusers=False)
    parser.add_argument('--url', help='where to direct API calls', default='http://homestead.test')
    parser.add_argument('--genusers', help='generates users and tokens for use in tests', dest='genusers', action='store_true')
    parser.add_argument('--curltrace', help='dumps a curl trace to given file', default='')
    parser.add_argument('--regex', help='filter tests that run', default=r'.*')
    args = parser.parse_args()
    main(url=args.url, genusers=args.genusers, curltrace=args.curltrace, regex=args.regex)
