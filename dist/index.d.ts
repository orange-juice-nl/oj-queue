import { EventAggregator } from "oj-eventaggregator";
export type QueueFn<Result, Data> = (data: Data, resolve: (value: Result | PromiseLike<Result>) => void, reject: (reason?: any) => void) => void;
export type QueueStatus = "PENDING" | "BUSY" | "DONE";
export declare class QueueItem<Result, Data> {
    private readonly delegate;
    private readonly handler;
    private _status;
    private _error?;
    readonly data: Data;
    readonly priority: number;
    constructor(handler: QueueFn<Result, Data>, data: Data, priority?: number);
    private listen;
    get promise(): Promise<Result>;
    get status(): QueueStatus;
    get error(): Error;
    execute(): Promise<Result>;
    resolve(value: Result): Promise<Result>;
    reject(err: Error): Promise<Result>;
}
export declare class Queue extends EventAggregator<{
    "add": QueueItem<any, any>;
    "remove": QueueItem<any, any>;
    "busy": QueueItem<any, any>;
    "done": QueueItem<any, any>;
    "error": QueueItem<any, any>;
}> {
    readonly options: {
        concurrent: number;
        delay: number;
    };
    readonly items: QueueItem<any, any>[];
    private addTimer;
    constructor(opts?: Partial<Queue["options"]>);
    add(...items: QueueItem<any, any>[]): this;
    sort(): this;
    next(): this;
    finish(item: QueueItem<any, any>): this;
    remove(item: QueueItem<any, any>, reject?: boolean): this;
}
export declare const queue: () => {
    q: Queue;
    add: <T>(fn: () => Promise<T>) => Promise<T>;
};
