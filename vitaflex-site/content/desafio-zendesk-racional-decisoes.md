# Racional das Decisões — Desafio Técnico Zendesk

**Autor:** Lucas Marcondes  
**Data:** 12/06/2026

Este documento explica o raciocínio por trás de cada resposta do desafio técnico. O objetivo é demonstrar não apenas o que foi configurado, mas por que cada decisão foi tomada.

---

## Visão geral da abordagem

A VitaFlex é uma operação B2B de saúde corporativa com clientes de médio e grande porte. Isso implica três pressões simultâneas: contratos com SLA rígido, dados sensíveis sujeitos à LGPD e volume alto de demandas repetitivas (acesso, permissões, dúvidas de uso).

Minha abordagem foi separar o atendimento em dois eixos ortogonais: tipo de demanda (técnica vs funcional) e nível de complexidade (N1, N2, especialista). Essa separação evita que dúvidas simples disputem fila com incidentes críticos e permite SLAs diferenciados sem criar dezenas de filas artificiais.

---

## Parte 1 — Estruturação de fluxos e acessos

### Por que dois formulários e não um só?

Um formulário único obriga o cliente a escolher corretamente a categoria — e na prática escolhem errado. Dois formulários com campos específicos (Tipo de Erro vs Área) fazem a triagem no momento da abertura, reduzindo retrabalho do N1 e melhorando métricas de categorização no Explore.

### Por que grupos N1/N2 separados por tipo?

Técnico e funcional exigem perfis diferentes: o técnico precisa de acesso a sistemas e logs; o funcional precisa de conhecimento de regras de negócio e LGPD. Misturar em um grupo só aumenta tempo de resolução porque o agente precisa constantemente transferir tickets.

### Por que Light Agent para especialistas?

Especialistas que não atuam no suporte diário não devem ver fila nem receber atribuições automáticas. O Light Agent do Zendesk resolve isso: o especialista só entra quando é colaborador ou mencionado. Combinado com Side Conversation, mantém o histórico auditável sem expor o especialista ao cliente.

### Por que Side Conversation em vez de e-mail externo?

E-mail externo perde rastreabilidade no ticket. Side Conversation mantém tudo vinculado ao ticket pai, permite pausar SLA com status Pendente e gera métricas de tempo de resposta do especialista.

### Por que mapear Urgência customizada para prioridade nativa?

O Zendesk só tem quatro prioridades nativas. Criar um campo Urgência com quatro níveis de negócio e mapear via gatilho permite linguagem alinhada ao contrato (Urgentíssimo) sem lutar contra limitações da plataforma.

### Por que calendários de SLA diferentes para VIP?

Cliente VIP paga por disponibilidade 24×7. Aplicar horário comercial ao SLA de um VIP gera falsa sensação de cumprimento ou violação injusta. Calendário 24×7 para VIP e Urgentíssimo reflete o contrato real.

---

## Parte 2 — Omnichannel e IA

### Por que FastAPI + Agno em vez de só Answer Bot?

O Answer Bot nativo limita-se a artigos estáticos. A VitaFlex precisa cruzar conhecimento com dados do cliente (permissões, organização, histórico). Uma API FastAPI com agente Agno centraliza essa lógica e pode ser chamada pelo Answer Bot quando o termo do usuário indicar necessidade — sem reescrever o fluxo Zendesk.

### Por que duas personas no mesmo agente?

Reutilizar o mesmo núcleo (KB + base de clientes + tools) com prompts diferentes é mais sustentável que dois sistemas separados. Persona cliente resolve no bot; persona copiloto apoia o analista nos comentários internos — humano sempre valida antes de enviar ao cliente.

### Por que meta de 65% de retenção no bot?

Com respostas personalizadas (não genéricas), a hipótese é que 65% das sessões se resolvem sem ticket. Métrica: `sessões resolvidas in-bot ÷ total sessões`, acompanhada no Explore.

### Por que AI Agent / Answer Bot antes do humano?

A reclamação central era demora no primeiro contato. O agente responde em segundos com contexto do cliente, não só artigo genérico. O humano entra com triagem feita.

### Por que priorizar erro 403 com urgência alta no chat?

Erro 403 em painel corporativo bloqueia operação. A palavra-chave "reunião" indica impacto imediato de negócio. Gatilho combinando intent + palavra-chave evita depender só do agente para priorizar.

### Por que unificar WhatsApp e Chat no mesmo fluxo?

Sunshine Conversations permite roteamento idêntico e a mesma chamada à API do agente. Separar fluxos duplica configuração e gera experiência inconsistente entre canais.

---

## Parte 3 — Base de conhecimento

### Por que deflexão em três pontos (Help Center, chat, formulário)?

Cada canal tem momento diferente de desistência. No Help Center o cliente desiste antes de abrir ticket. No chat, durante a conversa. No formulário, ao digitar o assunto. Cobrir os três maximiza deflexão sem depender de um único ponto.

### Por que artigo dedicado ao erro 403?

É demanda recorrente em operações B2B (permissão revogada, cache, perfil errado). Um artigo bem estruturado com checklist reduz tickets que hoje consumem N1. Meta de redução de 60–80% é agressiva mas alcançável com deflexão + IA treinada no artigo.

### Como medir se funciona?

Taxa de deflexão, score de artigo útil e redução mensal por categoria. Sem métrica, base de conhecimento vira projeto estático que ninguém revisa.

---

## Parte 4 — Métricas e governança

### Por que CSAT e SLA juntos?

SLA mede compromisso contratual; CSAT mede experiência real. É possível cumprir SLA com resposta técnica fria — CSAT captura isso.

### Por que deflexão como métrica estratégica?

Cada ticket evitado é custo operacional economizado. Para diretoria, deflexão traduz investimento em Help Center e IA em ROI tangível.

### Por que camadas de proteção para dados sensíveis?

LGPD exige minimização de acesso. Campos restritos por função + grupo Dados Sensíveis + tags + auditoria SIEM criam defesa em profundidade: mesmo que um agente N1 veja o ticket, não vê o CPF; mesmo que veja a tag, o ticket pode estar em grupo restrito.

---

## Parte 5 — Diagnóstico de incidentes

### Metodologia usada

Para cada caso segui o mesmo ciclo: hipótese inicial baseada em padrões conhecidos do Zendesk, busca de evidências em locais específicos da plataforma (Admin Center, webhook Activity, logs de API), validação com teste controlado e solução com resposta clara ao stakeholder.

### Caso 1 (agente não vê ticket)

Causa mais comum: escopo de função `group` vs grupo do ticket. Sempre verificar antes de assumir bug.

### Caso 2 (VIP sem violação de SLA)

Três armadilhas: tag VIP ausente, calendário comercial pausando relógio, status Pendente. SLA no Zendesk é política + calendário + status — não apenas tempo.

### Caso 3 (integração após troca de senha)

Anti-pattern clássico: integração com senha de usuário humano. API Token de serviço é obrigatório para produção.

### Caso 4 e 5 (webhooks)

Direção importa: webhook outbound notifica sistemas externos; criação de ticket inbound exige API REST. Confusão entre os dois é a causa número um de "webhook não cria ticket".

### Caso 6 (app sem ID externo)

Apps ZAF que consultam custom field sem fallback quebram silenciosamente. Campo obrigatório + gatilho de preenchimento automático + bulk update retroativo.

### Caso 7 (rate limit)

Zendesk limita requisições por minuto. Bulk API em lotes de 100 com backoff é a solução estrutural.

---

## Parte 6 — Simulação ponta a ponta

### Por que esse cenário?

Erro 403 + cliente VIP + formulário web cobre o caminho mais comum e mais crítico: abertura categorizada, automação de prioridade, escalonamento N1→N2, Side Conversation paralela, artigo de ajuda na resolução e CSAT no encerramento.

### Por que Side Conversation com Infra?

N1 não deve ter permissão para alterar backend. Side Conversation documenta a dependência sem expor complexidade ao cliente.

### Resultado em 35 minutos

Dentro do SLA VIP (15 min primeira resposta, 4h solução). Demonstra que a arquitetura proposta é operacionalmente viável.

---

## Síntese

Todas as decisões convergem para três princípios:

1. **Triagem cedo** — formulários, IA e gatilhos resolvem classificação na abertura.
2. **Escalonamento em camadas** — N1 resolve volume; N2 resolve complexidade; especialista resolve exceção sem poluir fila.
3. **Mensuração contínua** — SLA, CSAT, deflexão e auditoria permitem governança e melhoria iterativa.

As configurações JSON no anexo técnico são implementação concreta desses princípios, não um catálogo genérico de features do Zendesk.

---

*Documento de racional — Desafio Técnico Analista de Negócios Zendesk*
