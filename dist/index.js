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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
        while (_) try {
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
exports.Queue = exports.QueueItem = exports.Status = void 0;
var oj_eventaggregator_1 = require("oj-eventaggregator");
var Status;
(function (Status) {
    Status[Status["PENDING"] = 0] = "PENDING";
    Status[Status["BUSY"] = 1] = "BUSY";
    Status[Status["REMOVED"] = 2] = "REMOVED";
})(Status = exports.Status || (exports.Status = {}));
var QueueItem = /** @class */ (function (_super) {
    __extends(QueueItem, _super);
    function QueueItem(id, data, queue) {
        var _this = _super.call(this) || this;
        _this.id = id;
        _this.data = data;
        _this.status = Status.PENDING;
        _this.queue = queue;
        var resolver;
        var rejector;
        _this.promise = new Promise(function (resolve, reject) {
            resolver = resolve;
            rejector = reject;
        });
        _this.exec = function () {
            _this.status = Status.BUSY;
            Promise.resolve()
                .then(function () {
                _this.queue.resolver(_this.data, resolver, rejector);
                return _this.promise;
            })
                .catch(function (err) {
                var _a;
                if (!_this.queue.options.retries) {
                    _this.emit("error", err);
                    return;
                }
                if ("__retry" in data && data["__retry"] >= _this.queue.options.retries) {
                    _this.emit("error", err);
                    return;
                }
                _this.emit("retry", err);
                var retry = (_a = data["__retry"]) !== null && _a !== void 0 ? _a : 0;
                _this.queue.add(id + "_", __assign(__assign({}, data), { __retry: retry + 1 }), (retry + 1) * 5000)
                    .catch(function () { });
            })
                .finally(function () {
                _this.queue.remove(_this);
                setTimeout(function () { return _this.queue.next(); }, 1000);
            });
        };
        return _this;
    }
    return QueueItem;
}(oj_eventaggregator_1.EventAggregator));
exports.QueueItem = QueueItem;
var Queue = /** @class */ (function () {
    function Queue(resolver, options) {
        if (options === void 0) { options = {}; }
        this.queue = [];
        this.__id = 0;
        this.options = options;
        this.resolver = resolver;
    }
    Queue.prototype.find = function (id) {
        return this.queue.find(function (x) { return x.id === id; });
    };
    Queue.prototype.nextId = function () {
        return this.__id++;
    };
    Queue.prototype.add = function (id, data, delay) {
        if (delay === void 0) { delay = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var qi, item;
            var _this = this;
            return __generator(this, function (_a) {
                qi = this.find(id);
                if (qi)
                    return [2 /*return*/, qi.promise];
                item = new QueueItem(id, data, this);
                if (!delay) {
                    this.queue.push(item);
                    this.next();
                }
                else
                    setTimeout(function () {
                        _this.queue.push(item);
                        _this.next();
                    }, delay);
                return [2 /*return*/, item.promise];
            });
        });
    };
    Queue.prototype.allowNext = function () {
        var _a;
        var running = this.queue.filter(function (x) { return x.status === Status.BUSY; });
        return running.length < ((_a = this.options.concurrent) !== null && _a !== void 0 ? _a : 1);
    };
    Queue.prototype.remove = function (item) {
        var i = this.queue.indexOf(item);
        if (i !== -1)
            this.queue.splice(i, 1);
    };
    Queue.prototype.next = function (all) {
        if (all === void 0) { all = false; }
        if (!this.allowNext())
            return;
        var qi = this.queue.find(function (x) { return x.status === Status.PENDING; });
        if (!qi)
            return;
        qi.exec();
        if (all)
            this.next(all);
    };
    return Queue;
}());
exports.Queue = Queue;
