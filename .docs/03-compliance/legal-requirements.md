# Legal Requirements (Traced from W2)

Source: `.docs/03-compliance/rule.md` §5. This file restates rule.md's LR1–LR5 as the standalone,
traceable specification the W5 gate's compliance deliverable asks for — `rule.md` itself is not
modified here; it remains the authoritative source if the two ever disagree.

| ID | Law | Requirement | Priority | Backlog items |
|---|---|---|---|---|
| LR1 | PDPA | Consent before storing any personal data (name/email/panel-tester record); ship view/correct/delete as real features; sensitive fields need the owner's written plan. | Must | PRIV-001–004 |
| LR2 | Computer Crime Act §26 | Append-only access log (who, when, from where, what action), retained ≥90 days, including ≥90 days after an account ends. | Must | SEC-003, backlog.md §7 LR2 |
| LR3 | Electronic Transactions Act §9/26 | Every "I agree"/approval recorded with user id, timestamp, text version, and hash; high-value acts require re-authentication. | Must | backlog.md §7 LR3 (conditional this cycle — no agreement step is designed yet) |
| LR4 | ETDA principles | Explainable results, "insufficient data" instead of a guess, a human override/feedback path, and a core workflow that works without the model. | Should | CER-001–003, NFR-004 |
| LR5 | Owner IP | Dataset, rules, thresholds, and formulas never leave approved infrastructure; the repository stays private. | Must | IP-001–004 |

## Traceability chain

```
W2 legal research (PDPA / Computer Crime Act / Electronic Transactions Act)
  -> rule.md               (project-specific compliance rules, §§1-4)
  -> LR1-LR5                (this file, restating rule.md §5)
  -> backlog.md             (PRIV-*, SEC-*, CER-*, IP-*, NFR-004 — full requirement text + acceptance criteria)
  -> .docs/02-design/       (D3 shows access_log + consent in the architecture; user-journey.md reflects login)
  -> src/                   (implementation — not started)
  -> tests/                 (not started)
```

Every row above restates a `rule.md` §5 row exactly — no legal requirement here was invented.
`backlog.md` Section 7 carries the fully detailed requirement text, acceptance criteria, and the
specific `rule.md` rule numbers each one operationalizes.
