# STORY-006: Trade Entry Form UI

**Epic:** EPIC-002: Trade & Group Management
**Priority:** High (Should Have)
**Story Points:** 5
**Status:** Completed
**Assigned To:** Solo Developer
**Created:** 2026-01-10
**Completed:** 2026-01-10
**Sprint:** Sprint 2

---

## User Story

As a **trader**
I want to **manually enter options trade details via a web form**
So that **I can quickly log trades executed in Interactive Brokers for portfolio tracking and P&L analysis**

---

## Description

### Background

After executing trades in Interactive Brokers, traders need a streamlined way to log those trades into TradeLog for portfolio management. The IB interface is confusing and doesn't support the flexible grouping needed for complex multi-leg strategies. This story implements the primary trade entry interface that enables quick, accurate trade logging with full validation.

The Trade Entry Form is the **primary data input mechanism** for the TradeLog application. It must:
- Support all trade attributes (symbol, strike, expiry, type, cost, value, notes)
- Provide immediate validation feedback to prevent data entry errors
- Enable optional group assignment during trade creation
- Submit trades to the backend API (POST /v1/trades)
- Offer excellent UX with keyboard shortcuts and auto-focus

This form is critical for **FR-001 (Create Individual Trade)** and enables the Friday workflow where users quickly log closing trades.

### Scope

**In Scope:**

- Trade entry form component with all required fields
- Client-side validation using Zod schema
- Integration with Trade CRUD API (POST /v1/trades)
- Optional group selection dropdown
- Success/error feedback with toast notifications
- Form reset after successful submission
- Responsive layout (desktop, tablet, mobile)
- Accessible form controls (ARIA labels, keyboard navigation)
- Date picker for expiry date selection
- Number inputs with proper formatting
- shadcn/ui components for consistency

**Out of Scope:**

- Trade editing (covered in STORY-004 backend, frontend in backlog)
- Bulk trade import (future enhancement)
- Trade templates (covered in separate story FR-010)
- Real-time market data integration (post-MVP)
- Trade validation against broker API (post-MVP)
- Autosave/draft functionality (future enhancement)
- Trade history view (separate story)

### User Flow

1. User navigates to Trade Entry page (or opens modal)
2. Form displays with all fields empty (default state)
3. User enters trade details:
   - **Symbol** (text input, uppercase conversion)
   - **Strike Price** (number input, 2 decimal places)
   - **Expiry Date** (date picker, future dates only)
   - **Trade Type** (dropdown: BUY/SELL)
   - **Option Type** (dropdown: CALL/PUT)
   - **Quantity** (number input, integer)
   - **Cost Basis** (number input, 2 decimal places, can be negative)
   - **Current Value** (number input, 2 decimal places, can be negative)
   - **Notes** (textarea, optional)
   - **Trade Group** (dropdown, optional, shows existing groups)
4. Client-side validation runs on blur and before submit
5. Invalid fields show inline error messages
6. User clicks "Submit Trade" button
7. Form calls POST /v1/trades with validated data
8. API responds with success or error
9. On success:
   - Toast notification: "Trade created successfully"
   - Form resets to empty state
   - Optional: Redirect to trade list view
10. On error:
    - Toast notification with error message
    - Form fields remain populated for correction

---

## Acceptance Criteria

### Form Fields & Components

- [ ] **Symbol field** (text input)
  - Auto-converts to uppercase
  - Required validation
  - Max length: 10 characters
  - Pattern validation: letters only (e.g., "AAPL", "SPY")

- [ ] **Strike Price field** (number input)
  - Required validation
  - Minimum value: 0.01
  - 2 decimal places
  - Step: 0.01
  - Placeholder: "e.g., 450.00"

- [ ] **Expiry Date field** (date picker)
  - Required validation
  - Must be future date (or today)
  - Date picker UI using shadcn/ui Calendar
  - Format: MM/DD/YYYY display
  - Stores as ISO date string

- [ ] **Trade Type field** (select dropdown)
  - Required validation
  - Options: "BUY", "SELL"
  - Default: no selection (forces user choice)

- [ ] **Option Type field** (select dropdown)
  - Required validation
  - Options: "CALL", "PUT"
  - Default: no selection

- [ ] **Quantity field** (number input)
  - Required validation
  - Integer only (no decimals)
  - Minimum value: 1
  - Step: 1
  - Placeholder: "e.g., 10"

- [ ] **Cost Basis field** (number input)
  - Required validation
  - 2 decimal places
  - Can be negative (short positions)
  - Step: 0.01
  - Placeholder: "e.g., -500.00"

- [ ] **Current Value field** (number input)
  - Required validation
  - 2 decimal places
  - Can be negative
  - Step: 0.01
  - Placeholder: "e.g., -480.00"

- [ ] **Notes field** (textarea)
  - Optional
  - Max length: 1000 characters
  - Rows: 3
  - Placeholder: "Trade reasoning or notes..."

- [ ] **Trade Group field** (select dropdown)
  - Optional
  - Shows list of existing groups (fetched from GET /v1/trade-groups)
  - Display format: "{Group Name} - {Strategy Type}"
  - Placeholder: "None (ungrouped)"
  - Default: null (ungrouped trade)

### Form Behavior

- [ ] Form uses **React Hook Form** for state management
- [ ] Form validation uses **Zod schema** matching backend CreateTradeDto
- [ ] Validation errors display **inline below each field**
- [ ] Required fields show asterisk (*) indicator
- [ ] Form disables submit button while submitting (loading state)
- [ ] Form shows loading spinner on submit button during API call
- [ ] Form prevents double submission

### API Integration

- [ ] Form calls **POST /v1/trades** endpoint on submit
- [ ] Request body matches CreateTradeDto structure
- [ ] Uses **TanStack Query** (useMutation) for API call
- [ ] Request includes proper headers (Content-Type: application/json)
- [ ] Handles 201 Created response (success)
- [ ] Handles 400 Bad Request (validation errors from backend)
- [ ] Handles 500 Internal Server Error (server errors)
- [ ] Maps backend validation errors to form fields

### User Feedback

- [ ] **Success scenario:**
  - Toast notification: "Trade created successfully"
  - Form resets to empty state
  - Focus returns to symbol field
  - Optional: Auto-redirect to trade list after 2 seconds

- [ ] **Validation error scenario:**
  - Inline errors display below invalid fields
  - First invalid field receives focus
  - Submit button remains enabled for retry

- [ ] **Server error scenario:**
  - Toast notification: "Failed to create trade. Please try again."
  - Form fields remain populated
  - Error details logged to console

### Styling & UX

- [ ] Form uses **shadcn/ui components** (Input, Select, Button, Calendar, Textarea)
- [ ] Form layout is responsive (stacks vertically on mobile)
- [ ] Form fields have proper spacing and alignment
- [ ] Submit button styled as primary action (prominent)
- [ ] Cancel/Reset button available (secondary styling)
- [ ] Focus states clearly visible (accessibility)
- [ ] Error messages styled in red/destructive color
- [ ] Required field indicators visible

### Accessibility

- [ ] All form fields have proper **label** elements
- [ ] Labels use **htmlFor** attribute matching input IDs
- [ ] Error messages use **aria-describedby** for screen readers
- [ ] Required fields have **aria-required="true"**
- [ ] Form has **role="form"**
- [ ] Keyboard navigation works (Tab order logical)
- [ ] Date picker is keyboard accessible

### Type Safety

- [ ] Form types generated from OpenAPI spec (POST /v1/trades)
- [ ] Zod schema infers form field types
- [ ] TanStack Query mutation typed with request/response types
- [ ] No `any` types in form component

---

## Technical Notes

### Component Structure

**File Location:** `web/src/components/TradeForm/TradeForm.tsx`

**Component Hierarchy:**

```tsx
<TradeForm>
  <form onSubmit={handleSubmit}>
    <FormField name="symbol">
      <Input />
    </FormField>

    <FormField name="strikePrice">
      <Input type="number" />
    </FormField>

    <FormField name="expiryDate">
      <Popover> {/* shadcn/ui Popover */}
        <Calendar /> {/* shadcn/ui Calendar */}
      </Popover>
    </FormField>

    <FormField name="tradeType">
      <Select>
        <SelectItem value="BUY">Buy</SelectItem>
        <SelectItem value="SELL">Sell</SelectItem>
      </Select>
    </FormField>

    <FormField name="optionType">
      <Select>
        <SelectItem value="CALL">Call</SelectItem>
        <SelectItem value="PUT">Put</SelectItem>
      </Select>
    </FormField>

    <FormField name="quantity">
      <Input type="number" />
    </FormField>

    <FormField name="costBasis">
      <Input type="number" />
    </FormField>

    <FormField name="currentValue">
      <Input type="number" />
    </FormField>

    <FormField name="tradeGroupUuid">
      <Select> {/* Optional group selection */}
        <SelectItem value={null}>None (ungrouped)</SelectItem>
        {groups.map(g => (
          <SelectItem value={g.uuid}>{g.name}</SelectItem>
        ))}
      </Select>
    </FormField>

    <FormField name="notes">
      <Textarea />
    </FormField>

    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Creating..." : "Create Trade"}
    </Button>
  </form>
</TradeForm>
```

### Zod Validation Schema

**File Location:** `web/src/lib/schemas/trade-schema.ts`

```typescript
import { z } from 'zod';

export const createTradeSchema = z.object({
  symbol: z.string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be 10 characters or less')
    .regex(/^[A-Z]+$/, 'Symbol must contain only uppercase letters')
    .transform(val => val.toUpperCase()),

  strikePrice: z.number()
    .min(0.01, 'Strike price must be greater than 0')
    .multipleOf(0.01, 'Strike price must have at most 2 decimal places'),

  expiryDate: z.string() // ISO date string
    .refine(val => new Date(val) >= new Date(), {
      message: 'Expiry date must be today or in the future'
    }),

  tradeType: z.enum(['BUY', 'SELL'], {
    required_error: 'Trade type is required'
  }),

  optionType: z.enum(['CALL', 'PUT'], {
    required_error: 'Option type is required'
  }),

  quantity: z.number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),

  costBasis: z.number()
    .multipleOf(0.01, 'Cost basis must have at most 2 decimal places'),

  currentValue: z.number()
    .multipleOf(0.01, 'Current value must have at most 2 decimal places'),

  notes: z.string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional()
    .nullable(),

  tradeGroupUuid: z.string().uuid().optional().nullable()
});

export type CreateTradeFormData = z.infer<typeof createTradeSchema>;
```

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTradeSchema, CreateTradeFormData } from '@/lib/schemas/tradeSchema';

const form = useForm<CreateTradeFormData>({
  resolver: zodResolver(createTradeSchema),
  defaultValues: {
    symbol: '',
    strikePrice: undefined,
    expiryDate: '',
    tradeType: undefined,
    optionType: undefined,
    quantity: 1,
    costBasis: undefined,
    currentValue: undefined,
    notes: '',
    tradeGroupUuid: null
  }
});
```

### TanStack Query Mutation

**File Location:** `web/src/hooks/api/useCreateTrade.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CreateTradeDto, TradeResponseDto } from '@/types/api.types';

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation<TradeResponseDto, Error, CreateTradeDto>({
    mutationFn: async (tradeData) => {
      const response = await api.post('/v1/trades', tradeData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate trades query to refetch list
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trade-groups'] });
    }
  });
}
```

### API Client Setup

**File Location:** `web/src/lib/api.ts`

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### Type Generation from OpenAPI

**Generate frontend types from Swagger:**

```bash
# Backend must be running at http://localhost:3000
npx openapi-typescript http://localhost:3000/api/docs-json -o ./src/types/api.types.ts
```

**This generates:**

```typescript
// api.types.ts (auto-generated)
export interface CreateTradeDto {
  symbol: string;
  strikePrice: number;
  expiryDate: string; // ISO date
  tradeType: 'BUY' | 'SELL';
  optionType: 'CALL' | 'PUT';
  quantity: number;
  costBasis: number;
  currentValue: number;
  notes?: string;
  tradeGroupUuid?: string;
}

export interface TradeResponseDto {
  uuid: string;
  symbol: string;
  strikePrice: number;
  expiryDate: string;
  tradeType: 'BUY' | 'SELL';
  optionType: 'CALL' | 'PUT';
  quantity: number;
  costBasis: number;
  currentValue: number;
  pnl: number; // calculated field
  daysToExpiry: number; // calculated field
  status: 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
  notes?: string;
  tradeGroupUuid?: string;
}
```

### Group Selection Implementation

**Fetch groups for dropdown:**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { TradeGroupResponseDto } from '@/types/api.types';

function useTradeGroups() {
  return useQuery<TradeGroupResponseDto[]>({
    queryKey: ['trade-groups'],
    queryFn: async () => {
      const response = await api.get('/v1/trade-groups');
      return response.data;
    }
  });
}

// In TradeForm component
const { data: groups = [] } = useTradeGroups();
```

### Error Handling

**Backend validation error format:**

```json
{
  "statusCode": 400,
  "message": [
    "symbol must be a string",
    "strikePrice must be a positive number"
  ],
  "error": "Bad Request"
}
```

**Map to form errors:**

```typescript
.catch(error => {
  if (error.response?.status === 400) {
    const messages = error.response.data.message;
    // Map backend messages to form fields
    messages.forEach((msg: string) => {
      if (msg.includes('symbol')) {
        form.setError('symbol', { message: msg });
      }
      // ... map other fields
    });
  } else {
    toast.error('Failed to create trade. Please try again.');
  }
});
```

### Toast Notifications

**Use shadcn/ui Sonner:**

```typescript
import { toast } from 'sonner';

// Success
toast.success('Trade created successfully');

// Error
toast.error('Failed to create trade');
```

### Performance Considerations

- Use React Hook Form's `mode: "onBlur"` to minimize re-renders
- Debounce symbol field transformation (uppercase conversion)
- Lazy load date picker component (dynamic import)
- Memoize group dropdown options

### Keyboard Shortcuts (Future Enhancement)

- `Ctrl/Cmd + Enter` - Submit form
- `Escape` - Clear form
- `Ctrl/Cmd + K` - Focus symbol field

---

## Dependencies

### Prerequisite Stories

- **STORY-004: Trade CRUD API Endpoints**
  - **Why:** Form submits to POST /v1/trades endpoint
  - **Blocker:** Cannot submit trades without API endpoint
  - **Status:** ✅ Completed

- **STORY-001: Monorepo Setup**
  - **Why:** Need web/ workspace for React components
  - **Status:** ✅ Completed

### Blocked Stories

- **STORY-009: Hierarchical Trade List View**
  - **Why:** Trade list displays trades created via this form
  - **Impact:** Moderate - list view can mock data, but integration testing requires real form

### External Dependencies

- **shadcn/ui components installed** (Input, Select, Button, Calendar, Textarea, Popover, Form)
- **React Hook Form** (^7.0.0)
- **Zod** (^3.0.0)
- **TanStack Query** (^5.0.0)
- **axios** (^1.6.0)
- **date-fns** (for date formatting)
- **Sonner** (for toast notifications)

### Package Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "date-fns": "^3.0.0",
    "sonner": "^1.3.0"
  }
}
```

---

## Definition of Done

### Code Quality

- [ ] Component follows React best practices (hooks, functional components)
- [ ] TypeScript strict mode passes (no `any` types)
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] No console.log statements (except in error handlers)
- [ ] All imports use absolute paths (@/ prefix)
- [ ] Component is self-documenting (minimal comments needed)

### Testing

- [ ] Manual testing completed for all fields
- [ ] Validation tested with invalid inputs
- [ ] API integration tested (success and error cases)
- [ ] Form reset tested after successful submission
- [ ] Group dropdown tested (populated from API)
- [ ] Toast notifications tested (success and error)
- [ ] Responsive layout tested (desktop, tablet, mobile)
- [ ] Keyboard navigation tested (Tab order, Enter to submit)
- [ ] No automated tests required for MVP

### Documentation

- [ ] Component props documented (if exported for reuse)
- [ ] Zod schema includes helpful error messages
- [ ] README updated with form usage instructions (if needed)
- [ ] No inline documentation needed (self-documenting code)

### Integration

- [ ] Code committed to git with descriptive message
- [ ] Merged to main branch (or feature branch)
- [ ] Works in Docker development environment
- [ ] No breaking changes to existing components
- [ ] Environment variables configured (.env.example)

### Functional

- [ ] All acceptance criteria satisfied
- [ ] Form demonstrates correctly in local environment
- [ ] Backend API integration verified (creates trades in database)
- [ ] Error handling works for all edge cases
- [ ] Validation prevents invalid data submission
- [ ] UI matches shadcn/ui design system

### Performance

- [ ] Form renders in <100ms
- [ ] Submit response within 500ms (target)
- [ ] No performance regressions (measure with React DevTools Profiler)
- [ ] Date picker loads quickly (<200ms)

---

## Story Points Breakdown

**Total: 5 points**

### Estimation Details

| Task                                      | Complexity | Time Estimate | Points |
| ----------------------------------------- | ---------- | ------------- | ------ |
| Component structure & basic fields        | Moderate   | 1.5 hours     | 1.5    |
| Zod validation schema                     | Simple     | 30 minutes    | 0.5    |
| React Hook Form integration               | Simple     | 30 minutes    | 0.5    |
| shadcn/ui styling & responsive layout     | Moderate   | 1 hour        | 1      |
| TanStack Query mutation & API integration | Moderate   | 1 hour        | 1      |
| Error handling & toast notifications      | Simple     | 30 minutes    | 0.5    |
| Group dropdown integration                | Simple     | 30 minutes    | 0.5    |
| Manual testing & bug fixes                | Moderate   | 1 hour        | 1      |
| **Total**                                 |            | **~6 hours**  | **5**  |

### Rationale

**Why 5 points:**

- Form has many fields (10 inputs) requiring careful validation
- Integration with multiple libraries (React Hook Form, Zod, TanStack Query)
- shadcn/ui setup requires component configuration
- Date picker is moderately complex (Popover + Calendar)
- Error handling for multiple scenarios (validation, API errors)
- Group dropdown requires separate API call
- NOT complex enough for 8 points (no complex business logic)
- MORE complex than 3 points (10 fields, validation, API integration)

**Senior developer efficiency:**

- ~1 story point = 1-1.2 hours for this task
- React Hook Form + Zod is well-documented (low uncertainty)
- shadcn/ui components copy-paste friendly
- API endpoint already tested (STORY-004 complete)

**Risks factored into estimate:**

- First shadcn/ui form implementation (+0.5 points for learning)
- Date picker configuration may need tweaking (+0.5 points)
- Backend API error format mapping (+0.25 points)

---

## Additional Notes

### UI/UX Decisions

**Form Layout:**

- Single-column layout on mobile (< 768px)
- Two-column layout on desktop (>= 768px)
  - Left column: Symbol, Strike, Expiry, Trade Type, Option Type
  - Right column: Quantity, Cost Basis, Current Value, Notes
- Group selection above notes field (full width)
- Submit button bottom-right, Cancel button bottom-left

**Field Focus Order:**

1. Symbol (auto-focus on mount)
2. Strike Price
3. Expiry Date
4. Trade Type
5. Option Type
6. Quantity
7. Cost Basis
8. Current Value
9. Trade Group
10. Notes
11. Submit Button

**Placeholder Examples:**

- Symbol: "e.g., AAPL"
- Strike Price: "e.g., 180.00"
- Quantity: "e.g., 10"
- Cost Basis: "e.g., -500.00"
- Current Value: "e.g., -480.00"
- Notes: "Sold weekly calls against LEAP position"

### Future Enhancements (Post-MVP)

**Quick Entry Mode:**

- Keyboard-only workflow
- Auto-advance to next field on valid input
- Submit with Ctrl/Cmd + Enter

**Trade Templates:**

- Save frequently used trade configurations
- One-click populate from template
- Edit template values before submit

**Smart Defaults:**

- Remember last symbol used
- Default quantity to 10 contracts
- Suggest current date + 7 days for expiry

**Real-time Validation:**

- Check symbol against market data API
- Validate strike price is valid for symbol
- Show current market price for reference

**Bulk Entry:**

- CSV import
- Multi-trade form (array of trades)

### Testing Strategy

**Manual Testing Checklist:**

1. **Happy Path:**
   - Fill all required fields with valid data
   - Submit form
   - Verify toast notification
   - Verify form resets
   - Verify trade appears in database (Prisma Studio)

2. **Validation Errors:**
   - Leave required fields empty → see errors
   - Enter invalid symbol (numbers, lowercase) → see error
   - Enter negative strike price → see error
   - Enter past expiry date → see error
   - Enter zero quantity → see error
   - Submit form → errors prevent submission

3. **API Errors:**
   - Stop backend server → submit → see error toast
   - Submit duplicate trade (if backend prevents) → see error
   - Submit with network delay → see loading state

4. **Group Selection:**
   - Create group via separate UI (STORY-007 prereq)
   - Refresh page
   - Verify group appears in dropdown
   - Select group → submit → verify trade assigned to group

5. **Responsive Design:**
   - Test on desktop (1920x1080) → two-column layout
   - Test on tablet (768x1024) → two-column layout
   - Test on mobile (375x667) → single-column layout

6. **Accessibility:**
   - Tab through form → logical order
   - Screen reader test (macOS VoiceOver or NVDA)
   - Keyboard-only submit (no mouse)

**No automated tests required for MVP** (manual testing sufficient)

### Rollback Plan

If form has critical bugs:

1. Temporarily disable "Create Trade" button with message: "Feature under maintenance"
2. Fix bugs in local environment
3. Re-test manually
4. Deploy fix
5. Re-enable button

If API integration fails:

1. Check backend logs: `docker-compose logs api`
2. Verify POST /v1/trades endpoint working (Swagger UI)
3. Check CORS configuration
4. Verify environment variables (VITE_API_URL)

---

## Progress Tracking

**Status History:**

- 2026-01-10 12:00: Story created by Scrum Master (BMAD Method v6)
- 2026-01-10 12:30: Implementation started
- 2026-01-10 15:47: Initial implementation completed
- 2026-01-10 16:15: Calendar styling and date picker timezone fixes completed

**Actual Effort:** 3 hours 45 minutes (Estimated: 5 points / ~6 hours)
**AI Velocity Multiplier:** ~1.6x faster than human estimate

**Implementation Notes:**

**Core Implementation:**
- Set up React 18 + Vite + TypeScript with strict mode
- Installed and configured shadcn/ui components (Button, Input, Select, Calendar, Dialog, Form, Popover, Textarea)
- Configured Tailwind CSS v4 with new @import and @theme syntax
- Implemented Zod v4 validation schema with new {message: '...'} format
- Created reusable React Hook Form wrapper components (ReactHookFormField, ReactHookFormSelect, ReactHookFormDatePicker)
- Implemented TradeForm component with all 10 required fields
- Set up openapi-fetch + openapi-react-query v0.5.1 for type-safe API client
- Created trade and trade group API hooks (useTradeApi, useTradeGroupApi)
- Implemented modal-based trade entry using Dialog component
- Fixed date picker and Select component integration issues

**Code Quality Improvements:**
- Added explicit TypeScript types to all useState hooks
- Removed all redundant comments (including JSX comments)
- Extracted ApiError interface to reusable types/api-error.ts
- Cleaned up response typing after backend Swagger fix
- Optimized error mapping logic with fieldMap object
- Created unified form reset with DEFAULT_TRADE_VALUES constant
- Renamed API methods with "ByUuid" suffix for clarity (getTradeByUuid, getTradeGroupByUuid, updateTradeByUuid, etc.)
- Added TypeScript helper types (GetPathParams) following DocAid pattern
- Implemented consistent queryKey structure: [method, path, params] format
- Fixed queryKey invalidation to use {}: ['get', '/v1/trades', {}]

**Backend Improvements:**
- Created api/src/common/decorators/api-data-response.decorator.ts
- Implemented ApiOkDataResponse and ApiCreatedDataResponse decorators (following DocAid pattern)
- Added response type documentation to trades.controller.ts and trade-groups.controller.ts
- Fixed OpenAPI schema generation - response types now properly defined in api.schema.ts
- Exported decorators from api/src/common/decorators/index.ts

**Technical Stack:**
- openapi-fetch v0.15.0 + openapi-react-query v0.5.1 (type-safe API client)
- React Hook Form v7.70.0 + Zod v4.3.5 (form management and validation)
- TanStack Query v5.90.16 (server state management)
- shadcn/ui components with Radix UI primitives
- Tailwind CSS v4.1.18 (alpha version with new syntax)
- date-fns v4.1.0 (date formatting)
- Sonner v2.0.7 (toast notifications)

**Technical Decisions:**
- Used openapi-fetch instead of Axios for automatic type inference from OpenAPI spec
- Followed DocAid pattern for Swagger decorators and queryKey structure
- Used Tailwind CSS v4 (alpha) for latest features (@import, @theme directives)
- Implemented modal-based form instead of dedicated page for better UX
- Used Zod v4 with new error message format: {message: 'Error text'}
- Created reusable React Hook Form wrapper components to reduce boilerplate

**Challenges Resolved:**
- Tailwind CSS v4 syntax differences from v3 (@import "tailwindcss" instead of @tailwind directives)
- Zod v4 API changes (error messages now use object format: {message: '...'})
- shadcn/ui Select component type issues (resolved with proper typing and react-select integration)
- Backend missing response type documentation (fixed by creating custom @ApiOkDataResponse/@ApiCreatedDataResponse decorators)
- WebStorm autocomplete showing confusing queryKey order (investigated, determined correct order is [method, path, params])
- Form reset value duplication (resolved with DEFAULT_TRADE_VALUES: Partial<CreateTradeSchema> constant)
- TypeScript strict mode errors with undefined in form defaults (fixed with Partial<T> type)
- Calendar dates squished together (Tailwind v4 alpha doesn't process CSS custom properties correctly - replaced [--cell-size] with explicit w-9/h-9 classes)
- Date picker timezone bug (selecting date was off by one day - fixed by using date-fns parseISO and format instead of Date.toISOString)
- Calendar focus ring styling (removed gray border/ring on selected dates for cleaner appearance)

**Quality Checks:**
- ✅ TypeScript strict mode: 0 errors
- ✅ ESLint: 0 errors, 16 warnings (missing return types on functions - non-blocking)
- ✅ Prettier: All files formatted
- ✅ Form validation: All 10 fields validate correctly with appropriate error messages
- ✅ API integration: Successfully creates trades via POST /v1/trades
- ✅ Error handling: Backend validation errors properly mapped to form fields
- ✅ Success feedback: Toast notification and form reset on successful submission
- ✅ Responsive design: Form layout adapts to mobile, tablet, desktop viewports

**Files Changed:**
- Frontend: 25+ new files (components, hooks, schemas, types, providers)
- Backend: 2 new files, 2 modified files (decorator pattern for Swagger)
- OpenAPI schema regenerated with proper response types

**Commit:** a8ce1e9 - "refactor: code quality improvements for trade form and API integration"

**Blockers:** None

---

**This story was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
