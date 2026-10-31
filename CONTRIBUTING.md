# Contribuindo com o Ritmo

1. Faça um fork e crie uma branch (`feat/minha-ideia`).
2. `npm install` e `npm run dev`.
3. Mantenha a lógica de cálculo em `src/services` e `src/utils` (nunca em templates).
4. Adicione testes em `tests/` para regras novas.
5. Antes do PR: `npm run lint && npm run typecheck && npm test && npm run build`.
6. Interface sempre em português brasileiro, acessível (labels, foco visível, alvos de 44 px).

Alterações no formato dos dados exigem aumentar `SCHEMA_VERSION` e adicionar uma migração em `src/services/storage/migrations.ts`.
