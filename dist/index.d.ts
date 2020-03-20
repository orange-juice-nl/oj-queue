declare type PromiseFn = (done: (value: any, error?: any) => void) => void | Promise<void>;
export declare const setConcurrent: (n: number) => number;
export declare const add: <R>(id: string, fn: PromiseFn) => Promise<R>;
export {};
