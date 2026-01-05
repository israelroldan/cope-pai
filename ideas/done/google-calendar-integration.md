# Google Calendar Integration Plan (Work)

**Created:** 2026-01-04
**Purpose:** Access Israel's work calendar via Google Calendar API

---

## Background

Google Calendar is used for work scheduling. This integration enables querying meetings, creating events, checking availability, and managing calendar operations through Claude.

---

## Integration Options

### Option 1: MCP Server (Recommended)

Multiple MCP servers available. **nspady/google-calendar-mcp** is the most mature (800+ stars).

#### Installation via NPX (Easiest)

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["@cocal/google-calendar-mcp"],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "/path/to/gcp-oauth.keys.json"
      }
    }
  }
}
```

#### Installation via Local Clone

```bash
git clone https://github.com/nspady/google-calendar-mcp.git
cd google-calendar-mcp
npm install
npm run build
```

Config:
```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "node",
      "args": ["/path/to/google-calendar-mcp/dist/index.js"],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "/path/to/gcp-oauth.keys.json"
      }
    }
  }
}
```

#### Installation via Docker

```bash
cd google-calendar-mcp
docker compose up
```

#### Available MCP Tools

| Tool | Purpose |
|------|---------|
| `list-calendars` | Display all available calendars |
| `list-events` | Retrieve events with date filtering |
| `create-event` | Add new calendar entries |
| `update-event` | Modify existing events |
| `delete-event` | Remove calendar entries |
| `search-events` | Find events by text query |
| `respond-to-event` | Accept/decline invitations |
| `get-freebusy` | Check availability across calendars |
| `manage-accounts` | Add/remove Google accounts |

#### Features

- Multi-account support
- Multi-calendar support
- Cross-account conflict detection
- Recurring events
- Natural language scheduling
- Import from images, PDFs, or web links

---

### Option 2: Google Calendar REST API

Direct API integration for custom workflows.

#### API Details

```
Base URL: https://www.googleapis.com/calendar/v3
Authentication: OAuth 2.0
```

#### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/calendars/{calendarId}/events` | List events |
| POST | `/calendars/{calendarId}/events` | Create event |
| PUT | `/calendars/{calendarId}/events/{eventId}` | Update event |
| DELETE | `/calendars/{calendarId}/events/{eventId}` | Delete event |
| GET | `/freeBusy` | Query free/busy |
| GET | `/users/me/calendarList` | List user's calendars |

#### Example: List Events

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2026-01-01T00:00:00Z&maxResults=10"
```

#### Example Response

```json
{
  "kind": "calendar#events",
  "items": [
    {
      "id": "event123",
      "summary": "Team Standup",
      "start": {"dateTime": "2026-01-04T09:00:00-08:00"},
      "end": {"dateTime": "2026-01-04T09:30:00-08:00"},
      "attendees": [
        {"email": "colleague@company.com", "responseStatus": "accepted"}
      ]
    }
  ]
}
```

---

## Setup Steps

### For MCP Server (Recommended)

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project or select existing
   - Enable "Google Calendar API"

2. **Create OAuth 2.0 Credentials**
   - Navigate to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Select "Desktop app" as application type
   - Download JSON credentials file
   - Save as `gcp-oauth.keys.json`

3. **Configure OAuth Consent Screen**
   - Set up OAuth consent screen
   - Add your email as a test user (required for unverified apps)

4. **Configure Claude Code**
   - Add MCP server config (see installation options above)
   - Set `GOOGLE_OAUTH_CREDENTIALS` path to your credentials file

5. **Authenticate**
   - First run will open browser for OAuth consent
   - Grant calendar access permissions
   - Token stored for future sessions

6. **Test Integration**
   - Ask: "What's on my calendar today?"
   - Ask: "Schedule a meeting with Bob tomorrow at 2pm"

### For Custom Skill (REST API)

1. **Create Service Account** (for server-to-server)
   - Or use OAuth 2.0 for user context

2. **Store Credentials**
   ```bash
   echo "GOOGLE_CALENDAR_CLIENT_ID=xxx" >> $PAI_DIR/.env
   echo "GOOGLE_CALENDAR_CLIENT_SECRET=xxx" >> $PAI_DIR/.env
   ```

3. **Implement OAuth Flow**
   - Handle token refresh
   - Store refresh tokens securely

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_OAUTH_CREDENTIALS` | Path to OAuth credentials JSON |
| `GOOGLE_CALENDAR_MCP_TOKEN_PATH` | Custom token storage location (optional) |

---

## Recommendation

**Use the MCP Server** because:
- OAuth flow handled automatically
- Multi-account support built-in
- Rich feature set (free/busy, recurring events)
- Active maintenance (800+ stars)
- Natural language queries work out of the box

---

## Alternative MCP Servers

| Server | Notes |
|--------|-------|
| [nspady/google-calendar-mcp](https://github.com/nspady/google-calendar-mcp) | Most popular, full-featured |
| [takumi0706/google-calendar-mcp](https://github.com/takumi0706/google-calendar-mcp) | Enhanced security focus |
| [guinacio/mcp-google-calendar](https://github.com/guinacio/mcp-google-calendar) | Simpler implementation |

---

## Sources

- [nspady/google-calendar-mcp](https://github.com/nspady/google-calendar-mcp)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [MCP Market - Google Calendar](https://mcpmarket.com/server/google-calendar-5)
- [Activepieces MCP Tutorial](https://www.activepieces.com/blog/connecting-claude-to-google-calendar-with-mcp)
