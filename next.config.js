/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
}

module.exports = {
    images: {
        domains: [
            "lh3.googleusercontent.com",
            "firebasestorage.googleapis.com",
        ],
    },
    i18n: {
        locales: ["en"],
        defaultLocale: "en",
    },
}
