# Drivo

Web app para montar sua garagem de veículos. O usuário importa o CRLV (PDF ou foto) e o Gemini lê o documento e preenche o cadastro automaticamente.

## Funcionalidades

- Cadastro, login e logout com JWT em cookie `httpOnly`.
- Lista de veículos com busca por placa, marca, modelo ou apelido e paginação.
- Criar, editar e excluir veículos.
- Foto "real" do modelo do carro buscada automaticamente (Gemini + Wikipédia) e salva no banco, com imagem genérica quando o modelo não é encontrado.
- Importação de CRLV com leitura pelo Gemini e preenchimento automático do formulário.
- Perfil: foto de perfil, alterar nome, e-mail e senha, sair e excluir a conta.
- Estados de carregamento, erro e vazio em todas as telas.
- API documentada com Swagger.

## Stack

| Camada | Tecnologia |
|---|---|
| Front | Next.js 16 (App Router), React 19, Tailwind CSS 4, TanStack Query, React Hook Form, Zod |
| Back | NestJS 11, Prisma 6 (driver `pg`), class-validator, Swagger |
| Banco | PostgreSQL 17 |
| IA | Google Gemini (`@google/genai`) com saída estruturada em JSON Schema |
| Testes | Jest e Supertest (API) |
| Infra | Docker e Docker Compose |

## 1. Como instalar

Pré-requisitos: **Docker** e **Docker Compose**. Para rodar sem Docker, é preciso Node.js 22 e PostgreSQL.

```bash
git clone <url-do-repositorio> drivo
cd drivo
cp .env.example .env
```

No `.env`, preencha `GEMINI_API_KEY` com a chave gerada no https://aistudio.google.com/apikey. Sem ela, tudo funciona, exceto a leitura do CRLV, que deixei uma mensagem explicando que não está configurada e etc.

## 2. Como executar

```bash
docker compose up --build
```

| Serviço | URL |
|---|---|
| Aplicação | http://localhost:3000 |
| API | http://localhost:3333/api |
| Swagger (OpenAPI) | http://localhost:3333/api/docs |
| OpenAPI em JSON | http://localhost:3333/api/docs/openapi.json |

As migrations do banco rodam sozinhas quando o container da API sobe.

### Sem Docker 

```bash
docker compose up -d db

cd apps/api
npm install
DATABASE_URL=postgresql://drivo:drivo@localhost:5432/drivo JWT_SECRET=um-secretcode-com-16-chars-padrao npx prisma migrate deploy
DATABASE_URL=postgresql://drivo:drivo@localhost:5432/drivo JWT_SECRET=um-secretcode-com-16-chars-padrao GEMINI_API_KEY=sua-chave npm run start:dev

cd apps/web
npm install
npm run dev
```

## 3. Como executar os testes

```bash
cd apps/api
npm install
npm test
npm run test:cov
DATABASE_URL=postgresql://drivo:drivo@localhost:5432/drivo JWT_SECRET=um-secretcode-com-16-chars-padrao npm run test:e2e
```

- `npm test` na API: 11 testes unitários das regras de cadastro e edição de usuário e veículo, sem banco e sem rede.
- `npm run test:e2e`: 5 cenários contra um Postgres real (incluindo paginação e foto de perfil), com o Gemini e a busca de fotos simulados. Os dados das tabelas são apagados, então use um banco de desenvolvimento.

## 4. Decisões técnicas

| Decisão | Motivo |
|---|---|
| JWT em cookie `httpOnly` + `SameSite=Strict` | O token não fica acessível a JavaScript e o cookie não é enviado por outros sites. |
| `AuthGuard` global com `@Public()` | Toda possível nova rota já nasceria protegida. |
| Next.js faz proxy de `/api` | Mesmo domínio para front e API, por costume meu. |
| Gemini com `responseJsonSchema` | Resposta sempre em JSON válido, com enums iguais aos do banco, assim evitando problemas de identificação e etc. |
| `isCrlv` na resposta da IA | Rejeita imagens que não são CRLV (422). |
| A saída da IA passa pelas mesmas validações do cadastro | Valor inválido vira `null` e o usuário preencheria à mão, também podendo modificar os valores após gerados. Evitando problemas de formulários inválidos. |
| Foto do veículo: Gemini normaliza o nome do modelo e a Wikipédia fornece a imagem | Imagens reais e de licença livre, guardadas no banco e servidas pelo próprio domínio, o que achei válido pra tornar a experiência do usuário melhor, tornando mais fácil identificar o próprio veículo. |
| Arquivo do CRLV validado pelo conteúdo e não armazenado | O documento contém dados pessoais, então preferi evitar por ter itens que nem são usados na aplicação de maneira direta. |
| Isolamento por `userId` com resposta 404 | Um usuário não vê nem descobre veículos de outro. |
| Rate limit (`@nestjs/throttler`) | Protege login, cadastro e a cota gratuita do Gemini. |

## 5. Limitações que encontrei e melhorias que não fiz por conta dos problemas pessoais inesperados

- A qualidade da extração depende do modelo e da nitidez do documento, tive problemas testando com certos documentos.
- Plano gratuito do Gemini tem limite de requisições e às vezes fica sobrecarregado (503). A API tenta de novo, troca para o modelo reserva (`GEMINI_FALLBACK_MODELS`) e, se nada responder, devolve 503 com mensagem novamente, mas foi algo que me aconteceu com certa frequência.
- Foto do veículo depende da Wikipédia (foi uma ideia que me veio à mente para manter os modelos do usuário fiéis nas fotos): o container da API *PRECISA* de acesso à internet e a imagem acaba sendo imprecisa, não levando em consideração cor, pode ser mais de uma imagem e etc, pois não tive tempo de pensar como melhorar isso. Modelos sem artigo ou sem foto livre mostram uma imagem genérica de contorno.
- Deixei dados fictícios permitidos em Renavam e chassi, só validando o formato e o tamanho.
- Sessão: não há refresh token, o token dura 24h, e trocar a senha não invalida tokens já emitidos. Optei por isso por conta do meu curto tempo, se não iria por no modo Refresh token com rotação e campo `tokenVersion` no usuário, para invalidar sessões ao trocar a senha.
- Paginação: Eu preferi deixar com paginação ao invés de scroll infinito por conta que inicialmente vai ser usado num computador, caso fosse para mobile eu curto mais a ideia de scroll infinito.
- Filtros: Não coloquei grandes filtros como por Tipo, Combustível e etc por conta do meu limite de tempo.
- Foto de usuario: Curti fazer esse item mas como tive o imprevisto não consegui refinar completamente.

## 6. Observações

Eu estava fazendo o teste durante meu tempo livre mas tive um problema pessoal e vou ter que viajar de maneira inesperada por isso: nos 2 primeiros dias eu foquei na base da aplicação e nos pequenos itens novos que achei interessante colocar, mas como isso surgiu não tive oportunidade de refinar muita coisa e nem de testar 100% a maioria dos casos. E SIM, eu usei IA para refinar algumas coisas e avançar outras, já que tive que aprender certos itens que não conhecia bem como as nuances do NestJS e afins. Espero que entendam e mantenham o interesse sabendo disso.

## Estrutura

```
drivo/
├── apps/
│   ├── api/                NestJS
│   │   ├── prisma/         schema e migrations
│   │   ├── src/
│   │   │   ├── auth/       cadastro, login, logout, guard
│   │   │   ├── users/      perfil, foto, senha, exclusão de conta
│   │   │   ├── vehicles/   CRUD, busca, paginação e foto do modelo
│   │   │   ├── crlv/       upload e leitura com Gemini
│   │   │   ├── common/     decorators, Gemini, filtro do Prisma, segurança, validações
│   │   │   └── config/     validação das variáveis de ambiente
│   │   └── test/           e2e
│   └── web/                Next.js
│       └── src/
│           ├── app/        rotas
│           ├── components/ design system
│           ├── features/   auth, vehicles, profile
│           └── lib/        cliente HTTP e utilitários
├── docker-compose.yml
└── .env.example
```
