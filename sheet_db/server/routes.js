function route(method, path, body) {

    path = path.split('/')

    let result;

    if (path[0] === 'trackingEntries') {
        result = trackingService(method, path.slice(1), body)
    } else {
        result = {"message": "No such path"}
    }

    return result;
}