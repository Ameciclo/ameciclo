import { AwsClient } from "aws4fetch";

/** Minimal R2 client over its S3 API: all the collector needs is to write objects. */
export function r2Client(options: { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string }) {
  const aws = new AwsClient({ accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey, service: "s3", region: "auto" });
  const base = `https://${options.accountId}.r2.cloudflarestorage.com/${options.bucket}`;
  return {
    async putJson(key: string, value: unknown): Promise<void> {
      const response = await aws.fetch(`${base}/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      if (!response.ok) throw new Error(`R2 PUT ${key}: HTTP ${response.status} ${await response.text()}`);
    },
  };
}
