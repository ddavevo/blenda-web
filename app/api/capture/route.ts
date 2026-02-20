import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import type { CaptureResult } from "@/types/blenda";

const LAUNCH_TIMEOUT_MS = 30_000;
const NAVIGATION_TIMEOUT_MS = 15_000;
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;

function isValidCaptureUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = body?.url;
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "Missing or invalid url" }, { status: 400 });
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "URL cannot be empty" }, { status: 400 });
  }

  if (!isValidCaptureUrl(trimmed)) {
    return NextResponse.json(
      { error: "URL must be valid and use http or https" },
      { status: 400 }
    );
  }

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      timeout: LAUNCH_TIMEOUT_MS,
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
      deviceScaleFactor: 1,
    });
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);

    await page.goto(trimmed, {
      waitUntil: "networkidle2",
    });

    const screenshotBase64 = await page.screenshot({
      type: "png",
      encoding: "base64",
      fullPage: false,
    });

    if (typeof screenshotBase64 !== "string") {
      throw new Error("Screenshot did not return base64 string");
    }

    const result: CaptureResult = {
      image: screenshotBase64,
      metadata: {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
      },
    };

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed";
    const isTimeout =
      message.includes("timeout") ||
      message.includes("Timeout") ||
      message.includes("Navigation timeout");
    const status = isTimeout ? 408 : 500;
    return NextResponse.json(
      { error: isTimeout ? "Request timed out loading the page" : message },
      { status }
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
