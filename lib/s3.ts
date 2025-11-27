import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.BUCKET_REGION || "ap-southeast-2";
const BUCKET = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;
const PREFIX = process.env.S3_PREFIX || ""; // optional prefix where cases live
const NORMALIZED_PREFIX = PREFIX
    ? PREFIX.endsWith("/")
        ? PREFIX
        : `${PREFIX}/`
    : "";

if (!BUCKET) {
    // don't throw at import time; routes will check
}

const client = new S3Client({ region: REGION });

export type CaseObjectSummary = {
    key: string;
    relativeKey: string;
    lastModified?: Date;
    size?: number;
};

async function streamToBuffer(stream: any): Promise<Buffer> {
    // Node readable stream to Buffer
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

function stripPrefix(key: string) {
    if (NORMALIZED_PREFIX && key.startsWith(NORMALIZED_PREFIX)) {
        return key.slice(NORMALIZED_PREFIX.length);
    }
    return key;
}

async function listObjects(prefix: string): Promise<CaseObjectSummary[]> {
    if (!BUCKET) throw new Error('S3_BUCKET not configured');
    const items: CaseObjectSummary[] = [];
    let token: string | undefined;
    do {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: prefix || undefined,
            ContinuationToken: token
        });
        const out = await client.send(command);
        for (const obj of out.Contents || []) {
            if (!obj.Key) continue;
            items.push({
                key: obj.Key,
                relativeKey: stripPrefix(obj.Key).replace(/^\/+/, ''),
                lastModified: obj.LastModified,
                size: obj.Size
            });
        }
        token = out.IsTruncated ? out.NextContinuationToken : undefined;
    } while (token);
    return items;
}

export function buildCaseObjectKey(caseId: string, filename: string) {
    const safeCase = caseId.replace(/^\/+|\/+$/g, '');
    const safeFilename = filename.replace(/^\/+/, '');
    return `${NORMALIZED_PREFIX}${safeCase}/${safeFilename}`;
}

export async function listCaseIds(): Promise<string[]> {
    const objects = await listAllCaseObjects();
    const ids = new Set<string>();
    for (const obj of objects) {
        const relative = obj.relativeKey.replace(/^\/+/, '');
        const parts = relative.split('/');
        if (parts.length && parts[0]) {
            ids.add(parts[0]);
        }
    }
    return Array.from(ids).sort();
}

export async function listObjectsForCase(caseId: string): Promise<CaseObjectSummary[]> {
    if (!BUCKET) throw new Error('S3_BUCKET not configured');
    const casePrefix = `${NORMALIZED_PREFIX}${caseId.replace(/^\/+|\/+$/g, '')}/`;
    return listObjects(casePrefix);
}

export async function listAllCaseObjects(): Promise<CaseObjectSummary[]> {
    if (!BUCKET) throw new Error('S3_BUCKET not configured');
    return listObjects(NORMALIZED_PREFIX);
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
    if (!BUCKET) throw new Error('S3_BUCKET not configured');
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const out = await client.send(command);
    // @ts-ignore
    const body = out.Body;
    if (!body) throw new Error('S3 object has empty body');
    return await streamToBuffer(body as any);
}

export async function putObjectBuffer(key: string, buffer: Buffer, contentType = 'text/csv') {
    if (!BUCKET) throw new Error('S3_BUCKET not configured');
    const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType });
    await client.send(cmd);
}
