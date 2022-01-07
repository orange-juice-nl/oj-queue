import { EventAggregator } from "oj-eventaggregator"
import { delegate, pause } from "oj-promise-utils"

export type QueueFn<T, R> = (data: T, resolve: (value: R | PromiseLike<R>) => void, reject: (reason?: any) => void) => void
export type QueueStatus = "PENDING" | "BUSY" | "DONE"

export class QueueItem<T = any, R = any>{
    private readonly delegate: { promise: Promise<R>; resolve: (value: R | PromiseLike<R>) => void; reject: (reason?: any) => void }
    private readonly handler: QueueFn<T, R>
    private readonly data: T
    private _status: QueueStatus
    private _error?: Error

    constructor(handler: QueueFn<T, R>, data: T) {
        this.handler = handler
        this.data = data
        this._status = "PENDING"
        this.delegate = delegate<R>()
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

    cancel(err: Error) {
        this.delegate.reject(err)
        return this.promise
    }
}

export class Queue extends EventAggregator<{
    "add": QueueItem
    "remove": QueueItem
    "busy": QueueItem
    "done": QueueItem
    "error": QueueItem
}> {
    concurrent: number
    items: QueueItem[] = []

    constructor(opts?: { concurrent?: number }) {
        super()
        this.concurrent = opts?.concurrent ?? 1
    }

    async add<T, R>(handler: QueueFn<T, R>, data: T) {
        const item = new QueueItem<T, R>(handler, data)
        this.items.push(item)
        this.emit("add", item)
        this.next()

        item.promise
            .then(() => this.emit("done", item))
            .catch(() => this.emit("error", item))
            .finally(() => {
                this.remove(item)
                this.next()
            })

        return item.promise
    }

    remove(item: QueueItem) {
        const index = this.items.indexOf(item)
        if (index !== -1)
            this.items.splice(index, 1)

        item.cancel(new Error("removed from queue"))
        this.emit("remove", item)
    }

    next() {
        const busy = this.items.filter(x => x.status === "BUSY")
        const slots = this.concurrent - busy.length
        if (slots < 1)
            return

        for (let i = 0; i < slots; i++) {
            const item = this.items.find((x => x.status === "PENDING"))
            if (!item)
                return

            item.execute()
            this.emit("busy", item)
        }
    }
}