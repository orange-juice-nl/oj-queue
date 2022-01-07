import { EventAggregator } from "oj-eventaggregator";
export declare type QueueFn<T, R> = (data: T, resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: any) => void) => void;
export declare type QueueStatus = "PENDING" | "BUSY" | "DONE";
export declare class QueueItem<T = any, R = any> {
    private readonly delegate;
    private readonly handler;
    private readonly data;
    private _status;
    private _error?;
    constructor(handler: QueueFn<T, R>, data: T);
    private listen;
    get promise(): Promise<R>;
    get status(): QueueStatus;
    get error(): Error;
    execute(): Promise<R>;
    cancel(err: Error): Promise<R>;
}
export declare class Queue extends EventAggregator<{
    "add": QueueItem;
    "remove": QueueItem;
    "busy": QueueItem;
    "done": QueueItem;
    "error": QueueItem;
}> {
    concurrent: number;
    items: QueueItem[];
    constructor(opts?: {
        concurrent?: number;
    });
    add<T, R>(handler: QueueFn<T, R>, data: T): Promise<R>;
    remove(item: QueueItem): void;
    next(): void;
}
