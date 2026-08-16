# LIM Order Queue

**Purpose:** Store incoming LIM orders received via WhatsApp for batch processing.

## SLA (Effective 2026-08-09)
- **Orders before 10:00 NZ time** → Processed same working day
- **Orders after 10:00 NZ time** → Processed next working day
- **Processing window:** 08:00 SA time (= 10:00 NZ time)

## Directory Structure

```
lim-queue/
├── pending/      # New orders waiting to be processed
├── processing/   # Orders currently being submitted to council
└── completed/    # Forms filled, awaiting manual payment
```

## Order File Format

Each order is saved as `pending/<order-id>.json`:

```json
{
  "order_id": "LIM-20260809-001",
  "received_at": "2026-08-09T22:15:00+12:00",
  "received_at_sa": "2026-08-09T12:15:00+02:00",
  "customer": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+64-21-123-4567"
  },
  "property": {
    "address": "49 Wai Whatu Street, Napier South, Napier 4110",
    "street_number": "49",
    "street_name": "Wai Whatu Street",
    "suburb": "Napier South",
    "city": "Napier",
    "postcode": "4110",
    "legal_description": "Lot 1 DP 12345"
  },
  "application_options": {
    "fee_type": "$420.00 Residential / Rural Residential",
    "delivery_method": "Email",
    "urgency": "Standard"
  },
  "sla_status": "next_day",
  "scheduled_for": "2026-08-10T08:00:00+02:00",
  "status": "pending"
}
```

## Workflow

1. **WhatsApp order received** → Parse message → Save to `pending/`
2. **08:00 SA cron triggers** → Move files to `processing/`
3. **Browser automation runs** → Fill council forms
4. **Forms complete** → Move to `completed/`, notify Gerhard for payment

## Order ID Format
`LIM-YYYYMMDD-NNN` (e.g., `LIM-20260809-001`)
