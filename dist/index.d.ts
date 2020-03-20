declare type PromiseFn<T> = (done: (value: T | null, error?: any) => void) => void | Promise<void>;
export interface IQueueInstance {
    add<T>(id: string | number, fn: PromiseFn<T>): Promise<T>;
    nextId: () => number;
    pause: () => void;
    resume: () => void;
    cancel: (id: string | number) => void;
}
export declare const createQueue: (concurrent?: number) => IQueueInstance;
export {};
