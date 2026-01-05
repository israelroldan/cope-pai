# iCloud Calendar Integration Plan (Personal)

**Created:** 2026-01-04
**Purpose:** Access Israel's personal/shared iCloud calendars

---

## Background

iCloud Calendar is used for personal scheduling and shared family calendars. Unlike Google, Apple does not provide a REST API—integration requires CalDAV protocol or native macOS Calendar access.

---

## Integration Options

### Option 1: mcp-ical (macOS Native) - Recommended for Local Use

Leverages macOS Calendar app directly. Works with any calendar synced to macOS (iCloud, Google, Exchange).

#### Installation

```bash
git clone https://github.com/Omar-V2/mcp-ical.git
cd mcp-ical
uv sync
```

#### Configuration

Edit `~/.claude/settings.json` or Claude Desktop config:

```json
{
  "mcpServers": {
    "mcp-ical": {
      "command": "uv",
      "args": ["--directory", "/path/to/mcp-ical", "run", "mcp-ical"]
    }
  }
}
```

#### First Run (Important)

Must launch Claude from terminal to trigger macOS calendar permission prompt:

```bash
/Applications/Claude.app/Contents/MacOS/Claude
```

Direct Finder launch will NOT request permissions.

#### Available Tools

| Tool | Purpose |
|------|---------|
| Create events | With calendar selection, location, notes, reminders, recurrence |
| Update events | Modify time, date, calendar, location, reminders |
| Query events | View upcoming events, find free time slots |
| List calendars | View all available calendars |
| Availability check | Analyze calendar for scheduling gaps |

#### Pros
- Native macOS integration
- Works with ALL synced calendars (iCloud, Google, Exchange)
- No app-specific passwords needed
- Full access to shared/family calendars

#### Cons
- macOS only
- Requires terminal launch for permissions
- Some recurring event limitations

---

### Option 2: CalDAV MCP Server (Cross-Platform)

Direct CalDAV protocol access to iCloud servers.

#### Installation

```bash
npx caldav-mcp
```

Or use [dav-mcp](https://github.com/philflowio/dav-mcp) for more features.

#### Configuration

```json
{
  "mcpServers": {
    "caldav": {
      "command": "npx",
      "args": ["caldav-mcp"],
      "env": {
        "CALDAV_BASE_URL": "https://caldav.icloud.com",
        "CALDAV_USERNAME": "your-apple-id@icloud.com",
        "CALDAV_PASSWORD": "xxxx-xxxx-xxxx-xxxx"
      }
    }
  }
}
```

#### App-Specific Password Setup

1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in → Security → App-Specific Passwords
3. Click "Generate App-Specific Password"
4. Label it "Claude Calendar" or similar
5. Copy the 16-character password (shown once)
6. Use this password in `CALDAV_PASSWORD`

#### Pros
- Cross-platform (works on Linux, Windows)
- Direct iCloud access
- No macOS dependency

#### Cons
- Requires app-specific password management
- CalDAV quirks (XML-based, not all methods work reliably)
- More complex error handling

---

### Option 3: iCloud MCP Server (Full iCloud Suite)

Provides calendar, contacts, and email access.

#### Configuration

```json
{
  "mcpServers": {
    "icloud": {
      "command": "npx",
      "args": ["icloud-mcp"],
      "env": {
        "ICLOUD_USERNAME": "your-apple-id@icloud.com",
        "ICLOUD_PASSWORD": "xxxx-xxxx-xxxx-xxxx"
      }
    }
  }
}
```

---

### Option 4: Custom CalDAV Skill (REST-like Wrapper)

Build a PAI skill using the `tsdav` library.

#### CalDAV Details

```
Server URL: https://caldav.icloud.com
Authentication: Basic Auth (Base64 encoded)
Format: iCalendar (.ics)
```

#### Supported Operations

| Method | Purpose |
|--------|---------|
| PROPFIND | List calendars and properties |
| REPORT | Query calendar data |
| PUT | Create/update events (full VCALENDAR) |
| DELETE | Remove events |
| GET | Fetch individual events |

#### Code Example (tsdav)

```typescript
import { DAVClient } from "tsdav";

const client = new DAVClient({
  serverUrl: "https://caldav.icloud.com",
  credentials: {
    username: process.env.ICLOUD_EMAIL,
    password: process.env.ICLOUD_APP_PASSWORD,
  },
  authMethod: "Basic",
  defaultAccountType: "caldav",
});

// Fetch all calendars
const calendars = await client.fetchCalendars();

// Fetch events from a calendar
const events = await client.fetchCalendarObjects({
  calendar: calendars[0],
  timeRange: {
    start: "2026-01-01T00:00:00Z",
    end: "2026-01-31T23:59:59Z",
  },
});
```

#### Required Libraries

```json
{
  "dependencies": {
    "tsdav": "^2.0.0",
    "ical-generator": "^4.0.0",
    "ical.js": "^1.5.0"
  }
}
```

---

## Setup Steps

### For mcp-ical (Recommended on macOS)

1. **Install uv package manager**
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Clone and setup**
   ```bash
   git clone https://github.com/Omar-V2/mcp-ical.git
   cd mcp-ical
   uv sync
   ```

3. **Configure Claude Code**
   - Add MCP server config with correct path

4. **Grant Permissions**
   - Launch Claude from terminal (required!)
   - Accept calendar permission prompt

5. **Test Integration**
   - Ask: "What's on my personal calendar this week?"
   - Ask: "Create a reminder for Saturday at 10am"

### For CalDAV MCP (Cross-Platform)

1. **Generate App-Specific Password**
   - Go to appleid.apple.com → Security
   - Generate and save password

2. **Store Credentials**
   ```bash
   echo "ICLOUD_EMAIL=your@icloud.com" >> $PAI_DIR/.env
   echo "ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx" >> $PAI_DIR/.env
   ```

3. **Configure MCP Server**
   - Add caldav-mcp or dav-mcp config

4. **Test Connection**
   - List calendars to verify auth works

---

## Shared Calendar Considerations

iCloud shared/family calendars work with both options:

- **mcp-ical**: Sees all calendars synced to macOS Calendar app
- **CalDAV**: Can access shared calendars if they appear in your CalDAV principal

To verify shared calendar access:
```
Ask: "List all my calendars"
```

Shared calendars should appear with names like "Family" or the sharer's name.

---

## Recommendation

| Scenario | Recommendation |
|----------|----------------|
| macOS only, all calendars synced | **mcp-ical** - simplest, native integration |
| Cross-platform or server deployment | **CalDAV MCP** - direct iCloud access |
| Need contacts + email too | **iCloud MCP** - full suite |

**For Israel's use case (personal + shared calendars on macOS):**
→ Start with **mcp-ical** for the smoothest experience

---

## Known Limitations

### mcp-ical
- Non-standard recurring schedules may not configure correctly
- All-day event reminder timing may be offset
- Requires terminal launch for initial permissions

### CalDAV
- No REST API (XML-based protocol)
- Some CalDAV methods don't work reliably with iCloud
- Requires app-specific password rotation if compromised

---

## Sources

- [mcp-ical GitHub](https://github.com/Omar-V2/mcp-ical)
- [How to integrate iCloud Calendar API](https://www.onecal.io/blog/how-to-integrate-icloud-calendar-api-into-your-app)
- [Demystifying CalDAV](https://www.aurinko.io/blog/caldav-apple-calendar-integration/)
- [Apple CalDAV Documentation](https://developer.apple.com/documentation/devicemanagement/caldav)
- [dav-mcp](https://lobehub.com/mcp/philflowio-dav-mcp)
- [CalDAV MCP](https://mcpservers.org/servers/dominik1001/caldav-mcp)
