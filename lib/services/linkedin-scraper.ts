import * as cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";
import UserAgent from "user-agents";

/**
 * Gets a random user agent using the user-agents library
 */
function getRandomUserAgent(): string {
  const userAgent = new UserAgent();
  return userAgent.toString();
}

/**
 * Builds proxy URL with authentication from environment variables
 * Each request gets a different proxy from the rotating pool
 */
function buildProxyUrl(): string | undefined {
  const username = process.env.PROXY_USERNAME;
  const domain = process.env.PROXY_DOMAIN_NAME;
  const password = process.env.PROXY_PASSWORD;

  if (!username || !domain || !password) {
    return undefined;
  }

  return `http://${username}:${password}@${domain}:80`;
}

/**
 * Extracts employee count from LinkedIn company page HTML
 */
function extractEmployeeCount(html: string): number | null {
  const $ = cheerio.load(html);

  // LinkedIn shows employee count in various formats:
  // "X employees", "X-Y employees", "X+ employees"
  const patterns = [
    // Meta tag approach
    $('meta[property="og:description"]').attr("content"),
    // Text content approach - look for employee count patterns
    ...Array.from($("*"))
      .map((el) => $(el).text())
      .filter((text) => text.includes("employee")),
  ];

  for (const text of patterns) {
    if (!text) continue;

    // Match patterns like "1,234 employees", "500-1000 employees", "10,000+ employees"
    const match = text.match(
      /(\d{1,3}(?:,\d{3})*|\d+)(?:\s*-\s*(\d{1,3}(?:,\d{3})*|\d+))?\s*(?:\+)?\s*employees?/i
    );

    if (match) {
      // If range (e.g., "500-1000"), take the lower bound
      const count = match[1].replace(/,/g, "");
      return parseInt(count, 10);
    }
  }

  return null;
}

interface LinkedInScraperOptions {
  timeout?: number;
}

interface LinkedInScraperResult {
  success: boolean;
  employeeCount?: number;
  error?: string;
}

/**
 * Fetches employee count for a company from LinkedIn
 * @param url - LinkedIn company Url 
 * @param options - Optional timeout configuration
 * @returns Employee count or error
 */
export async function getLinkedInEmployeeCount(
  url: string,
  options: LinkedInScraperOptions = {}
): Promise<LinkedInScraperResult> {
  const { timeout = 10000 } = options;
  console.log(`Fetching Employee count: ${url}`)
  try {
    const userAgent = getRandomUserAgent();
    const proxyUrl = buildProxyUrl();

    const headers: HeadersInit = {
      "User-Agent": userAgent,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Cache-Control": "max-age=0",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      headers,
      signal: controller.signal,
      redirect: "follow",
    };

    if (proxyUrl) {
      // @ts-expect-error - Node.js fetch supports agent option
      fetchOptions.agent = new HttpsProxyAgent(proxyUrl);
    }

    const response = await fetch(url, fetchOptions);

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();

    const employeeCount = extractEmployeeCount(html);

    if (employeeCount === null) {
      return {
        success: false,
        error: "Could not extract employee count from page",
      };
    }

    return {
      success: true,
      employeeCount,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { success: false, error: "Request timeout" };
      }
      return { success: false, error: error.message };
    }
    return { success: false, error: "Unknown error occurred" };
  }
}
