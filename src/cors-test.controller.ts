import { Controller, Get, Headers, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('cors-test')
export class CorsTestController {
  @Get()
  testCors(@Req() request: Request, @Headers() headers: Record<string, string>) {
    return {
      message: 'CORS test successful',
      headers: headers,
      origin: request.headers.origin,
      host: request.headers.host,
    };
  }
}
