"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var queue = {};
var order = [];
var concurrent = 2;
exports.setConcurrent = function (n) {
    return concurrent = n;
};
exports.add = function (id, fn) {
    if (!queue[id]) {
        order.push(id);
        var resolver_1;
        var rejector_1;
        var promise = new Promise(function (res, rej) {
            resolver_1 = res;
            rejector_1 = rej;
        });
        queue[id] = {
            promise: promise,
            resolver: resolver_1,
            rejector: rejector_1,
            fn: fn,
            busy: null,
        };
        if (allowNext())
            run(order.shift());
    }
    return queue[id].promise;
};
var run = function (id) {
    if (!queue[id])
        throw new Error("No queued task with id \"" + id + "\"");
    queue[id].busy = true;
    queue[id].fn(function (val, err) {
        if (err)
            queue[id].rejector(err);
        else
            queue[id].resolver(val);
        queue[id].busy = false;
        if (allowNext() && order[0])
            run(order.shift());
        delete queue[id];
    });
};
var getRunning = function () {
    return Object.keys(queue)
        .map(function (x) { return queue[x]; })
        .filter(function (x) { return x.busy === true; });
};
var allowNext = function () {
    return getRunning().length < concurrent;
};
