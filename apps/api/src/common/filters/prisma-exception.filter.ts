import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const STATUS_BY_CODE: Record<string, { status: HttpStatus; message: string; error: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: 'Registro duplicado', error: 'Conflict' },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Registro não encontrado', error: 'Not Found' },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const mapped = STATUS_BY_CODE[exception.code];

    if (!mapped) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno do servidor',
        error: 'Internal Server Error',
      });
      return;
    }

    response.status(mapped.status).json({
      statusCode: mapped.status,
      message: mapped.message,
      error: mapped.error,
    });
  }
}
