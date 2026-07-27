# Domínio de especialidades médicas

`public.specialties` é a entidade canônica `MedicalSpecialty`. A evolução de
ownership não cria uma segunda taxonomia: programas, áreas, questões,
guidelines, blueprints e conteúdos continuam referenciando os mesmos
identificadores.

## Responsabilidade científica

`medical_specialty_owners` relaciona uma especialidade a um ou mais mentores.
Cada termo de responsabilidade possui identidade própria, papel (`primary` ou
`co_owner`), estado, escopo, vigência, motivo e referência da autorização.
Somente um `mentor_profile` com autorização ativa pode assumir ownership ativo.
Uma especialidade pode ter um owner principal e vários co-owners.

`medical_specialty_ownership_history` preserva snapshots e transições em modo
append-only. Uma troca encerra explicitamente o termo anterior e cria outro;
nunca sobrescreve a responsabilidade passada. Vínculos legados cuja única
evidência era o perfil do mentor ficam `pending_assignment`, sem inventar uma
autorização granular.

Mentores pendentes, suspensos ou revogados não recebem ownership automático.
O registro de ownership não implica autoria, revisão ou homologação de cada
material; essas evidências continuam separadas conforme a governança editorial.

## Conhecimento relacionado

- conteúdos: `learning_contents.specialty_id`, obrigatório para novos e
  existentes;
- questões: `question_version_specialties`, obrigatório para versões
  publicadas;
- competências: `competency_specialties`;
- referências editoriais: `content_reference_specialties`;
- vídeos: pertencem à versão de um conteúdo e herdam sua especialidade;
- blueprints: `exam_blueprint_areas.specialty_id`;
- guidelines: `guideline_specialties`;
- histórico científico: versões, revisões e auditoria editorial existentes.

Uma publicação de conteúdo exige especialidade, owner ativo e referências
vinculadas à mesma especialidade. O banco valida essas invariantes no commit da
transação.

## Segurança

RLS permanece ativa. Mentores consultam o dashboard apenas das especialidades
que possuem; editores consultam o contexto para encaminhamento, mas somente
Admin atribui, substitui ou altera a disponibilidade de owners.
O frontend envia somente intenção e identificadores. Identidade, papel e
ownership são resolvidos pela API e pelo banco a partir do JWT.

## API e experiência

- `GET /v1/review/specialties`
- `GET /v1/review/specialties/:specialtyId`
- `GET /v1/editorial/specialties`
- `GET /v1/admin/specialties`
- `GET /v1/admin/specialties/:specialtyId/ownership-history`
- `/review/specialties`
- `/review/specialties/:specialtyId`
- `/editorial/specialties`
- `/admin/specialties`
- `/admin/specialties/:specialtyId`

O dashboard apresenta owners, áreas, conteúdos, questões, competências,
referências, vídeos, blueprints, pendências e histórico recente. A cobertura
por competência é determinística: exige conteúdo publicado, questão elegível e
referência verificada. Ela não é apresentada como nota de qualidade.

## Operação e rollback

A migration `202607270001_medical_knowledge_ownership.sql` é aditiva para os
dados de domínio. Em caso de rollback da aplicação, mantenha as novas colunas e
o histórico; versões anteriores ignoram esses campos. Antes de qualquer
rollback do schema, exporte `medical_specialty_owners` e
`medical_specialty_ownership_history`. Remover o histórico ou reativar vínculos
`legacy:%` é proibido. O retorno operacional seguro é implantar a versão
anterior da API/frontend, preservando a migration até uma migration corretiva
versionada.
