const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const fs = require('fs');

// Set to keep track of visited URLs to avoid processing the same URL multiple times
const visitedUrls = new Set();

// Dictionary to store results for each start URL
const results = {};

// Function to extract and return internal links from a webpage
const extractInternalLinks = (baseUrl, html) => {
  const $ = cheerio.load(html);
  const links = [];
  $('a').each((index, element) => {
    const href = $(element).attr('href');
    if (href) {
      let absoluteUrl = url.resolve(baseUrl, href);
      const parsedUrl = url.parse(absoluteUrl);
      // Remove query string
      absoluteUrl = url.format({
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
      });
      if (absoluteUrl.startsWith(baseUrl)) {
        links.push(absoluteUrl);
      }
    }
  });
  return links;
};

// Function to extract create functions and their names from HTML content
const extractCreateFunctions = (html) => {
  const createFunctions = [];
  const createFunctionRegex = /([a-zA-Z0-9_]+)\.create\(\s*\{[^}]*\}\s*\)/g;
  let match;
  while ((match = createFunctionRegex.exec(html)) !== null) {
    createFunctions.push({ name: match[1], function: match[0] });
  }
  return createFunctions;
};

// Function to crawl a given URL
const crawl = async (baseUrl, currentUrl) => {
  if (visitedUrls.has(currentUrl)) {
    return;
  }
  visitedUrls.add(currentUrl);

  try {
    const response = await axios.get(currentUrl);
    const html = response.data;
    console.log(`Crawled: ${currentUrl}`);
    // Extract and log create functions
    const createFunctions = extractCreateFunctions(html);
    if (createFunctions.length > 0) {
      if (!results[baseUrl]) {
        results[baseUrl] = [];
      }
      createFunctions.forEach((func) => {
        if (!results[baseUrl].includes(func.name)) {
          results[baseUrl].push(func.name);
        }
      });
    }

    // Extract internal links and crawl them recursively
    const internalLinks = extractInternalLinks(baseUrl, html);
    for (const link of internalLinks) {
      await crawl(baseUrl, link);
    }
  } catch (error) {
    console.error(`Error crawling ${currentUrl}:`, error.message);
  }
};

// Array of starting URLs
const startUrls = [
  // 'https://www.ksk-koeln.de',
  'https://example.com',
];

// Start crawling all starting URLs
const startCrawling = async (urls) => {
  for (const startUrl of urls) {
    const startTime = new Date();
    await crawl(startUrl, startUrl);
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds
    console.log(`Time taken to crawl ${startUrl}: ${timeTaken} seconds`);
  }

  // Write results to a file
  fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
  console.log('Results written to results.json');
};

// Start the crawling process
startCrawling(startUrls);