import { FastifyPluginAsync } from 'fastify';
import { GetExercisesQuerySchema } from '@climbr/shared';
import { exerciseService } from '../../services/exercises.service';
import { ApiError } from '../../lib/errors';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export const exerciseRoutes: FastifyPluginAsync = async (fastify) => {
    const server = fastify.withTypeProvider<ZodTypeProvider>();

    server.get('/', {
        schema: {
            querystring: GetExercisesQuerySchema
        }
    }, async (request, reply) => {
        // request.query is automatically typed and validated!
        const query = request.query;
        const result = await exerciseService.getExercises(query);
        return result;
    });

    server.get('/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const result = await exerciseService.getExercise(id);
        return result;
    });

    server.setErrorHandler((error, request, reply) => {
        if (error instanceof z.ZodError) {
            reply.status(400).send({
                code: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                details: error.format()
            });
            return;
        }

        if (error instanceof ApiError) {
            reply.status(error.statusCode).send({
                code: error.code,
                message: error.message,
                details: error.details
            });
            return;
        }

        request.log.error(error);
        reply.status(500).send({
            code: 'INTERNAL_ERROR',
            message: 'Unexpected error occurred'
        });
    });
};
