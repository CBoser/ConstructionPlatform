# 🧠 MindFlow AI Training Prompt Library (v1.0)
**Author:** Corey Boser  
**System:** MindFlow Automated Systems  
**Version:** 1.0  
**Use Case:** Train AI and team members to interpret construction process videos, generate SOPs, identify RFIs, and automate workflows.

---

## 🧩 Section 1: Prompt Library Document (SharePoint / Knowledge Base Format)

### 1. SOP Extraction Prompts

#### 🔹 Full SOP Generator
**Purpose:** Convert video transcripts into structured SOPs.

**Prompt:**
```
You are a MindFlow Process Analyst specializing in construction workflow documentation.
Read the transcript below and produce a Standard Operating Procedure (SOP) in this format:

# SOP Title
## Objective
(Single sentence explaining purpose)
## Key Steps
[List steps with timestamps and screenshots]
## Decision Rules
[List logic-based or conditional decisions]
## Acceptance Criteria
[Checklist of measurable completion standards]
## RFI & Coordination Notes
[List open questions or uncertainties]
## Artifacts
[List files, logs, or exports referenced]
## Source
[Link to Loom video + timestamps]
```

---

#### 🔹 SOP Delta Generator
**Purpose:** Compare two process versions and summarize differences.

**Prompt:**
```
Compare the two transcripts or SOPs below.
Output a Process Delta Summary:
- Steps added
- Steps removed
- Logic or hardware updates
- RFI implications
```

---

### 2. Logic & Rule Extraction Prompts

#### 🔹 Decision Rule Extractor
**Purpose:** Identify rule-based construction logic.

**Prompt:**
```
Extract all IF-THEN logic statements from the transcript.
Group by:
- Structural Rules
- Material Rules
- Hardware Rules
- Waste Factor Rules
```

---

#### 🔹 Parameter Table Builder
**Purpose:** Build a variable matrix for automation.

**Prompt:**
```
Extract all measurable variables (spacing, thickness, material type).
Output as:
| Category | Parameter | Value | Unit | Notes |
```

---

### 3. Quality & Compliance Prompts

#### 🔹 SOP Audit Checklist
**Purpose:** Review generated SOPs for accuracy.

**Prompt:**
```
You are a MindFlow QA Auditor.
Check:
- Completeness of steps (≥90%)
- Timestamp coverage (≥80%)
- Logic correctness
- MindFlow formatting
Score out of 100 and provide corrections.
```

---

#### 🔹 Consistency Validator
**Purpose:** Ensure SOP terms match MindFlow conventions.

**Prompt:**
```
Validate consistency:
- Folder naming: 1704 Exterior Unit / Interior Unit
- Hardware naming: HUS210 / LUS210 / LSSR
- Structural naming: Pony Wall / Half Wall
Suggest corrections.
```

---

### 4. RFI & Communication Prompts

#### 🔹 RFI Generator
**Purpose:** Identify items needing clarification.

**Prompt:**
```
Find all uncertainty statements in transcript or SOP.
Output table:
| Plan | Sheet | Detail | Question | Assumption | Status |
```

---

#### 🔹 Clarification Summary
**Purpose:** Aggregate RFIs from multiple SOPs.

**Prompt:**
```
Combine all RFI items across SOPs.
Group by category (Structural / Material / Hardware).
Remove duplicates and create Coordination Log.
```

---

### 5. Automation Mapping Prompts

#### 🔹 Automation Opportunity Detector
**Purpose:** Identify repetitive tasks suitable for automation.

**Prompt:**
```
Identify SOP steps that can be automated.
Output:
| Step | Manual Action | Automation Candidate | Suggested Tool |
```

---

#### 🔹 Script Draft Generator
**Purpose:** Convert SOP steps into executable pseudocode.

**Prompt:**
```
Convert process into automation pseudocode.
Output logic outline + example Power Automate or VBA code.
```

---

## 🧰 Section 2: Power Automate-Compatible Flow (Automation Layer)

### ⚙️ Flow Name: MindFlow SOP Generator
**Trigger:** When new Loom video or transcript is added to “Training Videos” folder

**Steps:**
1. **Extract Transcript** → Use AI to convert speech to text.
2. **Run Prompt 1A (Full SOP Generator)** → Generate SOP markdown.
3. **Save SOP to SharePoint:** `/MindFlow/SOP Library/{Project}/{Phase}`
4. **Trigger Prompt 2A & 4A:** Extract Decision Rules + Generate RFIs.
5. **Compile Output:** Save SOP.md, LogicRules.json, RFIs.csv to project folder.
6. **Notify Reviewers:** Email summary + SharePoint link.

### ⚙️ Flow Name: MindFlow QA Validator
**Trigger:** When SOP is published.
- Run Prompt 3A (SOP Audit)
- Run Prompt 3B (Consistency Validator)
- Output QA_Report.md and push feedback to Teams.

### ⚙️ Flow Name: MindFlow Automation Finder
**Trigger:** When SOP approved.
- Run Prompt 5A (Automation Detector)
- Log automation opportunities in Power BI dashboard.

---

## 💬 Section 3: Reusable Prompt Cards (For ChatGPT / Claude / Gemini)

### 🟩 SOP Builder Card
**Use:** Turn a transcript into a MindFlow SOP.
```
Input: Transcript or video summary
Goal: Create an SOP following MindFlow’s structure and style
Include: Objective, Steps, Decision Rules, Acceptance Criteria, RFIs, Artifacts
Output: Markdown document
```

---

### 🟦 Logic Extractor Card
**Use:** Pull all engineering or structural logic.
```
Input: SOP or transcript
Goal: Extract IF-THEN rules grouped by type
Output: JSON or Markdown table for Estimator Toolkit
```

---

### 🟨 RFI Builder Card
**Use:** Summarize all questions and clarifications.
```
Input: SOP or meeting notes
Goal: Generate RFI table with assumptions
Output: CSV or Markdown Table
```

---

### 🟧 Automation Finder Card
**Use:** Identify what can be automated.
```
Input: SOP text
Goal: Flag manual actions → suggest Power Automate / VBA opportunities
Output: Table with automation mappings
```

---

### 🟪 QA Reviewer Card
**Use:** Audit for quality and formatting.
```
Input: SOP draft
Goal: Review completeness, logic accuracy, and consistency
Output: Scorecard (100-point scale) + corrections
```

---

## ✅ Deployment Summary
| Use Case | Prompt Category | Output | Destination |
|-----------|----------------|---------|--------------|
| Transcript → SOP | 1A | SOP.md | SharePoint Library |
| Rule Extraction | 2A | LogicRules.json | Estimator Toolkit |
| QA Audit | 3A | QA_Report.md | Internal Docs |
| RFI Generation | 4A | RFIs.csv | Logs Folder |
| Automation Mapping | 5A | AutomationMap.csv | MindFlow Automations |

---

## 📈 Next Development Phase
1. Integrate all prompt chains into a **MindFlow AI Trainer** Power Automate flow.
2. Embed prompt cards into SharePoint pages for quick access.
3. Build prompt chaining API between ChatGPT ↔ Power Automate for automated SOP generation.
4. Link outputs to your **Estimator Toolkit** and **Knowledge Graph** modules for continuous learning.

---

> **Result:** Every video → structured SOP → automation opportunities → AI retraining loop.  
> This closes the loop between *training, documenting, and automating* the ReadyFrame estimating system.

