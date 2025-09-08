/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://studycat.tech', // your website URL
  generateRobotsTxt: true, // optional: generates robots.txt
  changefreq: 'daily',       // optional: how often pages are updated
  priority: 0.7,             // optional: page priority
  sitemapSize: 5000,          // split large sitemaps if >5000 URLs
};
