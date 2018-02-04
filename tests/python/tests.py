#!/usr/bin/env python
import os, sys, json, requests
from collections import defaultdict as ddict

URL = 'http://homestead.test/api'

def load_users():
    with open('users.json') as f:
        return json.loads(f.read())["users"]

def dump(out):
    with open('dump.html', 'w') as f:
        f.write(out)

# generic API
def user_get(user, url):
    global URL
    print 'GET '+url
    headers = {'Authorization': 'Bearer '+user['token']}
    r = requests.get(url = URL + '/' + url, headers=headers)
    d = r.content
    try:
        return json.loads(d)
    except:
        print 'could not parse: ' + d[:100] + '...'
        dump(d)
        assert(0)

def user_post(user, url, body):
    global URL
    print 'POST '+url
    headers = {'Authorization': 'Bearer '+user['token']}
    r = requests.post(url = URL + '/' + url, headers=headers, data=json.dumps(body))
    d = r.content
    try:
        return json.loads(d)
    except:
        print 'could not parse: ' + d[:100] + '...'
        dump(d)
        assert(0)

# pivot API wrappers
def get_elections(user):
    return user_get(user, 'election')

def create_election(user, name):
    return user_post(user, 'election', {"name": name})

def get_candidates(user, election):
    url = 'election/%d/candidate' % election['id']
    return user_get(user, url)

def get_electors(user, election):
    url = 'election/%d/elector' % election['id']
    return user_get(user, url)

def create_candidate(user, election, name):
    url = 'election/%d/candidate' % election['id']
    return user_post(user, url, {"name": name})

def set_rank(user, election, candidate, rank):
    url = 'election/%d/candidate/%d/rank' % (election['id'], candidate['id'])
    return user_post(user, url, {"rank": rank})

def invite(user, election, email):
    url = 'election/%d/invite' % (election['id'])
    return user_post(user, url, {"email": email})

def accept(user, code):
    url = 'invite/accept'
    return user_post(user, url, {"code": code})

def acceptable(user):
    url = 'invite/acceptable'
    return user_post(user, url, {})

def election_result(user, election):
    url = 'election/%d/result' % election['id']
    return user_get(user, url)

def batchvote(user, election, votes):
    url = 'election/%d/batchvote' % election['id']
    return user_post(user, url, {'votes': votes})

def batchvote_view(user, election):
    url = 'election/%d/batchvote' % election['id']
    return user_get(user, url)

def test1():
    print "\n============= TEST 1 ============\n"
    users = load_users()
    userA = users[0]
    userB = users[1]

    # election (A's view)
    len1A = len(get_elections(userA))
    len1B = len(get_elections(userB))
    election = create_election(userA, 'test-election')
    len2A = len(get_elections(userA))
    len2B = len(get_elections(userB))
    assert(len2A == len1A + 1)
    assert(len2B == len1B)

    # election (B's view)
    len1 = len(get_elections(userA))
    election = create_election(userA, 'test-election')
    len2 = len(get_elections(userA))
    assert(len2 == len1 + 1)

    # electors
    invite_status = invite(userA, election, userA['email'])
    print 'invite_status: %s' % str(invite_status)
    code = invite_status['code']
    print code
    accept(userA, code)
    invite_status = invite(userA, election, userB['email'])
    print 'invite_status: %s' % str(invite_status)
    code = invite_status['code']
    electors = get_electors(userA, election)
    assert(len(electors) == 1)
    acceptables = acceptable(userB)
    codes = [inv['code'] for inv in acceptables]
    assert (code in codes)
    accept(userB, code)
    electors = get_electors(userA, election)
    assert(len(electors) == 2)
    electors = get_electors(userB, election)
    assert(len(electors) == 2)

    # verify B can now see it after being added
    len3B = len(get_elections(userB))
    assert(len3B == len2B + 1)

    # candidates
    A = create_candidate(userA, election, 'candidate-A')
    B = create_candidate(userA, election, 'candidate-B')
    C = create_candidate(userA, election, 'candidate-C')
    assert(len(get_candidates(userA, election)) == 3)

    # vote
    batch = True
    votes = [
        {'candidate_id': A['id'], 'rank': 2},
        {'candidate_id': B['id'], 'rank': 1},
        {'candidate_id': C['id'], 'rank': 3},
    ]
    bv1 = batchvote(userA, election, votes)
    bv2 = batchvote_view(userA, election)
    assert(len(bv1)) == len(votes)
    assert(len(bv2)) == len(votes)

    # result
    print election_result(userA, election)
    print election_result(userB, election)

def test2():
    """
    This tests one user voting on their own election.
    """
    print "\n============= TEST 2 ============\n"
    users = load_users()
    userA = users[0]
    userB = users[1]

    election = create_election(userA, 'Triceritops Rex')
    invite_status = invite(userA, election, userA['email'])
    code = invite_status['code']
    accept(userA, code)

    A = create_candidate(userA, election, 'candidate-A')
    B = create_candidate(userA, election, 'candidate-B')
    C = create_candidate(userA, election, 'candidate-C')
    D = create_candidate(userA, election, 'candidate-D')

    votes = [
        {'candidate_id': A['id'], 'rank': 1},
        {'candidate_id': B['id'], 'rank': 2},
        {'candidate_id': C['id'], 'rank': 3},
        {'candidate_id': D['id'], 'rank': 4},
    ]
    bv1 = batchvote(userA, election, votes)
    results = election_result(userA, election)
    result_names = [result['name'] for result in results['order']]
    assert(result_names == [u'candidate-A', u'candidate-B', u'candidate-C', u'candidate-D'])
    print result_names

def main(url = ''):
    global URL
    if len(url) > 0:
        URL = url
    else:
        print "\n no url specified. Using default " + URL
    test1()
    test2()

if __name__ == '__main__':
    main(*sys.argv[1:])
