import { Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MAX_CRLV_FILE_SIZE } from './crlv.constants';
import { CrlvService, UploadedCrlv } from './crlv.service';
import { CrlvExtractionDto } from './dto/crlv-extraction.dto';

@ApiTags('crlv')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ description: 'Sessão ausente ou expirada' })
@Controller('crlv')
export class CrlvController {
  constructor(private readonly crlvService: CrlvService) {}

  @Post('extract')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_CRLV_FILE_SIZE, files: 1 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary', description: 'PDF, JPG, PNG ou WEBP até 10 MB' } },
    },
  })
  @ApiOkResponse({ type: CrlvExtractionDto, description: 'Dados extraídos. Campos não identificados vêm como null' })
  @ApiBadRequestResponse({ description: 'Arquivo ausente, grande demais ou em formato não suportado' })
  @ApiUnprocessableEntityResponse({ description: 'O arquivo não é um CRLV' })
  @ApiBadGatewayResponse({ description: 'Falha na comunicação com o Gemini' })
  @ApiServiceUnavailableResponse({ description: 'Gemini não configurado ou limite de uso atingido' })
  @ApiTooManyRequestsResponse({ description: 'Muitas leituras em sequência' })
  extract(@UploadedFile() file: UploadedCrlv | undefined): Promise<CrlvExtractionDto> {
    return this.crlvService.extract(file);
  }
}
