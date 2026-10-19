# Arquitetura de produção do AcessaNet Connect

## Decisão

O roteador Grandstream não será o servidor do portal nem o dono do banco. Ele apenas
intercepta o primeiro acesso do visitante e redireciona o navegador para o portal
externo central:

```text
celular -> Grandstream -> https://wifi.acessanet.com.br/wifi
                              |              |
                              |              +-> autorização do acesso Wi-Fi
                              +-> API e banco central de visitantes
                                          |
                                          v
                          https://acessanet.com.br/admin/marketing
```

Isso permite acrescentar pontos de Wi-Fi sem instalar banco, copiar cadastros ou abrir
acesso de entrada em cada estabelecimento. Uma falha ou troca de roteador também não
elimina o histórico de consentimentos.

## Endereços de produção

- `wifi.acessanet.com.br`: frontend do captive portal e API do Connect, sempre HTTPS.
- `acessanet.com.br`: site e painel administrativo já publicados.
- O site consulta `https://wifi.acessanet.com.br/internal/marketing-leads` pelo backend,
  usando Bearer token. Esse token nunca é enviado ao navegador.

No backend do Site AcessaNet:

```dotenv
NODE_ENV=production
ACESSANET_CONNECT_URL=https://wifi.acessanet.com.br
ACESSANET_CONNECT_TOKEN=<mesmo valor de CONNECT_INTERNAL_TOKEN>
ACESSANET_CONNECT_TIMEOUT_MS=8000
```

No backend do Connect:

```dotenv
PORT=4000
DATABASE_URL=<banco central persistente com backup>
CONNECT_INTERNAL_TOKEN=<segredo aleatorio de pelo menos 32 bytes>
CORS_ORIGINS=https://wifi.acessanet.com.br
```

No build do frontend do Connect:

```dotenv
VITE_API_URL=https://wifi.acessanet.com.br
```

## Vários roteadores e estabelecimentos

Cada AP deve ser cadastrado no backend com um identificador interno, MAC, nome do local,
SSID e estado ativo. O local deve ser resolvido no servidor a partir do `apMac` recebido
no fluxo do captive portal; o navegador não pode escolher livremente o estabelecimento.
Assim, relatórios e campanhas podem ser filtrados por ponto sem confiar em dados
fornecidos pelo visitante.

O mesmo visitante pode aparecer em vários locais. O cadastro pessoal continua único,
enquanto cada sessão registra AP, SSID, local, data e resultado da autorização.

## Requisitos antes do primeiro ponto real

1. Publicar frontend e API no subdomínio com certificado HTTPS válido.
2. Usar banco central persistente com backup automático; SQLite local fica apenas para
   desenvolvimento.
3. Cadastrar o domínio do portal na allowlist/walled garden do Grandstream para que ele
   seja acessível antes da autenticação.
4. Configurar no site online a URL e o token acima, mantendo o token somente nos dois
   backends.
5. Adicionar rate limit ao cadastro, paginação à consulta de leads e rotação de token.
6. Validar no equipamento real o EXCAP/login URL, os nomes dos parâmetros e o retorno de
   autorização conforme o firmware e o modo de gestão (local, GDMS ou GWN Manager).
7. Definir retenção, exportação e revogação dos dados pessoais para atender às regras de
   consentimento e privacidade.

## Implantação gradual

O primeiro ponto pode usar um único serviço central e uma credencial de integração.
Antes de abrir muitos pontos, o endpoint de leads deve ganhar paginação incremental e o
cadastro de APs deve estar ativo. Em escala maior, métricas, alertas, fila de eventos e
replicação do banco podem ser adicionados sem alterar a configuração dos roteadores,
pois todos continuam apontando para o mesmo domínio.
