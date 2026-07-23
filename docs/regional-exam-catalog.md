# Catálogo regional de processos seletivos

O catálogo regional complementa o seed técnico e é versionado em
`supabase/migrations/202607230008_seed_south_region_catalog.sql`. A migration
garante sua presença após deploys e o seed de staging a reaplica de forma
idempotente em resets controlados. Ele contém somente processos verificados em
fontes institucionais ou da organizadora. Dados pessoais e questões de prova não
fazem parte deste catálogo.

## Modelo e deduplicação

- `exam_programs` representa o processo seletivo estável e usa `code` como
  identidade externa legível.
- `exam_editions` representa uma edição verificável do processo.
- `exam_boards` representa a organizadora.
- `institutions` representa cada instituição uma única vez.
- `exam_program_institutions` relaciona processos unificados às instituições
  participantes sem duplicar o processo.
- `region_code`, `state_code` e `city` permitem filtros estruturados.
- fonte, data de verificação, status e campos não confirmados pertencem à
  edição.

IDs existentes nunca devem ser trocados. Uma edição nova recebe novo ID e o
mesmo `exam_program_id`. Novas edições entram em uma migration de catálogo
posterior e não devem ser copiadas para `seed.sql`, que permanece um seed
técnico mínimo.

## Fontes verificadas

Verificação realizada em 23 de julho de 2026.

| Estado | Processo                              | Edição                   | Fonte primária                                                                                                                        |
| ------ | ------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| RS     | Prova AMB/AMRIGS                      | ingresso 2026            | [AMRIGS — Prova AMB/AMRIGS](https://www.amrigs.org.br/prova/)                                                                         |
| RS     | Hospital de Clínicas de Porto Alegre  | ingresso 2026            | [HCPA — Residência](https://www.hcpa.edu.br/ensino/ensino-residencia)                                                                 |
| RS     | Grupo Hospitalar Conceição            | ingresso 2026            | [GHC — Processo seletivo da COREME](https://www2.ghc.com.br/gepnet/processoseletivo.html)                                             |
| RS     | Hospital Universitário de Santa Maria | ingresso 2026            | [UFSM — Processo seletivo](https://www.ufsm.br/unidades-universitarias/ccs/coreme/processo-seletivo)                                  |
| RS     | Universidade Federal do Rio Grande    | seleção suplementar 2026 | [FURG — Edital oficial](https://www.furg.br/arquivos/Editais/18-02-2026_Edital_de_Neonatologia.pdf)                                   |
| SC     | Hospital Universitário da UFSC        | ingresso 2026            | [UFSC — Processo seletivo 2025/2026](https://residenciamedica.ufsc.br/processo-seletivo-2025/)                                        |
| PR     | Exame AMP                             | ingresso 2027            | [AMP — anúncio da 25ª edição](https://www.amp.org.br/web/noticias/exame-amp-de-resid-ncia-m-dica-ser-no-dia-1-de-novembro-2026-03-09) |
| PR     | Universidade Estadual de Maringá      | ingresso 2026            | [UEM — Processo seletivo 2025/2026](https://coreme.uem.br/processo-seletivo/2025-2026)                                                |
| PR     | Hospital Universitário da UEL         | ingresso 2027            | [UEL/COPS — documentos de Residência Médica](https://www.cops.uel.br/v2/documento.php?id=14)                                          |

Campos ausentes na fonte consultada ficam nulos e aparecem em
`unconfirmed_fields`. O catálogo nunca estima datas.

## Atualização

1. Abra a fonte oficial registrada na edição.
2. Confirme nome, organizadora, edição, status, cidade, datas e modalidade.
3. Atualize `verified_at`, `verification_status` e `unconfirmed_fields`.
4. Para nova edição, insira uma linha em `exam_editions`; não renomeie a edição
   anterior.
5. Para nova instituição participante, reutilize `institutions` e crie apenas
   o vínculo em `exam_program_institutions`.
6. Execute migrations, seed de staging, testes de banco e smoke.
7. Não promova o catálogo para produção sem autorização explícita.

O responsável pela manutenção é o processo de revisão acadêmica do Iatron. A
rotina recomendada é revisão antes da abertura anual de inscrições e nova
verificação quando o edital definitivo for publicado.
