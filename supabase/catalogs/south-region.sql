-- Verified regional catalogue. Keep stable IDs and update editions in place.
-- Sources and verification notes are documented in docs/regional-exam-catalog.md.

insert into public.institutions (id, name, acronym, state_code) values
  ('61000000-0000-4000-8000-000000000001', 'Associação Médica do Rio Grande do Sul', 'AMRIGS', 'RS'),
  ('61000000-0000-4000-8000-000000000002', 'Hospital de Clínicas de Porto Alegre', 'HCPA', 'RS'),
  ('61000000-0000-4000-8000-000000000003', 'Grupo Hospitalar Conceição', 'GHC', 'RS'),
  ('61000000-0000-4000-8000-000000000004', 'Universidade Federal de Santa Maria', 'UFSM', 'RS'),
  ('61000000-0000-4000-8000-000000000005', 'Universidade Federal do Rio Grande', 'FURG', 'RS'),
  ('61000000-0000-4000-8000-000000000006', 'Universidade Federal de Santa Catarina', 'UFSC', 'SC'),
  ('61000000-0000-4000-8000-000000000007', 'Associação Médica do Paraná', 'AMP', 'PR'),
  ('61000000-0000-4000-8000-000000000008', 'Universidade Estadual de Maringá', 'UEM', 'PR'),
  ('61000000-0000-4000-8000-000000000009', 'Universidade Estadual de Londrina', 'UEL', 'PR')
on conflict (id) do update set name=excluded.name, acronym=excluded.acronym, state_code=excluded.state_code, is_active=true;

insert into public.exam_boards (id, name, acronym) values
  ('62000000-0000-4000-8000-000000000001', 'Associação Médica do Rio Grande do Sul', 'AMB/AMRIGS'),
  ('62000000-0000-4000-8000-000000000002', 'Fundação Médica do Rio Grande do Sul', 'FUNDMED'),
  ('62000000-0000-4000-8000-000000000003', 'Comissão de Residência Médica da Universidade Federal do Rio Grande', 'COREME/FURG'),
  ('62000000-0000-4000-8000-000000000004', 'Associação Médica do Paraná', 'AMP/UCAMP'),
  ('62000000-0000-4000-8000-000000000005', 'Comissão de Residência Médica da Universidade Estadual de Maringá', 'COREME/UEM'),
  ('62000000-0000-4000-8000-000000000006', 'Comissão de Residência Médica da Universidade Estadual de Londrina', 'COREME/UEL')
on conflict (id) do update set name=excluded.name, acronym=excluded.acronym, is_active=true;

insert into public.exam_programs
  (id,institution_id,exam_board_id,code,name,scope,region_code,state_code,city,is_active) values
  ('63000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000001','62000000-0000-4000-8000-000000000001','AMRIGS','Prova AMB/AMRIGS — Processo Seletivo Unificado','unified','S','RS',null,true),
  ('63000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000002','62000000-0000-4000-8000-000000000002','HCPA','Residência Médica do Hospital de Clínicas de Porto Alegre','institutional','S','RS','Porto Alegre',true),
  ('63000000-0000-4000-8000-000000000003','61000000-0000-4000-8000-000000000003','62000000-0000-4000-8000-000000000001','GHC','Residência Médica do Grupo Hospitalar Conceição','institutional','S','RS','Porto Alegre',true),
  ('63000000-0000-4000-8000-000000000004','61000000-0000-4000-8000-000000000004','62000000-0000-4000-8000-000000000001','UFSM','Residência Médica do Hospital Universitário de Santa Maria','institutional','S','RS','Santa Maria',true),
  ('63000000-0000-4000-8000-000000000005','61000000-0000-4000-8000-000000000005','62000000-0000-4000-8000-000000000003','FURG','Residência Médica da Universidade Federal do Rio Grande','institutional','S','RS','Rio Grande',true),
  ('63000000-0000-4000-8000-000000000006','61000000-0000-4000-8000-000000000006','62000000-0000-4000-8000-000000000001','UFSC','Residência Médica do Hospital Universitário da UFSC','institutional','S','SC','Florianópolis',true),
  ('63000000-0000-4000-8000-000000000007','61000000-0000-4000-8000-000000000007','62000000-0000-4000-8000-000000000004','AMP','Exame AMP — Prova Seletiva para Residência Médica','unified','S','PR','Curitiba',true),
  ('63000000-0000-4000-8000-000000000008','61000000-0000-4000-8000-000000000008','62000000-0000-4000-8000-000000000005','UEM','Residência Médica da Universidade Estadual de Maringá','institutional','S','PR','Maringá',true),
  ('63000000-0000-4000-8000-000000000009','61000000-0000-4000-8000-000000000009','62000000-0000-4000-8000-000000000006','UEL','Residência Médica do Hospital Universitário da UEL','institutional','S','PR','Londrina',true)
on conflict (id) do update set institution_id=excluded.institution_id,exam_board_id=excluded.exam_board_id,code=excluded.code,name=excluded.name,scope=excluded.scope,region_code=excluded.region_code,state_code=excluded.state_code,city=excluded.city,is_active=true;

insert into public.exam_program_institutions (exam_program_id,institution_id,participation_role)
select id,institution_id,'host' from public.exam_programs where id::text like '63000000-0000-4000-8000-%'
on conflict do update set participation_role=excluded.participation_role;

insert into public.exam_editions
  (id,exam_program_id,year,application_date,registration_deadline,is_active,exam_board_id,edition,city,modality,status,official_url,source_title,source_url,verified_at,verification_status,update_method,unconfirmed_fields) values
  ('64000000-0000-4000-8000-000000000001','63000000-0000-4000-8000-000000000001',2026,'2025-11-23','2025-10-24',true,'62000000-0000-4000-8000-000000000001','Ingresso 2026',null,'prova teórico-objetiva','completed','https://www.amrigs.org.br/prova/','Prova AMB/AMRIGS 2025','https://www.amrigs.org.br/prova/',current_date,'verified','revisão anual do edital oficial','{}'),
  ('64000000-0000-4000-8000-000000000002','63000000-0000-4000-8000-000000000002',2026,null,null,true,'62000000-0000-4000-8000-000000000002','Ingresso 2026','Porto Alegre','processo seletivo institucional','completed','https://www.hcpa.edu.br/ensino/ensino-residencia','Residência — processo seletivo 2026','https://www.hcpa.edu.br/ensino/ensino-residencia',current_date,'partial','revisão anual do portal oficial','{application_date,registration_deadline}'),
  ('64000000-0000-4000-8000-000000000003','63000000-0000-4000-8000-000000000003',2026,'2025-11-23',null,true,'62000000-0000-4000-8000-000000000001','Ingresso 2026','Porto Alegre','prova teórico-objetiva e etapas institucionais','completed','https://www2.ghc.com.br/gepnet/processoseletivo.html','Processo Seletivo Público — Residência Médica do GHC','https://www2.ghc.com.br/gepnet/processoseletivo.html',current_date,'partial','revisão anual do edital oficial','{registration_deadline}'),
  ('64000000-0000-4000-8000-000000000004','63000000-0000-4000-8000-000000000004',2026,'2025-11-23',null,true,'62000000-0000-4000-8000-000000000001','Ingresso 2026','Santa Maria','prova teórico-objetiva e classificação institucional','completed','https://www.ufsm.br/unidades-universitarias/ccs/coreme/processo-seletivo','Processo Seletivo Residência Médica — ingresso 2026','https://www.ufsm.br/unidades-universitarias/ccs/coreme/processo-seletivo',current_date,'partial','revisão anual do edital oficial','{registration_deadline}'),
  ('64000000-0000-4000-8000-000000000005','63000000-0000-4000-8000-000000000005',2026,'2026-02-24',null,true,'62000000-0000-4000-8000-000000000003','Seleção suplementar 2026','Rio Grande','prova escrita','completed','https://www.furg.br/arquivos/Editais/18-02-2026_Edital_de_Neonatologia.pdf','Edital de Neonatologia — Residência Médica 2026','https://www.furg.br/arquivos/Editais/18-02-2026_Edital_de_Neonatologia.pdf',current_date,'partial','revisão do portal e editais da COREME','{registration_deadline}'),
  ('64000000-0000-4000-8000-000000000006','63000000-0000-4000-8000-000000000006',2026,'2025-11-23','2025-10-30',true,'62000000-0000-4000-8000-000000000001','Ingresso 2026','Florianópolis','prova teórico-objetiva e avaliação curricular','completed','https://residenciamedica.ufsc.br/processo-seletivo-2025/','Processo Seletivo 2025/2026 — HU/UFSC','https://residenciamedica.ufsc.br/processo-seletivo-2025/',current_date,'verified','revisão anual do edital oficial','{}'),
  ('64000000-0000-4000-8000-000000000007','63000000-0000-4000-8000-000000000007',2027,'2026-11-01',null,true,'62000000-0000-4000-8000-000000000004','25ª edição — ingresso 2027','Curitiba','prova geral e provas específicas','announced','https://www.amp.org.br/web/noticias/exame-amp-de-resid-ncia-m-dica-ser-no-dia-1-de-novembro-2026-03-09','Exame AMP de residência médica será no dia 1º de novembro','https://www.amp.org.br/web/noticias/exame-amp-de-resid-ncia-m-dica-ser-no-dia-1-de-novembro-2026-03-09',current_date,'partial','revisão do edital quando publicado','{registration_deadline,participating_programs}'),
  ('64000000-0000-4000-8000-000000000008','63000000-0000-4000-8000-000000000008',2026,null,null,true,'62000000-0000-4000-8000-000000000005','Ingresso 2026','Maringá','seleção pública institucional','completed','https://coreme.uem.br/processo-seletivo/2025-2026','Processo seletivo 2025/2026 — COREME/UEM','https://coreme.uem.br/processo-seletivo/2025-2026',current_date,'partial','revisão anual do edital oficial','{application_date,registration_deadline}'),
  ('64000000-0000-4000-8000-000000000009','63000000-0000-4000-8000-000000000009',2027,null,null,true,'62000000-0000-4000-8000-000000000006','Ingresso 2027','Londrina','seleção pública institucional','announced','https://www.cops.uel.br/v2/documento.php?id=14','Seleção Pública — Programa de Residência Médica HU/UEL 2027','https://www.cops.uel.br/v2/documento.php?id=14',current_date,'partial','revisão do edital oficial em publicação','{application_date,registration_deadline}')
on conflict (id) do update set exam_program_id=excluded.exam_program_id,year=excluded.year,application_date=excluded.application_date,registration_deadline=excluded.registration_deadline,is_active=true,exam_board_id=excluded.exam_board_id,edition=excluded.edition,city=excluded.city,modality=excluded.modality,status=excluded.status,official_url=excluded.official_url,source_title=excluded.source_title,source_url=excluded.source_url,verified_at=excluded.verified_at,verification_status=excluded.verification_status,update_method=excluded.update_method,unconfirmed_fields=excluded.unconfirmed_fields;
