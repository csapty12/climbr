import { FastifyPluginAsync } from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { exerciseRoutes } from './routes/v1/exercises';

export const app: FastifyPluginAsync = async (fastify, opts) => {
    // Plugins
    await fastify.register(cors as any);

    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    // Static files
    await fastify.register(fastifyStatic as any, {
        root: path.join(__dirname, '../static'),
        prefix: '/static/',
    });

    // Routes
    await fastify.register(exerciseRoutes, { prefix: '/v1/exercises' });

    // Health check
    fastify.get('/health', async () => {
        return { status: 'ok' };
    });
};
