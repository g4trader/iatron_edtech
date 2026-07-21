import {
  availabilityInputSchema,
  onboardingInputSchema,
  profileUpdateSchema,
  targetExamsInputSchema,
} from '@iatron/contracts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { ApiEnvironment } from './config/environment.js';
import type { StudentRepository } from './student-repository.js';

export interface MeRoutesOptions {
  environment: ApiEnvironment;
  repositoryFactory?: (userId: string, token: string) => StudentRepository;
}

export async function registerMeRoutes(
  app: FastifyInstance,
  options: MeRoutesOptions,
) {
  const repository = (request: FastifyRequest) =>
    options.repositoryFactory?.(
      request.auth.userId,
      request.auth.accessToken,
    ) ??
    (() => {
      throw new Error('Repository factory unavailable');
    })();
  app.get('/me', async (request) => repository(request).getOnboarding());
  app.get('/me/profile', async (request) => repository(request).getProfile());
  app.patch('/me/profile', async (request) =>
    repository(request).updateProfile(
      profileUpdateSchema.parse(request.body).displayName,
    ),
  );
  app.get('/me/availability', async (request) =>
    repository(request).getAvailability(),
  );
  app.put('/me/availability', async (request) =>
    repository(request).replaceAvailability(
      availabilityInputSchema.parse(request.body).items,
    ),
  );
  app.get('/exam-programs', async (request) =>
    repository(request).listPrograms(),
  );
  app.get('/exam-editions', async (request) =>
    repository(request).listEditions(),
  );
  app.get('/me/target-exams', async (request) =>
    repository(request).getTargets(),
  );
  app.put('/me/target-exams', async (request) =>
    repository(request).replaceTargets(
      targetExamsInputSchema.parse(request.body).examEditionIds,
    ),
  );
  app.get('/me/onboarding', async (request) =>
    repository(request).getOnboarding(),
  );
  app.put('/me/onboarding', async (request) =>
    repository(request).saveOnboarding(
      onboardingInputSchema.parse(request.body),
    ),
  );
}
