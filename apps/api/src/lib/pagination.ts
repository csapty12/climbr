export function encodeCursor(updatedAt: Date, id: string): string {
    const payload = JSON.stringify({ updatedAt: updatedAt.toISOString(), id });
    return Buffer.from(payload).toString('base64');
}

export function decodeCursor(cursor: string): { updatedAt: Date, id: string } | null {
    try {
        const payload = Buffer.from(cursor, 'base64').toString('utf-8');
        const parsed = JSON.parse(payload);
        return {
            updatedAt: new Date(parsed.updatedAt),
            id: parsed.id
        };
    } catch (e) {
        return null;
    }
}
