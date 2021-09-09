class ConcurrentError extends Error {
  constructor(type: 'aggregate' | 'stream', id: string) {
    super(
      `Cannot save the event because the ${type} '${id}' is currently out of date. Please retry later.`
    )
    this.name = 'ConcurrentError'
  }
  static is(error: Error): boolean {
    return error.name === 'ConcurrentError'
  }
}

export default ConcurrentError
