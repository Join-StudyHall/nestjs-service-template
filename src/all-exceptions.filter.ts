import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const respObj = this.getResponseMessage(exception, request);
    response.status(respObj.statusCode).json(respObj);
  }

  getResponseMessage = (exception: Error, request: any) => {
    const { name: errorType, message: errorMessage } = exception;

    if (exception instanceof HttpException) {
      const res: any = exception.getResponse();
      return {
        statusCode: res.statusCode,
        path: request.url,
        errorType: res.error || errorType,
        errorMessage: res.message,
      };
    }

    this.logger.error(
      JSON.stringify({
        error: exception.name,
        exception: exception.message,
        stack: exception.stack,
      }),
    );

    switch (errorType) {
      case 'MongoServerError':
        if (exception['code'] === 11000) {
          return {
            statusCode: 400,
            path: request.url,
            errorType: BadRequestException.name,
            errorMessage: `Duplicated entry: ${JSON.stringify(
              exception['keyValue'],
            )}`,
          };
        }

      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          path: request.url,
          errorType,
          errorMessage,
        };
    }
  };
}
