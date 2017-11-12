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
    headers = {'Authorization': 'Bearer '+user['token']}
    r = requests.get(url = URL + '/' + url, headers=headers)
    d = r.content
    try:
        return json.loads(d)
    except:
        print 'could not parse: ' + d[:100] + '...'
        dump(d)
        assert(0)

def user_put(user, url, body):
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
    return user_put(user, 'election', {"name": name})

def get_candidates(user, election):
    url = 'election/%d/candidate' % election['id']
    return user_get(user, url)

def get_electors(user, election):
    url = 'election/%d/elector' % election['id']
    return user_get(user, url)

def create_candidate(user, election, name):
    url = 'election/%d/candidate' % election['id']
    return user_put(user, url, {"name": name})

def set_rank(user, election, candidate, rank):
    url = 'election/%d/candidate/%d/rank' % (election['id'], candidate['id'])
    return user_put(user, url, {"rank": rank})

def invite(user, election, email):
    url = 'election/%d/invite' % (election['id'])
    return user_put(user, url, {"email": email})

def accept(user, code):
    url = 'invite/accept'
    return user_put(user, url, {"code": code})

def election_result(user, election):
    url = 'election/%d/result' % election['id']
    return user_get(user, url)

def test1():
    users = load_users()
    user = users[0]

    # election
    len1 = len(get_elections(user))
    election = create_election(user, 'test-election')
    len2 = len(get_elections(user))
    assert(len2 == len1 + 1)

    # electors
    code = invite(user, election, user['email'])['code']
    accept(user, code)
    get_electors(user, election)

    # candidates
    A = create_candidate(user, election, 'candidate-A')
    B = create_candidate(user, election, 'candidate-B')
    C = create_candidate(user, election, 'candidate-C')
    assert(len(get_candidates(user, election)) == 3)

    # vote
    set_rank(user, election, A, 2)
    set_rank(user, election, B, 1)
    set_rank(user, election, C, 3)

    # result
    print election_result(user, election)

def main():
    test1()

if __name__ == '__main__':
    main()
