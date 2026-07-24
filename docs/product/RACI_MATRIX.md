# Matriz RACI

Papéis, não pessoas, são usados enquanto responsáveis nominais não forem
formalmente definidos.

**R** executa, **A** responde pela decisão final, **C** é consultado e **I** é
informado.

## Papéis

- **PROD:** Produto
- **ED:** Editor
- **MED:** Revisor médico
- **MENT:** Mentor responsável
- **HOM:** Homologador
- **PUB:** Publicador
- **JUR:** Responsável jurídico
- **STAT:** Responsável estatístico
- **IMP:** Operador de importação
- **ENG:** Engenharia
- **SEC:** Segurança/Privacidade
- **ADM:** Administrador

| Atividade                | PROD | ED  | MED | MENT | HOM | PUB | JUR | STAT | IMP | ENG | SEC | ADM |
| ------------------------ | ---- | --- | --- | ---- | --- | --- | --- | ---- | --- | --- | --- | --- |
| Aquisição de conteúdo    | A    | C   | C   | I    | I   | I   | R   | I    | C   | I   | C   | I   |
| Importação               | I    | C   | I   | I    | I   | I   | C   | I    | R   | A   | C   | I   |
| Classificação            | I    | A/R | C   | C    | I   | I   | I   | C    | C   | I   | I   | I   |
| Revisão médica           | I    | C   | A/R | C    | I   | I   | I   | I    | I   | I   | I   | I   |
| Revisão editorial        | I    | A/R | C   | C    | I   | I   | I   | I    | I   | I   | I   | I   |
| Validação de gabarito    | I    | C   | A/R | C    | I   | I   | I   | C    | I   | I   | I   | I   |
| Homologação              | I    | C   | C   | C    | A/R | I   | C   | C    | I   | I   | I   | I   |
| Publicação               | I    | C   | I   | I    | C   | A/R | C   | I    | I   | C   | C   | I   |
| Correção                 | I    | R   | A   | C    | C   | C   | C   | C    | I   | I   | I   | I   |
| Exclusão/retirada        | I    | C   | C   | I    | I   | R   | A   | I    | I   | C   | C   | C   |
| Estatísticas             | C    | I   | C   | I    | I   | I   | I   | A/R  | I   | C   | C   | I   |
| Configuração de banca    | A    | C   | C   | C    | I   | I   | C   | R    | I   | C   | I   | I   |
| Metodologia de mentor    | C    | C   | C   | A/R  | I   | I   | C   | I    | I   | I   | I   | I   |
| Prompt de mentor         | A    | C   | C   | C    | I   | I   | C   | I    | I   | R   | C   | I   |
| Avaliação clínica da IA  | I    | C   | A/R | C    | I   | I   | I   | C    | I   | C   | C   | I   |
| Incidente de conteúdo    | I    | R   | A   | C    | C   | C   | C   | C    | I   | I   | C   | I   |
| Incidente de privacidade | I    | I   | I   | I    | I   | I   | C   | I    | I   | R   | A   | C   |

## Regras

- toda atividade possui exatamente um **A**;
- quem é **A** precisa estar formalmente nomeado antes da operação real;
- administrador técnico não recebe autoridade clínica, editorial ou jurídica;
- autoria não concede homologação automática;
- conflitos de interesse podem exigir substituição ou segundo revisor;
- incidentes seguem preservação de evidência, contenção, correção e comunicação;
- esta matriz é uma proposta e depende das decisões DEC-005 e DEC-006.
