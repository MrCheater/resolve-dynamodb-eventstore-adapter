class ConcurrentError extends Error {
  constructor() {
    super('Concurrency error')
    this.name = 'ConcurrentError'
  }
  static is(error: Error): boolean {
    return error.name === 'ConcurrentError'
  }
}

export default ConcurrentError
