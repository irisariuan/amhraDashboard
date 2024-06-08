import { readFileSync } from 'node:fs'
import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${process.env.API_URL}/:path*`
            }
        ]
    },
    
};

export default nextConfig;
