type PromiseFn<T> = (done: (value: T | null, error?: any) => void) => void | Promise<void>

interface IQueue {
  [id: string]: {
    promise: Promise<any>,
    resolver: (value?: any) => void,
    rejector: (reason?: any) => void,
    fn: PromiseFn<any>,
    busy: boolean,
  }
}

export interface IQueueInstance {
  add<T>(id: string | number, fn: PromiseFn<T>): Promise<T>,
  nextId: () => number,
  pause: () => void,
  resume: () => void,
  cancel: (id: string | number) => void
}

export const createQueue = (concurrent: number = 2): IQueueInstance => {
  const queue: IQueue = {}
  const order: (string | number)[] = []
  let id = 0
  let paused = false

  const add = <T>(id: string | number, fn: PromiseFn<T>): Promise<T> => {
    if (!queue[id]) {
      order.push(id)

      let resolver
      let rejector
      const promise = new Promise<T>((res, rej) => {
        resolver = res
        rejector = rej
      })

      queue[id] = {
        promise,
        resolver,
        rejector,
        fn,
        busy: null,
      }

      if (allowNext())
        run(order.shift())
    }

    return queue[id].promise as Promise<T>
  }

  const cancel = (id: string | number) => {
    const i = order.indexOf(id)
    if (id !== -1)
      order.splice(i)
  }

  const nextId = () =>
    id++

  const pause = () =>
    paused = true

  const resume = () => {
    paused = false
    while (allowNext() && order[0])
      run(order.shift())
  }

  const run = (id: string | number) => {
    if (!queue[id])
      throw new Error(`No queued task with id "${id}"`)

    queue[id].busy = true

    queue[id].fn((val, err) => {
      if (err)
        queue[id].rejector(err)
      else
        queue[id].resolver(val)

      queue[id].busy = false

      while (allowNext() && order[0])
        run(order.shift())

      delete queue[id]
    })
  }

  const allowNext = () =>
    !paused
    && getRunning().length < concurrent

  const getRunning = () =>
    Object.keys(queue)
      .map(x => queue[x])
      .filter(x => x.busy === true)

  return {
    add,
    nextId,
    pause,
    resume,
    cancel
  }
}
