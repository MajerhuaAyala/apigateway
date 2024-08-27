import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * {
 *   rpcError: {
 *     error: { message: [Array], error: 'Bad Request', statusCode: 400 },
 *     message: 'Rpc Exception'
 *   }
 * }
 * **/

type ErrorToDto = {
  error: { message: string[]; error: string; statusCode: number };
  message: string;
};

@Catch(RpcException)
export class RpcCustomExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rpcError = exception.getError();
    const errorToDto: ErrorToDto = JSON.parse(JSON.stringify(rpcError));

    if (errorToDto?.error?.message) {
      const code = errorToDto?.error?.statusCode;
      const message = errorToDto?.error?.message;
      return response.status(code || 400).json({
        status: code || 400,
        message: message || 'Bad request',
      });
    }

    if (rpcError.toString().includes('Empty response')) {
      return response.status(500).json({
        status: 500,
        message: rpcError
          .toString()
          .substring(0, rpcError.toString().indexOf('(') - 1),
      });
    }

    if (
      typeof rpcError === 'object' &&
      'status' in rpcError &&
      'message' in rpcError
    ) {
      const status = isNaN(+rpcError.status) ? 400 : +rpcError.status;
      return response.status(status).json(rpcError);
    }

    response.status(400).json({
      status: 400,
      message: rpcError,
    });
  }
}
