# Financial Integration Plan

**Created:** 2026-01-04
**Purpose:** Build a financial literacy coach agent + integrate with ABN AMRO, Bunq, and ICS for real-time financial visibility

---

## Overview

This plan covers two interconnected goals:

1. **Bank Integrations** - Connect to ABN AMRO, Bunq, and ICS for transaction data
2. **Financial Coach Agent** - Specialized AI agent for financial literacy and guidance

---

## TL;DR - Reality Check

| Bank | Direct API for Personal Use? | Best Approach |
|------|------------------------------|---------------|
| **Bunq** | ✅ YES - Generate API key in app | Direct API integration |
| **ABN AMRO** | ❌ NO - PSD2 requires TPP license | Export CSV/MT940 or use aggregator |
| **ICS** | ❌ NO - PSD2 requires TPP license | Export CSV or use aggregator |

**The honest truth:** Without a PSD2 Third Party Provider (TPP) license from DNB (Dutch National Bank), you cannot directly access ABN AMRO or ICS APIs. However, there are practical workarounds.

---

## Part 1: Bank Integrations

### Bank 1: Bunq (BEST - Full API Access)

Bunq is the **only bank where you can get direct personal API access** without being a licensed TPP.

#### Getting Your API Key

1. Open **bunq app**
2. Go to **Settings** → **Developers**
3. Select **API keys**
4. Click **Add API key**
5. **Activate within 1 hour** (or it expires)

#### Security Warning

> "Guard your API key carefully, as it provides access to sensitive financial information similar to actual banking details."

You can revoke the key anytime from the app if compromised.

#### Available Operations (300+ endpoints)

| Category | Operations |
|----------|------------|
| **Accounts** | List accounts, balances, details |
| **Transactions** | List payments, filter by date, search |
| **Payments** | Initiate transfers (careful!) |
| **Cards** | Card info, transactions |
| **Webhooks** | Real-time notifications |

#### Python SDK Example

```python
from bunq.sdk.context import ApiContext, BunqContext
from bunq.sdk.model.generated import endpoint

# First time: create context
api_context = ApiContext.create(
    environment_type=ApiEnvironmentType.PRODUCTION,
    api_key="YOUR_API_KEY",
    device_description="Cope Financial Agent"
)
api_context.save("bunq.conf")

# Load context
api_context = ApiContext.restore("bunq.conf")
BunqContext.load_api_context(api_context)

# Get all monetary accounts
accounts = endpoint.MonetaryAccountBank.list().value

# Get transactions for an account
payments = endpoint.Payment.list(
    monetary_account_id=accounts[0].id_
).value

for payment in payments:
    print(f"{payment.created}: {payment.amount.value} {payment.amount.currency}")
    print(f"  {payment.description}")
```

#### Webhooks for Real-Time Updates

```python
# Register webhook for payment notifications
endpoint.NotificationFilterUrlMonetaryAccount.create(
    monetary_account_id=account_id,
    notification_filters=[
        NotificationFilterUrl(
            category="PAYMENT",
            notification_target="https://your-server.com/bunq-webhook"
        )
    ]
)
```

#### MCP Server for Bunq

```typescript
// bunq-mcp-server.ts
import { Server } from "@modelcontextprotocol/sdk/server";
import BunqClient from "bunq-js-client";

const server = new Server({ name: "bunq", version: "1.0.0" });

server.tool("get_balance", "Get current Bunq account balance", {}, async () => {
  const accounts = await bunqClient.api.monetaryAccountBank.list();
  return accounts.map(a => ({
    name: a.description,
    balance: a.balance.value,
    currency: a.balance.currency
  }));
});

server.tool("get_transactions", "Get recent Bunq transactions", {
  days: { type: "number", description: "Days back to fetch", default: 30 }
}, async ({ days }) => {
  const payments = await bunqClient.api.payment.list(accountId);
  return payments.map(p => ({
    date: p.created,
    amount: p.amount.value,
    description: p.description,
    counterparty: p.counterparty_alias?.display_name
  }));
});

server.tool("categorize_spending", "Analyze spending by category", {
  month: { type: "string", description: "Month (YYYY-MM)" }
}, async ({ month }) => {
  // Fetch and categorize transactions
  const transactions = await getMonthTransactions(month);
  return categorizeTransactions(transactions);
});
```

---

### Bank 2: ABN AMRO (Manual Export or Aggregator)

ABN AMRO's PSD2 APIs require TPP registration with DNB. For personal use:

#### Option A: Manual CSV/MT940 Export

**Supported formats:** XLS, PDF, TXT, MT940, CAMT.053

**How to export:**
1. Log into ABN AMRO Internet Banking
2. Go to Transactions
3. Select date range (up to 18 months back)
4. Choose format (MT940 or CSV recommended)
5. Download

**Automate with browser automation:**

```python
# Using Playwright to automate ABN AMRO export
from playwright.sync_api import sync_playwright
import os

def download_abn_transactions():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to ABN AMRO
        page.goto("https://www.abnamro.nl/portalserver/my-abnamro/")

        # Login (requires PIN login enabled)
        page.fill('input[name="cardNumber"]', os.environ['ABN_CARD'])
        page.fill('input[name="pin"]', os.environ['ABN_PIN'])
        page.click('button[type="submit"]')

        # Navigate to downloads
        page.wait_for_selector('.transactions')
        page.click('text=Download')

        # Select MT940 format and date range
        page.select_option('select[name="format"]', 'MT940')

        # Download
        with page.expect_download() as download_info:
            page.click('button[text="Download"]')
        download = download_info.value
        download.save_as(f"abn_transactions_{date.today()}.mt940")

        browser.close()
```

#### Option B: Use Nordigen (Free for Personal Use)

Nordigen (now GoCardless Bank Account Data) offers **free personal account access** for PSD2 banks.

```python
from nordigen import NordigenClient

client = NordigenClient(
    secret_id=os.environ["NORDIGEN_SECRET_ID"],
    secret_key=os.environ["NORDIGEN_SECRET_KEY"]
)

# Get access token
token = client.generate_token()

# Find ABN AMRO
institutions = client.institution.get_institutions(country="NL")
abn_amro = next(i for i in institutions if "ABN" in i["name"])

# Create requisition (user must authorize in browser)
requisition = client.requisition.create_requisition(
    redirect_uri="http://localhost:3000/callback",
    institution_id=abn_amro["id"]
)

# After user authorizes, get account data
accounts = client.requisition.get_requisition_by_id(requisition["id"])
account_id = accounts["accounts"][0]

# Get transactions
transactions = client.account_api(account_id).get_transactions()
```

**Note:** User must re-authorize every 90 days (PSD2 requirement).

---

### Bank 3: ICS Credit Card (Manual Export or Aggregator)

Same situation as ABN AMRO - PSD2 API requires TPP license.

#### Option A: Manual PDF/CSV Export

1. Log into ICS Online
2. Go to Transactions/Statements
3. Download PDF statements
4. Parse with tool (see below)

**PDF Parser for ICS:**

```python
# Using abn2csv tool for ICS PDF parsing
# https://github.com/vgalaktionov/abn2csv

import subprocess
import json

def parse_ics_pdf(pdf_path):
    result = subprocess.run(
        ["abn2csv", pdf_path],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)
```

#### Option B: Nordigen/GoCardless

ICS is also available through Nordigen for transaction access.

---

### Unified Data Layer

Create a unified interface across all banks:

```python
# financial_data.py
from dataclasses import dataclass
from datetime import datetime
from typing import List
from enum import Enum

class TransactionCategory(Enum):
    GROCERIES = "groceries"
    RESTAURANTS = "restaurants"
    TRANSPORT = "transport"
    UTILITIES = "utilities"
    SUBSCRIPTIONS = "subscriptions"
    ENTERTAINMENT = "entertainment"
    HEALTHCARE = "healthcare"
    SHOPPING = "shopping"
    INCOME = "income"
    TRANSFER = "transfer"
    OTHER = "other"

@dataclass
class Transaction:
    id: str
    date: datetime
    amount: float
    currency: str
    description: str
    counterparty: str
    bank: str  # "bunq", "abn_amro", "ics"
    account: str
    category: TransactionCategory = None

@dataclass
class Account:
    id: str
    bank: str
    name: str
    balance: float
    currency: str
    type: str  # "checking", "savings", "credit"

class FinancialDataHub:
    """Unified interface for all bank data"""

    def __init__(self):
        self.bunq = BunqClient()
        self.abn_importer = ABNImporter()
        self.ics_importer = ICSImporter()

    def get_all_accounts(self) -> List[Account]:
        accounts = []
        accounts.extend(self.bunq.get_accounts())
        accounts.extend(self.abn_importer.get_accounts())
        accounts.extend(self.ics_importer.get_accounts())
        return accounts

    def get_all_transactions(self, start_date, end_date) -> List[Transaction]:
        transactions = []
        transactions.extend(self.bunq.get_transactions(start_date, end_date))
        transactions.extend(self.abn_importer.get_transactions(start_date, end_date))
        transactions.extend(self.ics_importer.get_transactions(start_date, end_date))
        return sorted(transactions, key=lambda t: t.date, reverse=True)

    def get_total_balance(self) -> dict:
        accounts = self.get_all_accounts()
        return {
            "checking": sum(a.balance for a in accounts if a.type == "checking"),
            "savings": sum(a.balance for a in accounts if a.type == "savings"),
            "credit_available": sum(a.balance for a in accounts if a.type == "credit"),
            "net_worth": sum(a.balance for a in accounts)
        }
```

---

## Part 2: Financial Coach Agent

### Agent Purpose

A specialized AI agent that serves as a **financial literacy coach** - helping you:
- Understand your spending patterns
- Build better financial habits
- Make informed decisions
- Track progress toward goals
- Learn financial concepts

### Agent Personality & Approach

```yaml
name: "Finance Coach"
role: "Personal Financial Literacy Coach"

personality:
  tone: "Supportive but honest - like a good coach"
  approach: "Educational, not judgmental"
  style: "Ask questions to understand context before advising"

principles:
  - Never shame about past decisions
  - Focus on actionable next steps
  - Explain the 'why' behind recommendations
  - Celebrate small wins
  - Use concrete numbers, not vague advice
```

### Agent Capabilities

#### 1. Financial Snapshot

```markdown
## Daily/Weekly Snapshot

When user asks "How am I doing financially?":

1. Pull current balances from all accounts
2. Calculate net position
3. Show recent spending vs budget
4. Highlight any concerns
5. Note positive trends

Example response:
"Here's your financial snapshot as of today:

💰 **Net Position: €12,450**
- Checking (Bunq): €3,200
- Savings (ABN): €8,500
- Credit Card (ICS): -€1,250 (due in 12 days)

📊 **This Month's Spending: €2,340 of €3,000 budget**
- 78% through budget, 65% through month ✅
- Groceries: €420 (on track)
- Restaurants: €380 (⚠️ 90% of monthly budget used)

🎯 **Goals Progress:**
- Emergency fund: €8,500/€10,000 (85%)
- Vacation fund: €1,200/€2,000 (60%)"
```

#### 2. Transaction Analysis

```markdown
## Spending Analysis

When user asks about spending:

1. Categorize transactions automatically
2. Compare to previous periods
3. Identify patterns and anomalies
4. Provide insights, not judgments

Categories:
- 🏠 Housing (rent, utilities, insurance)
- 🛒 Groceries
- 🍽️ Restaurants & Takeout
- 🚗 Transport (fuel, OV, parking)
- 📱 Subscriptions
- 🎬 Entertainment
- 👕 Shopping
- 💊 Healthcare
- 💰 Savings/Investments
- ↔️ Transfers
```

#### 3. Budget Coaching

```markdown
## Budget Management

Help user create and maintain budgets:

1. Analyze historical spending to suggest realistic budgets
2. Track progress throughout the month
3. Warn before overspending
4. Suggest adjustments based on patterns

Example interaction:
User: "I keep overspending on food"

Coach: "Let's look at your food spending pattern:

Last 3 months average:
- Groceries: €380/month
- Restaurants: €420/month
- Delivery apps: €180/month
Total: €980/month

Your current budget is €600. That's quite a gap.

Options:
1. **Realistic budget**: Set €900 (allows gradual reduction)
2. **Aggressive but achievable**: €750 (cut delivery by 50%)
3. **Keep €600**: Need specific strategy

Which feels right for you? I can help plan whichever you choose."
```

#### 4. Financial Education

```markdown
## Learning Mode

When user has questions about financial concepts:

Topics the coach can explain:
- Compound interest and why it matters
- Emergency funds - how much is enough
- Debt payoff strategies (avalanche vs snowball)
- Investment basics (index funds, diversification)
- Dutch-specific: toeslagen, hypotheek, pensioen
- Credit card best practices
- Savings rate and financial independence

Approach:
- Use user's own numbers as examples
- Relate to their specific situation
- Provide actionable takeaways
```

#### 5. Goal Tracking

```markdown
## Financial Goals

Help set and track SMART financial goals:

Goal types:
- Emergency fund (3-6 months expenses)
- Debt payoff
- Specific purchases (vacation, car, house)
- Investment targets
- Retirement planning

For each goal:
- Calculate required monthly savings
- Track progress
- Adjust based on changes
- Celebrate milestones
```

### Agent System Prompt

```markdown
# Financial Coach Agent System Prompt

You are a supportive financial literacy coach helping Israel manage his finances across three accounts: Bunq (daily banking), ABN AMRO (savings/primary), and ICS (credit card).

## Your Approach

1. **Be supportive, not judgmental** - Past financial decisions are learning opportunities, not failures.

2. **Use real data** - Always pull actual transaction data before giving advice. Don't guess.

3. **Educate while helping** - Explain the 'why' behind recommendations so the user learns.

4. **Be specific** - Use exact numbers, dates, and actionable steps. Avoid vague advice like "spend less."

5. **Ask before assuming** - Financial situations have context. Ask clarifying questions.

6. **Celebrate progress** - Acknowledge wins, even small ones. Building habits takes time.

## Available Tools

- `get_accounts()` - Get all account balances
- `get_transactions(start_date, end_date)` - Get transactions
- `categorize_transactions(transactions)` - Auto-categorize spending
- `get_spending_summary(period)` - Summarized spending by category
- `get_budget_status()` - Current budget vs actual
- `get_goals()` - Financial goals and progress
- `set_goal(name, target, deadline)` - Create new goal
- `get_recurring_expenses()` - Identify subscriptions/recurring charges
- `compare_periods(period1, period2)` - Compare spending between periods

## Response Format

When providing financial information:

1. Start with the key number/insight
2. Provide context (comparison, trend)
3. If concerning, explain why
4. End with actionable suggestion or question

## Privacy

- Never share financial data outside this conversation
- Don't make assumptions about income or wealth
- Respect that some questions may be sensitive

## Dutch Context

Remember Israel is in the Netherlands:
- Currency is EUR (€)
- Banks: Bunq, ABN AMRO, ICS
- Relevant: toeslagen, belastingaangifte, pensioen
- IBAN format for accounts
```

---

## Part 3: Implementation Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude / Cope                           │
│                  (Financial Coach Agent)                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ MCP Protocol
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  Finance MCP Server                         │
│                                                             │
│  Tools:                                                     │
│  - get_accounts()                                          │
│  - get_transactions()                                      │
│  - get_spending_summary()                                  │
│  - categorize_transaction()                                │
│  - get_budget_status()                                     │
│  - set_goal() / get_goals()                               │
│                                                             │
└──────────┬──────────────┬──────────────┬───────────────────┘
           │              │              │
     ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
     │   Bunq    │  │ ABN AMRO  │  │    ICS    │
     │   API     │  │  Import   │  │  Import   │
     │ (Direct)  │  │ (CSV/MT940)│  │  (CSV)    │
     └───────────┘  └───────────┘  └───────────┘
```

### Data Storage

```python
# Use SQLite for local transaction storage
# schema.sql

CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    bank TEXT NOT NULL,
    name TEXT,
    type TEXT,
    currency TEXT DEFAULT 'EUR',
    last_sync TIMESTAMP
);

CREATE TABLE transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT REFERENCES accounts(id),
    date TIMESTAMP NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    description TEXT,
    counterparty TEXT,
    category TEXT,
    auto_categorized BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE budgets (
    id INTEGER PRIMARY KEY,
    category TEXT NOT NULL,
    monthly_limit DECIMAL(10,2),
    start_date DATE,
    end_date DATE
);

CREATE TABLE goals (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    target_amount DECIMAL(10,2),
    current_amount DECIMAL(10,2) DEFAULT 0,
    deadline DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recurring_transactions (
    id INTEGER PRIMARY KEY,
    description_pattern TEXT,
    category TEXT,
    expected_amount DECIMAL(10,2),
    frequency TEXT,  -- 'monthly', 'weekly', 'yearly'
    last_seen TIMESTAMP
);
```

### Auto-Categorization

```python
# Simple rule-based categorization
CATEGORY_RULES = {
    "groceries": [
        "albert heijn", "ah ", "jumbo", "lidl", "aldi", "plus",
        "dirk", "coop", "spar", "ekoplaza"
    ],
    "restaurants": [
        "restaurant", "cafe", "eetcafe", "bistro", "pizzeria",
        "thuisbezorgd", "deliveroo", "uber eats"
    ],
    "transport": [
        "ns ", "ns.nl", "ov-chipkaart", "gvb", "ret", "htm",
        "shell", "bp ", "esso", "total", "parkeren"
    ],
    "utilities": [
        "vattenfall", "eneco", "essent", "greenchoice",
        "vitens", "waternet", "ziggo", "kpn", "t-mobile", "vodafone"
    ],
    "subscriptions": [
        "netflix", "spotify", "disney+", "amazon prime",
        "apple.com", "google storage", "dropbox", "notion"
    ],
    "healthcare": [
        "apotheek", "huisarts", "tandarts", "ziekenhuis",
        "cz", "zilveren kruis", "menzis", "vgz"
    ],
}

def categorize_transaction(description: str, amount: float) -> str:
    description_lower = description.lower()

    # Check rules
    for category, keywords in CATEGORY_RULES.items():
        if any(kw in description_lower for kw in keywords):
            return category

    # Income detection
    if amount > 0 and amount > 500:
        return "income"

    return "other"
```

---

## Part 4: Setup Steps

### Phase 1: Bunq Integration (Week 1)

1. **Generate API Key**
   - Open bunq app → Settings → Developers → API keys
   - Create and activate within 1 hour

2. **Store Securely**
   ```bash
   echo "BUNQ_API_KEY=your-key-here" >> $PAI_DIR/.env
   ```

3. **Test Connection**
   ```python
   from bunq.sdk.context import ApiContext, ApiEnvironmentType

   ctx = ApiContext.create(
       ApiEnvironmentType.PRODUCTION,
       os.environ["BUNQ_API_KEY"],
       "Cope Test"
   )
   print("Connected to Bunq!")
   ```

4. **Set Up Webhooks** (optional, for real-time)

### Phase 2: ABN AMRO Import (Week 1-2)

1. **Manual Export Process**
   - Document the export steps
   - Choose format (MT940 or CSV)

2. **Build Import Script**
   - Parse MT940/CSV files
   - Map to unified transaction format

3. **Optional: Nordigen Integration**
   - Register at GoCardless Bank Account Data
   - Connect ABN AMRO account
   - Note: Re-auth every 90 days

### Phase 3: ICS Import (Week 2)

1. **Export Statements**
   - Monthly PDF or CSV export

2. **Build Parser**
   - Parse ICS format
   - Extract transactions

### Phase 4: Financial Coach Agent (Week 2-3)

1. **Create MCP Server**
   ```bash
   mkdir $PAI_DIR/mcp-servers/finance
   cd $PAI_DIR/mcp-servers/finance
   npm init -y
   npm install @modelcontextprotocol/sdk
   ```

2. **Implement Tools**
   - Account balance fetching
   - Transaction retrieval
   - Categorization
   - Budget tracking
   - Goal management

3. **Create Coach Skill**
   ```bash
   mkdir $PAI_DIR/skills/FinanceCoach
   ```

4. **Configure MCP**
   ```json
   {
     "mcpServers": {
       "finance": {
         "command": "node",
         "args": ["/path/to/finance-mcp/dist/index.js"],
         "env": {
           "BUNQ_API_KEY": "${BUNQ_API_KEY}",
           "FINANCE_DB_PATH": "${PAI_DIR}/data/finances.db"
         }
       }
     }
   }
   ```

### Phase 5: Refinement (Ongoing)

1. **Improve Categorization**
   - Learn from manual corrections
   - Add merchant mappings

2. **Build Dashboards**
   - Monthly spending reports
   - Goal progress tracking
   - Net worth over time

3. **Set Up Alerts**
   - Large transactions
   - Budget warnings
   - Bill reminders

---

## Part 5: Privacy & Security

### Data Handling

1. **Local Storage Only**
   - All financial data stored locally in SQLite
   - No cloud sync of transaction data
   - Encrypted at rest (FileVault on macOS)

2. **Credential Security**
   ```bash
   # Store in PAI .env (not git)
   chmod 600 $PAI_DIR/.env

   # Never commit:
   # - API keys
   # - bunq.conf
   # - Database files
   ```

3. **Bunq API Key Rotation**
   - Rotate periodically
   - Revoke immediately if exposed

4. **Session Management**
   - bunq.conf contains session data
   - Treat as sensitive as API key

---

## Part 6: Example Interactions

### Morning Check-In

```
User: "Morning money check"

Coach: "Good morning! Here's your financial snapshot:

💰 **Balances**
- Bunq (daily): €1,847.32
- ABN (savings): €8,520.00
- ICS (credit): -€673.45 (payment due in 8 days)

📊 **Yesterday's Activity**
- Spent: €67.80 (groceries, coffee)
- Received: €0

📈 **Month-to-Date** (January, day 4)
- Spent: €234.50 of €3,000 budget (7.8%)
- On track ✅

💡 **Heads Up**
- ICS payment due January 12th (€673.45)
- Netflix renewal tomorrow (€15.99)

Anything you'd like to dive into?"
```

### Spending Analysis

```
User: "Why did I spend so much in December?"

Coach: "Let me analyze December for you...

📊 **December Spending: €4,847** (vs €3,200 average)

Breakdown vs November:
| Category      | Dec      | Nov      | Diff     |
|--------------|----------|----------|----------|
| 🎁 Shopping   | €1,240   | €320     | +€920    |
| 🍽️ Restaurants| €580     | €380     | +€200    |
| 🎬 Entertainment| €340   | €180     | +€160    |
| 🛒 Groceries  | €520     | €480     | +€40     |

**Key Drivers:**
1. Holiday shopping (+€920) - likely gifts
2. More dining out (+€200) - 8 more restaurant visits
3. Entertainment spike - concert tickets (€180)

This is a common December pattern. Your January is looking
much more typical so far.

Would you like to:
1. Set a post-holiday recovery budget?
2. Look at year-over-year December comparison?
3. Plan for next December now?"
```

### Goal Setting

```
User: "I want to save for a €2000 vacation in August"

Coach: "Great goal! Let's make it concrete:

🎯 **Vacation Fund**
- Target: €2,000
- Deadline: August 1st, 2026
- Time: 7 months

📐 **The Math**
- Monthly needed: €286/month
- Weekly: €66/week

💡 **How This Fits Your Budget**
Your current monthly savings rate: ~€400
After vacation fund: €114 remaining for other savings

**Options:**
1. ✅ €286/month - Comfortable, keeps other savings
2. ⚡ €333/month - Done by July 1st
3. 🎯 €200/month - Lower pressure, need €400 extra somewhere

Which approach feels right? I can set up automatic tracking
once you decide."
```

---

## Alternative: Use YNAB as Intermediary

If direct bank integration is too complex, consider **YNAB (You Need A Budget)**:

### Why YNAB?

- Has official API
- Connects to European banks
- Handles categorization
- Budget tracking built-in
- €14.99/month

### YNAB + Claude Integration

```json
{
  "mcpServers": {
    "ynab": {
      "command": "node",
      "args": ["ynab-mcp-server"],
      "env": {
        "YNAB_ACCESS_TOKEN": "${YNAB_ACCESS_TOKEN}"
      }
    }
  }
}
```

YNAB API provides:
- Budgets and categories
- Accounts and balances
- Transactions
- Scheduled transactions
- Budget goals

---

## Sources

### Bank APIs
- [Bunq API Documentation](https://doc.bunq.com/)
- [ABN AMRO Developer Portal](https://developer.abnamro.com/)
- [ICS Developer Portal](https://api-sandbox.developer.icscards.nl/)

### Aggregation Services
- [Nordigen/GoCardless Bank Account Data](https://nordigen.com/)
- [Tink Account Aggregation](https://tink.com/)
- [Salt Edge](https://www.saltedge.com/)

### Tools & Parsers
- [abn2csv - ABN AMRO/ICS Parser](https://github.com/vgalaktionov/abn2csv)
- [ABN AMRO Statement Parser](https://github.com/denilsonsa/abn-amro-statement-parser)

### Personal Finance Apps
- [YNAB API](https://api.ynab.com/)
- [Firefly III](https://firefly-iii.org/)

### AI Finance
- [Tendi - AI Financial Advisor](https://tendi.ai/)
- [Building Local Finance AI Assistant](https://medium.com/@sunbyrne/how-i-built-a-personal-finance-ai-assistant-with-local-language-models-2c0603b95cdc)
