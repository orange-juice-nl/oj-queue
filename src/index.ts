import { EventAggregator } from "oj-eventaggregator"

export type QueueFn<T, R> = (data: T, res: (data: R) => void, rej: (error: Error) => void) => void

export enum Status {
    PENDING,
    BUSY,
    REMOVED
}

export class QueueItem<T extends Object, R> extends EventAggregator<{
    "error": any
    "retry": any
}> {
    id: string | number
    data: T
    status: Status
    promise: Promise<R>
    exec: () => void
    queue: Queue<T, R>

    constructor(id: string | number, data: T, queue: Queue<T, R>) {
        super()
        this.id = id
        this.data = data
        this.status = Status.PENDING
        this.queue = queue

        let resolver: (data: R) => void
        let rejector: (reason?: Error) => void
        this.promise = new Promise<R>((resolve, reject) => {
            resolver = resolve
            rejector = reject
        })

        this.exec = () => {
            this.status = Status.BUSY

            Promise.resolve()
                .then(() => {
                    this.queue.resolver(this.data, resolver, rejector)
                    return this.promise
                })
                .catch(err => {
                    if (!this.queue.options.retries) {
                        this.emit("error", err)
                        return
                    }

                    if ("__retry" in data && data["__retry"] >= this.queue.options.retries) {
                        this.emit("error", err)
                        return
                    }

                    this.emit("retry", err)

                    const retry = data["__retry"] ?? 0

                    this.queue.add(`${id}_`, { ...data, __retry: retry + 1 }, (retry + 1) * 5000)
                        .catch(() => { })
                })
                .finally(() => {
                    this.queue.remove(this)
                    setTimeout(() => this.queue.next(), 1000)
                })
        }
    }
}

export interface IQueueOptions {
    concurrent?: number,
    retries?: number,
}

export class Queue<T extends Object, R> {
    private queue: QueueItem<T, R>[] = []
    private __id = 0
    resolver: QueueFn<T, R>
    options: IQueueOptions

    constructor(resolver: QueueFn<T, R>, options: IQueueOptions = {}) {
        this.options = options
        this.resolver = resolver
    }

    find(id: string | number) {
        return this.queue.find(x => x.id === id)
    }

    nextId() {
        return this.__id++
    }

    async add(id: string | number, data: T, delay = 0): Promise<R> {
        const qi = this.find(id)
        if (qi)
            return qi.promise

        const item = new QueueItem(id, data, this)
        if (!delay) {
            this.queue.push(item)
            this.next()
        }
        else
            setTimeout(() => {
                this.queue.push(item)
                this.next()
            }, delay)

        return item.promise
    }

    allowNext() {
        const running = this.queue.filter(x => x.status === Status.BUSY)
        return running.length < (this.options.concurrent ?? 1)
    }

    remove(item: QueueItem<T, R>) {
        const i = this.queue.indexOf(item)
        if (i !== -1)
            this.queue.splice(i, 1)
    }

    next(all = false) {
        if (!this.allowNext())
            return

        const qi = this.queue.find(x => x.status === Status.PENDING)
        if (!qi)
            return

        qi.exec()

        if (all)
            this.next(all)
    }
}