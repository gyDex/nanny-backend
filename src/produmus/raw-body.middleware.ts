import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, NextFunction } from 'express';
import * as getRawBody from 'raw-body';


@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  async use(req: Request, next: NextFunction) {
    if (req.headers['content-type']?.includes('application/json')) {
      req['rawBody'] = (
        await getRawBody(req, {
          encoding: 'utf-8',
        })
      ).toString();
    }
    next();
  }
}