#!/usr/bin/env python
import os, sys, json, requests
from collections import defaultdict as ddict

URL = 'http://homestead.app/api'

def load_users():
    with open('users.json') as f:
        return json.loads(f.read())["users"]

def dump(out):
    with open('dump.html', 'w') as f:
        f.write(out)

# generic API
def user_get(user, url):
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
    code = invite(userA, election, userA['email'])['code']
    print code
    accept(userA, code)
    code = invite(userA, election, userB['email'])['code']
    electors = get_electors(userA, election)
    assert(len(electors) == 1)
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

def main():
    test1()

if __name__ == '__main__':
    main()
