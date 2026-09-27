# IntentSpec: intent-dmi4q11h
Status: **approved**

## Objective
Provide a reusable date-formatting helper so any part of the codebase can render a date as DD/MM/YYYY consistently, instead of each call site hand-rolling its own formatting (which today does not exist anywhere: a search for "format" in frontend/src returns no matches). Without it, every future date display risks inconsistent day/month ordering and missing zero-padding.

## Outcomes
- A new format.ts exists at the agreed location, containing an exported date-formatting function.
- Given 2024-03-05 (5 March 2024), the helper returns the string "05/03/2024" (zero-padded day and month).
- The helper accepts the input type(s) the developer confirms (Date object and/or ISO string).
- The file type-checks under the workspace tsconfig with no new lint errors.

## Scope
**In Scope:**
- utils/format.ts

**Out of Scope:**
- frontend/src/app/**
- frontend/src/components/**
- frontend/src/lib/api.ts
- backend/**
- mcp/**
- scripts/**
- .intent/**

## Edge Cases
- **Invalid date input (e.g. new Date("nonsense") or an unparseable string)**: Developer to confirm: return an empty string, return "Invalid Date", or throw. Not assumed.
- **Day or month is a single digit (e.g. 9 January 2024)**: Zero-padded to two digits: "09/01/2024".
- **Date near midnight in different timezones**: Developer to confirm whether to format in local time or UTC — affects the resulting day.
- **No argument / null / undefined**: Developer to confirm: rely on TypeScript's type check only, or add a runtime guard.
