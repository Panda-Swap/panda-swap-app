export class FileProcessingError extends Error {
    constructor(message: string, public readonly fileName?: string) {
      super(message);
      this.name = 'FileProcessingError';
    }
  }