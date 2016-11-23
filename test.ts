
import {install} from 'source-map-support'
import * as http from 'http'
import { PathFinder } from './pathfinder'

install();

var routes = new PathFinder();

routes.create('/')
    .get((req, res) => {
        res.writeHead(200);
        res.write("Hey, I work!");
        res.end();
    });

routes.create('/test/me')
    .get((req, res) => {
        res.writeHead(200);
        res.write("Test me.");
        res.end();
    });

routes.create('/test/this/{var}')
    .get((req, res) => {
        res.writeHead(200);
        res.write("Found var = " + req.params['var']);
        res.end();
    });

routes.create('/test/this/{var}/that/{var2}')
    .get((req, res) => {
        res.writeHead(200);
        res.write(JSON.stringify(req.params, null, 2));
        res.end();
    });

routes.create('/test/you')
    .get((req, res) => {
        res.writeHead(200);
        res.write("Test you.");
        res.end();
    });

var server = http.createServer(routes.handle());

server.listen(1337);
