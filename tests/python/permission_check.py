#!/usr/bin/python
import os, re

def route_iter():
    with open('../../routes/api.php') as f:
        lines = f.read().split(';')
        for i in range(len(lines)):
            lines[i] = lines[i].replace('\n', '').strip()

    for line in lines:
        if line.startswith('Route::post(') or line.startswith('Route::get('):
            yield line.split(", '")[1].split("')")[0].replace('@', '.')
        elif line.startswith('Route::resource('):
            controller = line.split(", '")[1].split("'")[0]
            for method in line.split("'only' => ['")[1].split("']")[0].split("', '"):
                yield controller + '.' + method

def auth_dict():
    auths = {}
    base = '../../app/Http/Controllers/'
    for p in os.listdir(base):
        path = base + '/' + p
        path_parts = path.split('.')
        if not path_parts[-1] == 'php':
            continue
        controller = path_parts[-2].split('/')[-1]
        with open(path) as f:
            method = None
            for l in f:
                m = re.search(r'public function (.*)\(', l)
                if m:
                    method = m.group(1)
                m = re.search(r'this->authorize\(\'(.*?)\'', l)
                if m:
                    capability = m.group(1)
                    auths['%s.%s' % (controller, method)] = capability
    return auths
    
def main():
    auths = auth_dict()

    print '%s %s' % ('API'.ljust(40), 'Election Capability')
    print '='*80
    for route in sorted(list(route_iter())):
        print '%s <%s>' % (route.ljust(40), auths.get(route, 'NONE'))

if __name__ == '__main__':
    main()
