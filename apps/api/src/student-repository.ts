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
          await database.from('student_availability').insert(
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
          await database.from('student_target_exams').insert(
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
      experienceLevel?:
        | 'medical_student'
        | 'recent_graduate'
        | 'practicing_physician';
      preferredSessionMinutes?: number;
      assessmentPreference?: 'guided' | 'independent' | 'mixed';
      availability?: { items: { weekday: number; minutesAvailable: number }[] };
      examEditionIds?: string[];
      complete: boolean;
    }) {
      unwrap(
        await database.rpc('save_onboarding', {
          p_step: input.step,
          p_display_name: input.displayName,
          p_residency_year: input.residencyYear ?? undefined,
          p_graduation_year: input.graduationYear ?? undefined,
          p_experience_level: input.experienceLevel,
          p_preferred_session_minutes: input.preferredSessionMinutes,
          p_assessment_preference: input.assessmentPreference,
          p_availability: input.availability?.items,
          p_exam_edition_ids: input.examEditionIds,
          p_complete: input.complete,
        }),
      );
      return {
        profile: await getProfile(),
        studentProfile: await getStudentProfile(),
        availability: await getAvailability(),
        targets: await getTargets(),
      };
    },
  };
}
export type StudentRepository = ReturnType<typeof createStudentRepository>;
