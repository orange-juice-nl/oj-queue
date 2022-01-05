import { EventAggregator } from "oj-eventaggregator";
export declare type QueueFn<T, R> = (data: T, res: (data: R) => void, rej: (error: Error) => void) => void;
export declare enum Status {
    PENDING = 0,
    BUSY = 1,
    REMOVED = 2
}
export declare class QueueItem<T extends Object, R> extends EventAggregator<{
    "error": any;
    "retry": any;
}> {
    id: string | number;
    data: T;
    status: Status;
    promise: Promise<R>;
    exec: () => void;
    queue: Queue<T, R>;
    constructor(id: string | number, data: T, queue: Queue<T, R>);
}
export interface IQueueOptions {
    concurrent?: number;
    retries?: number;
}
export declare class Queue<T extends Object, R> {
    private queue;
    private __id;
    resolver: QueueFn<T, R>;
    options: IQueueOptions;
    constructor(resolver: QueueFn<T, R>, options?: IQueueOptions);
    find(id: string | number): any;
    nextId(): number;
    add(id: string | number, data: T, delay?: number): Promise<R>;
    allowNext(): boolean;
    remove(item: QueueItem<T, R>): void;
    next(all?: boolean): void;
}
