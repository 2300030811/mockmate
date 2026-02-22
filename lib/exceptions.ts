export class AppError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleError = (error: unknown): { error: string, code: string } => {
  if (error instanceof AppError) {
    return { error: error.message, code: error.code };
  }
  
  if (error instanceof Error) {
    // Basic fallback for standard errors
    return { error: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { error: 'An unexpected error occurred.', code: 'UNKNOWN_ERROR' };
};
