/**
 * Created by py on 06/09/16.
 */

class Worker {
    constructor(id){
        this.id = id;
    }

    handle(request) {

    }

    extract (request) {
        return request.params;
    }
}

module.exports = Worker;