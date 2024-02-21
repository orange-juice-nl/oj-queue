"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = exports.Queue = exports.QueueItem = void 0;
var oj_eventaggregator_1 = require("oj-eventaggregator");
var oj_promise_utils_1 = require("oj-promise-utils");
var QueueItem = /** @class */ (function () {
    function QueueItem(handler, data, priority) {
        if (priority === void 0) { priority = 0; }
        this.handler = handler;
        this.data = data;
        this._status = "PENDING";
        this.delegate = (0, oj_promise_utils_1.delegate)();
        this.priority = priority;
        this.listen();
    }
    QueueItem.prototype.listen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, this.delegate.promise];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        this._error = err_1;
                        return [3 /*break*/, 4];
                    case 3:
                        this._status = "DONE";
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(QueueItem.prototype, "promise", {
        get: function () {
            return this.delegate.promise;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueueItem.prototype, "status", {
        get: function () {
            return this._status;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueueItem.prototype, "error", {
        get: function () {
            return this._error;
        },
        enumerable: false,
        configurable: true
    });
    QueueItem.prototype.execute = function () {
        this._status = "BUSY";
        this.handler(this.data, this.delegate.resolve, this.delegate.reject);
        return this.promise;
    };
    QueueItem.prototype.resolve = function (value) {
        this.delegate.resolve(value);
        return this.promise;
    };
    QueueItem.prototype.reject = function (err) {
        this.delegate.reject(err);
        return this.promise;
    };
    return QueueItem;
}());
exports.QueueItem = QueueItem;
var Queue = /** @class */ (function (_super) {
    __extends(Queue, _super);
    function Queue(opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this) || this;
        _this.items = [];
        _this.options = Object.assign({ concurrent: 1, delay: 0 }, opts);
        return _this;
    }
    Queue.prototype.add = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        var _loop_1 = function (item) {
            item.promise
                .then(function () { return _this.emit("done", item); })
                .catch(function () { return _this.emit("error", item); })
                .finally(function () { return _this.finish(item); });
            this_1.items.push(item);
            this_1.emit("add", item);
        };
        var this_1 = this;
        for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
            var item = items_1[_a];
            _loop_1(item);
        }
        globalThis.clearTimeout(this.addTimer);
        this.addTimer = globalThis.setTimeout(function () {
            _this.sort();
            _this.next();
        }, this.options.delay);
        return this;
    };
    Queue.prototype.sort = function () {
        this.items.sort(function (a, b) { return a.priority - b.priority; });
        return this;
    };
    Queue.prototype.next = function () {
        var busy = this.items.filter(function (x) { return x.status === "BUSY"; });
        var slots = this.options.concurrent - busy.length;
        if (slots < 1)
            return this;
        for (var i = 0; i < slots; i++) {
            var item = this.items.find((function (x) { return x.status === "PENDING"; }));
            if (!item)
                return this;
            item.execute();
            this.emit("busy", item);
        }
        return this;
    };
    Queue.prototype.finish = function (item) {
        this.remove(item);
        this.next();
        return this;
    };
    Queue.prototype.remove = function (item, reject) {
        if (reject === void 0) { reject = true; }
        var index = this.items.indexOf(item);
        if (index !== -1)
            this.items.splice(index, 1);
        if (reject)
            item.reject(new Error("removed from queue"));
        this.emit("remove", item);
        return this;
    };
    return Queue;
}(oj_eventaggregator_1.EventAggregator));
exports.Queue = Queue;
var queue = function () {
    var q = new Queue();
    return {
        q: q,
        add: function (fn) {
            var qi = new QueueItem(function (_, res, rej) { return fn().then(res).catch(rej); }, undefined);
            q.add(qi);
            return qi.promise;
        }
    };
};
exports.queue = queue;
