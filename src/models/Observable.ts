export class Observable<T> {
  subscribers: Array<(obj: T) => any> = []

  subscribe(fun: (obj: T) => any) {
    this.subscribe(fun)
  }

  notify(fun: (obj: T) => void, obj: T) {
    fun(obj)
  }

  notifyAll(obj: T) {
    this.subscribers.forEach(subscribe => {
      this.notify(subscribe, obj)
    })
  }
}
