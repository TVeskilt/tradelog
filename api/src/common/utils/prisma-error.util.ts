import { NotFoundException } from '@nestjs/common';

export class PrismaErrorUtil {
  static handleNotFoundError(error: unknown, entityName: string, identifier: string): never {
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      throw new NotFoundException(`${entityName} with UUID '${identifier}' not found`);
    }
    throw error;
  }

  static isPrismaNotFoundError(error: unknown): boolean {
    return error instanceof Error && 'code' in error && error.code === 'P2025';
  }
}
