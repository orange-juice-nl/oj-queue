"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQueue = function (concurrent) {
    if (concurrent === void 0) { concurrent = 2; }
    var queue = {};
    var order = [];
    var id = 0;
    var paused = false;
    var add = function (id, fn) {
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
    var cancel = function (id) {
        var i = order.indexOf(id);
        if (id !== -1)
            order.splice(i);
    };
    var nextId = function () {
        return id++;
    };
    var pause = function () {
        return paused = true;
    };
    var resume = function () {
        paused = false;
        while (allowNext() && order[0])
            run(order.shift());
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
            while (allowNext() && order[0])
                run(order.shift());
            delete queue[id];
        });
    };
    var allowNext = function () {
        return !paused
            && getRunning().length < concurrent;
    };
    var getRunning = function () {
        return Object.keys(queue)
            .map(function (x) { return queue[x]; })
            .filter(function (x) { return x.busy === true; });
    };
    return {
        add: add,
        nextId: nextId,
        pause: pause,
        resume: resume,
        cancel: cancel
    };
};
