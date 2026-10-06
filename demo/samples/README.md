# Sample reference-data files

For practising and presenting the Reference data page without the owner's data.

| File | What it shows |
|---|---|
| `materials-sample.csv` | A clean upload. Identity (CAS, name) and molecular weight are public facts; **every other value is invented**, the same mock values the demo uses. One detection threshold is left empty on purpose |
| `materials-sample-with-errors.csv` | The check refusing a file: a CAS with a wrong check digit, a duplicate CAS, an empty name, and a non-numeric value |
| `limits-sample.csv` | A clean limits upload. **Every limit is fictional** and the source column says so; none is a real IFRA, EU or Thai FDA limit |

The owner's real files never go in this folder: this repository is public. Upload them only on the owner's own computer, where they stay in `demo/data/` (gitignored).
