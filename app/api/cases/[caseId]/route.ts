import { NextResponse } from 'next/server';
import { listObjectsForCase, getObjectBuffer } from '@lib/s3';
import parsePGM from '@lib/parsePGM';
import parseYAML from '@lib/parseYAML';
import parseCSV from '@lib/parseCSV';
import { getContours, convertEvidenceToPixels, pgmToPNGBuffer } from '@lib/mapUtils';
import { getCaseSummary } from '@lib/caseSummary';
import { attachMarkerImageUrls } from '@lib/markerMedia';

export async function GET(request: Request, context: { params: Promise<{ caseId: string }> }) {
  try {
    const { caseId } = await context.params;
    const objects = await listObjectsForCase(caseId);
    if (!objects.length) return NextResponse.json({ error: 'No files found for case' }, { status: 404 });

    // Find files by extension
    const pgmKey = objects.find(o => o.key.toLowerCase().endsWith('.pgm'))?.key;
    const yamlKey = objects.find(o => o.key.toLowerCase().endsWith('.yaml') || o.key.toLowerCase().endsWith('.yml'))?.key;
    const csvKey = objects.find(o => o.key.toLowerCase().endsWith('.csv'))?.key;

    if (!pgmKey || !yamlKey) return NextResponse.json({ error: 'PGM and YAML required' }, { status: 400 });

    const [pgmBuf, yamlBuf, csvBuf] = await Promise.all([
      getObjectBuffer(pgmKey),
      getObjectBuffer(yamlKey),
      csvKey ? getObjectBuffer(csvKey) : Promise.resolve(Buffer.from(''))
    ]);

    const pgm = parsePGM(pgmBuf);
    const yaml = parseYAML(yamlBuf.toString('utf-8'));
    const evidence = csvKey ? parseCSV(csvBuf.toString('utf-8')) : [];

    let contours: any[] = [];
    try { contours = getContours(pgm.pixels, pgm.width, pgm.height); } catch (_) { contours = []; }

    const evidencePixels = await attachMarkerImageUrls(
      convertEvidenceToPixels(evidence, yaml.origin, yaml.resolution, pgm.height)
    );
    const pngBuffer = await pgmToPNGBuffer(pgm.pixels, pgm.width, pgm.height);

    const summary = await getCaseSummary(caseId, objects);

    return NextResponse.json({
      success: true,
      map: { width: pgm.width, height: pgm.height, contours },
      evidence: evidencePixels,
      baseImage: `data:image/png;base64,${pngBuffer.toString('base64')}`,
      summary
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
