/** @type {import('next').NextConfig} */
const nextConfig = {
	// All /api/* traffic is handled by route handlers under app/api, which attach
	// the session/anonymous auth from httpOnly cookies before forwarding to the
	// bot. No rewrite proxy — the browser only ever talks to this origin.
	allowedDevOrigins: ["amhra.xyz"],
	images: {
		remotePatterns: [new URL("https://i.ytimg.com/**")],
	},
};

export default nextConfig;
