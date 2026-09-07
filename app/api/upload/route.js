import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    // Check Cloudflare R2 credentials
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME || 'chf-media';
    const publicUrlBase = process.env.R2_PUBLIC_URL || 'https://pub-ce8688bc6c654bcfb99716f7c9373bcd.r2.dev';

    if (!accountId || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        {
          error: 'Cloudflare R2 is not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in your environment.',
        },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cleanFilename = (file.name || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `vj-jewellery/${Date.now()}_${cleanFilename}`;

    const proxyUrl =
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy;

    const requestHandler = proxyUrl
      ? new NodeHttpHandler({
          httpAgent: new HttpsProxyAgent(proxyUrl),
          httpsAgent: new HttpsProxyAgent(proxyUrl),
        })
      : undefined;

    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
      requestHandler,
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    });

    await s3.send(command);

    const fileUrl = `${publicUrlBase.replace(/\/+$/, '')}/${objectKey}`;

    return NextResponse.json({
      Message: 'Success',
      status: 201,
      url: fileUrl,
      key: objectKey,
    });
  } catch (error) {
    console.error('Cloudflare R2 upload error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to upload image to Cloudflare R2',
      },
      { status: 500 }
    );
  }
}
