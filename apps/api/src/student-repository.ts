import { createDatabaseClient } from '@iatron/database';
import type { ApiEnvironment } from './config/environment.js';

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
  }
}

export function createStudentRepository(
  environment: ApiEnvironment,
  userId: string,
  accessToken: string,
) {
  const database = createDatabaseClient({
    url: environment.SUPABASE_URL,
    key: environment.SUPABASE_PUBLISHABLE_KEY,
    accessToken: async () => accessToken,
  });
  const unwrap = <T>(result: {
    data: T;
    error: { message: string; code?: string } | null;
  }): T => {
    if (result.error)
      throw new RepositoryError(
        result.error.message,
        result.error.code ?? 'DATABASE_ERROR',
      );
    return result.data;
  };
  const getProfile = async () =>
    unwrap(
      await database.from('profiles').select('*').eq('id', userId).single(),
    );
  const getStudentProfile = async () =>
    unwrap(
      await database
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
    );
  const getAvailability = async () =>
    unwrap(
      await database
        .from('student_availability')
        .select('*')
        .eq('user_id', userId)
        .order('weekday'),
    );
  const getTargets = async () =>
    unwrap(
      await database
        .from('student_target_exams')
        .select('*')
        .eq('user_id', userId),
    );
  return {
    getProfile,
    getStudentProfile,
    getAvailability,
    getTargets,
    async updateProfile(displayName: string) {
      return unwrap(
        await database
          .from('profiles')
          .update({ display_name: displayName })
          .eq('id', userId)
          .select()
          .single(),
      );
    },
    async replaceAvailability(
      items: { weekday: number; minutesAvailable: number }[],
    ) {
      unwrap(
        await database
          .from('student_availability')
          .delete()
          .eq('user_id', userId),
      );
      if (items.length)
        unwrap(
          await database
            .from('student_availability')
            .insert(
              items.map((item) => ({
                user_id: userId,
                weekday: item.weekday,
                minutes_available: item.minutesAvailable,
              })),
            ),
        );
      return getAvailability();
    },
    async listPrograms() {
      return unwrap(
        await database.from('exam_programs').select('*').order('name'),
      );
    },
    async listEditions() {
      return unwrap(
        await database
          .from('exam_editions')
          .select('*')
          .order('application_date'),
      );
    },
    async replaceTargets(ids: string[]) {
      unwrap(
        await database
          .from('student_target_exams')
          .delete()
          .eq('user_id', userId),
      );
      if (ids.length)
        unwrap(
          await database
            .from('student_target_exams')
            .insert(
              ids.map((exam_edition_id) => ({
                user_id: userId,
                exam_edition_id,
              })),
            ),
        );
      return getTargets();
    },
    async getOnboarding() {
      return {
        profile: await getProfile(),
        studentProfile: await getStudentProfile(),
        availability: await getAvailability(),
        targets: await getTargets(),
      };
    },
    async saveOnboarding(input: {
      step: number;
      displayName?: string;
      residencyYear?: number | null;
      graduationYear?: number | null;
      availability?: { items: { weekday: number; minutesAvailable: number }[] };
      examEditionIds?: string[];
      complete: boolean;
    }) {
      if (input.displayName)
        unwrap(
          await database
            .from('profiles')
            .update({ display_name: input.displayName })
            .eq('id', userId),
        );
      if (
        input.residencyYear !== undefined ||
        input.graduationYear !== undefined
      )
        unwrap(
          await database
            .from('student_profiles')
            .update({
              residency_year: input.residencyYear,
              graduation_year: input.graduationYear,
            })
            .eq('user_id', userId),
        );
      if (input.availability)
        await this.replaceAvailability(input.availability.items);
      if (input.examEditionIds) await this.replaceTargets(input.examEditionIds);
      unwrap(
        await database
          .from('profiles')
          .update({
            onboarding_step: input.step,
            onboarding_status: input.complete ? 'completed' : 'in_progress',
          })
          .eq('id', userId),
      );
      return this.getOnboarding();
    },
  };
}
export type StudentRepository = ReturnType<typeof createStudentRepository>;
