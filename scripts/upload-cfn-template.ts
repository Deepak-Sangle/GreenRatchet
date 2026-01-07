#!/usr/bin/env tsx
/**
 * Script to upload/upsert the AWS IAM CloudFormation template to S3
 *
 * Usage: npm run upload:cfn
 *
 * This script reads the local aws-iam-policy.yaml and uploads it to the
 * bridgly-usage-policies S3 bucket. Run this whenever you modify the template.
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  CFN_TEMPLATE_S3_BUCKET,
  CFN_TEMPLATE_S3_KEY,
  CFN_TEMPLATE_S3_REGION,
} from "../lib/constants";

const S3_BUCKET = CFN_TEMPLATE_S3_BUCKET;
const S3_KEY = CFN_TEMPLATE_S3_KEY;
const S3_REGION = process.env.AWS_REGION || CFN_TEMPLATE_S3_REGION;

// Path to the local YAML file
const LOCAL_YAML_PATH = resolve(
  __dirname,
  "../components/cloud/aws-iam-policy.yaml"
);

async function uploadTemplate() {
  console.log("📦 Uploading CloudFormation template to S3...\n");

  // Read the local YAML file
  let templateContent: string;
  try {
    templateContent = readFileSync(LOCAL_YAML_PATH, "utf-8");
    console.log(`✅ Read local template: ${LOCAL_YAML_PATH}`);
  } catch (error) {
    console.error(`❌ Failed to read local template: ${LOCAL_YAML_PATH}`);
    console.error(error);
    process.exit(1);
  }

  // Initialize S3 client
  const s3Client = new S3Client({
    region: S3_REGION,
    // Uses default credential chain:
    // - Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    // - AWS credentials file (~/.aws/credentials)
    // - IAM role (if running on AWS)
  });

  // Upload to S3
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: S3_KEY,
      Body: templateContent,
      ContentType: "application/x-yaml",
    });

    await s3Client.send(command);

    const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${S3_KEY}`;

    console.log(`✅ Successfully uploaded to S3!`);
    console.log(`\n🔗 Public URL:`);
    console.log(`   ${publicUrl}`);
  } catch (error) {
    console.error(`❌ Failed to upload to S3:`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
uploadTemplate();
