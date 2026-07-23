-- Completa o conjunto mínimo homologado necessário para um diagnóstico de 10 questões.
-- O conteúdo permanece vinculado às guidelines versionadas já publicadas no catálogo.

insert into public.guideline_competencies (guideline_id, competency_id) values
  ('57000000-0000-4000-8000-000000000002', '54000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into public.questions (id, source_key, canonical_hash, current_version, status) values
  ('58000000-0000-4000-8000-000000000003', 'seed-iam-002', repeat('c', 64), 1, 'published'),
  ('58000000-0000-4000-8000-000000000004', 'seed-iam-003', repeat('d', 64), 1, 'published'),
  ('58000000-0000-4000-8000-000000000005', 'seed-iam-004', repeat('e', 64), 1, 'published'),
  ('58000000-0000-4000-8000-000000000006', 'seed-iam-005', repeat('f', 64), 1, 'published'),
  ('58000000-0000-4000-8000-000000000007', 'seed-sepse-002', repeat('1', 64), 1, 'published'),
  ('58000000-0000-4000-8000-000000000008', 'seed-sepse-003', repeat('2', 64), 1, 'published'),
  ('58000000-0000-4000-8000-000000000009', 'seed-sepse-004', repeat('3', 64), 1, 'published'),
  ('58000000-0000-4000-8000-000000000010', 'seed-sepse-005', repeat('4', 64), 1, 'published')
on conflict (id) do update set
  source_key = excluded.source_key,
  canonical_hash = excluded.canonical_hash,
  current_version = excluded.current_version,
  status = excluded.status;

insert into public.question_versions (
  id, question_id, version, stem, commentary, difficulty, cognitive_level, status, change_note
) values
  (
    '59000000-0000-4000-8000-000000000003',
    '58000000-0000-4000-8000-000000000003',
    1,
    'Paciente com dor torácica há 90 minutos apresenta supradesnivelamento persistente de ST em DII, DIII e aVF. Qual achado sustenta o diagnóstico de infarto com supra de ST?',
    'O supradesnivelamento persistente de ST em derivações contíguas, no contexto clínico compatível, sustenta o diagnóstico e exige avaliação imediata para reperfusão.',
    2,
    'understanding',
    'published',
    'Conteúdo mínimo homologado para o diagnóstico determinístico.'
  ),
  (
    '59000000-0000-4000-8000-000000000004',
    '58000000-0000-4000-8000-000000000004',
    1,
    'Paciente com dor torácica apresenta supradesnivelamento de ST restrito a DII, DIII e aVF. Qual território miocárdico está mais provavelmente envolvido?',
    'DII, DIII e aVF representam a parede inferior.',
    2,
    'application',
    'published',
    'Conteúdo mínimo homologado para o diagnóstico determinístico.'
  ),
  (
    '59000000-0000-4000-8000-000000000005',
    '58000000-0000-4000-8000-000000000005',
    1,
    'Um paciente com infarto com supra de ST chega a um hospital com capacidade de angioplastia primária em tempo adequado. Qual estratégia de reperfusão deve ser priorizada?',
    'Quando pode ser realizada em tempo adequado por equipe habilitada, a intervenção coronária percutânea primária é a estratégia preferencial.',
    3,
    'application',
    'published',
    'Conteúdo mínimo homologado para o diagnóstico determinístico.'
  ),
  (
    '59000000-0000-4000-8000-000000000006',
    '58000000-0000-4000-8000-000000000006',
    1,
    'Paciente com infarto com supra de ST, início dos sintomas há duas horas, não terá acesso à angioplastia em tempo adequado e não possui contraindicação à fibrinólise. Qual conduta de reperfusão é apropriada?',
    'Na impossibilidade de angioplastia primária em tempo adequado e sem contraindicações, a fibrinólise deve ser considerada prontamente.',
    4,
    'application',
    'published',
    'Conteúdo mínimo homologado para o diagnóstico determinístico.'
  ),
  (
    '59000000-0000-4000-8000-000000000007',
    '58000000-0000-4000-8000-000000000007',
    1,
    'Em um adulto com alta probabilidade de sepse e choque, quando a terapia antimicrobiana empírica deve ser iniciada?',
    'Na provável sepse com choque, antimicrobianos devem ser administrados imediatamente, idealmente na primeira hora após o reconhecimento.',
    3,
    'application',
    'published',
    'Conteúdo mínimo homologado para o diagnóstico determinístico.'
  ),
  (
    '59000000-0000-4000-8000-000000000008',
    '58000000-0000-4000-8000-000000000008',
    1,
    'Após culturas identificarem um agente sensível e o paciente com sepse apresentar melhora clínica, qual princípio deve orientar a antibioticoterapia?',
    'A terapia deve ser reavaliada diariamente e descalonada conforme o agente, a sensibilidade, o foco e a evolução clínica.',
    3,
    'application',
    'published',
    'Conteúdo mínimo homologado para o diagnóstico determinístico.'
  ),
  (
    '59000000-0000-4000-8000-000000000009',
    '58000000-0000-4000-8000-000000000009',
    1,
    'Paciente com infecção apresenta hipotensão persistente, alteração do estado mental e enchimento capilar prolongado. Qual interpretação é prioritária?',
    'Hipotensão associada a sinais de hipoperfusão no contexto infeccioso exige reconhecimento imediato de choque séptico.',
    2,
    'understanding',
    'published',
    'Conteúdo mínimo homologado para o diagnóstico determinístico.'
  ),
  (
    '59000000-0000-4000-8000-000000000010',
    '58000000-0000-4000-8000-000000000010',
    1,
    'Após reposição inicial com cristaloide, um paciente em choque séptico permanece hipotenso e necessita de vasopressor. Qual é o agente de primeira linha?',
    'A norepinefrina é o vasopressor de primeira linha no choque séptico.',
    4,
    'application',
    'published',
    'Conteúdo mínimo homologado para o diagnóstico determinístico.'
  )
on conflict (id) do update set
  stem = excluded.stem,
  commentary = excluded.commentary,
  difficulty = excluded.difficulty,
  cognitive_level = excluded.cognitive_level,
  status = excluded.status,
  change_note = excluded.change_note;

insert into public.question_options (
  id, question_version_id, label, content, is_correct, position
) values
  ('5b000000-0000-4000-8000-000000000001', '59000000-0000-4000-8000-000000000003', 'A', 'Supradesnivelamento persistente em derivações contíguas', true, 1),
  ('5b000000-0000-4000-8000-000000000002', '59000000-0000-4000-8000-000000000003', 'B', 'Onda T isoladamente achatada em uma derivação', false, 2),
  ('5b000000-0000-4000-8000-000000000003', '59000000-0000-4000-8000-000000000003', 'C', 'Intervalo PR discretamente prolongado', false, 3),
  ('5b000000-0000-4000-8000-000000000004', '59000000-0000-4000-8000-000000000003', 'D', 'Extrassístole ventricular isolada', false, 4),
  ('5b000000-0000-4000-8000-000000000005', '59000000-0000-4000-8000-000000000004', 'A', 'Parede inferior', true, 1),
  ('5b000000-0000-4000-8000-000000000006', '59000000-0000-4000-8000-000000000004', 'B', 'Parede anterior', false, 2),
  ('5b000000-0000-4000-8000-000000000007', '59000000-0000-4000-8000-000000000004', 'C', 'Parede lateral alta', false, 3),
  ('5b000000-0000-4000-8000-000000000008', '59000000-0000-4000-8000-000000000004', 'D', 'Septo interventricular', false, 4),
  ('5b000000-0000-4000-8000-000000000009', '59000000-0000-4000-8000-000000000005', 'A', 'Intervenção coronária percutânea primária', true, 1),
  ('5b000000-0000-4000-8000-000000000010', '59000000-0000-4000-8000-000000000005', 'B', 'Alta para investigação ambulatorial', false, 2),
  ('5b000000-0000-4000-8000-000000000011', '59000000-0000-4000-8000-000000000005', 'C', 'Aguardar normalização espontânea do segmento ST', false, 3),
  ('5b000000-0000-4000-8000-000000000012', '59000000-0000-4000-8000-000000000005', 'D', 'Somente analgesia e observação', false, 4),
  ('5b000000-0000-4000-8000-000000000013', '59000000-0000-4000-8000-000000000006', 'A', 'Fibrinólise sem atraso desnecessário', true, 1),
  ('5b000000-0000-4000-8000-000000000014', '59000000-0000-4000-8000-000000000006', 'B', 'Aguardar 24 horas por angioplastia eletiva', false, 2),
  ('5b000000-0000-4000-8000-000000000015', '59000000-0000-4000-8000-000000000006', 'C', 'Alta com retorno se a dor persistir', false, 3),
  ('5b000000-0000-4000-8000-000000000016', '59000000-0000-4000-8000-000000000006', 'D', 'Adiar reperfusão até o resultado de teste ergométrico', false, 4),
  ('5b000000-0000-4000-8000-000000000017', '59000000-0000-4000-8000-000000000007', 'A', 'Imediatamente, idealmente na primeira hora', true, 1),
  ('5b000000-0000-4000-8000-000000000018', '59000000-0000-4000-8000-000000000007', 'B', 'Somente após o resultado final das culturas', false, 2),
  ('5b000000-0000-4000-8000-000000000019', '59000000-0000-4000-8000-000000000007', 'C', 'Após 24 horas de observação', false, 3),
  ('5b000000-0000-4000-8000-000000000020', '59000000-0000-4000-8000-000000000007', 'D', 'Apenas se houver febre persistente', false, 4),
  ('5b000000-0000-4000-8000-000000000021', '59000000-0000-4000-8000-000000000008', 'A', 'Descalonar conforme cultura e resposta clínica', true, 1),
  ('5b000000-0000-4000-8000-000000000022', '59000000-0000-4000-8000-000000000008', 'B', 'Manter indefinidamente o esquema mais amplo', false, 2),
  ('5b000000-0000-4000-8000-000000000023', '59000000-0000-4000-8000-000000000008', 'C', 'Associar outro antimicrobiano sem reavaliação', false, 3),
  ('5b000000-0000-4000-8000-000000000024', '59000000-0000-4000-8000-000000000008', 'D', 'Interromper toda terapia independentemente do foco', false, 4),
  ('5b000000-0000-4000-8000-000000000025', '59000000-0000-4000-8000-000000000009', 'A', 'Choque séptico com hipoperfusão', true, 1),
  ('5b000000-0000-4000-8000-000000000026', '59000000-0000-4000-8000-000000000009', 'B', 'Hipertensão assintomática', false, 2),
  ('5b000000-0000-4000-8000-000000000027', '59000000-0000-4000-8000-000000000009', 'C', 'Resposta fisiológica sem gravidade', false, 3),
  ('5b000000-0000-4000-8000-000000000028', '59000000-0000-4000-8000-000000000009', 'D', 'Quadro exclusivamente alérgico', false, 4),
  ('5b000000-0000-4000-8000-000000000029', '59000000-0000-4000-8000-000000000010', 'A', 'Norepinefrina', true, 1),
  ('5b000000-0000-4000-8000-000000000030', '59000000-0000-4000-8000-000000000010', 'B', 'Dopamina em todos os pacientes', false, 2),
  ('5b000000-0000-4000-8000-000000000031', '59000000-0000-4000-8000-000000000010', 'C', 'Nitroprussiato', false, 3),
  ('5b000000-0000-4000-8000-000000000032', '59000000-0000-4000-8000-000000000010', 'D', 'Furosemida como vasopressor', false, 4)
on conflict (id) do update set
  content = excluded.content,
  is_correct = excluded.is_correct,
  position = excluded.position;

insert into public.question_version_competencies (
  question_version_id, competency_id, relevance
) values
  ('59000000-0000-4000-8000-000000000002', '54000000-0000-4000-8000-000000000005', 0.5),
  ('59000000-0000-4000-8000-000000000003', '54000000-0000-4000-8000-000000000001', 1),
  ('59000000-0000-4000-8000-000000000004', '54000000-0000-4000-8000-000000000001', 1),
  ('59000000-0000-4000-8000-000000000005', '54000000-0000-4000-8000-000000000002', 1),
  ('59000000-0000-4000-8000-000000000006', '54000000-0000-4000-8000-000000000002', 1),
  ('59000000-0000-4000-8000-000000000007', '54000000-0000-4000-8000-000000000003', 1),
  ('59000000-0000-4000-8000-000000000008', '54000000-0000-4000-8000-000000000003', 1),
  ('59000000-0000-4000-8000-000000000009', '54000000-0000-4000-8000-000000000004', 1),
  ('59000000-0000-4000-8000-000000000010', '54000000-0000-4000-8000-000000000005', 1)
on conflict do nothing;

insert into public.question_version_themes (question_version_id, theme_id) values
  ('59000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000003'),
  ('59000000-0000-4000-8000-000000000003', '52000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000004', '52000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000005', '52000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000006', '52000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000007', '52000000-0000-4000-8000-000000000002'),
  ('59000000-0000-4000-8000-000000000008', '52000000-0000-4000-8000-000000000002'),
  ('59000000-0000-4000-8000-000000000009', '52000000-0000-4000-8000-000000000003'),
  ('59000000-0000-4000-8000-000000000010', '52000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into public.question_version_subthemes (
  question_version_id, subtheme_id
) values
  ('59000000-0000-4000-8000-000000000001', '53000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000002', '53000000-0000-4000-8000-000000000003'),
  ('59000000-0000-4000-8000-000000000003', '53000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000004', '53000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000005', '53000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000006', '53000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000007', '53000000-0000-4000-8000-000000000002'),
  ('59000000-0000-4000-8000-000000000008', '53000000-0000-4000-8000-000000000002'),
  ('59000000-0000-4000-8000-000000000009', '53000000-0000-4000-8000-000000000003'),
  ('59000000-0000-4000-8000-000000000010', '53000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into public.question_version_specialties (
  question_version_id, specialty_id
)
select question_version_id, '50000000-0000-4000-8000-000000000001'::uuid
from (
  values
    ('59000000-0000-4000-8000-000000000001'::uuid),
    ('59000000-0000-4000-8000-000000000002'::uuid),
    ('59000000-0000-4000-8000-000000000003'::uuid),
    ('59000000-0000-4000-8000-000000000004'::uuid),
    ('59000000-0000-4000-8000-000000000005'::uuid),
    ('59000000-0000-4000-8000-000000000006'::uuid),
    ('59000000-0000-4000-8000-000000000007'::uuid),
    ('59000000-0000-4000-8000-000000000008'::uuid),
    ('59000000-0000-4000-8000-000000000009'::uuid),
    ('59000000-0000-4000-8000-000000000010'::uuid)
) as versions(question_version_id)
on conflict do nothing;

insert into public.question_version_guidelines (
  question_version_id, guideline_id
) values
  ('59000000-0000-4000-8000-000000000003', '57000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000004', '57000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000005', '57000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000006', '57000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000007', '57000000-0000-4000-8000-000000000002'),
  ('59000000-0000-4000-8000-000000000008', '57000000-0000-4000-8000-000000000002'),
  ('59000000-0000-4000-8000-000000000009', '57000000-0000-4000-8000-000000000002'),
  ('59000000-0000-4000-8000-000000000010', '57000000-0000-4000-8000-000000000002')
on conflict do nothing;
