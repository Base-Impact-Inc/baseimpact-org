# Base Impact — Legal Documents Folder Structure

## 📁 Required Folder: `/home/eric/projects/baseimpact-org/legal/`

Create this folder and organize as follows:

```
legal/
├── incorporation/
│   ├── articles-of-incorporation.pdf          # Brevard County filed copy
│   ├── articles-of-incorporation-stamped.pdf  # State-stamped version
│   ├── filing-receipt.pdf                     # Sunbiz/Division of Corporations receipt
│   └── florida-nonprofit-certificate.pdf      # FL Nonprofit Corp status
├── ein/
│   ├── ein-confirmation-letter.pdf            # IRS Form SS-4 confirmation (CP 575)
│   └── ein-application.pdf                    # Copy of submitted SS-4
├── fdacs/
│   ├── fdacs-registration.pdf                 # FL Dept of Agriculture registration
│   ├── fdacs-approval-letter.pdf              # Approval confirmation
│   └── charitable-solicitation-permit.pdf     # If applicable
├── bank/
│   ├── bank-account-confirmation.pdf          # Business account opening confirmation
│   └── banking-resolution.pdf                 # Board resolution authorizing account
├── governance/
│   ├── bylaws.pdf                             # Adopted bylaws (signed)
│   ├── conflict-of-interest-policy.pdf        # Signed by all directors
│   ├── board-resolutions/
│   │   ├── 001-initial-board-appointment.pdf
│   │   ├── 002-officer-appointment.pdf
│   │   ├── 003-banking-authorization.pdf
│   │   ├── 004-fiscal-year-adoption.pdf
│   │   └── 005-501c3-application-authorization.pdf
│   ├── directors/
│   │   ├── director-1-[your-name].pdf         # Bio + signed acceptance
│   │   ├── director-2-[name].pdf              # Community member served
│   │   └── director-3-[name].pdf              # Technical/financial expert
│   └── meeting-minutes/
│       ├── 2026-XX-XX-organizational-meeting.pdf
│       └── 2026-XX-XX-501c3-application-approval.pdf
├── 501c3-application/
│   ├── form-1023-ez.pdf                       # Filed copy (if eligible)
│   ├── form-1023-ez-confirmation.pdf          # IRS receipt/acknowledgment
│   ├── narrative-description.pdf              # Part IV narrative
│   ├── financial-projections.pdf              # Part IX (3-year budget)
│   └── irs-determination-letter.pdf           # WHEN RECEIVED — critical!
├── fiscal-sponsorship/
│   ├── open-collective-application.pdf        # Application submitted
│   ├── open-collective-agreement.pdf          # Signed agreement
│   └── sponsor-confirmation.pdf               # Welcome letter from OC
├── insurance/
│   ├── general-liability.pdf
│   └── directors-officers.pdf                 # If obtained
└── compliance/
    ├── florida-annual-report.pdf              # Due annually by May 1
    ├── form-990-n-postcard.pdf                # Due annually (e-postcard)
    └── registered-agent-confirmation.pdf      # FL registered agent
```

## 🎯 Immediate Actions (This Week)

### 1. Create the folder structure
```bash
mkdir -p /home/eric/projects/baseimpact-org/legal/{incorporation,ein,fdacs,bank,governance/{board-resolutions,directors,meeting-minutes},501c3-application,fiscal-sponsorship,insurance,compliance}
```

### 2. Scan/upload all existing documents
- EIN confirmation letter (IRS CP 575)
- FDACS approval
- Articles of Incorporation (stamped)
- Bank account confirmation
- Any board meeting minutes

### 3. Draft missing governance docs
- **Bylaws** — Use [National Council of Nonprofits template](https://www.councilofnonprofits.org/tools-resources/bylaws)
- **Conflict of Interest Policy** — Required for 1023-EZ
- **Board Resolutions** — At minimum: organizational meeting, officer appointments, banking, 501c3 application authorization
- **Director Acceptance Letters** — Signed by each of your 3 directors

### 4. File 501(c)(3) — Form 1023-EZ ($275, ~4 weeks)
**Eligibility check** (you likely qualify):
- ✅ Projected annual gross receipts ≤ $50,000
- ✅ Total assets ≤ $250,000
- ✅ Not a church, school, hospital, or foreign org
- ✅ Organized as FL nonprofit corporation

**Required attachments for 1023-EZ:**
- Articles of Incorporation (stamped)
- Bylaws (adopted)
- Conflict of Interest Policy
- Narrative description of activities (Part IV)
- Financial projections (Part IX) — 3-year budget
- Director/officer list with addresses

---

## 📋 Application-Ready Document Checklist

| Program | Required Docs | Status |
|---------|---------------|--------|
| **OpenAI Codex for OSS** | GitHub repo, OSS license | ✅ Ready |
| **[PERSON_NAME] for OSS** | GitHub repo, 500+ dependent repos OR 100+ PRs | Check eligibility |
| **GitHub Copilot Pro** | GitHub account, popular OSS repo | ✅ Check eligibility |
| **OpenAI Researcher Access** | Research proposal, GitHub | Draft needed |
| **Cohere Catalyst Grants** | Project description, public benefit focus | Draft needed |
| **Lambda Research Grant** | Research proposal, GPU needs | Draft needed |
| **Google Cloud Research** | Project proposal, nonprofit status | Needs 501c3 or fiscal sponsor |
| **NVIDIA Inception** | Pitch deck, company info | Draft needed |
| **OpenAI for Nonprofits** | **501(c)(3) determination letter** | ❌ Pending |
| **Google for Nonprofits** | **501(c)(3) + TechSoup validation** | ❌ Pending |
| **Fiscal Sponsorship (OCF)** | Articles, EIN, bylaws, board list | ✅ Ready to apply |

---

## 🚀 Next Steps Priority Order

1. **TODAY**: Create `legal/` folder, scan existing docs
2. **THIS WEEK**: Draft bylaws, conflict of interest, board resolutions
3. **THIS WEEK**: Apply to **Open Collective Foundation** (fiscal sponsor) — unlocks tax-deductible donations NOW
4. **THIS WEEK**: File **Form 1023-EZ** ($275) — 4-week timeline
5. **PARALLEL**: Submit OSS program applications (Codex, [PERSON_NAME], Copilot)
6. **PARALLEL**: Draft research grant applications (OpenAI Researcher, Cohere, Lambda)

---

## 💡 Pro Tip: Digital Organization

Add a `legal/README.json` for quick reference:
```json
{
  "ein": "XX-XXXXXXX",
  "incorporation_date": "2026-XX-XX",
  "incorporation_state": "FL",
  "fdacs_number": "CHXXXXXX",
  "bank": "Bank Name - Account ending XXXX",
  "registered_agent": "Name, Address",
  "fiscal_year_end": "12-31",
  "501c3_status": "pending|submitted|approved",
  "fiscal_sponsor": "Open Collective Foundation|None",
  "key_dates": {
    "annual_report_due": "2027-05-01",
    "form_990_due": "2027-05-15",
    "1023_submitted": "2026-XX-XX"
  }
}
```