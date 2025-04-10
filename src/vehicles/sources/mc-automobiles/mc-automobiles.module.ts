import { Module } from '@nestjs/common';
import { McAutomobilesSource } from './mc-automobiles.source';

@Module({
  providers: [McAutomobilesSource],
  exports: [McAutomobilesSource],
})
export class McAutomobilesModule {}
