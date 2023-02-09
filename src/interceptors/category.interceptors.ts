import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformationInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        //capture the response and if it contains pagination,
        // add it to the headers, then I format the response
        const res = context.switchToHttp().getResponse();
        const req = context.switchToHttp().getRequest();

        if (data['X-pagination-total-count']) {
          this.buildHeader(res, data);
        }
        const newResponse = {
          message: `${req.method} success`,
          data: data['data'] ? data['data'] : data,
          errors: {},
        };
        return newResponse;
      }),
    );
  }

  buildHeader(res, data) {
    res.header('X-pagination-total-count', data['X-pagination-total-count']);
    res.header('X-pagination-page-count', data['X-pagination-page-count']);
    res.header('X-pagination-current-page', data['X-pagination-current-page']);
    res.header('X-pagination-page-size', data['X-pagination-page-size']);
  }
}
