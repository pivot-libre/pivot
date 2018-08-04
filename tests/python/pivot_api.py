from collections import defaultdict as ddict
import os, sys, json, requests, re, time

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
        with open(os.path.dirname(os.path.realpath(__file__))+'/users.json') as f:
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
            if self.next_should_fail or d == "":
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
        return self.user_get(user, 'elections')

    def create_election(self, user, name):
        return self.user_post(user, 'elections', {"name": name})

    def delete_election(self, user, election):
        url = 'elections/%d' % election['id']
        return self.user_delete(user, url)

    def get_candidates(self, user, election):
        url = 'elections/%d/candidates' % election['id']
        return self.user_get(user, url)

    def create_candidate(self, user, election, name):
        url = 'elections/%d/candidates' % election['id']
        return self.user_post(user, url, {"name": name})

    def delete_candidate(self, user, election, candidate):
        url = 'elections/%d/candidates/%d' % (election['id'], candidate['id'])
        return self.user_delete(user, url)

    def delete_elector(self, user, election, elector):
        url = 'elections/%d/electors/%d' % (election['id'], elector['id'])
        return self.user_delete(user, url)

    def get_electors(self, user, election):
        url = 'elections/%d/electors' % election['id']
        return self.user_get(user, url)

    def get_elector(self, user, election, elector_id):
        url = 'elections/%d/electors/%d' % (election['id'], elector_id)
        return self.user_get(user, url)

    def set_rank(self, user, election, candidate, rank):
        url = 'elections/%d/candidates/%d/rank' % (election['id'], candidate['id'])
        return self.user_post(user, url, {"rank": rank})

    def invite(self, user, election, email):
        url = 'elections/%d/invite' % (election['id'])
        return self.user_post(user, url, {"email": email})

    def accept(self, user, code):
        url = 'invite/accept'
        return self.user_post(user, url, {"code": code})

    def acceptable(self, user):
        url = 'invite/acceptable'
        return self.user_get(user, url)

    def election_result(self, user, election):
        url = 'elections/%d/result' % election['id']
        return self.user_get(user, url)

    def batchvote(self, user, election, votes):
        url = 'elections/%d/batchvote' % election['id']
        return self.user_post(user, url, {'votes': votes})

    def batchvote_view(self, user, election):
        url = 'elections/%d/batchvote' % election['id']
        return self.user_get(user, url)

    def batch_candidates(self, user, election, candidates):
        url = 'elections/%d/batch_candidates' % election['id']
        return self.user_post(user, url, {'candidates': candidates})

    def batch_candidates_view(self, user, election):
        url = 'elections/%d/batch_candidates' % election['id']
        return self.user_get(user, url)

    def add_elector(self, election, admin, user):
        invite_status = self.invite(admin, election, user['email'])
        code = invite_status['election_id']
        return self.accept(user, code)

    def get_ready(self, user, election):
        url = 'elections/%d/get_ready' % election['id']
        return self.user_get(user, url)

    def set_ready(self, user, election, version):
        url = 'elections/%d/set_ready' % election['id']
        return self.user_post(user, url, {'approved_version': version})

    def voter_stats(self, user, election):
        url = 'elections/%d/voter_stats' % election['id']
        return self.user_get(user, url)

    def voter_details(self, user, election):
        url = 'elections/%d/voter_details' % election['id']
        return self.user_get(user, url)

    def create_result_snapshot(self, user, election):
        url = 'elections/%d/result_snapshots' % election['id']
        return self.user_post(user, url, {})

    def get_result_snapshot(self, user, election, snap_id):
        url = 'elections/%d/result_snapshots/%d' % (election['id'], snap_id)
        return self.user_get(user, url)

    def list_result_snapshots(self, user, election):
        url = 'elections/%d/result_snapshots' % (election['id'])
        return self.user_get(user, url)

    def delete_result_snapshot(self, user, election, snap_id):
        url = 'elections/%d/result_snapshots/%d' % (election['id'], snap_id)
        return self.user_delete(user, url)
