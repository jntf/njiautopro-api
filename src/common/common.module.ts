import { Module } from '@nestjs/common';
import { JSONScalar } from './scalars/json.scalar';

@Module({
  providers: [JSONScalar],
  exports: [JSONScalar],
})
export class CommonModule {}