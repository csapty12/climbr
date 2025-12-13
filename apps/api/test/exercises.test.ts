import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { app } from '../src/app';
import { prisma } from '../src/db/prisma';

describe('API Exercises Routes', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
        server = Fastify();
        server.register(app);
        await server.ready();
    });

    afterAll(async () => {
        await server.close();
        await prisma.$disconnect();
    });

    it('GET /v1/exercises returns list', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/v1/exercises'
        });
        if (response.statusCode !== 200) {
            console.log('GET /v1/exercises failed:', response.body);
        }
        expect(response.statusCode).toBe(200);
        const json = response.json();
        expect(json.items).toBeInstanceOf(Array);
        expect(json.items.length).toBeGreaterThan(0);
    });

    it('GET /v1/exercises filters by category', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/v1/exercises?category=strength'
        });
        expect(response.statusCode).toBe(200);
        const json = response.json();
        json.items.forEach((item: any) => {
            expect(item.category).toBe('strength');
        });
    });

    it('GET /v1/exercises supports pagination', async () => {
        // First page
        const res1 = await server.inject({
            method: 'GET',
            url: '/v1/exercises?limit=1'
        });
        const json1 = res1.json();
        expect(json1.items.length).toBe(1);
        expect(json1.nextCursor).toBeDefined();

        // Second page
        const res2 = await server.inject({
            method: 'GET',
            url: `/v1/exercises?limit=1&cursor=${encodeURIComponent(json1.nextCursor)}`
        });
        const json2 = res2.json();
        expect(json2.items.length).toBeDefined();
        expect(json2.items[0].id).not.toBe(json1.items[0].id);
    });

    it('GET /v1/exercises/:id returns detail', async () => {
        // Get an ID first
        const list = await server.inject({ method: 'GET', url: '/v1/exercises' });
        const item = list.json().items[0];

        const response = await server.inject({
            method: 'GET',
            url: `/v1/exercises/${item.id}`
        });
        expect(response.statusCode).toBe(200);
        const json = response.json();
        expect(json.id).toBe(item.id);
        expect(json.instructionsMarkdown).toBeDefined();
    });

    it('GET /v1/exercises/:id returns 404 for unknown', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/v1/exercises/unknown-slug-123'
        });
        expect(response.statusCode).toBe(404);
        expect(response.json().code).toBe('NOT_FOUND');
    });
});
