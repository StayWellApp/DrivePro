import puppeteer from "puppeteer";

export interface ReportData {
  studentName: string;
  instructorName: string;
  startTime: string;
  faults: Record<string, number>;
}

export interface MonthlyReportData {
  schoolName: string;
  month: string;
  totalLessons: number;
  totalRevenue: number;
  fleetStatus: {
    total: number;
    operational: number;
    warning: number;
    overdue: number;
  };
  studentStats: {
    totalActive: number;
    estimatedPassRate: number;
  };
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

  return renderHtmlToPdf(html);
}

export async function generateMonthlySchoolReport(data: MonthlyReportData): Promise<Buffer> {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Monthly Performance Report</title>
      <style>
        body { font-family: 'Helvetica', sans-serif; color: #1e293b; line-height: 1.5; margin: 40px; }
        .header { border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: end; }
        h1 { margin: 0; font-size: 32px; font-weight: 900; color: #0f172a; }
        .month { font-size: 18px; color: #64748b; font-weight: bold; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
        .stat-label { font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: 900; color: #0f172a; }
        .fleet-grid { display: flex; gap: 10px; margin-top: 10px; }
        .fleet-pill { padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; color: white; }
        .bg-teal { background-color: #14b8a6; }
        .bg-amber { background-color: #f59e0b; }
        .bg-red { background-color: #ef4444; }
        .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <p class="month">${data.month} 2025</p>
          <h1>${data.schoolName}</h1>
        </div>
        <div style="text-align: right; color: #14b8a6; font-weight: 900; font-size: 24px;">DRIVEPRO</div>
      </div>

      <div class="grid">
        <div class="stat-card">
          <div class="stat-label">Total Training Sessions</div>
          <div class="stat-value">${data.totalLessons}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Monthly Gross Revenue</div>
          <div class="stat-value">${data.totalRevenue.toLocaleString()} CZK</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Fleet Compliance Status</div>
          <div class="stat-value">${Math.round((data.fleetStatus.operational / data.fleetStatus.total) * 100)}%</div>
          <div class="fleet-grid">
             <span class="fleet-pill bg-teal">${data.fleetStatus.operational} OK</span>
             <span class="fleet-pill bg-amber">${data.fleetStatus.warning} Attention</span>
             <span class="fleet-pill bg-red">${data.fleetStatus.overdue} Overdue</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Estimated Student Pass Rate</div>
          <div class="stat-value">${data.studentStats.estimatedPassRate}%</div>
          <p style="font-size: 10px; color: #64748b; margin-top: 5px;">Based on AI-driven fault analysis across ${data.studentStats.totalActive} active students.</p>
        </div>
      </div>

      <div style="background: #0f172a; color: white; padding: 30px; border-radius: 12px;">
         <h3 style="margin-top: 0;">School Intelligence Summary</h3>
         <p style="font-size: 14px; opacity: 0.8;">The fleet is performing within expected safety margins. We recommend scheduling maintenance for ${data.fleetStatus.warning + data.fleetStatus.overdue} vehicles to maintain 100% operational readiness. Student performance in "Observation" has improved by 12% compared to last month.</p>
      </div>

      <div class="footer">
        Generated by DrivePro Fleet Intelligence • Kinetic Precision v4.2
      </div>
    </body>
    </html>
  `;
  return renderHtmlToPdf(html);
}

async function renderHtmlToPdf(html: string): Promise<Buffer> {
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
  return Buffer.from(pdfBuffer);
}
