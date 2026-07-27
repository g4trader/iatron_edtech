# Domínio de especialidades médicas

`public.specialties` é a entidade canônica `MedicalSpecialty`. A evolução de
ownership não cria uma segunda taxonomia: programas, áreas, questões,
guidelines, blueprints e conteúdos continuam referenciando os mesmos
identificadores.

## Responsabilidade científica

`medical_specialty_owners` relaciona uma especialidade a um ou mais mentores.
Cada vínculo registra papel (`primary` ou `co_owner`), estado, vigência e a
referência da autorização. Somente um `mentor_profile` com autorização ativa
pode assumir ownership ativo. Uma especialidade pode ter um owner principal e
vários co-owners.

A migração reaproveita vínculos previamente autorizados em `mentor_profiles`.
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
que possuem; editores administram vínculos conforme as permissões editoriais.
O frontend envia somente intenção e identificadores. Identidade, papel e
ownership são resolvidos pela API e pelo banco a partir do JWT.

## API e experiência

- `GET /v1/review/specialties`
- `GET /v1/review/specialties/:specialtyId`
- `/review/specialties`
- `/review/specialties/:specialtyId`

O dashboard apresenta owners, áreas, conteúdos, questões, competências,
referências, vídeos, blueprints, pendências e histórico recente. Indicadores
sem método estatístico aprovado não são estimados e aparecem como limitação.
