import { Injectable } from '@nestjs/common';
import { GeminiService } from '../common/gemini/gemini.service';
import { CRLV_PROMPT, CRLV_RESPONSE_SCHEMA, CrlvMimeType } from './crlv.constants';

export type CrlvFile = {
  data: Buffer;
  mimeType: CrlvMimeType;
};

@Injectable()
export class GeminiCrlvReader {
  constructor(private readonly gemini: GeminiService) {}

  read(file: CrlvFile): Promise<string> {
    return this.gemini.generateJson(
      [{ inlineData: { mimeType: file.mimeType, data: file.data.toString('base64') } }, { text: CRLV_PROMPT }],
      CRLV_RESPONSE_SCHEMA,
    );
  }
}
