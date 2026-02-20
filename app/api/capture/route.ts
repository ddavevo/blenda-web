import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export async function POST(request: NextRequest) {
  let body: { url?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  const normalizedUrl = normalizeUrl(body.url);

  console.log("Capture request for:", normalizedUrl);

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
    });

    await page.goto(normalizedUrl, {
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    const screenshot = await page.screenshot({
      type: "png",
      encoding: "base64",
    });

    return NextResponse.json({
      image: screenshot,
      metadata: {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to capture site" },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}