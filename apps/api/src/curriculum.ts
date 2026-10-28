import {
  curriculumPageSchema,
  curriculumQuerySchema,
  saveCurriculumSchema,
  type CurriculumQuery,
  type SaveCurriculum,
} from '@iatron/contracts';
import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import type { ApiEnvironment } from './config/environment.js';
import { RepositoryError } from './student-repository.js';

export function createCurriculumRepository(
  environment: ApiEnvironment,
  token: string,
) {
  async function rpc(name: string, body: Record<string, unknown>) {
    const response = await fetch(
      `${environment.SUPABASE_URL}/rest/v1/rpc/${name}`,
      {
        method: 'POST',
        headers: {
          apikey: environment.SUPABASE_PUBLISHABLE_KEY,
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      const error: unknown = await response.json();
      const code = z.object({ code: z.string() }).safeParse(error);
      const status = code.success ? code.data.code : '';
      throw new CurriculumError(
        status === '42501'
          ? 403
          : status === '40001' || status === '23505'
            ? 409
            : status === '22023'
              ? 400
              : status === 'P0002'
                ? 404
                : 502,
      );
    }
    return response.json() as Promise<unknown>;
  }
  return {
    async list(query: CurriculumQuery) {
      return curriculumPageSchema.parse(
        await rpc('admin_curriculum_catalog', { p_query: query }),
      );
    },
    async save(id: string, input: SaveCurriculum) {
      return z
        .uuid()
        .parse(
          await rpc('admin_save_curriculum', { p_id: id, p_input: input }),
        );
    },
  };
}
class CurriculumError extends RepositoryError {
  constructor(readonly status: number) {
    super('Curriculum request rejected', 'CURRICULUM_ERROR');
  }
}
export async function registerCurriculumRoutes(
  app: FastifyInstance,
  factory: (token: string) => ReturnType<typeof createCurriculumRepository>,
) {
  app.get('/admin/curriculum', async (request, reply) => {
    const query = curriculumQuerySchema.parse(request.query);
    try {
      return await factory(request.auth.accessToken).list(query);
    } catch (error) {
      if (error instanceof CurriculumError)
        return reply
          .status(error.status)
          .send({
            error: {
              code: 'CURRICULUM_ERROR',
              message: 'Não foi possível consultar o catálogo.',
              requestId: request.id,
            },
          });
      throw error;
    }
  });
  app.post('/admin/curriculum/:id', async (request, reply) => {
    const id = z.uuid().parse((request.params as { id: string }).id);
    const input = saveCurriculumSchema.parse(request.body);
    try {
      return { id: await factory(request.auth.accessToken).save(id, input) };
    } catch (error) {
      if (error instanceof CurriculumError)
        return reply
          .status(error.status)
          .send({
            error: {
              code: 'CURRICULUM_ERROR',
              message:
                error.status === 409
                  ? 'A competência mudou ou já existe. Recarregue os dados antes de salvar.'
                  : 'Alteração recusada. Verifique a permissão e o estado da competência.',
              requestId: request.id,
            },
          });
      throw error;
    }
  });
}
