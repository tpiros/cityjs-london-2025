import { neonConfig } from '@neondatabase/serverless';

neonConfig.wsProxy = (host) => `${host}:54330/v1`;
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineTLS = false;
neonConfig.pipelineConnect = false;

export * from '@vercel/postgres';
