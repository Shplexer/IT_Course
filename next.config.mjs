/** @type {import('next').NextConfig} */
//const nextConfig = {};
const nextConfig = {
    env: {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASS: process.env.DB_PASS,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT,
    },
    experimental:{
      serverActions:{
        bodySizeLimit: '10mb' 
      }
    }
  };
export default nextConfig;
