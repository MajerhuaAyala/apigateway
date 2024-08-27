import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

type ErrorToDto = {
  message: string[];
  error: string;
  statusCode: number;
};

@Catch(HttpException)
export class HttpCustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const error = exception.getResponse();
    const errorToDto: ErrorToDto = JSON.parse(JSON.stringify(error));
    console.log(errorToDto);
    if (errorToDto?.message) {
      const code = errorToDto?.statusCode;
      const message = errorToDto?.message;
      return response.status(code || 400).json({
        status: code || 400,
        message: message || 'Bad request',
      });
    }
    return response;
  }
}
