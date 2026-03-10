---
slug: /changelog
title: Changelog
sidebar_class_name: hidden
---

# Changelog

## v1.2.0  - 2026-03-01

### New
- Added SEPA Direct Debit as a payment method
- Webhook retry policy now configurable per endpoint

### Improved
- 3D Secure redirects now complete 40% faster
- Error messages include `request_id` for easier debugging

### Fixed
- Partial refunds on AMEX cards now process correctly

---

## v1.1.0  - 2026-02-01

### New
- Connect: merchant payout schedules (daily, weekly, monthly, manual)
- Added `metadata` field to refund objects

### Improved
- List endpoints now support `starting_after` cursor pagination
- SDK error types are more specific (e.g., `CardError` vs generic `HelixError`)

---

## v1.0.0  - 2026-01-15

Initial release.

- Payments API (create, retrieve, list)
- Refunds API (full and partial)
- Connect: merchant onboarding and payouts
- Webhooks with signature verification
- SDKs for Node.js, Python, Go, Java, Ruby, PHP
