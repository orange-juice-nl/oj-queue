# promise based queue
uses oj-eventaggregator and oj-promise-utils
## Usage
```typescript
import { Queue, QueueItem, QueueFn } from "oj-queue"

const fetchHandler: QueueFn<{ value: number }, string> = (url, resolve, reject) =>
    fetch(url)
        .then(x => x.json())
        .then(x => resolve({ value: x.data }))
        .catch(reject)

const q = new Queue({ concurrent: 2 })

q.on("error", item => console.error(item.error))

const item0 = new QueueItem(fetchHandler, "https://some.api.com?data=0")
const item1 = new QueueItem(fetchHandler, "https://some.api.com?data=1", -1) // add priority, low value = high priority, 0 is default

q.add(item0, item1)

item0.promise
    .then(x => console.log(x.value))
    .catch(err => console.error(err))

```