interface IException {
  message: string
  code: number
}

export class Exception {
  static #output(message: string, code: number): IException {
    return { message, code }
  }

  static Forbidden(text: string) {
    return Exception.#output(text, 403)
  }

  static Unauthorized(text: string) {
    return Exception.#output(text, 401)
  }

  static Ok(text: string) {
    return Exception.#output(text, 200)
  }

  static Created(text: string) {
    return Exception.#output(text, 201)
  }
}
