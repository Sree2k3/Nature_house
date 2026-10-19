import { NextResponse } from 'next/server';
import { PersistenceError } from './db';

export class ValidationError extends Error {
  public readonly fieldErrors?: Record<string, string>;
  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class MediaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaError';
  }
}

/**
 * Standard error response mapper for Next.js Route Handlers.
 */
export function handleApiError(err: unknown): NextResponse {
  console.error('[API Error]:', err);

  if (err instanceof ValidationError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: err.message,
          fieldErrors: err.fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  if (err instanceof UnauthorizedError) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: err.message,
        },
      },
      { status: 401 }
    );
  }

  if (err instanceof ForbiddenError) {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: err.message,
        },
      },
      { status: 403 }
    );
  }

  if (err instanceof NotFoundError) {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: err.message,
        },
      },
      { status: 404 }
    );
  }

  if (err instanceof ConflictError) {
    return NextResponse.json(
      {
        error: {
          code: 'CONFLICT',
          message: err.message,
        },
      },
      { status: 409 }
    );
  }

  if (err instanceof MediaError) {
    return NextResponse.json(
      {
        error: {
          code: 'MEDIA_ERROR',
          message: err.message,
        },
      },
      { status: 422 }
    );
  }

  if (err instanceof PersistenceError) {
    return NextResponse.json(
      {
        error: {
          code: err.code || 'PERSISTENCE_ERROR',
          message: 'A database error occurred while persisting the request.',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected internal error occurred.',
      },
    },
    { status: 500 }
  );
}
