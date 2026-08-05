const trailingUuid =
  /\s+[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const editorialStatusLabels: Record<string, string> = {
  draft: 'Em preparação',
  awaiting_mentor_review: 'Aguardando revisão médica',
  mentor_approved: 'Revisão médica concluída',
  changes_requested: 'Ajustes solicitados',
  rejected: 'Não aprovado',
  published: 'Publicado',
  archived: 'Arquivado',
};

/** Removes technical identifiers used to keep synthetic records unique. */
export function contentDisplayTitle(title: string) {
  return title.replace(trailingUuid, '').trim();
}

/** Converts persisted workflow values into language suitable for operators. */
export function editorialStatusLabel(status: string) {
  return editorialStatusLabels[status] ?? 'Situação registrada';
}
