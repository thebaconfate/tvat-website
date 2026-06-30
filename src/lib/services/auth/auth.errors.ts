export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message = "Invalid reset link") {
    super(message, 400);
  }
}

export class UserNotFoundError extends AuthError {
  constructor(message = "User not found") {
    super(message, 404);
  }
}
