export const site = {
  title: 'VitaFlex × Zendesk',
  subtitle: 'Desafio Técnico — Analista de Negócios',
  author: 'Lucas Marcondes',
  date: '12/06/2026',
  demo: 'vitaflex-demo.zendesk.com',
};

export const nav = [
  { href: '/', label: 'Início' },
  { href: '/parte-1', label: 'Parte 1', desc: 'Fluxos e Acessos' },
  { href: '/parte-2', label: 'Parte 2', desc: 'Omnichannel + IA' },
  { href: '/parte-3', label: 'Parte 3', desc: 'Base de Conhecimento' },
  { href: '/parte-4', label: 'Parte 4', desc: 'Métricas' },
  { href: '/parte-5', label: 'Parte 5', desc: 'Diagnósticos' },
  { href: '/parte-6', label: 'Parte 6', desc: 'Simulação' },
  { href: '/guia-demo', label: 'Guia Demo', desc: 'Passo a passo' },
];

export const parts = [
  {
    id: 1,
    slug: 'parte-1',
    icon: '⚙️',
    title: 'Estruturação de Fluxos e Acessos',
    summary: 'Formulários, grupos N1/N2, visualizações, SLAs e fluxo com especialista sob demanda.',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    id: 2,
    slug: 'parte-2',
    icon: '💬',
    title: 'Omnichannel e IA',
    summary: 'Chat, WhatsApp, formulário e simulação do erro 403 com priorização automática.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 3,
    slug: 'parte-3',
    icon: '📚',
    title: 'Base de Conhecimento',
    summary: 'Help Center, deflexão, métricas de autoatendimento e artigo prático de erro 403.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    id: 4,
    slug: 'parte-4',
    icon: '📊',
    title: 'Métricas e Governança',
    summary: '5 KPIs estratégicos/operacionais, Explore e proteção de dados sensíveis.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 5,
    slug: 'parte-5',
    icon: '🔍',
    title: 'Diagnóstico de Incidentes',
    summary: '7 casos técnicos com hipótese, evidências, validação e solução.',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 6,
    slug: 'parte-6',
    icon: '🎯',
    title: 'Simulação Ponta a Ponta',
    summary: 'Atendimento completo do ticket #4821 — abertura até CSAT 5/5.',
    color: 'from-emerald-500 to-teal-600',
  },
];

export const demoSteps = [
  {
    step: 1,
    title: 'Criar os Grupos',
    path: 'Admin Center → Pessoas → Grupos',
    items: ['N1 Técnico', 'N1 Funcional', 'N2 Técnico', 'N2 Funcional', 'Dados Sensíveis'],
    tip: 'Adicione seu usuário ao N1 Técnico e N1 Funcional para testar tickets.',
  },
  {
    step: 2,
    title: 'Criar Campos Personalizados',
    path: 'Admin Center → Objetos e regras → Tickets → Campos',
    items: [
      'Tipo de Erro (dropdown): Acesso 403/401, Performance, Integração, Outro',
      'Urgência (dropdown): Urgentíssimo, Alta, Normal, Baixa',
      'Área (dropdown): Benefícios, Relatórios, Cadastro, Permissões',
      'ID Externo do Cliente (texto)',
    ],
    tip: 'Campos são obrigatórios antes de montar os formulários.',
  },
  {
    step: 3,
    title: 'Criar os 2 Formulários',
    path: 'Admin Center → Objetos e regras → Tickets → Formulários',
    items: [
      'Suporte Técnico: Assunto, Descrição, Tipo de Erro, Urgência, ID Externo, Anexos',
      'Suporte Funcional: Assunto, Descrição, Área, Urgência, ID Externo, Anexos',
    ],
    tip: 'Marque ambos como visíveis para usuários finais.',
  },
  {
    step: 4,
    title: 'Configurar Políticas de SLA',
    path: 'Admin Center → Regras de negócios → Acordos de nível de serviço',
    items: [
      'SLA Urgente: Prioridade Urgente → 1ª resposta em 15 min',
      'SLA Alta: Prioridade Alta → 1ª resposta em 1 hora',
      'Calendário 24×7 para VIP / Urgentíssimo',
    ],
    tip: 'Sem SLA ativo, a view "SLA em Risco" não funciona.',
  },
  {
    step: 5,
    title: 'Criar Gatilhos',
    path: 'Admin Center → Regras de negócios → Gatilhos',
    items: [
      'Roteamento Suporte Técnico → Grupo N1 Técnico + tag tecnico',
      'Roteamento Suporte Funcional → Grupo N1 Funcional + tag funcional',
      'Classificar Urgente - Erro 403: assunto contém 403 → prioridade Urgente, tags urgente/erro_403, grupo N1 Técnico',
      'Priorizar Cliente VIP: tag cliente_vip → prioridade Urgente',
    ],
    tip: 'Gatilhos rodam de cima para baixo — ordem importa.',
  },
  {
    step: 6,
    title: 'Criar View SLA em Risco',
    path: 'Admin Center → Ferramentas de agente → Visualizações',
    items: [
      'Condição: Status menor que Resolvido',
      'Condição: Horas até próxima violação de SLA menor que 1',
      'Ordenar por SLA crescente',
    ],
    tip: 'Colunas: ID, Assunto, Prioridade, SLA, Grupo, Status.',
  },
  {
    step: 7,
    title: 'Testar Tudo',
    path: 'Agent → Novo ticket',
    items: [
      'Criar ticket com assunto "Erro 403 ao acessar painel"',
      'Verificar: grupo N1 Técnico, prioridade Urgente, tags aplicadas',
      'Abrir view SLA em Risco após aguardar',
      'Testar Help Center: /hc → Enviar solicitação',
    ],
    tip: 'Resultado esperado: automações funcionando em < 5 segundos.',
  },
];

export const incidents = [
  {
    id: 1,
    title: 'Agente não visualiza tickets do cliente',
    hypothesis: 'Restrição de grupo, organização ou função',
    evidence: 'Perfil do agente, grupo do ticket, permissões de função',
    validation: 'Comparar grupo do ticket × grupos do agente',
    solution: 'Incluir no grupo correto ou transferir ticket',
    response: 'Identifiquei que o ticket está em grupo diferente do seu perfil. Transferi para seu grupo.',
  },
  {
    id: 2,
    title: 'VIP aguardou 3h sem violação de SLA',
    hypothesis: 'SLA não aplicado, calendário comercial ou status Pendente',
    evidence: 'Painel SLA do ticket, eventos, gatilho VIP, tags da organização',
    validation: 'Conferir política de SLA e prioridade aplicada',
    solution: 'Corrigir gatilho VIP, SLA 24×7, mapear organizações',
    response: 'Pedimos desculpas. Corrigimos a priorização automática da conta VIP.',
  },
  {
    id: 3,
    title: 'Integração parou após troca de senha admin',
    hypothesis: 'Integração usa senha em vez de API Token',
    evidence: 'Logs com HTTP 401, data da troca de senha',
    validation: 'Testar API com token novo vs antigo',
    solution: 'Criar API Token dedicado, atualizar integração',
    response: 'Integração restaurada com API Token de serviço.',
  },
  {
    id: 4,
    title: 'Webhook Zendesk → CRM não dispara',
    hypothesis: 'Webhook inativo, trigger desvinculado ou auth falhou',
    evidence: 'Admin → Webhooks → Activity, logs do CRM',
    validation: 'Disparar trigger manualmente, testar endpoint',
    solution: 'Reativar webhook, renovar API Key do CRM',
    response: 'Webhook falhava com 403. Chave renovada, últimos disparos com 200.',
  },
  {
    id: 5,
    title: 'Webhook externo não cria ticket',
    hypothesis: 'Confusão outbound vs inbound API',
    evidence: 'Activity vazia, logs Zapier, teste POST /api/v2/tickets.json',
    validation: 'Testar criação via API direta',
    solution: 'Sistema externo deve chamar API REST, não webhook de saída',
    response: 'Ajustamos Zapier para Create Ticket com mapeamento correto.',
  },
  {
    id: 6,
    title: 'App privado sem ID externo',
    hypothesis: 'Campo id_externo_cliente vazio causa null reference',
    evidence: 'Console do app, tickets afetados vs funcionais',
    validation: 'Filtrar tickets com campo vazio no Explore',
    solution: 'Campo obrigatório + gatilho automático + bulk update',
    response: 'Preenchimento automático ativado. Atualize a página do ticket.',
  },
  {
    id: 7,
    title: 'Rate limit ao atualizar tickets (Bônus)',
    hypothesis: 'Limite API Zendesk (~200-700 req/min)',
    evidence: 'HTTP 429, mensagem de limite, pico de updates',
    validation: 'Identificar origem, contar req/min',
    solution: 'Backoff, Bulk Update API em lotes de 100',
    response: 'Aguarde 60s. Integração ajustada para lotes menores.',
    bonus: true,
  },
];

export const simulationTimeline = [
  { time: '10:00:00', title: 'Abertura', desc: 'Cliente abre formulário Suporte Técnico — Erro 403', tags: ['tecnico', 'erro_403', 'vip'] },
  { time: '10:00:05', title: 'Resposta automática', desc: 'E-mail com ticket #4821 e link do artigo de ajuda', tags: ['auto'] },
  { time: '10:05', title: 'Triagem N1', desc: 'Agente Ana identifica permissão revogada via app privado', tags: ['N1'] },
  { time: '10:15', title: 'Escalonamento N2', desc: 'Transferência + Side Conversation para Infra', tags: ['N2', 'escalado'] },
  { time: '10:22', title: 'Resolução N2', desc: 'Bruno reativa permissão gestor_painel', tags: ['N2'] },
  { time: '10:28', title: 'Validação', desc: 'Ana confirma com cliente + artigo de ajuda', tags: ['artigo'] },
  { time: '10:35', title: 'Encerramento', desc: 'Status Resolvido + pesquisa CSAT disparada', tags: ['CSAT'] },
  { time: '10:40', title: 'Resultado', desc: 'Cliente responde 5/5 — SLA 100%', tags: ['5/5'] },
];

export const metrics = [
  { num: 1, name: 'CSAT', type: 'Estratégica', why: 'Experiência real do cliente B2B' },
  { num: 2, name: '% Adesão ao SLA', type: 'Operacional', why: 'Contrato e confiança enterprise' },
  { num: 3, name: 'Tempo médio de 1ª resposta', type: 'Operacional', why: 'Ataca demora no primeiro contato' },
  { num: 4, name: 'Taxa de deflexão', type: 'Estratégica', why: 'ROI da base de conhecimento e IA' },
  { num: 5, name: 'Volume por categoria', type: 'Estratégica', why: 'Direciona treinamento e automações' },
];
