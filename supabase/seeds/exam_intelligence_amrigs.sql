insert into public.specialties (id, code, name, description) values
  ('50000000-0000-4000-8000-000000000004', 'GINECOLOGIA_OBSTETRICIA', 'Ginecologia e Obstetrícia', 'Grande área sintética para validar o blueprint demonstrativo.'),
  ('50000000-0000-4000-8000-000000000005', 'MEDICINA_PREVENTIVA', 'Medicina Preventiva e Saúde Coletiva', 'Grande área sintética para validar o blueprint demonstrativo.')
on conflict (id) do update set
  code=excluded.code,name=excluded.name,description=excluded.description;

insert into public.exam_intelligence_profiles (
  id,exam_program_id,display_name,version,valid_from,valid_until,
  editorial_status,is_active,analysis_period_start,analysis_period_end,
  exams_analyzed,questions_analyzed,coverage,confidence,limitations,
  source_title,source_url,source_origin,responsible_editorial,
  responsible_statistical,notes,
  method_version,is_synthetic,last_updated_at
) values
  (
    '65000000-0000-4000-8000-000000000001',
    '63000000-0000-4000-8000-000000000001',
    'Perfil demonstrativo AMRIGS',
    1,'2026-01-01',null,'draft',true,null,null,0,0,0,'insufficient',
    array[
      'Perfil composto exclusivamente por dados sintéticos.',
      'Nenhuma prova licenciada foi analisada.',
      'Não deve orientar decisões reais de estudo.'
    ],
    'Fixture sintética do Exam Intelligence MVP',null,'synthetic_fixture',
    'Equipe editorial de desenvolvimento',null,
    'Estrutura de validação; não representa frequência ou formato oficial.',
    'exam-intelligence-mvp-v1',true,'2026-07-24T12:00:00Z'
  ),
  (
    '65000000-0000-4000-8000-000000000002',
    '63000000-0000-4000-8000-000000000001',
    'Perfil demonstrativo AMRIGS inativo',
    2,'2025-01-01','2025-12-31','draft',false,null,null,0,0,0,'insufficient',
    array['Versão sintética inativa usada apenas em testes de versionamento.'],
    'Fixture sintética do Exam Intelligence MVP',null,'synthetic_fixture',
    'Equipe editorial de desenvolvimento',null,
    'Não selecionar como versão ativa.',
    'exam-intelligence-mvp-v1',true,'2026-07-24T12:00:00Z'
  )
on conflict (id) do update set
  display_name=excluded.display_name,valid_from=excluded.valid_from,
  valid_until=excluded.valid_until,editorial_status=excluded.editorial_status,
  is_active=excluded.is_active,limitations=excluded.limitations,
  notes=excluded.notes,last_updated_at=excluded.last_updated_at;

insert into public.exam_blueprints (
  id,profile_id,version,is_active,expected_question_count,duration_minutes,
  format_description,correction_rules,notes,source_title,source_url,
  period_start,period_end,confidence,editorial_status,is_synthetic
) values (
  '66000000-0000-4000-8000-000000000001',
  '65000000-0000-4000-8000-000000000001',
  1,true,100,240,
  'Distribuição demonstrativa em cinco grandes áreas.',
  'Exemplo sintético sem regra oficial de correção.',
  'Números escolhidos apenas para validar contratos e não representam a AMRIGS.',
  'Fixture sintética do Exam Intelligence MVP',null,null,null,
  'insufficient','draft',true
)
on conflict (id) do update set
  format_description=excluded.format_description,
  correction_rules=excluded.correction_rules,notes=excluded.notes,
  confidence=excluded.confidence,editorial_status=excluded.editorial_status,
  is_synthetic=excluded.is_synthetic;

insert into public.exam_blueprint_areas (
  blueprint_id,specialty_id,expected_proportion,expected_question_count,
  weight,notes,position
) values
  ('66000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000001',0.2,20,1,'Valor exclusivamente sintético.',1),
  ('66000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000002',0.2,20,1,'Valor exclusivamente sintético.',2),
  ('66000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000003',0.2,20,1,'Valor exclusivamente sintético.',3),
  ('66000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000004',0.2,20,1,'Valor exclusivamente sintético.',4),
  ('66000000-0000-4000-8000-000000000001','50000000-0000-4000-8000-000000000005',0.2,20,1,'Valor exclusivamente sintético.',5)
on conflict (blueprint_id,specialty_id) do update set
  expected_proportion=excluded.expected_proportion,
  expected_question_count=excluded.expected_question_count,
  weight=excluded.weight,notes=excluded.notes,position=excluded.position;

insert into public.exam_recurrence_statistics (
  id,profile_id,version,dimension_type,area_id,theme_id,subtheme_id,
  competency_id,period_start,period_end,sample_size,sample_unit,occurrences,
  denominator,coverage,relevance,confidence,origin,method_version,missing_data,
  limitations,responsible_statistical,
  editorial_status,is_synthetic,last_updated_at
) values
  (
    '67000000-0000-4000-8000-000000000001',
    '65000000-0000-4000-8000-000000000001',1,'area',
    '51000000-0000-4000-8000-000000000001',null,null,null,null,null,
    10,'questões sintéticas',3,10,0.1,'insufficient','insufficient',
    'synthetic_fixture','exam-intelligence-mvp-v1',
    array['Todas as provas e questões reais estão ausentes.'],
    array['Amostra e ocorrências são sintéticas e não descrevem a AMRIGS.'],
    null,'draft',true,'2026-07-24T12:00:00Z'
  ),
  (
    '67000000-0000-4000-8000-000000000002',
    '65000000-0000-4000-8000-000000000001',1,'theme',null,
    '52000000-0000-4000-8000-000000000001',null,null,null,null,
    0,'questões licenciadas',0,0,0,'insufficient','insufficient',
    'synthetic_fixture','exam-intelligence-mvp-v1',
    array['Nenhuma prova licenciada disponível.'],
    array['Nenhuma prova licenciada disponível para estimar recorrência.'],
    null,'draft',true,'2026-07-24T12:00:00Z'
  ),
  (
    '67000000-0000-4000-8000-000000000003',
    '65000000-0000-4000-8000-000000000001',1,'subtheme',null,null,
    '53000000-0000-4000-8000-000000000001',null,null,null,
    0,'questões licenciadas',0,0,0,'insufficient','insufficient',
    'synthetic_fixture','exam-intelligence-mvp-v1',
    array['Nenhuma prova licenciada disponível.'],
    array['Nenhuma prova licenciada disponível para estimar recorrência.'],
    null,'draft',true,'2026-07-24T12:00:00Z'
  ),
  (
    '67000000-0000-4000-8000-000000000004',
    '65000000-0000-4000-8000-000000000001',1,'competency',null,null,null,
    '54000000-0000-4000-8000-000000000001',null,null,
    0,'questões licenciadas',0,0,0,'insufficient','insufficient',
    'synthetic_fixture','exam-intelligence-mvp-v1',
    array['Nenhuma prova licenciada disponível.'],
    array['Nenhuma prova licenciada disponível para estimar recorrência.'],
    null,'draft',true,'2026-07-24T12:00:00Z'
  )
on conflict (id) do update set
  sample_size=excluded.sample_size,occurrences=excluded.occurrences,
  denominator=excluded.denominator,coverage=excluded.coverage,
  relevance=excluded.relevance,confidence=excluded.confidence,
  limitations=excluded.limitations,last_updated_at=excluded.last_updated_at;
