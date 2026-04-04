from playwright.sync_api import sync_playwright

def run_verification(page):
    # Check Dashboard
    print("Verifying Dashboard...")
    page.goto("http://localhost:3000/cs")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/dashboard.png")

    # Check Students
    print("Verifying Students...")
    page.goto("http://localhost:3000/cs/students")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/students.png")

    # Check Fleet
    print("Verifying Fleet...")
    page.goto("http://localhost:3000/cs/fleet")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/fleet.png")

    # Check Schedule
    print("Verifying Schedule...")
    page.goto("http://localhost:3000/cs/schedule")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/schedule.png")

    # Check Lesson Review
    print("Verifying Lesson Review...")
    page.goto("http://localhost:3000/cs/lessons/mock-lesson-id")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/lesson_review.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
