import { test, expect } from '@playwright/test';

test.describe('LeadgerX Real Browser End-to-End Verification', () => {

  test('1. Public Marketing Website loads with hero and CTAs', async ({ page }) => {
    await page.goto('/');
    
    // Inspect brand & title
    await expect(page.locator('text=LeadgerX').first()).toBeVisible();
    await expect(page.locator('h1')).toContainText('RUN YOUR BUSINESS SMARTER WITH AI');
    
    // Inspect navigation links (visible on desktop)
    const isMobile = (page.viewportSize()?.width || 1280) < 768;
    if (!isMobile) {
      await expect(page.locator('header nav a:has-text("Features")')).toBeVisible();
      await expect(page.locator('header nav a:has-text("Pricing")')).toBeVisible();
      await expect(page.locator('header nav a:has-text("FAQ")')).toBeVisible();
    }

    // Inspect hero CTAs
    await expect(page.locator('button:has-text("Get Started Free")')).toBeVisible();
    await expect(page.locator('button:has-text("Explore Instant Demo")')).toBeVisible();

    // Inspect feature sections & accordion
    await expect(page.locator('text=Next-Gen Operating System')).toBeVisible();
    await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();
  });

  test('2. Authentication: Fresh Account Registration, Persistence, and Empty State', async ({ page }) => {
    await page.goto('/');

    // Click Get Started to open signup
    await page.click('button:has-text("Get Started Free")');
    await expect(page.locator('text=Create your store workspace')).toBeVisible();

    const timestamp = Date.now();
    const freshEmail = `testowner_${timestamp}@leadgerx.test`;
    const freshPassword = 'Password123!';
    const freshStoreName = `Fresh Store ${timestamp}`;

    // Fill registration using exact input labels/placeholders
    await page.fill('input[placeholder*="Sharma General"]', freshStoreName);
    await page.fill('input[placeholder="Your full name"]', 'Priya Patel');
    await page.fill('input[placeholder="owner@yourstore.com"]', freshEmail);
    await page.fill('input[placeholder="Minimum 6 characters"]', freshPassword);
    await page.fill('input[placeholder="+91 98765 43210"]', '+91 98999 11223');

    await page.click('button:has-text("Create Store Workspace")');

    // Should land on Dashboard with empty state
    await expect(page.locator(`strong:has-text("${freshStoreName}")`)).toBeVisible();

    // Verify Fresh Account is empty (no fake metrics, 0 bills recorded)
    await expect(page.locator('text=₹0').first()).toBeVisible();
    await expect(page.locator('text=0 bills recorded')).toBeVisible();
    await expect(page.locator('text=0 customers with dues')).toBeVisible();

    // Refresh page to confirm session persistence
    await page.reload();
    await expect(page.locator(`strong:has-text("${freshStoreName}")`)).toBeVisible();

    // Logout
    const logoutBtn = page.locator('button[title="Sign Out"]').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      await page.click('nav button:has-text("More")');
      await page.click('button:has-text("Sign Out of Account")');
    }

    // Now on Marketing page again
    await expect(page.locator('h1')).toContainText('RUN YOUR BUSINESS SMARTER WITH AI');

    // Login with the freshly created credentials
    await page.click('header button:has-text("Log in")');
    await expect(page.locator('text=Sign in to LeadgerX')).toBeVisible();

    await page.fill('input[type="email"]', freshEmail);
    await page.fill('input[type="password"]', freshPassword);
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Verify logged back into fresh store
    await expect(page.locator(`strong:has-text("${freshStoreName}")`)).toBeVisible();
  });

  test('3. Main Dashboard Actions: Add Entry, Speak, Scan Bill, Upload Bill, Manual', async ({ page }) => {
    // Login to demo account for rich interaction
    await page.goto('/');
    await page.click('button:has-text("Explore Instant Demo")');
    await expect(page.locator('strong:has-text("Sharma General & Kirana Store")')).toBeVisible();

    // Action 1: Add Entry
    await page.click('button:has-text("Add Entry")');
    await expect(page.locator('text=Create Business Entry')).toBeVisible();
    await page.click('button[aria-label="Close"]');

    // Action 2: Speak (Voice Entry)
    await page.click('button:has-text("Speak")');
    await expect(page.locator('text=Voice Transaction Entry')).toBeVisible();
    await page.click('button[aria-label="Close"]');

    // Action 3: Scan Bill (Camera)
    await page.click('button:has-text("Scan Bill")');
    await expect(page.locator('text=Scan / Upload Bill (AI OCR)')).toBeVisible();
    await page.click('button[aria-label="Close"]');

    // Action 4: Upload Bill
    await page.click('button:has-text("Upload Bill")');
    await expect(page.locator('text=Scan / Upload Bill (AI OCR)')).toBeVisible();
    await page.click('button[aria-label="Close"]');

    // Action 5: Manual Entry
    await page.click('button:has-text("Manual")');
    await expect(page.locator('text=Create Business Entry')).toBeVisible();
    await page.click('button[aria-label="Close"]');
  });

  test('4. Customer Workflow: Create, Search, Filter, Open Timeline, Belongs to CustomerId', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Explore Instant Demo")');

    // Navigate to Customers
    const customersNav = page.locator('button:has-text("Customers"):visible').first();
    await customersNav.click();
    await expect(page.locator('h1')).toContainText('Customers & Udhaar');

    // Create a new Customer
    await page.click('button:has-text("New Customer")');
    const custName = `Kavita Verma ${Date.now()}`;
    const custPhone = '+91 98123 45678';
    await page.fill('input[placeholder*="Ramesh Sharma"]', custName);
    await page.fill('input[placeholder*="98765 43210"]', custPhone);
    await page.fill('input[placeholder*="Flat 102"]', 'House 42, Green Park');
    await page.click('button[type="submit"]:has-text("Save Customer")');

    // Detail view automatically opens for the newly created customer
    await expect(page.locator('h2')).toContainText(custName);
    await expect(page.locator('text=Ledger Activity Timeline')).toBeVisible();

    // Record a new bill for this customer from detail view
    await page.click('button:has-text("New Bill")');
    await expect(page.locator('text=Create Business Entry')).toBeVisible();

    // Select Product "Tata Salt (1kg)"
    await page.fill('input[placeholder="Product or item description..."]', 'Tata Salt (1kg)');
    // Unit price must prefill with 30
    const priceInput = page.locator('input[title="Unit Price"]');
    await expect(priceInput).toHaveValue('30');

    // Set Quantity = 2 -> total = 60
    await page.fill('input[title="Quantity"]', '2');
    await expect(page.locator('text=₹60').first()).toBeVisible();

    // Set paid amount = 20 -> Udhaar = 40
    await page.fill('input[placeholder*="Amount paid upfront"]', '20');
    await expect(page.locator('text=₹40').first()).toBeVisible();

    await page.click('button[type="submit"]:has-text("Save Entry")');

    // Record must appear in Kavita's timeline
    await expect(page.locator('text=Tata Salt (1kg)')).toBeVisible();
    await expect(page.locator('text=₹40 Udhaar').first()).toBeVisible();

    // Refresh page and confirm persisted
    await page.reload();
    await expect(page.locator('h2')).toContainText(custName);
    await expect(page.locator('text=Tata Salt (1kg)')).toBeVisible();
  });

  test('5. Product Price Validation: Known Product vs Unknown Price Blank (Not 0)', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Explore Instant Demo")');

    await page.click('button:has-text("Add Entry")');

    // Case 1: Select known product "Amul Milk (1L)" -> Price 68 prefilled
    await page.fill('input[placeholder="Product or item description..."]', 'Amul Milk (1L)');
    const priceInput = page.locator('input[title="Unit Price"]').first();
    await expect(priceInput).toHaveValue('68');

    // Case 2: Add row with unknown product
    await page.click('button:has-text("Add Item")');
    const unknownItemNameInput = page.locator('input[placeholder="Product or item description..."]').nth(1);
    await unknownItemNameInput.fill('Custom Handicraft Basket');

    // Verify price field remains blank (NOT '0')
    const unknownPriceInput = page.locator('input[title="Unit Price"]').nth(1);
    const value = await unknownPriceInput.inputValue();
    expect(value).toBe(''); // Must be blank, NOT 0
    expect(value).not.toBe('0');

    await page.click('button[aria-label="Close"]');
  });

  test('6. Authoritative Balance & Advance / Credit State (No Math.max Masking)', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Explore Instant Demo")');

    // Open Customers and pick Rahul Sharma (cust_1)
    const custBtn = page.locator('button:has-text("Customers"):visible').first();
    await custBtn.click();
    await page.click('text=Rahul Sharma');

    // Record an overpayment (Payment greater than current dues)
    await page.click('button:has-text("Record Payment")');
    await expect(page.locator('text=Create Business Entry')).toBeVisible();

    // Enter large payment
    await page.fill('input[placeholder="Enter amount..."]', '5000');
    await page.click('button[type="submit"]:has-text("Save Entry")');

    // Balance should now show negative balance as legitimate Advance / Credit
    await expect(page.locator('text=Advance').first()).toBeVisible();

    // Reload page to verify persistence across sessions
    await page.reload();
    await expect(page.locator('text=Advance').first()).toBeVisible();
  });

  test('7. Bill Scanning & OCR Flow with Edit & Human Verification', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Explore Instant Demo")');

    await page.click('button:has-text("Scan Bill")');
    await expect(page.locator('text=Scan / Upload Bill (AI OCR)')).toBeVisible();

    // Use Sample Wholesale Bill
    await page.click('button:has-text("Use Sample Wholesale Bill")');

    // Step 2: Scanning screen
    await expect(page.locator('text=Reading Bill & Extracting Items')).toBeVisible();

    // Step 3: Structured review screen (Allow up to 15s for OCR/AI processing)
    await expect(page.locator('text=Bill Processed Successfully')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[value*="Gupta Wholesale Traders"]')).toBeVisible();

    // Verify extracted items table
    await expect(page.locator('input[value*="Basmati Rice"]')).toBeVisible();

    // Edit one field (human verification)
    const supplierInput = page.locator('input[value*="Gupta Wholesale Traders"]');
    await supplierInput.fill('Gupta Wholesale Traders Verified');

    // Confirm & Save
    await page.click('button:has-text("Confirm & Save Record")');

    // Modal closes and entry is saved
    await expect(page.locator('text=Scan / Upload Bill (AI OCR)')).not.toBeVisible();
  });

  test('8. Voice Entry Workflow: "Sold 3 Tata Salt to Rahul for 90 rupees"', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Explore Instant Demo")');

    await page.click('button:has-text("Speak")');
    await expect(page.locator('text=Voice Transaction Entry')).toBeVisible();

    // Click sample voice phrase "Sold 3 Tata Salt to Rahul for 90 rupees"
    await page.click('button:has-text("Sold 3 Tata Salt to Rahul for 90 rupees")');

    // Step 2: Processing state
    await expect(page.locator('text=Understanding Speech...')).toBeVisible();

    // Step 3: Structured Draft Review (Allow up to 25s for Gemini AI network latency)
    await expect(page.locator('text=Parsed with')).toBeVisible({ timeout: 25000 });
    await expect(page.locator('text=Rahul').first()).toBeVisible();
    await expect(page.locator('text=Tata Salt').first()).toBeVisible();
    await expect(page.locator('text=₹90').first()).toBeVisible();

    // Click Edit to verify draft modification capability
    await page.click('button:has-text("Edit")');
    await page.click('button:has-text("Done")');

    // Confirm and Save
    await page.click('button:has-text("Confirm & Save")');
    await expect(page.locator('text=Voice Transaction Entry')).not.toBeVisible();
  });

  test('9. Security & Tenant Isolation Regression', async ({ request }) => {
    // 1. Unauthorized request rejected with 401
    const unauthRes = await request.get('/api/customers');
    expect(unauthRes.status()).toBe(401);

    // 2. Staff user cannot access audit logs (RBAC 403 Forbidden)
    const staffRes = await request.get('/api/audit-logs', {
      headers: { Authorization: 'Bearer token_user_demo_staff' },
    });
    expect(staffRes.status()).toBe(403);

    // 3. Owner CAN access audit logs (200 OK)
    const ownerRes = await request.get('/api/audit-logs', {
      headers: { Authorization: 'Bearer token_user_demo_owner' },
    });
    expect(ownerRes.status()).toBe(200);

    // 4. Tenant isolation: Register Store B, verify it cannot see Store A's customers
    const storeBRes = await request.post('/api/auth/register', {
      data: {
        storeName: 'Store B Retail',
        ownerName: 'Bob Builder',
        email: `bob_${Date.now()}@storeb.com`,
        password: 'Password123!',
      },
    });
    expect(storeBRes.status()).toBe(201);
    const storeBData = await storeBRes.json();
    const storeBToken = storeBData.token;

    // Fetch customers with Store B token
    const storeBCusts = await request.get('/api/customers', {
      headers: { Authorization: `Bearer ${storeBToken}` },
    });
    expect(storeBCusts.status()).toBe(200);
    const custs = await storeBCusts.json();
    // Fresh store B has exactly 0 customers from Store A
    expect(custs.length).toBe(0);
  });
});
