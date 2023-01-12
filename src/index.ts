import { EventAggregator } from "oj-eventaggregator"
import { delegate } from "oj-promise-utils"

export type QueueFn<Result, Data> = (data: Data, resolve: (value: Result | PromiseLike<Result>) => void, reject: (reason?: any) => void) => void
export type QueueStatus = "PENDING" | "BUSY" | "DONE"

export class QueueItem<Result, Data>{
    private readonly delegate: { promise: Promise<Result>; resolve: (value: Result | PromiseLike<Result>) => void; reject: (reason?: any) => void }
    private readonly handler: QueueFn<Result, Data>
    private _status: QueueStatus
    private _error?: Error
    readonly data: Data
    readonly priority: number

    constructor(handler: QueueFn<Result, Data>, data: Data, priority = 0) {
        this.handler = handler
        this.data = data
        this._status = "PENDING"
        this.delegate = delegate<Result>()
        this.priority = priority
        this.listen()
    }

    private async listen() {
        try {
            await this.delegate.promise
        }
        catch (err) {
            this._error = err
        }
        finally {
            this._status = "DONE"
        }
    }

    get promise() {
        return this.delegate.promise
    }

    get status() {
        return this._status
    }

    get error() {
        return this._error
    }

    execute() {
        this._status = "BUSY"
        this.handler(this.data, this.delegate.resolve, this.delegate.reject)
        return this.promise
    }

    resolve(value: Result) {
        this.delegate.resolve(value)
        return this.promise
    }

    reject(err: Error) {
        this.delegate.reject(err)
        return this.promise
    }
}

export class Queue extends EventAggregator<{
    "add": QueueItem<any, any>
    "remove": QueueItem<any, any>
    "busy": QueueItem<any, any>
    "done": QueueItem<any, any>
    "error": QueueItem<any, any>
}> {
    readonly options: { concurrent: number, delay: number }
    readonly items: QueueItem<any, any>[] = []
    private addTimer: any

    constructor(opts: Partial<Queue["options"]> = {}) {
        super()
        this.options = Object.assign({ concurrent: 1, delay: 0 }, opts)
    }

    add(...items: QueueItem<any, any>[]) {
        for (const item of items) {
            item.promise
                .then(() => this.emit("done", item))
                .catch(() => this.emit("error", item))
                .finally(() => this.finish(item))

            this.items.push(item)

            this.emit("add", item)
        }

        globalThis.clearTimeout(this.addTimer)
        this.addTimer = globalThis.setTimeout(() => {
            this.sort()
            this.next()
        }, this.options.delay)

        return this
    }

    sort() {
        this.items.sort((a, b) => a.priority - b.priority)
        return this
    }

    next() {
        const busy = this.items.filter(x => x.status === "BUSY")
        const slots = this.options.concurrent - busy.length
        if (slots < 1)
            return this

        for (let i = 0; i < slots; i++) {
            const item = this.items.find((x => x.status === "PENDING"))
            if (!item)
                return this

            item.execute()
            this.emit("busy", item)
        }

        return this
    }

    finish(item: QueueItem<any, any>) {
        this.remove(item)
        this.next()
        return this
    }

    remove(item: QueueItem<any, any>, reject = true) {
        const index = this.items.indexOf(item)
        if (index !== -1)
            this.items.splice(index, 1)

        if (reject)
            item.reject(new Error("removed from queue"))

        this.emit("remove", item)

        return this
    }
}

export const queue = () => {
    const q = new Queue()

    return {
        q,
        add: <T>(fn: () => Promise<T>) => {
            const qi = new QueueItem<T, undefined>((_, res, rej) => fn().then(res).catch(rej), undefined)
            q.add(qi)
            return qi.promise
        }
    }
}