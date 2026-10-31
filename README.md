<div align="center">

<img src="public/favicon.svg" width="96" alt="Logo do Ritmo" />

# Ritmo

**Sua melhor versão, todos os dias.**

Planeje. Acompanhe. Evolua. Conquiste.

</div>

Ritmo é um aplicativo web (PWA) open source de metas, hábitos, estudos e exercícios. É 100% frontend: sem backend, sem login e sem APIs pagas. Os dados ficam no `localStorage` do seu navegador e o app funciona offline após o primeiro carregamento.

## Funcionalidades

- **Onboarding** com apenas o primeiro nome e saudação conforme o horário.
- **Dashboard semanal**: seletor de dias (semana começa na segunda), metas da semana, 4 indicadores clicáveis, resumo com comparação, atividades do dia e insights.
- **Calendário** em visões mês, semana e dia, com filtros, recorrência (diária, dias da semana, semanal, mensal), edição/exclusão de uma ocorrência ou da série, reagendamento e metas do mês.
- **Metas**: 5 tipos, categorias personalizadas, detalhe com gráfico, checklist e registros; estudos e treinos vinculados contam automaticamente.
- **Hábitos** com sequência atual/maior, respeitando apenas os dias programados.
- **Conquistas** baseadas em eventos reais.
- **Estudos**: sessões manuais e cronômetro baseado em timestamps, restaurado com segurança após recarregar.
- **Exercícios**: registro, estatísticas e gráficos.
- **Relatórios** (ECharts): evolução %, anéis, barras por semana, distribuição, heatmap de hábitos, comparativo semanal e tendência mensal.
- **Insights determinísticos** locais, sem IA.
- **Busca global**, ações rápidas, desfazer, tema claro/escuro, animações reduzidas.
- **Backup**: exportar/importar JSON validado (com resumo antes de confirmar) e apagar tudo.
- **Resumo semanal** compartilhável (Web Share API, com cópia como alternativa).
- **Modo demonstração** isolado: dados só em memória, nunca gravados.

## Stack

Vue 3, Vite, TypeScript, Pinia, Vue Router, Tailwind CSS 3, Lucide (`@lucide/vue`), Apache ECharts + vue-echarts, date-fns, Zod, vite-plugin-pwa, Vitest, Vue Test Utils, Playwright. Fontes Plus Jakarta Sans e Inter empacotadas localmente.

## Executar

```bash
npm install
npm run dev        # desenvolvimento
npm run build      # typecheck + build em dist/
npm run preview    # servir o build
npm test           # testes unitários e de integração
npm run lint
npm run typecheck
npm run e2e        # Playwright (requer: npx playwright install chromium)
```

Os ícones PWA são gerados por `node scripts/generate-icons.mjs`.

## Instalar como PWA

- **iPhone (Safari)**: Compartilhar → *Adicionar à Tela de Início*.
- **Android (Chrome)**: menu ⋮ → *Instalar app*.

## Persistência

Chave `ritmo:data` com envelope `{ schemaVersion, data }`. Na leitura: JSON → migração → validação Zod. Dados inválidos nunca sobrescrevem registros válidos; o conteúdo original é preservado em `ritmo:corrupt-backup`. Gravações usam debounce e são forçadas ao ocultar a página. Erros (armazenamento cheio ou indisponível) são exibidos ao usuário.

> Seus dados ficam somente neste navegador e dispositivo. Para transferi-los ou protegê-los contra perda, exporte um backup. Não há sincronização entre dispositivos.

## Decisões de cálculo

- Datas civis `yyyy-MM-dd` locais (sem conversão UTC); semana de segunda a domingo; minutos como unidade de armazenamento.
- Percentual = realizado ÷ planejado; sem meta aparece como "—", e a barra é limitada a 100%.
- Produtividade = tarefas concluídas ÷ planejadas (canceladas não contam).
- Metas de estudo/treino são semanais e escalam proporcionalmente em outros períodos.
- Comparação com período anterior de zero mostra mensagem, nunca infinito.

## Estrutura

```text
src/components  ui, layout, dashboard, calendar, goals, habits, studies, exercises, charts
src/services    storage, backup, reports, insights, demo
src/stores      Pinia (data é a fonte; demais stores aplicam regras de domínio)
src/schemas     Zod        src/models  tipos        src/utils  datas e recorrência
src/views       telas      tests/      Vitest       e2e/       Playwright
```

## Deploy estático

O `base` é relativo (`./`) e o roteamento usa hash, então `dist/` funciona em GitHub Pages, Netlify e Vercel sem configuração extra.

## Privacidade

Sem contas, servidores ou rastreamento. Nada sai do dispositivo.

## Roadmap

Lembretes locais, metas com templates, importação parcial de backup, mais visões de calendário.

## Contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

[MIT](LICENSE)
