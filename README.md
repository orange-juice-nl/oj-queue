# Queue
Promise based queue

## createQueue
`createQueue(concurrent: number = 2): QueueInstance`
Create a new Queue instance.
The concurrent parameter defines how many queue items will be handled at the same time.

## add
`add<R>(id: string | number, fn: PromiseFn<T>): Promise<T>`
Add a new function to the queue.

```typescript
const id = q.nextId()
q.add(id, done => 
  fetch("stuff")
    .then(data => done(data))
    .catch(err => done(null, err)))
```

## cancel
`cancel(id: string | number): void`
Removes the queued function if it is not already running.

## pause
`pause(): void`
Puases all pending items. The ones that are already running wil continue.

## resume
`resume(): void`
Resumes the queue. It will start the next item(s) in the queue.