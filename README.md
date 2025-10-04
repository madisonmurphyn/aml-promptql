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

1. **`getSdnData`** - Retrieves SDN records by name or country
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
**Thread**: https://promptql.console.hasura.io/project/crucial-oyster-4778/promptql-playground/thread/1d1e7653-1077-45d7-98e9-004fb9a7d437

**Question**: "How many pending AML investigations involve customers from high-risk sanctioned countries?"

**Finding**: Identified 462 pending cases involving sanctioned jurisdictions, allowing immediate prioritization of highest-risk investigations.

**Business Impact**: Reduces manual triage time and ensures regulatory deadlines are met for critical cases.

---

### Insight 2: Geographic Risk Patterns - Sanctioned Country Exposure
**Thread**: https://promptql.console.hasura.io/project/crucial-oyster-4778/promptql-playground/thread/3ac5fc50-4f88-44ed-a85a-40a6f494866a?artifact=country_overlap_analysis

**Question**: Which countries appear in both our transaction data and SDN sanctions lists?

**Finding**: 3 countries overlap, Cuba, Iran, and Russia

**Business Impact**: Reveals hidden geographic risk concentrations they couldn't see before - this is their "darknet patterns, structuring" visibility gap.

---

### Insight 3: PEP + Sanctions Cross-Reference Compliance Gaps
**Thread**: https://promptql.console.hasura.io/project/crucial-oyster-4778/promptql-playground/thread/c8ba06b0-af33-4798-a63f-785609ae5de1?artifact=high_risk_pep_detailed

**Question**: Find customers with PEP status from sanctioned countries who have high transaction volumes

**Finding**: Both customers are from Cuba
- Jennifer Bryant
- Samantha Smith DDS

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