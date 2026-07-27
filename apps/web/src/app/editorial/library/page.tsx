import type { Route } from 'next';
import { redirect } from 'next/navigation';

export default function EditorialLibraryPage() {
  redirect('/editorial' as Route);
}
