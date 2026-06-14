# JSONs Prontos para Importar - Desafio Zendesk VitaFlex

Olá, aqui é o Lucas. Neste documento, vou te passar todos os JSONs prontos para você importar diretamente no Zendesk. Cada JSON tem uma explicação do que ele faz e como usar. Eu já usei configurações parecidas em projetos reais, então sei que funciona.


## COMO USAR ESTES JSONS

Tem duas formas de usar os JSONs que eu preparei:

1. **Via API (Recomendado para muitos itens):**
   Você pode usar o cURL ou qualquer linguagem de programação para importar diretamente via API do Zendesk.

2. **Via Interface (Para poucos itens):**
   Copie os valores do JSON e cole na interface do Zendesk.

Antes de começar, você precisa substituir os placeholders (como ID_GRUPO_N1_TECNICO) pelos IDs reais da sua instância. Para obter os IDs, use os endpoints da API que eu vou te mostrar mais abaixo.


## GATILHOS (TRIGGERS)

Os gatilhos são automações que executam ações quando certas condições são atendidas. Aqui estão os que eu criaria para a VitaFlex.


### Gatilho 1: Classificar Ticket como Urgente quando contem erro 403

Este gatilho identifica automaticamente tickets com erro 403 no assunto e os classifica como urgentes. Assim, a gente não precisa fazer isso manualmente.

```json
{
  "title": "Classificar Urgente - Erro 403",
  "active": true,
  "conditions": {
    "all": [
      {"field": "subject", "operator": "contains", "value": "403"},
      {"field": "tags", "operator": "not_contains", "value": "urgente"}
    ]
  },
  "actions": [
    {"field": "priority", "value": "urgent"},
    {"field": "tags", "value": "urgente,erro_403"},
    {"field": "group_id", "value": "ID_GRUPO_N1_TECNICO"}
  ]
}
```

O que este JSON faz:
- Verifica se o assunto do ticket contém "403"
- Se não tiver a tag "urgente", executa as ações
- Define prioridade como "urgent"
- Adiciona as tags "urgente" e "erro_403"
- Move o ticket para o grupo N1 Técnico

NOTA: Você precisa substituir ID_GRUPO_N1_TECNICO pelo ID real do seu grupo N1 Técnico.


### Gatilho 2: Adicionar Especialista como Colaborador quando precisa de validação

Este gatilho é para quando um agente do N1 Funcional identifica que precisa de um especialista. Ele adiciona o especialista como colaborador e notifica por email.

```json
{
  "title": "Adicionar Especialista - Validacao Necessaria",
  "active": true,
  "conditions": {
    "all": [
      {"field": "group_id", "operator": "is", "value": "ID_GRUPO_N1_FUNCIONAL"},
      {"field": "tags", "operator": "contains", "value": "precisa_especialista"}
    ]
  },
  "actions": [
    {"field": "collaborator_ids", "value": "ID_ESPECIALISTA"},
    {"field": "tags", "value": "aguardando_especialista"},
    {"field": "notification_email", "value": "especialista@vitaflex.com"}
  ]
}
```

O que este JSON faz:
- Verifica se o ticket está no grupo N1 Funcional e tem a tag "precisa_especialista"
- Adiciona o especialista como colaborador (você precisa do ID do usuário)
- Adiciona a tag "aguardando_especialista"
- Envia email de notificação para o especialista

NOTA: Substitua ID_GRUPO_N1_FUNCIONAL e ID_ESPECIALISTA pelos IDs reais.


### Gatilho 3: Priorizar Cliente VIP automaticamente

Este gatilho garante que tickets de clientes VIP sejam priorizados automaticamente.

```json
{
  "title": "Priorizar Cliente VIP",
  "active": true,
  "conditions": {
    "all": [
      {"field": "tags", "operator": "contains", "value": "cliente_vip"}
    ]
  },
  "actions": [
    {"field": "priority", "value": "urgent"},
    {"field": "tags", "value": "vip,urgente"}
  ]
}
```

O que este JSON faz:
- Verifica se o ticket tem a tag "cliente_vip"
- Define prioridade como "urgent"
- Adiciona as tags "vip" e "urgente"


### Gatilho 4: Notificar quando SLA estiver em risco

Este gatilho envia um email de alerta quando o SLA de um ticket está abaixo de 20% do tempo limite.

```json
{
  "title": "Notificar SLA em Risco",
  "active": true,
  "conditions": {
    "all": [
      {"field": "sla", "operator": "less_than", "value": "20"}
    ]
  },
  "actions": [
    {"field": "notification_email", "value": "gestor@vitaflex.com"},
    {"field": "tags", "value": "sla_risco"}
  ]
}
```

O que este JSON faz:
- Verifica se o SLA está abaixo de 20%
- Envia email para o gestor
- Adiciona a tag "sla_risco"


### Gatilho 5: Mover tickets com dados sensíveis para grupo restrito

Este gatilho move automaticamente tickets que contêm dados sensíveis para um grupo especial.

```json
{
  "title": "Mover para Dados Sensiveis",
  "active": true,
  "conditions": {
    "all": [
      {"field": "custom_field_ID_DADOS_SENSIVEIS", "operator": "not_empty"}
    ]
  },
  "actions": [
    {"field": "group_id", "value": "ID_GRUPO_DADOS_SENSIVEIS"},
    {"field": "tags", "value": "dados_sensiveis"}
  ]
}
```

O que este JSON faz:
- Verifica se o campo de dados sensíveis está preenchido
- Move o ticket para o grupo de dados sensíveis
- Adiciona a tag "dados_sensiveis"

NOTA: Substitua ID_DADOS_SENSIVEIS e ID_GRUPO_DADOS_SENSIVEIS pelos IDs reais.


### Gatilho 6: Resposta Automática para Erros de Acesso

Este gatilho envia uma resposta automática para tickets com tag erro_acesso, dando orientações iniciais ao cliente.

```json
{
  "title": "Resposta Automatica - Erro de Acesso",
  "active": true,
  "conditions": {
    "all": [
      {"field": "tags", "operator": "contains", "value": "erro_acesso"}
    ]
  },
  "actions": [
    {
      "field": "comment",
      "value": "Ola! Detectamos que voce esta com um erro de acesso. Enquanto conectamos voce a um agente:\n\n- Verifique se sua senha esta correta\n- Tente acessar em modo anonimo (Ctrl+Shift+N)\n- Se o problema persistir, um agente entrara em contato em ate 15 minutos\n\nPrioridade: URGENTE | Ticket #{{ticket.id}}"
    }
  ]
}
```

O que este JSON faz:
- Verifica se o ticket tem a tag "erro_acesso"
- Adiciona um comentário público com orientações
- O cliente recebe essa resposta automaticamente


### Gatilho 7: Adicionar ID Externo do Cliente automaticamente

Este gatilho preenche automaticamente o campo ID Externo do Cliente com o ID da organização do solicitante.

```json
{
  "title": "Adicionar ID Externo - Novo Ticket",
  "active": true,
  "conditions": {
    "all": [
      {"field": "custom_field_ID_EXTERNO", "operator": "is", "value": ""}
    ]
  },
  "actions": [
    {
      "field": "custom_field_ID_EXTERNO",
      "value": "{{ticket.requester.organization_id}}"
    }
  ]
}
```

O que este JSON faz:
- Verifica se o campo ID Externo está vazio
- Preenche com o ID da organização do solicitante

NOTA: Substitua ID_EXTERNO pelo ID real do campo personalizado.


## WEBHOOKS

Webhooks são notificações que o Zendesk envia para outros sistemas quando algo acontece. Aqui estão os que eu criaria.


### Webhook 1: Integração com CRM para Criação de Ticket

Este webhook envia informações de novos tickets para o CRM da empresa.

```json
{
  "name": "Webhook_CRM_Criacao_Ticket",
  "endpoint": "https://crm.vitaflex.com/api/tickets",
  "request_method": "POST",
  "active": true,
  "events": ["ticket.created"],
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer API_KEY_CRM"
  },
  "payload": {
    "ticket_id": "{{ticket.id}}",
    "subject": "{{ticket.subject}}",
    "priority": "{{ticket.priority}}",
    "requester_email": "{{ticket.requester.email}}",
    "status": "{{ticket.status}}"
  }
}
```

O que este JSON faz:
- Quando um ticket é criado, envia os dados para o endpoint do CRM
- Usa autenticação Bearer Token
- Envia ID, assunto, prioridade, email do solicitante e status

NOTA: Substitua API_KEY_CRM pela chave real da API do CRM.


### Webhook 2: Integração com LLM para Análise de Ticket

Este é o webhook que eu usaria para integrar com o LLM (Mistral). Ele envia os dados do ticket para o LLM analisar e classificar.

```json
{
  "name": "Webhook_LLM_Analise_Ticket",
  "endpoint": "https://llm.vitaflex.com/api/analisar",
  "request_method": "POST",
  "active": true,
  "events": ["ticket.created", "ticket.updated"],
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer API_KEY_LLM"
  },
  "payload": {
    "ticket_id": "{{ticket.id}}",
    "subject": "{{ticket.subject}}",
    "description": "{{ticket.description}}",
    "tags": "{{ticket.tags}}",
    "requester_id": "{{ticket.requester.id}}"
  }
}
```

O que este JSON faz:
- Quando um ticket é criado ou atualizado, envia os dados para o endpoint do LLM
- O LLM recebe ID, assunto, descrição, tags e ID do solicitante
- O LLM pode classificar, sugerir respostas, etc.

NOTA: Substitua API_KEY_LLM pela chave real da API do LLM.


### Webhook 3: Notificação Slack para Tickets Urgentes

Este webhook envia uma notificação para o Slack quando um ticket urgente é criado.

```json
{
  "name": "Webhook_Slack_Urgente",
  "endpoint": "https://hooks.slack.com/services/SLACK_WEBHOOK_URL",
  "request_method": "POST",
  "active": true,
  "events": ["ticket.created"],
  "headers": {
    "Content-Type": "application/json"
  },
  "payload": {
    "text": "NOVO TICKET URGENTE\nTicket: #{{ticket.id}}\nAssunto: {{ticket.subject}}\nCliente: {{ticket.requester.name}}\nLink: https://vitaflex-demo.zendesk.com/agent/tickets/{{ticket.id}}"
  }
}
```

O que este JSON faz:
- Quando um ticket é criado, envia notificação para o Slack
- Inclui número do ticket, assunto, cliente e link direto

NOTA: Substitua SLACK_WEBHOOK_URL pelo URL real do webhook do Slack.


### Webhook 4: Integração com SIEM para Logs de Segurança

Este webhook envia logs de atividades do Zendesk para o sistema SIEM de monitoramento.

```json
{
  "name": "Webhook_SIEM_Logs",
  "endpoint": "https://siem.vitaflex.com/api/logs",
  "request_method": "POST",
  "active": true,
  "events": ["ticket.created", "ticket.updated", "ticket.solved"],
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer API_KEY_SIEM"
  },
  "payload": {
    "event": "{{event}}",
    "ticket_id": "{{ticket.id}}",
    "user_id": "{{ticket.requester.id}}",
    "timestamp": "{{ticket.updated_at}}",
    "action": "{{action}}"
  }
}
```

O que este JSON faz:
- Envia logs para o SIEM sempre que um ticket é criado, atualizado ou resolvido
- Inclui tipo de evento, ID do ticket, ID do usuário, timestamp e ação

NOTA: Substitua API_KEY_SIEM pela chave real da API do SIEM.


## POLÍTICAS DE SLA

As políticas de SLA definem os prazos que a gente se compromete a cumprir. Aqui estão as que eu criaria.


### SLA 1: Tempo de Resposta Urgentíssimo

SLA para tickets com prioridade urgentíssima, tempo alvo de 15 minutos para primeira resposta.

```json
{
  "title": "SLA Urgentissimo - Resposta",
  "metric": "first_reply_time",
  "target": 900,
  "conditions": {
    "all": [
      {"field": "priority", "operator": "is", "value": "urgent"}
    ]
  },
  "actions": [
    {"field": "notification_email", "value": "gestor@vitaflex.com"}
  ]
}
```

O que este JSON faz:
- Aplica a tickets com prioridade "urgent"
- Métrica: tempo até a primeira resposta
- Alvo: 900 segundos (15 minutos)
- Se violado, notifica o gestor por email


### SLA 2: Tempo de Resposta Alta

SLA para tickets com prioridade alta, tempo alvo de 1 hora para primeira resposta.

```json
{
  "title": "SLA Alta - Resposta",
  "metric": "first_reply_time",
  "target": 3600,
  "conditions": {
    "all": [
      {"field": "priority", "operator": "is", "value": "high"}
    ]
  }
}
```


### SLA 3: Tempo de Resposta Normal

SLA para tickets com prioridade normal, tempo alvo de 2 horas para primeira resposta.

```json
{
  "title": "SLA Normal - Resposta",
  "metric": "first_reply_time",
  "target": 7200,
  "conditions": {
    "all": [
      {"field": "priority", "operator": "is", "value": "normal"}
    ]
  }
}
```


### SLA 4: Tempo de Solução Urgentíssimo

SLA para resolução completa de tickets urgentíssimos, tempo alvo de 1 hora.

```json
{
  "title": "SLA Urgentissimo - Solucao",
  "metric": "full_resolution_time",
  "target": 3600,
  "conditions": {
    "all": [
      {"field": "priority", "operator": "is", "value": "urgent"}
    ]
  }
}
```


### SLA 5: Tempo de Solução Alta

SLA para resolução completa de tickets com prioridade alta, tempo alvo de 4 horas.

```json
{
  "title": "SLA Alta - Solucao",
  "metric": "full_resolution_time",
  "target": 14400,
  "conditions": {
    "all": [
      {"field": "priority", "operator": "is", "value": "high"}
    ]
  }
}
```


## CAMPOS PERSONALIZADOS

Os campos personalizados são campos extras que a gente pode adicionar aos tickets para capturar informações específicas.


### Campo 1: Tipo de Erro (Dropdown)

Campo para classificar o tipo de erro reportado no ticket.

```json
{
  "title": "Tipo de Erro",
  "type": "dropdown",
  "key": "tipo_erro",
  "custom_field_options": [
    {"name": "Acesso (403/401)"},
    {"name": "Performance"},
    {"name": "Integracao"},
    {"name": "Dados Corrompidos"},
    {"name": "Outro"}
  ],
  "required": true
}
```


### Campo 2: Urgência (Dropdown)

Campo para definir o nível de urgência do ticket.

```json
{
  "title": "Urgencia",
  "type": "dropdown",
  "key": "urgencia",
  "custom_field_options": [
    {"name": "Urgentissimo"},
    {"name": "Alta"},
    {"name": "Normal"},
    {"name": "Baixa"}
  ],
  "default": "Alta"
}
```


### Campo 3: ID Externo do Cliente

Campo para armazenar o ID externo do cliente no sistema legado.

```json
{
  "title": "ID Externo do Cliente",
  "type": "text",
  "key": "id_externo_cliente",
  "required": true
}
```


### Campo 4: Especialista Consultado (Dropdown)

Campo para registrar qual especialista foi consultado para um ticket.

```json
{
  "title": "Especialista Consultado",
  "type": "dropdown",
  "key": "especialista_consultado",
  "custom_field_options": [
    {"name": "Especialista em Beneficios"},
    {"name": "Especialista em Seguranca"},
    {"name": "Especialista em Integracao"},
    {"name": "Especialista em Relatorios"}
  ]
}
```


### Campo 5: Contém Dados Sensíveis (Checkbox)

Campo para marcar tickets que contêm dados sensíveis.

```json
{
  "title": "Contem Dados Sensiveis",
  "type": "checkbox",
  "key": "dados_sensiveis",
  "default": false
}
```


### Campo 6: CPF Cliente (Restrito)

Campo para armazenar CPF do cliente com validação de formato.

```json
{
  "title": "CPF do Cliente",
  "type": "text",
  "key": "cpf_cliente",
  "regexp_for_validation": "^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}$",
  "restricted": true
}
```


## FORMULÁRIOS

Os formulários são o que o cliente vê quando vai abrir um ticket. Aqui estão os que eu criaria.


### Formulário 1: Suporte Técnico

Formulário para tickets de suporte técnico (erros, falhas, acessos).

```json
{
  "title": "Suporte Tecnico",
  "position": 1,
  "active": true,
  "end_user_visible": true,
  "ticket_field_ids": [
    123456,  // ID do campo Subject
    789012,  // ID do campo Descricao
    345678,  // ID do campo Tipo de Erro
    901234,  // ID do campo Urgencia
    567890,  // ID do campo ID Externo
    112233   // ID do campo Anexos
  ],
  "default_group_id": 111111,  // ID do grupo N1 Tecnico
  "default_tags": ["tecnico"]
}
```

O que este JSON faz:
- Define o formulário de Suporte Técnico
- Especifica quais campos serão exibidos
- Define o grupo padrão (N1 Técnico)
- Adiciona a tag "tecnico" automaticamente

NOTA: Substitua os IDs pelos IDs reais dos campos e grupos na sua instância.


### Formulário 2: Suporte Funcional

Formulário para tickets de suporte funcional (orientações, dúvidas).

```json
{
  "title": "Suporte Funcional",
  "position": 2,
  "active": true,
  "end_user_visible": true,
  "ticket_field_ids": [
    123456,  // ID do campo Subject
    789012,  // ID do campo Descricao
    456789,  // ID do campo Area
    901234,  // ID do campo Urgencia
    567890,  // ID do campo ID Externo
    112233   // ID do campo Anexos
  ],
  "default_group_id": 222222,  // ID do grupo N1 Funcional
  "default_tags": ["funcional"]
}
```


## GRUPOS

Os grupos são as equipes de agentes. Aqui estão os que eu criaria.


### Grupo 1: N1 Técnico

Grupo para agentes de primeiro nível de suporte técnico.

```json
{
  "name": "N1 Tecnico",
  "default": false,
  "user_ids": [
    100001,  // ID do Agente 1
    100002,  // ID do Agente 2
    100003,  // ID do Agente 3
    100004,  // ID do Agente 4
    100005   // ID do Agente 5
  ]
}
```

NOTA: Substitua os IDs pelos IDs reais dos usuários na sua instância.


### Grupo 2: N1 Funcional

Grupo para agentes de primeiro nível de suporte funcional.

```json
{
  "name": "N1 Funcional",
  "default": false,
  "user_ids": [
    100006,  // ID do Agente 6
    100007,  // ID do Agente 7
    100008,  // ID do Agente 8
    100009,  // ID do Agente 9
    100010   // ID do Agente 10
  ]
}
```


### Grupo 3: N2 Técnico

Grupo para agentes de segundo nível de suporte técnico.

```json
{
  "name": "N2 Tecnico",
  "default": false,
  "user_ids": [
    100011,  // ID do Agente 11
    100012,  // ID do Agente 12
    100013   // ID do Agente 13
  ]
}
```


### Grupo 4: N2 Funcional

Grupo para agentes de segundo nível de suporte funcional.

```json
{
  "name": "N2 Funcional",
  "default": false,
  "user_ids": [
    100014,  // ID do Agente 14
    100015,  // ID do Agente 15
    100016   // ID do Agente 16
  ]
}
```


### Grupo 5: Suporte - Dados Sensíveis

Grupo restrito para agentes autorizados a acessar dados sensíveis.

```json
{
  "name": "Suporte - Dados Sensiveis",
  "default": false,
  "user_ids": [
    100017,  // ID do Agente 17
    100018   // ID do Agente 18
  ]
}
```


## FUNÇÕES (ROLES)

As funções definem as permissões dos usuários. Aqui estão as que eu criaria.


### Função 1: Especialista Sob Demanda

Função para especialistas que só acessam tickets onde são colaboradores.

```json
{
  "name": "Especialista Sob Demanda",
  "description": "Acesso apenas a tickets onde e colaborador",
  "configuration": {
    "tickets": {
      "access": "collaborator",
      "edit": true,
      "view": true
    },
    "groups": {
      "access": false
    },
    "organization": {
      "access": false
    }
  }
}
```

O que esta função permite:
- Visualizar e editar tickets onde o usuário é colaborador
- Não pode acessar grupos diretamente
- Não pode acessar organizações


### Função 2: Agente N1

Função padrão para agentes de primeiro nível.

```json
{
  "name": "Agente N1",
  "description": "Acesso a tickets do seu grupo",
  "configuration": {
    "tickets": {
      "access": "group",
      "edit": true,
      "view": true
    },
    "groups": {
      "access": "own"
    }
  }
}
```

O que esta função permite:
- Visualizar e editar tickets do seu grupo
- Acessar apenas os grupos que pertence


### Função 3: Gestor de Suporte

Função para gestores com acesso total.

```json
{
  "name": "Gestor de Suporte",
  "description": "Acesso total a tickets e relatorios",
  "configuration": {
    "tickets": {
      "access": "all",
      "edit": true,
      "view": true
    },
    "groups": {
      "access": "all"
    },
    "reports": {
      "access": true
    }
  }
}
```

O que esta função permite:
- Visualizar e editar todos os tickets
- Acessar todos os grupos
- Acessar relatórios


## VISUALIZAÇÕES

As visualizações são filtros salvos que mostram apenas os tickets que você quer ver.


### Visualização 1: N1 Técnico - Pendentes

Visualização para monitorar tickets pendentes do N1 Técnico.

```json
{
  "title": "N1 Tecnico - Pendentes",
  "conditions": {
    "all": [
      {"field": "group_id", "operator": "is", "value": "ID_GRUPO_N1_TECNICO"},
      {"field": "status", "operator": "is", "value": "open"}
    ]
  },
  "columns": [
    "ticket_id",
    "subject",
    "requester",
    "priority",
    "created_at",
    "sla"
  ],
  "sort_by": "created_at",
  "sort_order": "asc"
}
```

NOTA: Substitua ID_GRUPO_N1_TECNICO pelo ID real do grupo.


### Visualização 2: Escalados para N2

Visualização para monitorar tickets escalados para N2.

```json
{
  "title": "Escalados para N2",
  "conditions": {
    "all": [
      {"field": "group_id", "operator": "is", "value": "ID_GRUPO_N2_TECNICO"},
      {"field": "status", "operator": "is", "value": "open"}
    ]
  },
  "columns": [
    "ticket_id",
    "subject",
    "requester",
    "assignee",
    "created_at"
  ]
}
```

NOTA: Substitua ID_GRUPO_N2_TECNICO pelo ID real do grupo.


### Visualização 3: Aguardando Especialista

Visualização para monitorar tickets aguardando validação de especialista.

```json
{
  "title": "Aguardando Especialista",
  "conditions": {
    "all": [
      {"field": "tags", "operator": "contains", "value": "aguardando_especialista"}
    ]
  },
  "columns": [
    "ticket_id",
    "subject",
    "requester",
    "especialista_consultado",
    "created_at"
  ]
}
```


### Visualização 4: SLA em Risco

Visualização para monitorar tickets com SLA em risco.

```json
{
  "title": "SLA em Risco",
  "conditions": {
    "all": [
      {"field": "sla", "operator": "less_than", "value": "50"}
    ]
  },
  "columns": [
    "ticket_id",
    "subject",
    "requester",
    "sla",
    "priority"
  ],
  "sort_by": "sla",
  "sort_order": "asc"
}
```


### Visualização 5: VIP - Todos os Tickets

Visualização para monitorar todos os tickets de clientes VIP.

```json
{
  "title": "VIP - Todos os Tickets",
  "conditions": {
    "all": [
      {"field": "tags", "operator": "contains", "value": "cliente_vip"}
    ]
  },
  "columns": [
    "ticket_id",
    "subject",
    "requester",
    "status",
    "priority",
    "sla"
  ]
}
```


## INSTRUÇÕES PARA USO


### Como Obter os IDs Necessários

Para substituir os placeholders nos JSONs (como ID_GRUPO_N1_TECNICO), você precisa obter os IDs reais da sua instância. Use os seguintes endpoints da API:


Obter todos os grupos:
```
GET /api/v2/groups.json
```

Obter todos os usuários:
```
GET /api/v2/users.json
```

Obter todos os campos personalizados:
```
GET /api/v2/ticket_fields.json
```

Obter todos os formulários:
```
GET /api/v2/ticket_forms.json
```


### Como Importar via API

Para importar um gatilho via API, use o seguinte comando:

```
POST /api/v2/triggers.json
Headers:
  Content-Type: application/json
  Authorization: Basic BASE64_ENCODED_EMAIL_TOKEN
Body:
  [JSON do gatilho]
```


Para importar um webhook via API:

```
POST /api/v2/webhooks.json
Headers:
  Content-Type: application/json
  Authorization: Basic BASE64_ENCODED_EMAIL_TOKEN
Body:
  [JSON do webhook]
```


Para importar uma política de SLA via API:

```
POST /api/v2/slas/policies.json
Headers:
  Content-Type: application/json
  Authorization: Basic BASE64_ENCODED_EMAIL_TOKEN
Body:
  [JSON da política]
```


Para importar um campo personalizado via API:

```
POST /api/v2/ticket_fields.json
Headers:
  Content-Type: application/json
  Authorization: Basic BASE64_ENCODED_EMAIL_TOKEN
Body:
  [JSON do campo]
```


Para importar um formulário via API:

```
POST /api/v2/ticket_forms.json
Headers:
  Content-Type: application/json
  Authorization: Basic BASE64_ENCODED_EMAIL_TOKEN
Body:
  [JSON do formulário]
```


Para importar um grupo via API:

```
POST /api/v2/groups.json
Headers:
  Content-Type: application/json
  Authorization: Basic BASE64_ENCODED_EMAIL_TOKEN
Body:
  [JSON do grupo]
```


### Como Importar Manual via Interface

Se preferir não usar a API, você pode importar manualmente:

1. Acesse o Zendesk com sua conta de administrador
2. Vá até a seção correspondente (ex: Admin > Objetivos > Gatilhos para gatilhos)
3. Clique em "Adicionar Gatilho" ou equivalente
4. Copie os valores do JSON e cole nos campos da interface
5. Salve a configuração


### Autenticação via API

Para autenticação via API, você tem duas opções:


Basic Auth:
```
Username: seu_email@dominio.com
Password: sua_senha OU seu_token
Header: Authorization: Basic BASE64_ENCODED_USERNAME_PASSWORD
```

Para gerar o Base64, use:
```
base64.encode("seu_email@dominio.com:seu_token")
```


OAuth 2.0:
```
Header: Authorization: Bearer SEU_TOKEN_OAUTH
```


### Rate Limit

O Zendesk API tem limite de 100 requisições por minuto por conta. Para evitar bloqueios, implemente delays entre as requisições quando estiver importando muitos itens de uma vez.


### Documentação Oficial

Para mais informações, consulte a documentação oficial da API do Zendesk:
https://developer.zendesk.com/api-reference/


Data: 14/06/2026
Autor: Lucas Marcondes
Autor: Lucas Marcondes