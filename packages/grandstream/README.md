# @acessanet/grandstream (reservado)

Pacote reservado para o `GrandstreamCaptivePortalService` real (Fase 7-8 do roadmap):
`CaptivePortalContextService`, `GrandstreamRedirectAdapter`, `RadiusAuthenticationService`,
`RadiusAccountingService`, `WiFiSessionService`, `CaptivePortalAuthorizationService`.

Ainda não implementado — depende de:
1. Confirmar como o GWN7664ELR está sendo gerenciado (controlador local, GDMS
   Networking ou GWN Manager) e a versão de firmware.
2. Confirmar suporte a External Captive Portal (EXCAP) nesse modo/firmware.
3. Acesso real ao equipamento para validar o fluxo de redirecionamento documentado em
   https://documentation.grandstream.com/knowledge-base/external-captive-portal-api-guide/
   e https://documentation.grandstream.com/knowledge-base/radius-authentication/.

Até lá, o fluxo de autorização é simulado em
`apps/web/src/features/portal/mock/grandstreamMockProvider.ts` (frontend) e, a partir
da Fase 6, por um mock equivalente no backend.
