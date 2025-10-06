# Aurelia Bank AML Compliance - SDN Integration

## Overview
A comprehensive Anti-Money Laundering (AML) analytics platform built with PromptQL that integrates OFAC sanctions data, customer databases, and transaction monitoring to detect financial crime patterns and provide real-time compliance insights.

## Problem Statement
Aurelia Bank faces three strategic blockers:
1. **Delayed AML investigations** due to manual analysis workflows
2. **Lack of visibility** into emerging laundering techniques
3. **Inconsistent handling** of PEPs and sanctions compliance

## Solution Architecture

### SDN API Endpoint
- **Hosted at**: https://sdn-api-w7wr.onrender.com
- **Endpoint**: `/getsdn?name={name}`
- **Data Source**: US OFAC SDN list (20250806 dataset)

### Demo Architecture Pattern
Each demo follows a consistent structure:
- `hasura.yaml` - DDN project configuration
- `supergraph.yaml` - Defines subgraphs composition
- `compose.yaml` - Docker services orchestration
- `globals/` - Global configurations (auth, GraphQL, PromptQL settings)
- `app/` subgraph - Contains connector and metadata configuration

### Subgraph Structure
Each subgraph contains:
- `connector/` - Data connector implementations (MongoDB, PostgreSQL, TypeScript functions)
- `metadata/` - DDN metadata files (.hml format) defining data models and relationships
- `subgraph.yaml` - Subgraph definition

### PromptQL Integration
The SDN data is integrated via three TypeScript lambda functions:

1. **`getSdnData`** - Retrieves SDN records by name
2. **`checkCustomerAgainstSdn`** - Validates individual customers against sanctions list
3. **`bulkCheckSdn`** - Batch screening for portfolio-wide compliance reviews

### Setup Instructions

### Prerequisites
Before running project, ensure you have:
- DDN CLI installed
- Docker and Docker Compose
- Node.js
- Access to data sources and credentials

1. **Clone repository**:
```bash
git clone https://github.com/madisonmurphyn/aml-promptql.git
cd my-project
```
2. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables** in `.env`:

APP_MYMONGODB_*: MongoDB database connection settings
APP_MYPOSTGRES_*: PostgreSQL database connection settings
APP_TYPESCRIPT__*: SDN API service configuration

3. **Build and deploy**:
```bash

# Project init
ddn project init . --with-project crucial-oyster-4778 --with-promptql

# MongoDB
ddn connector init mymongodb -i
ddn connector introspect mymongodb
ddn model add mymongodb "*"
ddn command add mymongodb "*"

# PostgreSQL
ddn connector init mypostgres_promptql -i
ddn connector introspect mypostgres_promptql
ddn model add mypostgres_promptql "*"
ddn command add mypostgres_promptql "*"
ddn relationship add mypostgres_promptql "*"


# SDN API
ddn connector init typescript -i
ddn connector introspect typescript
ddn command add typescript getSdnData
ddn command add typescript checkCustomerAgainstSdn
ddn command add typescript bulkCheckSdn


ddn supergraph build create
```

## Key Insights Delivered

### Insight 1: Automated SDN Screening Reduces Investigation Backlog
**Thread**: https://promptql.console.hasura.io/project/crucial-oyster-4778/build/5c71e352d5/promptql-playground/thread/01a6500c-7967-45a3-904a-416737de13a4?artifact=aml_cases_viz&artifact=monthly_trend

**Question**: How many AML cases have been opened over the last year? 

**Finding**: Over the last 12 months (since October 2024), there have been 40,675 AML cases opened. Here's the breakdown:

- 140 cases involved structuring activity
- No cases were flagged for cross-border violations
- No cases were flagged for darknet activity

**Business Impact**: Reduces manual triage time and ensures regulatory deadlines are met for critical cases.

---

### Insight 2: Geographic Risk Patterns - Sanctioned Country Exposure
**Thread**: https://promptql.console.hasura.io/project/crucial-oyster-4778/build/5c71e352d5/promptql-playground/thread/ee950337-f6b9-4dd5-b486-630811d77104?artifact=overlapping_countries

**Question**: Which countries appear in both our transaction data and SDN sanctions lists?

**Finding**: 3 countries overlap, Cuba, Iran, and Russia

**Business Impact**: Reveals hidden geographic risk concentrations they couldn't see before - this is their "darknet patterns, structuring" visibility gap.

---

### Insight 3: PEP + Sanctions Cross-Reference Compliance Gaps
**Thread**: https://promptql.console.hasura.io/project/crucial-oyster-4778/build/5c71e352d5/promptql-playground/thread/b79b4d70-ac5f-4e1b-9221-9891ec1ce071?artifact=high_risk_sanctioned_peps

**Question**: Find customers with PEP status from sanctioned countries who are considered high risk

**Finding**: 
- 7 individuals are from sanctioned jurisdictions (like Iran)
- 2 customers are from jurisdictions requiring Enhanced Due Diligence (Russia/China)
- 1 customer has previous SAR filings
- None of these high-risk PEPs show transaction activity in the last 6 months, which could either indicate dormant accounts or could itself be a risk indicator

These customers warrant enhanced monitoring due to their combined risk factors of:
- High-risk classification
- PEP status
- Presence in sanctioned or high-risk jurisdictions
- History of suspicious activity reports (for one customer)

**Business Impact**: Identifies the most critical compliance failures - PEPs who are also sanctioned but weren't flagged.

---

## Data Sources Connected

### MongoDB (AML Data)
- **Accounts**: Risk levels, entity types, transaction limits
- **AML Cases**: Flags, volumes, counterparties, statuses  
- **Sanctions**: Sanctioned entities, addresses, programs

### PostgreSQL (Customer Data)
- **Customers**: PEP status, blacklist, jurisdiction, risk tier
- **Transfers**: Sender/receiver details, volumes, currencies
- **SARs**: Narratives, tags, filing status

### SDN API (Sanctions Data)
- **SDN Records**: Names, aliases, countries, sanctions programs, identifiers

## Compliance Value Delivered

### Before Integration
- Manual review of all AML cases
- No automated sanctions screening
- Reactive compliance approach
- High risk of regulatory fines

### After Integration
- Automated SDN screening across customer base
- Real-time transaction monitoring against sanctions lists
- Proactive identification of compliance gaps
- Reduced investigation backlog

## Future Enhancements

1. **Fuzzy Matching Improvements**: Implement advanced name matching algorithms for aliases and transliterations
2. **Real-time Alerts**: Set up automated notifications when SDN matches are detected
3. **Risk Scoring**: Combine SDN data with other risk factors for comprehensive customer scoring
4. **Audit Trail**: Log all SDN checks for regulatory documentation

## Technical Notes

- Functions are implemented as procedures and require action confirmation in PromptQL UI
- The SDN API is hosted on Render free tier; production deployment should use dedicated infrastructure
- All functions include proper error handling and return structured responses

## Contact
Madison Murphy - Forward Deployed Engineer Candidate