# Desafio Técnico — Analista de Negócios Zendesk
## Cliente Fictício: VitaFlex — Saúde Corporativa

**Candidato:** Lucas Marcondes  
**Data:** 12/06/2026  
**Instância demo (referência):** `vitaflex-demo.zendesk.com`

---

## Sumário executivo

A VitaFlex opera suporte B2B para empresas de médio e grande porte, com demandas **técnicas** (erros, falhas, acessos) e **funcionais/consultivas** (orientações, dúvidas de uso e dados). A proposta estrutura o Zendesk Suite em camadas N1 → N2 → Especialista sob demanda, com omnichannel (formulário, WhatsApp, chat), autoatendimento via Help Center + IA, governança de dados sensíveis e painéis no Explore.

**Justificativa central:** separar fluxos por *tipo de demanda* e *nível de complexidade* reduz retrabalho, protege SLAs diferenciados e permite escalar especialistas sem expô-los à fila operacional diária.

Configurações prontas para importação estão documentadas em `jsons-prontos-para-importar-desafio-zendesk-vitaflex.md`.

---

# Parte 1 — Estruturação de fluxos e acessos

## 1.1 Configuração proposta

### Formulários (2)

| Formulário | Público | Campos principais | Destino automático |
|---|---|---|---|
| **Suporte Técnico** | Gestores de TI / RH das empresas clientes | Assunto, Descrição, Tipo de Erro (dropdown), Urgência, ID Externo do Cliente, Anexo (print do erro) | Grupo **N1 Técnico** + tag `tecnico` |
| **Suporte Funcional** | Usuários finais e analistas das empresas | Assunto, Descrição, Área (Benefícios, Relatórios, Cadastro, Permissões), Urgência, ID Externo | Grupo **N1 Funcional** + tag `funcional` |

**Gatilhos de roteamento:**
- Campo *Tipo de Erro* = Acesso (403/401) → tag `erro_acesso`, prioridade `high`, SLA Alta
- Campo *Urgência* = Urgentíssimo → prioridade `urgent`, notificação Slack
- Organização com tag `cliente_vip` → prioridade `urgent`, tag `vip`

> **Nota Zendesk:** a plataforma possui 4 prioridades nativas (`low`, `normal`, `high`, `urgent`). O campo customizado *Urgência* (Urgentíssimo / Alta / Normal / Baixa) mapeia para essas prioridades via gatilho — "Urgentíssimo" vira `urgent`.

### Grupos

| Grupo | Agentes | Escopo | SLA alvo (1ª resposta / solução) |
|---|---|---|---|
| **N1 Técnico** | 5 | Erros, falhas, acessos | 1h / 4h |
| **N1 Funcional** | 5 | Dúvidas, orientações | 2h / 8h |
| **N2 Técnico** | 3 | Escalonamentos técnicos | 30min / 2h |
| **N2 Funcional** | 3 | Escalonamentos funcionais | 1h / 4h |
| **Especialistas** | 10 (sob demanda) | Validações pontuais | Sem SLA próprio — herda do ticket pai |
| **Dados Sensíveis** | 2 (treinados LGPD) | Tickets com PII/dados de saúde | Mesmo SLA do ticket, grupo restrito |

**Funções (roles):**
- **Agente N1:** acesso `group` — vê apenas tickets do(s) seu(s) grupo(s)
- **Agente N2:** acesso `group` + permissão de reatribuir entre N1/N2
- **Especialista Sob Demanda:** *Light Agent* — acesso apenas a tickets onde é colaborador ou @mencionado
- **Gestor:** acesso `all` + Explore + configuração de macros/views
- **Admin:** acesso total + Admin Center

### Visualizações

| Visualização | Condição | Uso |
|---|---|---|
| N1 Técnico — Pendentes | Grupo = N1 Técnico, Status = Aberto | Fila operacional técnica |
| N1 Funcional — Pendentes | Grupo = N1 Funcional, Status = Aberto | Fila operacional funcional |
| Escalados para N2 | Grupo ∈ {N2 Técnico, N2 Funcional} | Monitorar escalonamentos |
| Aguardando Especialista | Tag = `aguardando_especialista` | SLA de espera externa |
| SLA em Risco | SLA < 20% do tempo restante | Ação preventiva do gestor |
| VIP — Todos | Tag = `cliente_vip` | Visão executiva de contas críticas |

### Políticas de SLA

| Nível (campo Urgência) | Prioridade Zendesk | 1ª resposta | Solução | Horário |
|---|---|---|---|---|
| Urgentíssimo | `urgent` | 15 min | 1h | 24×7 (plantão técnico) |
| Alta | `high` | 1h | 4h | Comercial estendido (7h–22h) |
| Normal | `normal` | 2h | 8h | Comercial (8h–18h) |
| Baixa | `low` | 4h | 24h | Comercial (8h–18h) |

**Calendário de SLA:** tickets VIP e Urgentíssimo usam calendário 24×7; demais usam horário comercial — evita falso "cumprimento" fora do expediente e explica violações reais.

---

## 1.2 Caso prático — Validação por especialista (não atua no suporte diário)

**Cenário:** Empresa cliente pergunta se pode exportar relatório de utilização de benefícios com dados anonimizados para auditoria externa. N1 Funcional não tem certeza da política de LGPD + regra de negócio.

### Fluxo no Zendesk

```
Cliente → Formulário Funcional → N1 Funcional
    → Agente identifica necessidade de especialista
    → Macro "Solicitar Especialista LGPD" (adiciona tag + preenche campo)
    → Gatilho: tag precisa_especialista
        → Side Conversation por e-mail ao Especialista em Benefícios/LGPD
        → Status do ticket: Pendente (aguardando terceiro)
        → Tag: aguardando_especialista
    → Especialista (Light Agent) responde na Side Conversation
    → Agente N1 consolida resposta pública ao cliente
    → Campo especialista_consultado = "Especialista em Benefícios"
    → Ticket resolvido
```

**Por que é eficiente:**
1. **Light Agent** — especialista não vê fila, não recebe atribuições automáticas; entra só quando convocado.
2. **Side Conversation** — conversa paralela sem expor o especialista ao cliente; mantém histórico auditável.
3. **Status Pendente** — pausa SLA de solução enquanto aguarda terceiro (configurável nas políticas de SLA).
4. **Campo `especialista_consultado`** — rastreabilidade para métricas (quantas consultas/mês, tempo médio de resposta do especialista).
5. **Gatilho de SLA em risco** — se especialista não responder em 4h, notifica gestor.

**Alternativa complementar:** Grupo "Especialistas" com roteamento manual + @menção no comentário interno (notificação por e-mail ao especialista).

---

# Parte 2 — Atendimento Omnichannel e Automático com IA

## Canais configurados

| Canal | Produto Zendesk | Roteamento |
|---|---|---|
| Formulário Web | Ticket Form no Help Center | Direto ao grupo por formulário |
| Chat no site | Messaging (Web Widget) | AI Agent → fila humana N1 |
| WhatsApp | Sunshine Conversations / integração nativa | Mesmo fluxo do Messaging |

**Problema a resolver:** demora no primeiro contato e baixa taxa de resolução no bot — o cliente abandona o chat antes de obter resposta útil.

## Proposta de solução — Agente Inteligente VitaFlex (conceitual)

Em vez de depender apenas do Answer Bot nativo (artigos estáticos), proponho uma **camada de agente robusta** desacoplada do Zendesk, integrada às conversas quando o termo digitado pelo usuário indicar necessidade de resposta contextualizada.

### Arquitetura proposta

```
Cliente (Chat / WhatsApp / Answer Bot)
        │
        ▼  termo ou intent detectado (ex.: "403", "permissão", "relatório")
API FastAPI — Agente Global (framework Agno)
        │
        ├── Knowledge Base Zendesk (Help Center + artigos)
        ├── Base de dados de clientes (organização, permissões, ID externo)
        └── LLM com tools de busca e consulta
        │
        ├── Persona 1: Assistente ao CLIENTE (Answer Bot)
        └── Persona 2: Copiloto do ANALISTA (comentários internos)
```

| Componente | Função |
|---|---|
| **FastAPI** | API única que expõe o agente ao Zendesk via webhook |
| **Agno** | Orquestra o agente: memória, tools, knowledge retrieval, múltiplas personas |
| **Knowledge Base** | Artigos do Help Center VitaFlex indexados para RAG |
| **Base de clientes** | CRM/dados operacionais — permissões, perfil, histórico da empresa |
| **Integração Answer Bot** | Ao detectar termo relevante na conversa, Zendesk chama a API e injeta resposta enriquecida no fluxo do bot |

### Persona 1 — Assistente ao cliente (Answer Bot)

**Quando atua:** o usuário digita termos como `403`, `acesso negado`, `permissão`, `relatório`, `exportar dados`.

**O que o agente faz:**
- Consulta artigos da base de conhecimento Zendesk
- Cruza com dados da organização do cliente (perfil ativo, permissões, ID externo)
- Responde de forma personalizada, não genérica
- Se não resolver, escalona para humano com contexto já montado

**Impacto esperado:** aumento de **65% na retenção no bot** — mais sessões resolvidas sem abrir ticket, medido por `sessões resolvidas in-bot ÷ total de sessões`.

### Persona 2 — Copiloto do analista (comentários internos)

**Mesmo agente, persona diferente** — atua nos **comentários internos** do ticket durante o atendimento humano.

**O que o agente faz:**
- Lê contexto completo: assunto, descrição, tags, histórico, organização, SLA
- Sugere soluções possíveis e macros de resposta em nota interna
- O analista valida e envia ao cliente — humano sempre no controle

**Benefício:** reduz tempo de pesquisa do N1/N2 e padroniza qualidade da resposta em casos complexos.

### Por que essa abordagem para a VitaFlex?

| Limitação do Answer Bot nativo | Solução com agente Agno |
|---|---|
| Só sugere artigos genéricos | Resposta personalizada com dados do cliente |
| Não acessa CRM/base operacional | Consulta permissões, organização, histórico |
| Analista pesquisa manualmente | Copiloto sugere solução no ticket |
| Baixa taxa de resolução in-bot | Meta de 65% de retenção no bot |

> **Nota:** esta é uma **proposta arquitetural** para o cenário VitaFlex — demonstra viabilidade técnica e ROI sem substituir a configuração nativa do Zendesk, que permanece como fallback.

## Simulação — Chat ao vivo (com agente enriquecido)

**Cliente (10:42):**  
> "Estou tentando acessar o painel da minha empresa e aparece erro 403. Preciso disso para a reunião de agora."

### 1. Resposta automatizada (Answer Bot + Agente VitaFlex) — instantânea

O Answer Bot detecta o termo **"403"** e aciona a API do agente, que consulta KB + dados da organização do cliente antes de responder:

```
Olá! Sou o assistente VitaFlex. Entendi que você está com erro 403 ao acessar o painel corporativo.

Enquanto conecto você a um especialista, tente:
✓ Atualizar a página (Ctrl+F5)
✓ Acessar em aba anônima
✓ Confirmar se seu e-mail corporativo está ativo no cadastro da empresa

📄 Artigo relacionado: "Resolvendo erro 403 no painel corporativo"

Se nada resolver, um agente humano assume em instantes. Sua solicitação já foi registrada com prioridade ALTA.
```

**Ações automáticas em paralelo (gatilhos + IA):**
- Intent detectada: `erro_acesso` + `erro_403` + palavra-chave "reunião" → urgência elevada
- Ticket criado no grupo **N1 Técnico**
- Tags: `chat`, `erro_403`, `painel`, `urgente`
- Prioridade: `urgent` (reunião iminente = impacto de negócio)
- Campo *Tipo de Erro*: Acesso (403/401)
- Webhook Slack: notificação ao canal `#suporte-urgente`

### 2. Direcionamento humano — ~45 segundos

- Se o agente não resolver em 2 turnos, handoff automático para N1 Técnico
- Copiloto já deixou nota interna sugerindo verificação de permissão `gestor_painel`
- Omnichannel Routing atribui ao agente com skill "Acesso"

**Agente N1 (10:43):**  
> "Lucas, já estou verificando suas permissões no painel da sua empresa. Pode confirmar o e-mail que você usa para login?"

### 3. Priorização do caso

| Critério | Valor | Efeito |
|---|---|---|
| Prioridade Zendesk | `urgent` | Topo da fila + SLA 15 min |
| Canal | Chat ativo | Roteamento em tempo real |
| Tag | `cliente_vip` (se aplicável) | SLA 24×7 |
| SLA | Urgentíssimo — 1ª resposta 15 min | Timer visível ao agente e gestor |
| Notificação | Slack + e-mail gestor se SLA < 20% | Escalação preventiva |

**Resultado esperado:** primeira resposta humana em < 3 min; resolução típica em 15–30 min (reativação de permissão).

---

# Parte 3 — Base de Conhecimento e Autoatendimento

## Estratégia por canal

| Canal | Recurso | Objetivo |
|---|---|---|
| **Help Center** | Artigos, seções, busca | Desvio antes da abertura do ticket |
| **Chat / WhatsApp** | AI Agent + sugestão de artigos | Resolução in-chat sem ticket |
| **Formulário** | Deflection (artigos sugeridos ao digitar assunto) | Reduz tickets mal categorizados |

### Estrutura do Help Center (B2B)

```
Para Empresas
├── Acesso e Segurança
│   ├── Como acessar o painel corporativo
│   ├── Resolvendo erro 403
│   ├── Recuperação de senha
│   └── Configuração de 2FA
├── Relatórios e Dados
├── Configurações (usuários, cadastro, permissões)
└── Suporte (status, SLAs, como abrir ticket)
```

## Como avaliar se o autoatendimento funciona

| Métrica | Fórmula / Fonte (Explore) | Meta VitaFlex |
|---|---|---|
| **Taxa de deflexão** | Tickets evitados ÷ (Tickets + Deflexões) | > 40% |
| **Resolução via AI Agent** | Sessões resolvidas sem ticket ÷ total sessões | > 35% |
| **Taxa de "artigo útil"** | Sim ÷ (Sim + Não) no feedback do artigo | > 70% |
| **Redução de tickets** | Comparativo mês a mês por categoria | −20% em 6 meses |
| **Tempo no Help Center** | Duração média da sessão | > 2 min (leitura real) |
| **Tickets com artigo vinculado** | Tickets que citam artigo na resolução | Tendência de alta |

**Cadência de revisão:** semanal (artigos com baixo score), mensal (categorias com mais tickets), trimestral (reestruturação de seções).

## Exemplo prático — Erro de acesso (403)

**Artigo:** *"Resolvendo erro 403 no painel corporativo"*

Conteúdo:
1. O que significa 403 (sem permissão, não é senha errada)
2. Checklist: e-mail correto, usuário ativo, perfil autorizado, cache do navegador
3. Quando acionar o suporte (com print e ID da empresa)
4. Vídeo de 60s demonstrando o fluxo

**Integrações:**
- AI Agent treinado neste artigo → responde no chat antes de abrir ticket
- Deflection no formulário: ao digitar "403" ou "acesso negado", sugere o artigo
- Macro para agentes linkar o artigo em respostas

**Impacto esperado:** −60% a −80% nos tickets recorrentes de 403 (benchmark interno após 90 dias).

---

# Parte 4 — Métricas, Painéis e Governança

## 5 métricas que eu acompanharia

| # | Métrica | Tipo | Por quê |
|---|---|---|---|
| 1 | **CSAT** (% satisfação pós-atendimento) | Estratégica | Mede experiência real do cliente B2B |
| 2 | **% Adesão ao SLA** (1ª resposta e solução) | Operacional | Contrato e confiança com contas enterprise |
| 3 | **Tempo médio de 1ª resposta** por grupo/canal | Operacional | Ataca reclamação de demora no primeiro contato |
| 4 | **Taxa de deflexão / autoatendimento** | Estratégica | ROI da base de conhecimento e IA |
| 5 | **Volume de tickets por categoria** (técnico vs funcional, top 5 assuntos) | Estratégica | Direciona treinamento, artigos e automações |

**Painéis no Explore:**
- **Operacional (diário):** fila por grupo, SLA em risco, agentes online, tickets abertos por canal
- **Estratégico (semanal/mensal):** CSAT, deflexão, custo por ticket, reabertura, tendência VIP

## Governança — Restringir dados sensíveis

### Camadas de proteção

1. **Campos personalizados com permissão restrita**
   - `cpf_cliente`, `diagnostico_medico` → visíveis apenas para funções Gestor e Dados Sensíveis
   - Configuração: Admin Center → Objetos e regras → Tickets → Campos → Editar permissões por função

2. **Grupos com acesso limitado**
   - Grupo "Dados Sensíveis" — apenas agentes com treinamento LGPD
   - Gatilho: campo *Contém Dados Sensíveis* = true → move ticket para grupo restrito + tag `dados_sensiveis`

3. **Funções customizadas**
   - Agente N1: **sem** acesso a campos restritos
   - Agente N2: leitura parcial (mascarado: `***.***.***-**`)
   - Gestor / Admin: acesso completo

4. **Tags de classificação**
   - `dados_sensiveis`, `confidencial`, `lgpd` → usadas em views, relatórios e gatilhos de bloqueio

5. **Auditoria**
   - Log de eventos do Zendesk (quem acessou/editou ticket)
   - Webhook para SIEM em tickets tagueados `dados_sensiveis`
   - Revisão trimestral de permissões (access review)

---

# Parte 5 — Diagnóstico de Incidentes Técnicos

## Caso 1 — Agente não visualiza tickets de um cliente

| Etapa | Detalhe |
|---|---|
| **Hipótese inicial** | Restrição de grupo, organização ou função; ticket em grupo não pertencente ao agente |
| **Onde buscar evidências** | Admin Center → Pessoas → [Agente] → Grupos e Função; ticket → Grupo, Organização, Tags; Admin → Funções → escopo de tickets |
| **Evidências típicas** | Agente no grupo N1 Funcional, ticket no N1 Técnico; ou função com acesso `assigned_only`; organização com restrição de visibilidade |
| **Validação** | Comparar grupo do ticket × grupos do agente; testar com conta admin; verificar se há tag `dados_sensiveis` em grupo restrito |
| **Solução** | Incluir agente no grupo correto, ou transferir ticket; ajustar função para `group`; documentar regra de roteamento |
| **Resposta ao agente** | "Identifiquei que o ticket #XXXX está no grupo N2 Técnico e seu perfil tem acesso apenas ao N1 Funcional. Transferi o ticket para seu grupo. Se precisar de acesso permanente ao N2, abra solicitação ao gestor." |

## Caso 2 — VIP aguardou 3h sem violação de SLA

| Etapa | Detalhe |
|---|---|
| **Hipótese inicial** | SLA não aplicado (prioridade/tag incorreta), calendário comercial pausou o relógio, ou status Pendente pausou SLA |
| **Onde buscar evidências** | Ticket → painel de SLA (qual política aplicou); Eventos do ticket; Gatilho VIP; Organização → tags |
| **Evidências típicas** | Prioridade `normal` em vez de `urgent`; tag `cliente_vip` ausente; SLA com horário 8h–18h e ticket aberto às 19h; status Pendente por 3h |
| **Validação** | Conferir política de SLA vinculada; simular gatilho VIP com organização de teste |
| **Solução** | Corrigir gatilho para aceitar `vip` e `cliente_vip`; mapear organizações VIP; SLA 24×7 para tag VIP; remover pausa indevida |
| **Resposta ao cliente VIP** | "Pedimos desculpas pela demora. Identificamos falha na priorização automática da sua conta. Corrigimos a configuração e priorizamos sua solicitação. Um agente sênior está tratando agora." |

## Caso 3 — Integração parou após troca de senha do admin

| Etapa | Detalhe |
|---|---|
| **Hipótese inicial** | Integração autentica com credencial do admin (e-mail + senha) em vez de API Token OAuth |
| **Onde buscar evidências** | Logs da integração / Zapier / middleware; `GET /api/v2/tickets.json` com credencial atual → 401; Admin → Apps e integrações |
| **Evidências típicas** | HTTP 401 Unauthorized após data da troca de senha; nenhum ticket criado desde então |
| **Validação** | Testar endpoint com Postman usando token antigo (falha) vs API Token novo (sucesso) |
| **Solução** | Criar API Token dedicado (`/admin/apps-integrations/apis/zendesk-api/settings`); atualizar integração; nunca usar senha de usuário humano |
| **Resposta interna** | "Integração restaurada com API Token de serviço. Recomendo rotacionar tokens a cada 90 dias e documentar no runbook." |

## Caso 4 — Webhook (Zendesk → CRM) não dispara

| Etapa | Detalhe |
|---|---|
| **Hipótese inicial** | Webhook inativo, trigger não vinculado, endpoint externo rejeitando (4xx/5xx), ou throttling |
| **Onde buscar evidências** | Admin → Apps → Webhooks → [webhook] → **Activity**; Trigger associado; logs do CRM |
| **Evidências típicas** | Activity vazia = trigger não disparou; Activity com 403 = auth do CRM; 502 = endpoint fora |
| **Validação** | Disparar trigger manualmente (atualizar ticket teste); curl no endpoint com mesmo payload |
| **Solução** | Reativar webhook; corrigir Bearer token do CRM; ajustar trigger (condição `ticket is updated` + tag) |
| **Resposta ao time** | "Webhook falhava com 403 por API Key expirada no CRM. Chave renovada; últimos 5 disparos com status 200. Monitorar por 24h." |

## Caso 5 — Webhook de criação de ticket (externo → Zendesk) sem ticket e sem erro

| Etapa | Detalhe |
|---|---|
| **Hipótese inicial** | Confusão de direção (webhook outbound vs inbound API); trigger com ação webhook mal configurada; payload inválido silenciosamente ignorado |
| **Onde buscar evidências** | Admin → Webhooks → Activity; Triggers (ação "Notify active webhook"); logs do sistema externo / Zapier; `/api/v2/tickets.json` POST direto |
| **Evidências típicas** | Activity sem registros = trigger não executou; Zapier "success" mas Zendesk sem ticket = campo obrigatório faltando; webhook outbound não cria ticket — precisa `POST /api/v2/tickets.json` |
| **Validação** | Testar criação via API direta; revisar se ação do gatilho é notificação (saída) e não criação (entrada) |
| **Solução** | Sistema externo deve chamar API REST do Zendesk (ou Zapier action "Create Ticket"); gatilho outbound apenas para notificar CRM *após* criação |
| **Resposta ao time** | "O webhook configurado era de saída (notificar URL). Criação inbound exige chamada à API de Tickets. Ajustamos o Zapier para Create Ticket com mapeamento de campos." |

## Caso 6 — App privado não carrega — tickets sem ID externo

| Etapa | Detalhe |
|---|---|
| **Hipótese inicial** | App ZAF consulta `id_externo_cliente` para API externa; campo vazio → null reference |
| **Onde buscar evidências** | Console do app (iframe); tickets afetados vs funcionais; relatório Explore de campo vazio; código `client.get('ticket.customField:custom_field_XXXXX')` |
| **Evidências típicas** | Tickets antigos e via e-mail sem ID; app funciona em tickets novos do formulário |
| **Validação** | Filtrar `id_externo_cliente is blank` no Explore; testar app em ticket com campo preenchido |
| **Solução** | Campo obrigatório no formulário; gatilho preenche com `{{ticket.requester.organization.external_id}}`; bulk update retroativo via API |
| **Resposta ao agente** | "App depende do ID Externo do Cliente. Ativei preenchimento automático para novos tickets e rodei correção em massa nos últimos 90 dias. Atualize a página do ticket." |

## Caso 7 (Bônus) — Rate limit ao atualizar tickets

| Etapa | Detalhe |
|---|---|
| **Hipótese inicial** | Limite da API Zendesk (~200–700 req/min conforme plano) ou bulk update simultâneo por app/script |
| **Onde buscar evidências** | Mensagem na UI; headers `X-Rate-Limit-Remaining`; logs do app privado / integração; Audit log de automação |
| **Evidências típicas** | HTTP 429; erro "Limite de taxa de atualização do ticket atingido"; pico de updates no mesmo minuto |
| **Validação** | Identificar origem (macro em massa, app, integração); contar req/min no log |
| **Solução** | Aguardar reset (~1 min); implementar exponential backoff; usar Bulk Update API (`/api/v2/tickets/update_many.json`) em lotes de 100; espaçar jobs |
| **Resposta ao agente** | "Pico de atualizações simultâneas atingiu o limite da API. Aguarde 60 segundos e tente novamente. Estamos ajustando a integração para processar em lotes menores." |

---

# Parte 6 — Simulação de Atendimento Ponta a Ponta

**Cliente:** Lucas Marcondes — empresa cliente (organização com tag `cliente_vip`)  
**Canal:** Formulário Web — Suporte Técnico  
**Problema:** Erro 403 ao acessar painel corporativo  
**Horário:** Segunda-feira, 10:00

---

### Etapa 1 — Abertura (10:00:00)

Cliente preenche formulário:
- Assunto: "Erro 403 ao acessar painel"
- Tipo de Erro: Acesso (403/401)
- Urgência: Alta
- Anexo: screenshot

**Automações:**
- Ticket #4821 criado → Grupo N1 Técnico
- Gatilho 403: prioridade `high`, tags `erro_403`, `erro_acesso`, `tecnico`
- Gatilho VIP: prioridade elevada para `urgent`, tag `vip`
- Webhook CRM: novo ticket sincronizado

### Etapa 2 — Resposta automática (10:00:05)

E-mail + notificação no portal:

> Olá Lucas! Recebemos sua solicitação **#4821** com prioridade alta.  
> Enquanto nossa equipe analisa, consulte: [Resolvendo erro 403 no painel corporativo].  
> Tempo estimado de 1ª resposta: até 15 minutos (conta VIP).

### Etapa 3 — Triagem N1 (10:05)

**Agente Ana (N1 Técnico)** assume via Omnichannel Routing.

*Nota interna:*  
> "Cliente VIP. Print mostra 403 na rota /dashboard. Verificar permissão 'gestor_painel' no ID externo 88742."

Consulta app privado (ID externo preenchido automaticamente) → permissão revogada ontem por migração.

### Etapa 4 — Escalonamento N2 (10:15)

Ana não tem permissão para reativar perfil admin.

*Nota interna + macro Escalonar N2:*  
> "Necessário reativar role gestor_painel no backend. Migração #MIG-2024-09."

- Grupo → N2 Técnico
- Tag: `escalado_n2`
- Side Conversation para Time de Infra (paralela, não visível ao cliente)

### Etapa 5 — Resolução N2 (10:22)

**Agente Bruno (N2)** reativa permissão via app integrado.

*Nota interna:*  
> "Permissão restaurada. Pedir ao N1 validar com cliente."

### Etapa 6 — Artigo de ajuda + validação (10:28)

Ana envia ao cliente:

> Lucas, corrigimos suas permissões de acesso. Por favor, tente novamente em aba anônima.  
> Se precisar no futuro, este guia ajuda: [Resolvendo erro 403 no painel corporativo].

Cliente confirma acesso restaurado às 10:32.

### Etapa 7 — Encerramento e CSAT (10:35)

- Status: Resolvido
- Tag: `resolvido_acesso`
- Pesquisa CSAT disparada automaticamente (gatilho: status = solved)
- Cliente responde **5/5** às 10:40

---

### Resultado

| Indicador | Resultado | Meta |
|---|---|---|
| 1ª resposta | 5 min | < 15 min (VIP) |
| Resolução | 35 min | < 4h |
| SLA | 100% | > 95% |
| CSAT | 5/5 | > 4,5 |
| Artigo vinculado | Sim | — |
| Side Conversation | Sim (Infra) | — |

---

# Anexos e material de implementação

- **JSONs prontos:** `jsons-prontos-para-importar-desafio-zendesk-vitaflex.md` — gatilhos, webhooks, SLAs, campos, formulários, grupos, views
- **Demo Zendesk:** https://www.zendesk.com.br/register/
- **Documentação:** https://support.zendesk.com/hc/pt-br

### Ordem sugerida de implementação na demo

1. Grupos e funções  
2. Campos personalizados  
3. Formulários  
4. Políticas de SLA + calendários  
5. Visualizações  
6. Gatilhos  
7. Webhooks  
8. Help Center + artigo 403  
9. AI Agent / Messaging  
10. Teste ponta a ponta (Parte 6)

---

*Documento elaborado como entrega do Desafio Técnico — Analista de Negócios Zendesk.*
