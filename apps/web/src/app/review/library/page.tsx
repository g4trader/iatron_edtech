import type { Route } from 'next';
import { redirect } from 'next/navigation';

export default function MentorLibraryPage() {
  redirect('/review' as Route);
}
