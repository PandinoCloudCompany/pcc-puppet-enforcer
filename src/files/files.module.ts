import { Module } from '@nestjs/common';
import { UtilsModule } from '../utils/utils.module.js';
import { FileIteratorController } from './file.iterator.controller.js';
import { FileIteratorService } from './file.iterator.service.js';
import { FormatModule } from './format/format.module.js';
import { LocateModule } from './locate/locate.module.js';
import { ParseModule } from './parse/parse.module.js';
import { StoreModule } from './store/store.module.js';

@Module({
  imports: [LocateModule, FormatModule, ParseModule, StoreModule, UtilsModule],
  controllers: [FileIteratorController],
  providers: [FileIteratorService],
})
export class FilesModule {}
