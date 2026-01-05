# Magister Integration Plan (Daughter's School Schedule)

**Created:** 2026-01-04
**Purpose:** Access daughter's school roster from Magister for drop-off/pick-up scheduling

---

## Background

Magister is a Dutch school management system used widely in the Netherlands. Israel needs to check his daughter's schedule almost daily to know drop-off/pick-up times. Magister doesn't have an official public API, but there are several approaches to access the data.

---

## TL;DR - Recommended Approach

1. **First, check if native iCal export is enabled** (easiest, official)
2. **If not, use Magical tool** (third-party iCal generator)
3. **For automation, use Home Assistant integration**

---

## Option 1: Native "Agenda Delen" (BEST - Check First!)

Magister has a **built-in iCal export feature** called "Agenda delen" (Share Calendar). If your daughter's school has enabled it:

### How to Check/Enable

1. **Log into Magister web** (not the app - feature not in app yet)
2. Click profile photo → **Instellingen** (Settings)
3. Look for **"Agenda delen"** option
4. If present → Generate iCalendar link

### If Available

The iCal link syncs:
- Current week + next 2 weeks
- Updates automatically on schedule changes

### Add to Your Calendars

**Apple Calendar (iPhone/Mac):**
```
Settings → Calendar → Accounts → Add Subscription
Paste the webcal:// link
```

**Google Calendar:**
```
Settings → Add calendar → From URL
Paste the link
```

**iCloud Calendar (syncs everywhere):**
- Add via macOS Calendar app
- Auto-syncs to all Apple devices

### Limitations

- Only 3 weeks ahead
- Paused during summer vacation
- School must have enabled the feature
- No detailed info (just times/availability)

### If NOT Available

The school admin hasn't enabled it. You could:
1. Request they enable it (legitimate feature request)
2. Use one of the alternatives below

---

## Option 2: Magical (Third-Party iCal Generator)

**Website:** https://magical.harrydekat.dev/

A service that logs into Magister and generates an iCal feed with more features than native export.

### Features

- **4 weeks ahead** (vs 3 for native)
- Color-coded events (blue=homework, red=cancelled, green=completed)
- Custom event titles with variables
- Personal notes on events
- Multiple reminders
- Toggle visibility of different event types

### Setup

1. Visit https://magical.harrydekat.dev/
2. Enter your school's Magister domain
3. Log in with your credentials
4. Configure visibility settings
5. Generate iCal link
6. Add to your calendar app

### Security

- Credentials encrypted with public key
- Only decryptable by their server
- Consider: you're trusting a third-party service

### Limitation

- Links over 255 chars may fail in Google/Apple Calendar
- Use URL shortener if needed

---

## Option 3: Home Assistant Integration

**Best for automation** (automatic notifications, dashboard display)

**GitHub:** https://github.com/OdynBrouwer/magister-school-integration

### Features

- 📅 Daily schedule and appointments
- 📊 Grades overview
- 📚 Homework & assignments
- ⚠️ Schedule changes
- 👨‍👩‍👧‍👦 Multi-child support (parent accounts)
- 🔄 Automatic updates
- 🎨 Lovelace card for dashboard

### Installation (via HACS)

1. HACS → Integrations → Custom repositories
2. Add: `https://github.com/OdynBrouwer/magister-school-integration`
3. Category: Integration
4. Install and restart Home Assistant
5. Add integration with Magister credentials

### Automation Ideas

```yaml
# Notify when schedule changes
automation:
  - alias: "Magister Schedule Change Alert"
    trigger:
      - platform: state
        entity_id: sensor.magister_volgende_afspraak
    action:
      - service: notify.mobile_app
        data:
          message: "Schedule changed: {{ states('sensor.magister_volgende_afspraak') }}"

# Morning announcement of today's schedule
automation:
  - alias: "Morning School Schedule"
    trigger:
      - platform: time
        at: "07:00:00"
    action:
      - service: notify.mobile_app
        data:
          message: "Today's first class: {{ state_attr('sensor.magister_rooster', 'first_appointment') }}"
```

### Expose to Claude via MCP

Once in Home Assistant, you can expose sensors via Home Assistant MCP server.

---

## Option 4: Python CLI Tools

### magister-tool

**GitHub:** https://github.com/nlitsme/magister-tool

```bash
# Install
pip install requests python-dateutil

# Clone
git clone https://github.com/nlitsme/magister-tool.git
cd magister-tool

# Configure ~/.magisterrc
school=schoolname.magister.net
user=myloginname
pass=MySecretPassword

# Get roster
python magister.py --rooster
```

### magister-scraper

**GitHub:** https://github.com/Gertje823/magister-scraper

```bash
# Install
pip install -r requirements.txt

# Edit credentials in magister.py (lines 5-7)
# Run
python3 magister.py

# Output: JSON files for absenties, cijfers, rooster
```

---

## Option 5: Browser Automation (Fallback)

If all else fails, use Playwright/Puppeteer to automate the browser.

### Playwright Approach

```typescript
import { chromium } from 'playwright';

async function getMagisterSchedule() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to school's Magister
  await page.goto('https://schoolname.magister.net');

  // Login
  await page.fill('input[name="username"]', process.env.MAGISTER_USER);
  await page.fill('input[name="password"]', process.env.MAGISTER_PASS);
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForSelector('.agenda');

  // Extract schedule
  const schedule = await page.evaluate(() => {
    // Parse DOM for schedule data
    const items = document.querySelectorAll('.agenda-item');
    return Array.from(items).map(item => ({
      time: item.querySelector('.time')?.textContent,
      subject: item.querySelector('.subject')?.textContent,
      location: item.querySelector('.location')?.textContent,
    }));
  });

  await browser.close();
  return schedule;
}
```

### Run on Schedule

```bash
# Cron job to fetch daily at 6am
0 6 * * * cd /path/to/script && node getMagisterSchedule.js >> /var/log/magister.log
```

---

## Option 6: Build MCP Server

Wrap any of the above approaches in an MCP server for Claude access.

### Basic Structure

```typescript
// magister-mcp-server.ts
import { Server } from "@modelcontextprotocol/sdk/server";

const server = new Server({
  name: "magister",
  version: "1.0.0",
});

server.tool("get_schedule", "Get daughter's school schedule", {
  date: { type: "string", description: "Date (YYYY-MM-DD) or 'today', 'tomorrow', 'week'" }
}, async ({ date }) => {
  // Use one of the methods above to fetch schedule
  const schedule = await fetchMagisterSchedule(date);
  return { schedule };
});

server.tool("get_next_class", "Get next upcoming class", {}, async () => {
  const next = await fetchNextClass();
  return {
    time: next.time,
    subject: next.subject,
    location: next.location
  };
});
```

---

## Recommended Implementation Path

### Step 1: Check Native iCal (5 minutes)

1. Log into Magister web
2. Settings → Look for "Agenda delen"
3. If available → Generate link, add to iCloud Calendar
4. **Done!** Schedule syncs to all your Apple devices

### Step 2: If No Native Option

**For passive sync (calendar only):**
→ Use Magical tool (https://magical.harrydekat.dev/)

**For active automation:**
→ Set up Home Assistant integration

**For Claude integration:**
→ Build MCP server wrapping magister-tool or Playwright

### Step 3: Claude Integration

Once you have data flowing (via any method):

```json
{
  "mcpServers": {
    "magister": {
      "command": "node",
      "args": ["/path/to/magister-mcp-server/dist/index.js"],
      "env": {
        "MAGISTER_SCHOOL": "schoolname",
        "MAGISTER_USER": "${MAGISTER_USER}",
        "MAGISTER_PASS": "${MAGISTER_PASS}"
      }
    }
  }
}
```

Then ask:
- "What time does [daughter] start school tomorrow?"
- "When should I pick her up today?"
- "Does she have early dismissal this week?"

---

## Environment Variables

```bash
# Add to $PAI_DIR/.env
MAGISTER_SCHOOL=schoolname.magister.net
MAGISTER_USER=your-username
MAGISTER_PASS=your-password
```

---

## Security Considerations

1. **Credential Storage**
   - Never commit credentials to git
   - Use environment variables or secure config

2. **Third-Party Services**
   - Magical tool requires trusting their service
   - Native iCal is safest (official Magister feature)

3. **Session Tokens**
   - API libraries use session tokens that expire
   - Browser automation may trigger security alerts

4. **School Policy**
   - Check if automated access violates terms of service
   - Native iCal export is officially supported

---

## Comparison of Approaches

| Approach | Effort | Real-time | Claude Integration | Notes |
|----------|--------|-----------|-------------------|-------|
| Native iCal | ⭐ Easy | ~15 min delay | Via calendar MCP | Best if available |
| Magical | ⭐ Easy | ~15 min delay | Via calendar MCP | 4 weeks ahead |
| Home Assistant | ⭐⭐ Medium | ~5 min | Via HA MCP | Best for automation |
| Python tools | ⭐⭐ Medium | On-demand | Custom MCP | Full control |
| Browser automation | ⭐⭐⭐ Hard | On-demand | Custom MCP | Most flexible |

---

## Quick Win: Calendar-Based Solution

If native iCal works, the simplest path:

1. Enable "Agenda delen" in Magister
2. Add iCal to iCloud Calendar
3. Use existing iCloud Calendar MCP (from your other plan)
4. Ask Claude: "What's on [daughter]'s school calendar tomorrow?"

This avoids building any custom integration!

---

## Sources

- [Magister Agenda Delen Documentation](https://service.magister.nl/support/solutions/articles/101000454943-agenda-delen)
- [Magical - Magister naar iCalendar](https://magical.harrydekat.dev/)
- [Home Assistant Magister Integration](https://github.com/OdynBrouwer/magister-school-integration)
- [magister-tool (Python)](https://github.com/nlitsme/magister-tool)
- [magister-scraper](https://github.com/Gertje823/magister-scraper)
- [magister-api (Node.js)](https://github.com/idiidk/magister-api)
- [magister-calendar (Google Sync)](https://www.npmjs.com/package/magister-calendar)
