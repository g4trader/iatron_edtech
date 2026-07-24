begin;
set local role postgres;
set local search_path = public, extensions;
select extensions.plan(12);

create temporary table import_results(id uuid);

insert into import_results
select public.import_amrigs_content(
  jsonb_build_object(
    'importKey','AMRIGS:DB.TEST.001',
    'boardCode','AMRIGS',
    'examEditionId','64000000-0000-4000-8000-000000000001',
    'sourceKind','authorial_validation',
    'createdBy','pgTAP',
    'questions',jsonb_build_array(
      jsonb_build_object(
        'sourceKey','AMRIGS:MVP:DB.TEST.001',
        'canonicalHash',repeat('a',64),
        'institutionId','61000000-0000-4000-8000-000000000001',
        'position',950,
        'stem','Conteúdo sintético para teste do pipeline.',
        'commentary','Não homologado.',
        'difficulty',1,
        'cognitiveLevel','recognition',
        'areaCode','CARDIOLOGIA',
        'competencyCodes',jsonb_build_array('CARD.SCA.001'),
        'editorialStatus','draft',
        'options',jsonb_build_array(
          jsonb_build_object('label','A','content','Opção A','isCorrect',true,'position',1),
          jsonb_build_object('label','B','content','Opção B','isCorrect',false,'position',2)
        ),
        'provenance',jsonb_build_object(
          'origin','pgTAP',
          'sourceTitle','Fixture sintética',
          'sourceUrl','',
          'rightsHolder','Iatron',
          'legalBasis','Conteúdo autoral de teste',
          'externalIdentifier','PGTAP-AMRIGS-001',
          'obtainedOn','2026-07-24',
          'authorshipKind','editorial_non_homologated',
          'authorName','Teste',
          'responsibleParty','Engenharia',
          'usageRestrictions',jsonb_build_array('Não publicar')
        )
      )
    )
  )
);

select extensions.is((select count(*) from public.content_import_batches where import_key='AMRIGS:DB.TEST.001'),1::bigint,'one import batch is recorded');
select extensions.is((select status from public.content_import_batches where import_key='AMRIGS:DB.TEST.001'),'completed','batch completes atomically');
select extensions.is((select question_count from public.content_import_batches where import_key='AMRIGS:DB.TEST.001'),1,'batch stores question count');
select extensions.is((select count(*) from public.questions where source_key='AMRIGS:MVP:DB.TEST.001'),1::bigint,'question identity is created once');
select extensions.is((select count(*) from public.question_version_provenance where external_identifier='PGTAP-AMRIGS-001'),1::bigint,'provenance is mandatory and linked');
select extensions.is((select status from public.questions where source_key='AMRIGS:MVP:DB.TEST.001'),'draft','validation content remains draft');
select extensions.is((select non_published_count from public.amrigs_content_metadata where exam_edition_id='64000000-0000-4000-8000-000000000001'),1,'metadata reports non-published validation content');

select extensions.is(
  public.import_amrigs_content(
    jsonb_build_object(
      'importKey','AMRIGS:DB.TEST.001',
      'boardCode','AMRIGS',
      'examEditionId','64000000-0000-4000-8000-000000000001',
      'sourceKind','authorial_validation',
      'createdBy','pgTAP',
      'questions',jsonb_build_array(
        jsonb_build_object(
          'sourceKey','AMRIGS:MVP:DB.TEST.001','canonicalHash',repeat('a',64),
          'institutionId','61000000-0000-4000-8000-000000000001',
          'position',950,'stem','Conteúdo sintético para teste do pipeline.',
          'commentary','Não homologado.','difficulty',1,'cognitiveLevel','recognition',
          'areaCode','CARDIOLOGIA','competencyCodes',jsonb_build_array('CARD.SCA.001'),
          'editorialStatus','draft',
          'options',jsonb_build_array(
            jsonb_build_object('label','A','content','Opção A','isCorrect',true,'position',1),
            jsonb_build_object('label','B','content','Opção B','isCorrect',false,'position',2)
          ),
          'provenance',jsonb_build_object(
            'origin','pgTAP','sourceTitle','Fixture sintética','sourceUrl','',
            'rightsHolder','Iatron','legalBasis','Conteúdo autoral de teste',
            'externalIdentifier','PGTAP-AMRIGS-001','obtainedOn','2026-07-24',
            'authorshipKind','editorial_non_homologated','authorName','Teste',
            'responsibleParty','Engenharia','usageRestrictions',jsonb_build_array('Não publicar')
          )
        )
      )
    )
  ),
  (select id from import_results limit 1),
  'same import key and payload returns the original batch'
);
select extensions.is((select count(*) from public.questions where source_key='AMRIGS:MVP:DB.TEST.001'),1::bigint,'repeated import does not duplicate questions');

select extensions.throws_ok(
  $$select public.import_amrigs_content('{"importKey":"AMRIGS:WRONG.BOARD","boardCode":"AMP","examEditionId":"64000000-0000-4000-8000-000000000001","sourceKind":"authorial_validation","createdBy":"pgTAP","questions":[{}]}'::jsonb)$$,
  'P0001',
  'Only the AMRIGS pilot is supported',
  'another board is rejected'
);

set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa","role":"authenticated"}';
select extensions.throws_ok(
  $$select public.import_amrigs_content('{}'::jsonb)$$,
  '42501',
  null,
  'students cannot call the administrative import'
);
select extensions.is((select count(*) from public.question_version_provenance where external_identifier='PGTAP-AMRIGS-001'),1::bigint,'students may read provenance metadata');

select * from extensions.finish();
rollback;
