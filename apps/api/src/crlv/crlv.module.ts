import { Module } from '@nestjs/common';
import { CrlvController } from './crlv.controller';
import { CrlvService } from './crlv.service';
import { GeminiCrlvReader } from './gemini-crlv.reader';

@Module({
  controllers: [CrlvController],
  providers: [CrlvService, GeminiCrlvReader],
})
export class CrlvModule {}
