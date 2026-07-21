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
