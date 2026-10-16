export const MAX_CRLV_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_CRLV_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;

export type CrlvMimeType = (typeof ALLOWED_CRLV_MIME_TYPES)[number];

export const UNKNOWN = 'UNKNOWN';

export const CRLV_PROMPT = `Você recebe um arquivo (PDF ou imagem) que deveria ser um CRLV ou CRLV-e brasileiro (Certificado de Registro e Licenciamento de Veículo).

1. Em "isCrlv", responda true somente se o arquivo for de fato um CRLV ou CRLV-e. Para qualquer outro documento ou imagem, responda false e deixe os demais campos vazios.
2. Extraia os dados exatamente como aparecem no documento:
   - plate: placa do veículo, somente letras e números.
   - renavam: código RENAVAM, somente dígitos.
   - chassis: número do chassi, somente letras e números.
   - brand e model: o campo "MARCA / MODELO / VERSÃO" vem no formato "MARCA/MODELO". Separe a marca do modelo e escreva os dois com iniciais maiúsculas. Converta abreviações para o nome comercial da marca (VW → Volkswagen, GM ou CHEV → Chevrolet, M.BENZ → Mercedes-Benz, I/ indica importado e deve ser descartado). Exemplo: "TOYOTA/COROLLA ALTIS HYBRID" → brand "Toyota", model "Corolla Altis Hybrid".
   - manufactureYear e modelYear: "ANO FABRICAÇÃO" e "ANO MODELO", com quatro dígitos.
   - color: "COR PREDOMINANTE", com inicial maiúscula (ex.: "Prata").
   - fuel: converta "COMBUSTÍVEL" para GASOLINE (gasolina), ETHANOL (álcool ou etanol), FLEX (álcool/gasolina ou flex), DIESEL, HYBRID (híbrido ou gasolina/elétrico), ELECTRIC (elétrico) ou CNG (gás natural).
   - type: converta "ESPÉCIE / TIPO" para CAR (automóvel), MOTORCYCLE (motocicleta, motoneta ou ciclomotor), PICKUP (caminhonete, camioneta ou utilitário), TRUCK (caminhão ou caminhão-trator) ou VAN (furgão, micro-ônibus ou ônibus).
3. Quando um campo não estiver legível ou não existir, use string vazia, ou UNKNOWN para fuel e type. Nunca invente valores.`;

export const CRLV_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    isCrlv: { type: 'boolean' },
    plate: { type: 'string' },
    renavam: { type: 'string' },
    chassis: { type: 'string' },
    brand: { type: 'string' },
    model: { type: 'string' },
    manufactureYear: { type: 'string' },
    modelYear: { type: 'string' },
    color: { type: 'string' },
    fuel: { type: 'string', enum: ['GASOLINE', 'ETHANOL', 'FLEX', 'DIESEL', 'HYBRID', 'ELECTRIC', 'CNG', UNKNOWN] },
    type: { type: 'string', enum: ['CAR', 'MOTORCYCLE', 'PICKUP', 'TRUCK', 'VAN', UNKNOWN] },
  },
  required: ['isCrlv', 'plate', 'renavam', 'chassis', 'brand', 'model', 'manufactureYear', 'modelYear', 'color', 'fuel', 'type'],
};
