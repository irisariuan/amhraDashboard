import { readFileSync } from 'node:fs'
import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${JSON.parse(readFileSync(path.join(process.cwd(), 'settings.json'))).apiUrl}/:path*`
            }
        ]
    }
};

export default nextConfig;
