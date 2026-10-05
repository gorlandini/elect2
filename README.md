# Um voto pelo Brasil

Site de mobilização para o 2º turno (25/10/2026), com contador de votos conquistados e painel administrativo. Mesma base técnica do *Um voto pelo Senado*.

- `index.html` — site público
- `admin.html` — painel de administração (senha)
- `/api` — funções serverless (Vercel)
- Banco: **Turso** (crie um banco **novo**, separado do site do Senado)

## Publicar

1. **Turso:** crie um banco novo e copie a Database URL e um auth token.
2. **Vercel:** *Add New Project* → importe `gorlandini/elect2` → em *Environment Variables* adicione:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `ADMIN_PASSWORD` (use uma senha diferente da do outro site)
3. **Domínio:** em *Settings → Domains*, adicione `umvotopelobrasil.com.br` e configure o DNS conforme a Vercel indicar.
4. **Banco:** acesse `/admin.html`, entre com a senha e clique em **Inicializar / verificar banco**. O contador começa do zero.

## Estrutura

```
index.html              site público
admin.html              painel administrativo
api/votes.js            GET contagem / POST registrar voto
api/settings.js         GET configurações públicas
api/track-visit.js      contador de visitas
api/admin/login.js      valida a senha do admin
api/admin/settings.js   GET/POST configurações (autenticado)
api/admin/seed.js       cria tabelas e configurações padrão
lib/db.js               conexão com o Turso
lib/utils.js            blacklist de palavras e helpers
schema.sql              schema do banco (referência)
```
