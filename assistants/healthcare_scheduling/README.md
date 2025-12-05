# VAPI Health Clinic - Complex Booking System

## Overview

This system provides an AI-powered voice assistant for VAPI Health Clinic that handles appointment scheduling, rescheduling, cancellation, and general inquiries. The assistant, **Amy**, uses natural language processing to guide callers through appointment management workflows while maintaining a warm, professional, and empathetic tone.

<a href="https://dashboard.vapi.ai/import?=healthcare_scheduling">
<img height="35" src="https://auth.vapi.ai/storage/v1/object/public/files/import-to-vapi.svg" alt="Import to Vapi"/>
</a>

## System Architecture

The system consists of three main components:

1. **VAPI AI Assistant** (`agent/assistant_config.json`) - The conversational AI that handles voice interactions
2. **n8n Workflow** (`tools/scheduling/n8n_workflow.json`) - Backend automation that processes scheduling requests
3. **cal.com API** - Calendar management system that stores and manages appointments

## Important Notes

- The system enforces business hours (9 AM - 5 PM) and will not book outside these times
- The system uses number for booking (assumed +1 US numbers)
- Doctor availability is automatically enforced based on day of week
- All scheduling operations require proper event type selection based on day, doctor, and consultation type
- NOT Optimised for multiple booking records (ensure only 1 booking exists for rescheduling or cancellation for smooth operation)
- Cal.COM bookins WILL fill up after use, sanitize unused bookings / cancel to avoid availability fill up.
- Transfer calls goes to arbitrary US number
- Insurance collection details not required (added for realism)

## AI Assistant: Amy

Amy is only designed to:

- Answer patient questions and handle FAQs (extreamly general, denoted in prompt)
- Book, reschedule, and cancel healthcare appointments
- Route callers to appropriate human staff when needed (one destination)
- Maintain clinical professionalism without giving medical advice

### Key Features

- **Business Hours**: 9:00 AM - 5:00 PM, Sunday to Saturday (America/Los_Angeles)
- **One question at a time**: Asks questions sequentially and waits for responses
- **Natural conversation**: Never mentions "functions", "tools", or technical terms
- **Guardrails**: Handles inappropriate questions and medical emergencies appropriately

## Scheduling Tools

All scheduling operations are handled through five main tools that connect to the n8n workflow:

### 1. `checkCalendarVAPIHealth`

**Purpose**: Check available appointment slots

**Parameters**:
- `requestedTime` (required): Requested time in format `yyyy-mm-ddTHH:mm:ss` (e.g., `2025-07-04T11:00:00`)
- `EventTypeID` (required): One of the four event type IDs
- `EventTypeSlug` (required): One of the four event type slugs
- `timeZone` (optional): Defaults to `America/Los_Angeles`

**Logic** (from n8n workflow):
- Queries cal.com API for available slots around the requested time
- If exact match found → returns confirmation message
- If no exact match but slots available → returns alternative times
- If no slots available → expands search window (±2 hours) and retries
- If still no slots → suggests alternative days

### 2. `bookCalendarVAPIHealth`

**Purpose**: Create a new appointment

**Required Parameters**:
- `firstName`, `lastName`: Patient name
- `requestedTime`: Selected appointment time
- `eventTypeID`, `eventTypeSlug`: Event type identifiers

**Optional Parameters**:
- `phone`: Patient phone number (normalized to E.164 format)
- `birthDate`: Date of birth
- `reason`: Reason for visit
- `insuranceProvider`, `insuranceID`: Insurance information

**Logic** (from n8n workflow):
- Normalizes phone number to E.164 format (+1XXXXXXXXXX)
- Creates booking via cal.com v2 API
- Updates/creates patient record in n8n DataTable
- Returns success confirmation with booking details

### 3. `getCalendarVAPIHealth`

**Purpose**: Retrieve existing appointment by patient details

**Required Parameters**:
- `phone`: Patient phone number

**Optional Parameters**:
- `name`: Patient name (for verification)

**Logic** (from n8n workflow):
- Normalizes phone number to E.164 format
- Queries n8n DataTable for appointment by phone number
- If found → retrieves appointment UID from cal.com
- Returns appointment details (date, time, UID)

### 4. `rescheduleCalendarVAPIHealth`

**Purpose**: Change an existing appointment to a new time

**Required Parameters**:
- `bookinguid`: Unique identifier from `getCalendarVAPIHealth`

**Optional Parameters**:
- `start`: New start time in ISO 8601 UTC format

**Logic** (from n8n workflow):
- Calls cal.com v2 API to reschedule booking
- Updates appointment time in n8n DataTable
- Returns success confirmation with new appointment details

### 5. `cancelCalendarVAPIHealth`

**Purpose**: Cancel an existing appointment

**Required Parameters**:
- `phone`: Patient phone number

**Optional Parameters**:
- `name`: Patient name (for verification)

**Logic** (from n8n workflow):
- Retrieves appointment using `getCalendarVAPIHealth` logic
- Cancels booking via cal.com v2 API
- Optionally clears appointment data from DataTable
- Returns cancellation confirmation

## Event Types & Doctor Availability

The system supports 4 event types in cal.com, mapped to specific doctors and consultation types:

### Event Type Mapping

| Event Type ID | Event Type Slug | Doctor | Consultation Type | Available Days |
|---------------|----------------|--------|-------------------|----------------|
| `3954317` | `dr-chan-clinic-30-minute` | Dr. Chan | In-person | Sunday, Wednesday, Saturday |
| `3954310` | `dr-wong-clinic-30-minute` | Dr. Wong | In-person | Monday, Tuesday, Thursday, Friday |
| `3954311` | `dr-chan-telehealth-30-minute` | Dr. Chan | Telehealth | Sunday, Wednesday, Saturday |
| `3954306` | `dr-wong-telehealth-30-minute` | Dr. Wong | Telehealth | Monday, Tuesday, Thursday, Friday |

### Doctor Availability

**Dr. Chan**
- Days: Sunday, Wednesday, Saturday
- Hours: 9:00 AM - 5:00 PM
- Timezone: America/Los_Angeles

**Dr. Wong**
- Days: Monday, Tuesday, Thursday, Friday
- Hours: 9:00 AM - 5:00 PM
- Timezone: America/Los_Angeles

### Event Type Selection Logic

The AI assistant automatically selects the correct event type based on:
1. **Consultation type** (in-person vs telehealth)
2. **Requested day of week**
3. **Doctor preference** (if specified)

Example:
- Caller requests: "Telehealth appointment on Monday"
- System selects: `3954306` / `dr-wong-telehealth-30-minute` (Dr. Wong, Telehealth, Monday)

## n8n Workflow Logic

The n8n workflow (`tools/scheduling/n8n_workflow.json`) handles all backend processing:

### Webhook Endpoint
- **URL**: `https://vapiai.app.n8n.cloud/webhook/calendar-book12`
- **Method**: POST
- Receives tool calls from VAPI AI assistant

### Workflow Steps

1. **Request Validation**
   - Validates incoming webhook is a tool-call request
   - Routes to appropriate handler based on tool name

2. **Tool Routing (Switch Node)**
   - Routes to different flows based on tool name:
     - `checkCalendarVAPIHealth` → Availability checking flow
     - `bookCalendarVAPIHealth` → Booking flow
     - `getCalendarVAPIHealth` → Retrieval flow
     - `cancelCalendarVAPIHealth` → Cancellation flow
     - `rescheduleCalendarVAPIHealth` → Rescheduling flow

3. **Phone Number Normalization**
   - Converts various phone formats to E.164 (+1XXXXXXXXXX)
   - Handles US numbers (10 digits) and international format (11 digits with country code)

4. **DataTable Integration**
   - Stores patient information (name, phone, DOB, appointment UID, appointment time)
   - Uses phone number (E.164) as primary key
   - Supports upsert operations for patient records

5. **cal.com API Integration**
   - **v1 API**: Used for checking availability (`/v1/slots`)
   - **v2 API**: Used for booking, rescheduling, and cancellation (`/v2/bookings`)
   - Handles timezone conversions (America/Los_Angeles)
   - Manages event type selection based on day/doctor/consultation type

6. **Error Handling**
   - Returns appropriate error messages for failed operations
   - Handles missing appointments gracefully
   - Provides fallback responses for technical issues

## Conversation Flow

### Booking Flow

1. **Intent Detection**: Caller expresses desire to book appointment
2. **Information Collection**: Amy collects:
   - First name, last name
   - Date of birth
   - Phone number
   - Reason for visit
   - Insurance information (optional)
   - Consultation type (in-person/telehealth)
   - Preferred time/day
   - Doctor preference (optional)
3. **Availability Check**: Calls `checkCalendarVAPIHealth` with appropriate event type
4. **Slot Selection**: Presents 2-4 available options to caller
5. **Confirmation**: Confirms appointment details
6. **Booking**: Calls `bookCalendarVAPIHealth` to create appointment
7. **Confirmation**: Provides booking confirmation with details

### Rescheduling Flow

1. **Appointment Retrieval**: Uses `getCalendarVAPIHealth` to find existing appointment
2. **Verification**: Confirms appointment details with caller
3. **New Time Collection**: Asks for preferred new time
4. **Availability Check**: Checks availability for new time
5. **Rescheduling**: Calls `rescheduleCalendarVAPIHealth` with booking UID
6. **Confirmation**: Confirms new appointment time

### Cancellation Flow

1. **Appointment Retrieval**: Uses `getCalendarVAPIHealth` to find appointment
2. **Verification**: Confirms appointment to cancel
3. **Cancellation**: Calls `cancelCalendarVAPIHealth`
4. **Rebooking Offer**: Optionally offers to book new appointment

## Data Storage

Patient and appointment data is stored in:
- **cal.com**: Primary source of truth for appointments
- **n8n DataTable**: Patient records with appointment references
  - Fields: `first_name`, `last_name`, `phone`, `dob`, `appointment_uid`, `appointment_time`

## Timezone Handling

- All appointments are managed in **America/Los_Angeles** timezone
- The system converts between UTC (for API calls) and Pacific Time (for user communication)
- Business hours are enforced: 9:00 AM - 5:00 PM Pacific Time

## Error Handling

The system handles various error scenarios:

- **No appointment found**: Offers to book new appointment
- **Time slot unavailable**: Suggests alternative times
- **Technical errors**: Provides user-friendly error messages and fallback options
- **Invalid phone numbers**: Normalizes or requests clarification

## Security & Privacy

- Phone numbers are normalized and stored in E.164 format
- Patient data is stored securely in n8n DataTable
- All API communications use secure HTTPS endpoints
- HIPAA compliance considerations are built into the system design

## Configuration Files

- `assistant.json`: VAPI AI assistant configuration with system prompt
- `tools/scheduling/n8n_workflow.json`: n8n workflow definition
- `tools/scheduling/*.json`: Individual tool definitions for VAPI


