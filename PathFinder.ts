
import * as http from 'http';
import * as url from 'url';
import { CustomIncomingMessage, convertToCustomMessage } from "./CustomIncomingMessage"

type ActionHandler = (req: CustomIncomingMessage, res: http.ServerResponse) => void;

export class PathFinder {

    private paths: PathNode = new PathNode();

    private _navigatePath(path: string, partialHandler: (partial: string) => boolean) {
        if (path.startsWith('/')) path = path.substr(1, path.length - 1);
        path = path.toLowerCase();

        let partials = path.split('/');
        partials.every(partialHandler);
    }

    public create(path: string) {
        var current: PathNode = this.paths;
        this._navigatePath(path, (part) => {
            current = current.partials[part] = current.partials[part] || new PathNode();
            return true;
        });

        return new PathBuilder(current);
    }

    public handle() {

        let self = this;

        return (req: http.IncomingMessage, res: http.ServerResponse) => {
            let verb = req.method.toUpperCase();
            let request = convertToCustomMessage(req);
            let path = request.urlParts.pathname;

            let current: PathNode = self.paths;
            self._navigatePath(path, (part) => {
                let next = current.partials[part];

                if (!next) {
                    let variablePart = Object.keys(current.partials).find((part) => { return part.startsWith("{"); });
                    if (!!variablePart) {
                        var key = variablePart.slice(1, -1);
                        next = current.partials[variablePart];
                        request.params[key] = part;
                    }
                }

                current = next;

                return !!current;
            });

            let action: ActionHandler = current && current.handlers[verb] || NotFoundHandler;

            action(request, res);
        }
    }
}

let NotFoundHandler: ActionHandler = (req, res) => {
    res.writeHead(404);
    res.end();
}

class PathBuilder {

    private _path: PathNode;

    constructor(path: PathNode) {
        this._path = path;
    }

    private addActionHandler(action: string, handler: ActionHandler) {
        this._path.handlers[action] = handler;
    }

    get(handler: ActionHandler) {
        this.addActionHandler('GET', handler);
    }

    post(handler: ActionHandler) {
        this.addActionHandler('POST', handler);
    }

    put(handler: ActionHandler) {
        this.addActionHandler('PUT', handler);
    }

    patch(handler: ActionHandler) {
        this.addActionHandler('PATCH', handler);
    }

    delete(handler: ActionHandler) {
        this.addActionHandler('DELETE', handler);
    }

    all(handler: ActionHandler) {
        this.get(handler);
        this.post(handler);
        this.put(handler);
        this.patch(handler);
        this.delete(handler);
    }

}

class PathNode {
    partials: { [key: string]: PathNode } = {};
    handlers: { [verb: string]: ActionHandler } = {};
}

