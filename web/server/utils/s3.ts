import { S3Client, GetObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";



export default class Bucket {
    CLOUDFLARE_R2_ACCOUNT_ID: string;
    CLOUDFLARE_R2_ACCESS_KEY_ID: string;
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: string;
    CLOUDFLARE_R2_BUCKET: string;
    DOMAIN?: string;
    
    constructor(
        accountId: string, 
        accessKeyId: string, 
        secretAccessKey: string, 
        bucket: string, 
    ) {
        this.CLOUDFLARE_R2_ACCOUNT_ID = accountId;
        this.CLOUDFLARE_R2_ACCESS_KEY_ID = accessKeyId;
        this.CLOUDFLARE_R2_SECRET_ACCESS_KEY = secretAccessKey;
        this.CLOUDFLARE_R2_BUCKET = bucket;
    }

    s3(): S3Client {
        const R2_ENDPOINT = `https://${this.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

        const s3 = new S3Client({
            region: "auto",
            endpoint: R2_ENDPOINT,
            credentials: {
                accessKeyId: this.CLOUDFLARE_R2_ACCESS_KEY_ID,
                secretAccessKey: this.CLOUDFLARE_R2_SECRET_ACCESS_KEY
            },
            forcePathStyle: false,
        });
        return s3;
    }

    async getPublicAccess(keyOrUrl: string): Promise<{ok: true, date: string, data: GetObjectCommandOutput } | {ok: false, date: string, reason: string}> {

       try {
           const cmd = new GetObjectCommand({Bucket: this.CLOUDFLARE_R2_BUCKET, Key: keyOrUrl});
           const out = await this.s3().send(cmd);
           if (!out.Body) {
               return {
                   ok: false,
                   date: new Date().toISOString(),
                   reason: 'Error getting blob'
                };
            }
            return {
                ok: true,
                date: new Date().toISOString(),
                data: out
            };
        } catch(err) {
             return {
                ok: false,
                date: new Date().toISOString(),    
                reason: err instanceof Error ? err.message : String(err),
            };
        }
    }
}