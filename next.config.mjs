import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseUrlObject = supabaseUrl ? new URL(supabaseUrl) : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabaseUrlObject
      ? [
          {
            protocol: supabaseUrlObject.protocol.replace(':', ''),
            hostname: supabaseUrlObject.hostname,
            port: supabaseUrlObject.port || '',
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
};

export default withVanillaExtract(nextConfig);
