import puppeteer from "puppeteer";

export interface ReportData {
  studentName: string;
  instructorName: string;
  startTime: string;
  faults: Record<string, number>;
}

export async function generatePdf(data: ReportData): Promise<Buffer> {
  const faultEntries = Object.entries(data.faults);
  const maxFaults = faultEntries.reduce(
    (max, [_, count]) => Math.max(max, count),
    0,
  );

  const faultHtml =
    faultEntries.length > 0
      ? faultEntries
          .map(([category, count]) => {
            const width = maxFaults > 0 ? (count / maxFaults) * 100 : 0;
            return `
          <div style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>${category}</span>
              <span>${count}</span>
            </div>
            <div style="background-color: #f3f4f6; border-radius: 4px; height: 20px; width: 100%;">
              <div style="background-color: #ef4444; height: 100%; border-radius: 4px; width: ${width}%;"></div>
            </div>
          </div>
        `;
          })
          .join("")
      : "<p>No faults recorded during this lesson.</p>";

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Lesson Report</title>
      <style>
        body { font-family: sans-serif; color: #333; line-height: 1.6; margin: 40px; }
        h1, h2 { color: #111; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .details { margin-bottom: 30px; }
        .details p { margin: 5px 0; }
        .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .thumbnail { width: 100%; height: 200px; background-color: #e5e7eb; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 20px; color: #6b7280; font-style: italic; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Lesson Report</h1>
        <div style="text-align: right;">
          <h2>DrivePro</h2>
        </div>
      </div>

      <div class="details">
        <p><strong>Student:</strong> ${data.studentName}</p>
        <p><strong>Instructor:</strong> ${data.instructorName}</p>
        <p><strong>Date & Time:</strong> ${data.startTime}</p>
      </div>

      <div class="card">
        <h2>Route Overview</h2>
        <div class="thumbnail">Route Thumbnail Placeholder</div>
      </div>

      <div class="card">
        <h2>Performance Scorecard</h2>
        ${faultHtml}
      </div>

      <div class="card">
        <h2>Instructor Notes</h2>
        <p>Keep practicing junctions and speed control. Good overall awareness today.</p>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
  });

  await browser.close();

  // Puppeteer returns a Uint8Array in newer versions, ensure it's a Node Buffer
  return Buffer.from(pdfBuffer);
}
