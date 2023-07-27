export default class Semaphore {
  promise: Promise<void> | null = null;

  constructor(private locked = false, private resolve: Function | null = null) {
    // this.locked = false;
    // this.resolve = null;
  }

  unlock() {
    this.locked = false;
    if (typeof this.resolve == "function") this.resolve();
  }

  async lock() {
    if (!this.locked) {
      this.locked = true;
      this.promise = new Promise((r) => (this.resolve = r));
    } else await this.promise;
  }

  check() {
    return this.locked;
  }
}
