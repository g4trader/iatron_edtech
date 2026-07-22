insert into public.institutions (id, name, acronym, state_code) values
  ('10000000-0000-4000-8000-000000000001', 'Instituto Médico Aurora', 'IMA', 'SP'),
  ('10000000-0000-4000-8000-000000000002', 'Universidade Clínica do Cerrado', 'UCC', 'GO'),
  ('10000000-0000-4000-8000-000000000003', 'Centro Acadêmico Costa Azul', 'CACA', 'BA')
on conflict (id) do update set name = excluded.name, acronym = excluded.acronym, state_code = excluded.state_code;
insert into public.exam_boards (id, name) values
  ('20000000-0000-4000-8000-000000000001', 'Banca Horizonte'),
  ('20000000-0000-4000-8000-000000000002', 'Comissão Vértice')
on conflict (id) do update set name = excluded.name;
insert into public.exam_programs (id, institution_id, exam_board_id, name) values
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Residência Médica IMA'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'Residência Médica UCC'),
  ('30000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', 'Residência Médica CACA'),
  ('30000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', null, 'Programa Complementar IMA')
on conflict (id) do update set institution_id = excluded.institution_id, exam_board_id = excluded.exam_board_id, name = excluded.name;
insert into public.exam_editions (id, exam_program_id, year, application_date, registration_deadline, is_active) values
  ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 2027, '2027-11-14', '2027-09-30', true),
  ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002', 2027, '2027-11-21', '2027-10-05', true),
  ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000003', 2027, '2027-12-05', '2027-10-15', true),
  ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000004', 2026, '2026-11-01', '2026-09-01', false)
on conflict (id) do update set exam_program_id = excluded.exam_program_id, year = excluded.year, application_date = excluded.application_date, registration_deadline = excluded.registration_deadline, is_active = excluded.is_active;

insert into public.exam_boards (id, name, acronym) values
  ('20000000-0000-4000-8000-000000000003', 'Sistema Único de Saúde de São Paulo', 'SUS-SP'),
  ('20000000-0000-4000-8000-000000000004', 'Processo Seletivo Unificado de Minas Gerais', 'PSU-MG'),
  ('20000000-0000-4000-8000-000000000005', 'Secretaria Estadual de Saúde de Pernambuco', 'SES-PE')
on conflict (id) do update set name = excluded.name, acronym = excluded.acronym;

insert into public.specialties (id, code, name, description) values
  ('50000000-0000-4000-8000-000000000001', 'CLINICA_MEDICA', 'Clínica Médica', 'Cuidado integral do adulto e raciocínio clínico.'),
  ('50000000-0000-4000-8000-000000000002', 'PEDIATRIA', 'Pediatria', 'Cuidado da criança e do adolescente.'),
  ('50000000-0000-4000-8000-000000000003', 'CIRURGIA_GERAL', 'Cirurgia Geral', 'Fundamentos de avaliação e tratamento cirúrgico.')
on conflict (id) do update set code = excluded.code, name = excluded.name, description = excluded.description;

insert into public.medical_areas (id, code, name, description) values
  ('51000000-0000-4000-8000-000000000001', 'CARDIOLOGIA', 'Cardiologia', 'Doenças do coração e sistema circulatório.'),
  ('51000000-0000-4000-8000-000000000002', 'INFECTOLOGIA', 'Infectologia', 'Prevenção, diagnóstico e manejo de doenças infecciosas.'),
  ('51000000-0000-4000-8000-000000000003', 'URGENCIA_EMERGENCIA', 'Urgência e Emergência', 'Reconhecimento e estabilização de condições agudas.')
on conflict (id) do update set code = excluded.code, name = excluded.name, description = excluded.description;

insert into public.program_specialties (exam_program_id, specialty_id) values
  ('30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001'),
  ('30000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000002'),
  ('30000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001'),
  ('30000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into public.specialty_areas (specialty_id, area_id) values
  ('50000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001'),
  ('50000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000003'),
  ('50000000-0000-4000-8000-000000000002', '51000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000002', '51000000-0000-4000-8000-000000000003'),
  ('50000000-0000-4000-8000-000000000003', '51000000-0000-4000-8000-000000000003')
on conflict do nothing;

insert into public.themes (id, area_id, code, name, description) values
  ('52000000-0000-4000-8000-000000000001', '51000000-0000-4000-8000-000000000001', 'SINDROMES_CORONARIANAS', 'Síndromes coronarianas', 'Avaliação e manejo da doença coronariana aguda.'),
  ('52000000-0000-4000-8000-000000000002', '51000000-0000-4000-8000-000000000002', 'ANTIMICROBIANOS', 'Uso de antimicrobianos', 'Seleção e uso seguro de terapias antimicrobianas.'),
  ('52000000-0000-4000-8000-000000000003', '51000000-0000-4000-8000-000000000003', 'CHOQUE', 'Choque', 'Identificação, classificação e estabilização do choque.')
on conflict (id) do update set area_id = excluded.area_id, code = excluded.code, name = excluded.name, description = excluded.description;

insert into public.subthemes (id, theme_id, code, name, description) values
  ('53000000-0000-4000-8000-000000000001', '52000000-0000-4000-8000-000000000001', 'IAM_COM_SUPRA', 'Infarto com supra de ST', 'Diagnóstico e reperfusão no infarto com supra de ST.'),
  ('53000000-0000-4000-8000-000000000002', '52000000-0000-4000-8000-000000000002', 'ANTIBIOTICOTERAPIA_EMPIRICA', 'Antibioticoterapia empírica', 'Escolha inicial orientada por foco e gravidade.'),
  ('53000000-0000-4000-8000-000000000003', '52000000-0000-4000-8000-000000000003', 'CHOQUE_SEPTICO', 'Choque séptico', 'Reconhecimento e manejo inicial da sepse com choque.')
on conflict (id) do update set theme_id = excluded.theme_id, code = excluded.code, name = excluded.name, description = excluded.description;

insert into public.competencies (id, subtheme_id, code, name, description) values
  ('54000000-0000-4000-8000-000000000001', '53000000-0000-4000-8000-000000000001', 'CARD.SCA.001', 'Reconhecer infarto com supra de ST', 'Identificar critérios clínicos e eletrocardiográficos de infarto com supra de ST.'),
  ('54000000-0000-4000-8000-000000000002', '53000000-0000-4000-8000-000000000001', 'CARD.SCA.002', 'Indicar estratégia de reperfusão', 'Selecionar reperfusão conforme tempo, disponibilidade e contraindicações.'),
  ('54000000-0000-4000-8000-000000000003', '53000000-0000-4000-8000-000000000002', 'INF.ATM.001', 'Selecionar terapia antimicrobiana empírica', 'Escolher esquema inicial considerando foco, gravidade e epidemiologia.'),
  ('54000000-0000-4000-8000-000000000004', '53000000-0000-4000-8000-000000000003', 'EMERG.CHOQUE.001', 'Reconhecer choque séptico', 'Reconhecer hipoperfusão e critérios clínicos de choque séptico.'),
  ('54000000-0000-4000-8000-000000000005', '53000000-0000-4000-8000-000000000003', 'EMERG.CHOQUE.002', 'Iniciar ressuscitação do choque séptico', 'Priorizar fluidos, vasopressor e monitorização inicial.')
on conflict (id) do update set subtheme_id = excluded.subtheme_id, code = excluded.code, name = excluded.name, description = excluded.description;

insert into public.competency_objectives (id, competency_id, description, position) values
  ('55000000-0000-4000-8000-000000000001', '54000000-0000-4000-8000-000000000001', 'Interpretar supradesnivelamento de ST em derivações contíguas.', 1),
  ('55000000-0000-4000-8000-000000000002', '54000000-0000-4000-8000-000000000002', 'Comparar intervenção coronária percutânea e fibrinólise.', 1),
  ('55000000-0000-4000-8000-000000000003', '54000000-0000-4000-8000-000000000004', 'Identificar sinais de hipoperfusão persistente.', 1)
on conflict (id) do update set competency_id = excluded.competency_id, description = excluded.description, position = excluded.position;

insert into public.guideline_issuers (id, name, acronym, url) values
  ('56000000-0000-4000-8000-000000000001', 'Sociedade Brasileira de Cardiologia', 'SBC', 'https://www.portal.cardiol.br'),
  ('56000000-0000-4000-8000-000000000002', 'Surviving Sepsis Campaign', 'SSC', 'https://www.sccm.org')
on conflict (id) do update set name = excluded.name, acronym = excluded.acronym, url = excluded.url;

insert into public.guidelines (id, issuer_id, stable_key, title, version, issued_on, effective_from, url, notes, status) values
  ('57000000-0000-4000-8000-000000000001', '56000000-0000-4000-8000-000000000001', 'sbc-sindrome-coronariana', 'Diretriz de Síndrome Coronariana Aguda', '2021', '2021-03-01', '2021-03-01', 'https://abccardiol.org', 'Referência acadêmica para o seed de navegação.', 'published'),
  ('57000000-0000-4000-8000-000000000002', '56000000-0000-4000-8000-000000000002', 'ssc-sepsis', 'International Guidelines for Management of Sepsis and Septic Shock', '2021', '2021-10-01', '2021-10-01', 'https://www.sccm.org/clinical-resources/surviving-sepsis-campaign-guidelines-2021', 'Versão identificada para rastreabilidade.', 'published')
on conflict (id) do update set issuer_id = excluded.issuer_id, stable_key = excluded.stable_key, title = excluded.title, version = excluded.version, issued_on = excluded.issued_on, effective_from = excluded.effective_from, url = excluded.url, notes = excluded.notes, status = excluded.status;

insert into public.guideline_competencies (guideline_id, competency_id) values
  ('57000000-0000-4000-8000-000000000001', '54000000-0000-4000-8000-000000000001'),
  ('57000000-0000-4000-8000-000000000001', '54000000-0000-4000-8000-000000000002'),
  ('57000000-0000-4000-8000-000000000002', '54000000-0000-4000-8000-000000000004'),
  ('57000000-0000-4000-8000-000000000002', '54000000-0000-4000-8000-000000000005')
on conflict do nothing;

insert into public.guideline_specialties (guideline_id, specialty_id) values
  ('57000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001'),
  ('57000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000001'),
  ('57000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002')
on conflict do nothing;

update public.exam_editions set exam_board_id = '20000000-0000-4000-8000-000000000003', edition = 'Acesso Direto', city = 'São Paulo', modality = 'objetiva', duration_minutes = 240, question_count = 100 where id = '40000000-0000-4000-8000-000000000001';
update public.exam_editions set exam_board_id = '20000000-0000-4000-8000-000000000004', edition = 'Acesso Direto', city = 'Belo Horizonte', modality = 'objetiva', duration_minutes = 240, question_count = 100 where id = '40000000-0000-4000-8000-000000000002';
update public.exam_editions set exam_board_id = '20000000-0000-4000-8000-000000000005', edition = 'Acesso Direto', city = 'Recife', modality = 'objetiva', duration_minutes = 240, question_count = 100 where id = '40000000-0000-4000-8000-000000000003';

insert into public.questions (id, source_key, canonical_hash, current_version, status) values
  ('58000000-0000-4000-8000-000000000001', 'seed-iam-001', repeat('a', 64), 1, 'published'),
  ('58000000-0000-4000-8000-000000000002', 'seed-sepse-001', repeat('b', 64), 1, 'published')
on conflict (id) do update set source_key = excluded.source_key, canonical_hash = excluded.canonical_hash, current_version = excluded.current_version, status = excluded.status;

insert into public.question_versions (id, question_id, version, institution_id, stem, commentary, difficulty, cognitive_level, status) values
  ('59000000-0000-4000-8000-000000000001', '58000000-0000-4000-8000-000000000001', 1, '10000000-0000-4000-8000-000000000001', 'Paciente com dor torácica e supradesnivelamento persistente de ST. Qual é a prioridade terapêutica?', 'A prioridade é definir e executar uma estratégia de reperfusão em tempo adequado.', 3, 'application', 'published'),
  ('59000000-0000-4000-8000-000000000002', '58000000-0000-4000-8000-000000000002', 1, '10000000-0000-4000-8000-000000000002', 'Paciente com infecção, hipotensão persistente e sinais de hipoperfusão. Qual síndrome deve ser reconhecida?', 'O quadro é compatível com choque séptico e requer ressuscitação imediata.', 2, 'understanding', 'published')
on conflict (id) do update set stem = excluded.stem, commentary = excluded.commentary, difficulty = excluded.difficulty, cognitive_level = excluded.cognitive_level, status = excluded.status;

insert into public.question_options (id, question_version_id, label, content, is_correct, position) values
  ('5a000000-0000-4000-8000-000000000001', '59000000-0000-4000-8000-000000000001', 'A', 'Estratégia de reperfusão', true, 1),
  ('5a000000-0000-4000-8000-000000000002', '59000000-0000-4000-8000-000000000001', 'B', 'Alta com seguimento ambulatorial', false, 2),
  ('5a000000-0000-4000-8000-000000000003', '59000000-0000-4000-8000-000000000002', 'A', 'Choque séptico', true, 1),
  ('5a000000-0000-4000-8000-000000000004', '59000000-0000-4000-8000-000000000002', 'B', 'Hipertensão assintomática', false, 2)
on conflict (id) do update set content = excluded.content, is_correct = excluded.is_correct, position = excluded.position;

insert into public.question_version_competencies (question_version_id, competency_id, relevance) values
  ('59000000-0000-4000-8000-000000000001', '54000000-0000-4000-8000-000000000001', 0.5),
  ('59000000-0000-4000-8000-000000000001', '54000000-0000-4000-8000-000000000002', 1),
  ('59000000-0000-4000-8000-000000000002', '54000000-0000-4000-8000-000000000004', 1)
on conflict do nothing;

insert into public.question_version_guidelines (question_version_id, guideline_id) values
  ('59000000-0000-4000-8000-000000000001', '57000000-0000-4000-8000-000000000001'),
  ('59000000-0000-4000-8000-000000000002', '57000000-0000-4000-8000-000000000002')
on conflict do nothing;

insert into public.exam_questions (exam_edition_id, question_id, question_version_id, position) values
  ('40000000-0000-4000-8000-000000000001', '58000000-0000-4000-8000-000000000001', '59000000-0000-4000-8000-000000000001', 1),
  ('40000000-0000-4000-8000-000000000002', '58000000-0000-4000-8000-000000000001', '59000000-0000-4000-8000-000000000001', 1),
  ('40000000-0000-4000-8000-000000000003', '58000000-0000-4000-8000-000000000002', '59000000-0000-4000-8000-000000000002', 1)
on conflict do nothing;
