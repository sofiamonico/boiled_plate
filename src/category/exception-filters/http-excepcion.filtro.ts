import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = exception.getStatus();

    //format the error message
    response.status(status).json({
      message: `${request.method} error`,
      data: {},
      errors: [
        exception['response']['message']
          ? exception['response']['message']
          : exception.message,
      ],
    });
  }
}
