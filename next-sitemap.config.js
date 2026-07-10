/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://promptvault.vercel.app",
  generateRobotsTxt: false, // handled by app/robots.ts
  exclude: ["/admin/*", "/dashboard"],
}
