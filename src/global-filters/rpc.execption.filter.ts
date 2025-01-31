// rpc-exception.filter.ts
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class GlobalRpcExceptionFilter
  implements RpcExceptionFilter<RpcException>
{
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    const error = exception.getError();
    console.log('RPC Exception:', error);

    // If error is an object with message and statusCode
    if (
      typeof error === 'object' &&
      'message' in error &&
      'statusCode' in error
    ) {
      return throwError(() => ({
        status: error.statusCode,
        message: error.message,
        timestamp: new Date().toISOString(),
      }));
    }

    // If error is just a string
    return throwError(() => ({
      status: 500,
      message: error,
      timestamp: new Date().toISOString(),
    }));
  }
}
