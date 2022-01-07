# promise based queue
uses oj-eventaggregator and oj-promise-utils
## Usage
```typescript
import { Queue, QueueFn } from "oj-queue"

const fetchHandler: QueueFn<string, { value: number }> = (url, resolve, reject) =>
    fetch(url)
        .then(x => x.json())
        .then(x => resolve({ value: x.data }))
        .catch(reject)

const q = new Queue({ concurrent: 2 })

q.on("error", item => console.error(item.error))

q.add(fetchHandler, "https://some.api.com?data=0")
    .then(x => console.log(x.value))
    .catch(err => console.error(err))

q.add(fetchHandler, "https://some.api.com?data=1")
    .then(x => console.log(x.value))
    .catch(err => console.error(err))

```