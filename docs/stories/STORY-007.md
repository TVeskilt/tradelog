# STORY-007: Strategy Builder UI (Atomic Multi-Leg Trade Creation)

**Epic:** EPIC-002: Trade & Group Management
**Priority:** High
**Story Points:** 8
**Status:** In Progress
**Assigned To:** Developer
**Created:** 2026-01-11
**Updated:** 2026-01-11 (Pivoted to Strategy Builder approach)
**Sprint:** Sprint 3

---

## User Story

As a **trader building multi-leg options strategies**
I want to **create a strategy with multiple trades in a single atomic operation**
So that **I can quickly build complex positions without managing trades and groups separately**

---

## Description

### Background

**Original Approach (Abandoned):** Separate group management UI where users created empty groups then assigned existing trades. This was counterintuitive and disconnected.

**New Approach (Strategy Builder):** Integrated strategy builder within the trade creation modal. Users toggle "Build Multi-Leg Strategy" and add multiple trades together with group metadata in one flow. Everything is created atomically.

Interactive Brokers limits multi-leg strategies (4-leg max) and doesn't allow post-creation editing. This Strategy Builder eliminates those constraints by providing:
- Unlimited leg grouping (no 4-leg limit)
- Atomic creation (group + all trades in single transaction)
- Visual strategy preview while building
- Intuitive single-modal workflow
- Optional: Create standalone trades OR multi-leg strategies

### Scope

**In scope:**
- Strategy builder toggle within trade creation modal
- Add multiple trades to strategy (min 2 required)
- Group metadata fields (name, strategy type, notes)
- Trade line item preview showing added trades
- Atomic strategy creation (POST /v1/strategies endpoint)
- Single trade creation (existing POST /v1/trades endpoint)
- Form validation (min 2 trades for strategy, group fields required)
- Strategy type badges (visual indicators)
- Responsive design for desktop and tablet

**Out of scope:**
- Separate group management page (removed)
- Editing trades after adding to strategy list (MVP: no editing)
- Draft strategy saving (all-or-nothing creation)
- Trade assignment to existing groups (future: via trade list)
- Group deletion (covered in STORY-008)
- Advanced drag-and-drop reordering
- Group templates or quick-entry presets (FR-010, future)
- Mobile-specific optimizations (tablet minimum)

### User Flow

**Flow 1: Creating a Single Trade (Strategy Builder OFF)**

1. User clicks "Add Trade" button
2. Trade modal opens with toggle "Build Multi-Leg Strategy" (default: OFF)
3. User fills in single trade fields (symbol, strike, expiry, type, etc.)
4. User clicks "Create Trade"
5. System validates and calls POST /v1/trades API
6. Success toast: "Trade created successfully"
7. Modal closes automatically
8. Trade appears in trade list

**Flow 2: Building a Multi-Leg Strategy (Strategy Builder ON)**

1. User clicks "Add Trade" button
2. Trade modal opens
3. User toggles "Build Multi-Leg Strategy" → ON
4. Strategy section appears with group fields:
   - Name: "AAPL Calendar Spread Feb-15"
   - Strategy Type: "Calendar Spread" (dropdown)
   - Notes: "Selling Feb-15 $150 call, buying Mar-15 $150 call" (optional)
5. User fills in first trade details (symbol, strike, expiry, etc.)
6. User clicks "Add Trade to Strategy" button
7. Trade is added to strategy preview list as simplified line item:
   - "AAPL $150 Call 2/15/26 - SELL 10 @ -$500"
8. Form resets, user fills in second trade
9. User clicks "Add Trade to Strategy" again
10. Second trade added to list: "AAPL $150 Call 3/15/26 - BUY 10 @ $450"
11. User can add more trades (optional, no max limit)
12. User clicks "Create Strategy" button (enabled when ≥2 trades)
13. System validates:
    - Group fields filled (name, strategyType required)
    - Minimum 2 trades in list
14. System calls POST /v1/strategies API (atomic transaction)
15. Success toast: "Strategy 'AAPL Calendar Spread Feb-15' created with 2 trades"
16. Modal closes automatically
17. Strategy group + all trades appear in trade list

**Flow 3: Strategy Creation Validation Errors**

- If user tries to submit with <2 trades: Error "Strategy must have at least 2 trades"
- If group name empty: Validation error "Strategy name is required"
- If strategyType not selected: Validation error "Strategy type is required"
- If backend transaction fails: All changes rolled back, error toast shown

---

## Acceptance Criteria

### Strategy Builder Toggle

- [ ] "Add Trade" button opens trade modal
- [ ] Trade modal includes toggle switch labeled "Build Multi-Leg Strategy"
- [ ] Toggle default state is OFF
- [ ] Toggle uses shadcn/ui Switch component
- [ ] Toggle is visible at top of modal (prominent placement)
- [ ] Toggling ON reveals strategy section below
- [ ] Toggling OFF hides strategy section

### Strategy Section (When Toggle ON)

- [ ] Strategy section displays three group fields:
  - [ ] Name (text input, required, max 100 characters, placeholder: "e.g., AAPL Calendar Spread Feb-15")
  - [ ] Strategy Type (select dropdown with 3 options: "Calendar Spread", "Ratio Calendar Spread", "Custom")
  - [ ] Notes (textarea, optional, max 500 characters, placeholder: "Strategy notes...")
- [ ] Fields visually grouped in bordered container
- [ ] Section appears above trade form fields

### Adding Trades to Strategy

- [ ] When strategy mode ON, submit button text changes to "Add Trade to Strategy"
- [ ] Clicking "Add Trade to Strategy" validates current trade form
- [ ] Valid trade is added to strategy trade list (displayed below form)
- [ ] Trade appears as simplified line item: "AAPL $150 Call 2/15/26 - BUY 10 @ $500"
- [ ] Line item format: `{symbol} ${strike} {optionType} {expiryDate} - {tradeType} {quantity} @ ${costBasis}`
- [ ] Each line item has remove button (X icon)
- [ ] After adding trade, trade form resets but strategy fields persist
- [ ] User can add unlimited trades (no max limit)
- [ ] Trade list shows count: "Trades in strategy: 2"

### Strategy Creation

- [ ] Final submit button appears when ≥1 trade in list
- [ ] Button labeled "Create Strategy" when strategy mode ON
- [ ] Button disabled when:
  - [ ] Less than 2 trades in list
  - [ ] Group name empty
  - [ ] Strategy type not selected
- [ ] Validation errors shown:
  - [ ] "Strategy must have at least 2 trades" if <2 trades
  - [ ] "Strategy name is required" if name empty
  - [ ] "Strategy type is required" if not selected
- [ ] Clicking "Create Strategy" calls POST /v1/strategies API
- [ ] Request payload includes:
  ```json
  {
    "group": { "name": "...", "strategyType": "...", "notes": "..." },
    "trades": [...]
  }
  ```
- [ ] Success toast: "Strategy '{name}' created with X trades"
- [ ] Modal closes automatically after success
- [ ] Both group and all trades appear in trade list

### Single Trade Creation (Toggle OFF)

- [ ] When strategy mode OFF, form behaves like original
- [ ] Submit button labeled "Create Trade"
- [ ] Clicking "Create Trade" calls POST /v1/trades API
- [ ] Success toast: "Trade created successfully"
- [ ] Modal closes after success

### Backend Integration

- [ ] New endpoint: POST /v1/strategies
- [ ] Endpoint accepts CreateStrategyDto
- [ ] Backend creates group + all trades in single transaction
- [ ] If any trade fails, entire transaction rolls back
- [ ] Returns DataResponseDto<TradeGroupResponseDto> with all trades
- [ ] Existing POST /v1/trades endpoint still works for single trades

### UI/UX Requirements

- [ ] All components use shadcn/ui design system components:
  - [ ] Dialog for create/edit modals
  - [ ] Form, Input, Textarea, Select for form fields
  - [ ] Button for actions
  - [ ] Badge for strategy type indicators
  - [ ] Checkbox for trade selection
  - [ ] Toast for notifications
  - [ ] Table for group list
- [ ] Strategy type visual indicators:
  - [ ] Calendar Spread: `<Badge variant="default" className="bg-blue-500">📅 Calendar Spread</Badge>`
  - [ ] Ratio Calendar Spread: `<Badge variant="default" className="bg-purple-500">📊 Ratio Calendar Spread</Badge>`
  - [ ] Custom: `<Badge variant="secondary">🔧 Custom</Badge>`
- [ ] Responsive layout:
  - [ ] Desktop: Full features, side-by-side layouts
  - [ ] Tablet: Stacked layouts, full functionality
  - [ ] Mobile: Not optimized (out of scope)
- [ ] Keyboard navigation support:
  - [ ] Tab through form fields
  - [ ] Enter to submit forms
  - [ ] Escape to close modals
  - [ ] Space to toggle checkboxes
- [ ] Accessibility (a11y):
  - [ ] Form labels properly associated with inputs
  - [ ] ARIA attributes on modal (role="dialog", aria-labelledby, aria-describedby)
  - [ ] Focus trap in modal (focus stays within modal when open)
  - [ ] Focus returns to trigger button when modal closes
  - [ ] Screen reader announcements for success/error states
- [ ] Loading states:
  - [ ] Spinner on initial group list load
  - [ ] Skeleton rows while loading
  - [ ] Button spinners during form submission
  - [ ] Disabled buttons with loading state
- [ ] Error states:
  - [ ] Inline validation errors (red text below fields)
  - [ ] API error toasts (red background, error icon)
  - [ ] Retry buttons on failure states
  - [ ] Clear, actionable error messages

### Data Management

- [ ] TanStack Query manages server state:
  - [ ] `useQuery` for fetching groups (key: ['trade-groups'])
  - [ ] `useMutation` for create/update/delete operations
  - [ ] Cache invalidation after mutations (invalidateQueries(['trade-groups']))
  - [ ] Stale time: 30 seconds (refetch if data older than 30s)
- [ ] React Hook Form manages form state:
  - [ ] `useForm` hook with Zod resolver
  - [ ] `register` for input binding
  - [ ] `handleSubmit` for form submission
  - [ ] `formState.errors` for validation errors
  - [ ] `reset` to clear form after success
- [ ] Zod schema validation:
  - [ ] Schema matches CreateTradeGroupDto from backend
  - [ ] Client-side validation before API call
  - [ ] Type-safe form data

### Performance

- [ ] Form submission completes within 2 seconds (including API call)
- [ ] Group list renders within 1 second for 100 groups
- [ ] No UI blocking during API calls (async/await with loading states)
- [ ] Trade assignment for 10 trades completes within 5 seconds
- [ ] Optimistic updates optional (nice-to-have, not required for MVP)

---

## Technical Notes

### Components Involved

**Frontend:**
- `web/src/components/GroupManagement/GroupManagement.tsx` - Main container component
- `web/src/components/GroupManagement/GroupList.tsx` - Group list display
- `web/src/components/GroupManagement/GroupFormModal.tsx` - Create/edit modal
- `web/src/components/GroupManagement/GroupForm.tsx` - Reusable form component
- `web/src/components/GroupManagement/GroupStrategyBadge.tsx` - Strategy badge component
- `web/src/components/TradeList/TradeAssignment.tsx` - Trade assignment UI (extends STORY-009)
- `web/src/hooks/useGroups.ts` - TanStack Query hooks for group operations
- `web/src/hooks/useTradeAssignment.ts` - Trade assignment logic
- `web/src/lib/validations/group.schema.ts` - Zod schemas for group forms

**Shared:**
- Generated types from openapi-typescript (TradeGroupResponseDto, CreateTradeGroupDto, UpdateTradeGroupDto)

### API Endpoints

**Group CRUD (from STORY-005):**
- `POST /v1/trade-groups` - Create group
  - Input: `{ name, strategyType, tradeUuids[], notes? }`
  - Output: `DataResponseDto<TradeGroupResponseDto>`
- `GET /v1/trade-groups` - List all groups
  - Output: `DataResponseDto<TradeGroupResponseDto[]>`
- `GET /v1/trade-groups/:uuid` - Get single group
  - Output: `DataResponseDto<TradeGroupResponseDto>`
- `PUT /v1/trade-groups/:uuid` - Update group
  - Input: `{ name?, strategyType?, notes? }`
  - Output: `DataResponseDto<TradeGroupResponseDto>`
- `DELETE /v1/trade-groups/:uuid` - Delete group (STORY-008)

**Trade Assignment (from STORY-004):**
- `PUT /v1/trades/:uuid` - Update trade
  - Input: `{ tradeGroupUuid: string | null }`
  - Used for assigning/ungrouping trades

### State Management

**TanStack Query (Server State):**

```typescript
// web/src/hooks/useGroups.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TradeGroupResponseDto, CreateTradeGroupDto, UpdateTradeGroupDto } from '@/types/api';

export function useGroups() {
  return useQuery({
    queryKey: ['trade-groups'],
    queryFn: async () => {
      const response = await fetch('/api/v1/trade-groups');
      const data = await response.json();
      return data.data as TradeGroupResponseDto[];
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTradeGroupDto) => {
      const response = await fetch('/api/v1/trade-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-groups'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] }); // Refresh trade list too
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, data }: { uuid: string; data: UpdateTradeGroupDto }) => {
      const response = await fetch(`/api/v1/trade-groups/${uuid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trade-groups'] });
    },
  });
}
```

**React Hook Form (Form State):**

```typescript
// web/src/components/GroupManagement/GroupForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupSchema } from '@/lib/validations/group.schema';

const form = useForm({
  resolver: zodResolver(groupSchema),
  defaultValues: {
    name: '',
    strategyType: 'CUSTOM',
    notes: '',
  },
});
```

**Zod Validation Schema:**

```typescript
// web/src/lib/validations/group.schema.ts
import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  strategyType: z.enum(['CALENDAR_SPREAD', 'RATIO_CALENDAR_SPREAD', 'CUSTOM'], {
    required_error: 'Strategy type is required',
  }),
  notes: z.string()
    .max(500, 'Notes must be 500 characters or less')
    .optional(),
});

export type GroupFormData = z.infer<typeof groupSchema>;
```

### Component Structure Example

**GroupFormModal.tsx:**

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GroupForm } from './GroupForm';
import type { TradeGroupResponseDto } from '@/types/api';

interface GroupFormModalProps {
  open: boolean;
  onClose: () => void;
  group?: TradeGroupResponseDto; // Undefined for create, defined for edit
}

export function GroupFormModal({ open, onClose, group }: GroupFormModalProps) {
  const isEdit = !!group;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Group' : 'Create Group'}</DialogTitle>
        </DialogHeader>
        <GroupForm
          group={group}
          onSuccess={onClose}
          mode={isEdit ? 'edit' : 'create'}
        />
      </DialogContent>
    </Dialog>
  );
}
```

**GroupForm.tsx:**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useCreateGroup, useUpdateGroup } from '@/hooks/useGroups';
import { groupSchema, type GroupFormData } from '@/lib/validations/group.schema';
import { toast } from 'sonner';

interface GroupFormProps {
  group?: TradeGroupResponseDto;
  onSuccess: () => void;
  mode: 'create' | 'edit';
}

export function GroupForm({ group, onSuccess, mode }: GroupFormProps) {
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: group?.name || '',
      strategyType: group?.strategyType || 'CUSTOM',
      notes: group?.notes || '',
    },
  });

  const onSubmit = async (data: GroupFormData) => {
    try {
      if (mode === 'create') {
        await createGroup.mutateAsync({ ...data, tradeUuids: [] });
        toast.success(`Group '${data.name}' created successfully`);
      } else {
        await updateGroup.mutateAsync({ uuid: group!.uuid, data });
        toast.success(`Group '${data.name}' updated successfully`);
      }
      onSuccess();
      form.reset();
    } catch (error) {
      toast.error('Failed to save group. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., AAPL Calendar Spread Feb-15" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="strategyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Strategy Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CALENDAR_SPREAD">Calendar Spread</SelectItem>
                  <SelectItem value="RATIO_CALENDAR_SPREAD">Ratio Calendar Spread</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Strategy notes or leg descriptions..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Create Group' : 'Update Group'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**GroupStrategyBadge.tsx:**

```typescript
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Layers, Wrench } from 'lucide-react';
import type { StrategyType } from '@/types/api';

interface GroupStrategyBadgeProps {
  strategyType: StrategyType;
}

export function GroupStrategyBadge({ strategyType }: GroupStrategyBadgeProps) {
  const config = {
    CALENDAR_SPREAD: {
      label: 'Calendar Spread',
      icon: CalendarDays,
      className: 'bg-blue-500 hover:bg-blue-600',
    },
    RATIO_CALENDAR_SPREAD: {
      label: 'Ratio Calendar Spread',
      icon: Layers,
      className: 'bg-purple-500 hover:bg-purple-600',
    },
    CUSTOM: {
      label: 'Custom',
      icon: Wrench,
      className: 'bg-gray-500 hover:bg-gray-600',
    },
  }[strategyType];

  const Icon = config.icon;

  return (
    <Badge variant="default" className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

### Trade Assignment Implementation

**Trade assignment logic (integrated with STORY-009 trade list):**

```typescript
// web/src/hooks/useTradeAssignment.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAssignTradesToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tradeUuids, groupUuid }: { tradeUuids: string[]; groupUuid: string }) => {
      // Update each trade sequentially
      const promises = tradeUuids.map(uuid =>
        fetch(`/api/v1/trades/${uuid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeGroupUuid: groupUuid }),
        })
      );

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trade-groups'] });
    },
  });
}

export function useUngroupTrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tradeUuids }: { tradeUuids: string[] }) => {
      const promises = tradeUuids.map(uuid =>
        fetch(`/api/v1/trades/${uuid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tradeGroupUuid: null }),
        })
      );

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['trade-groups'] });
    },
  });
}
```

### Type Generation

**Generate TypeScript types from OpenAPI spec:**

```bash
# Install openapi-typescript
pnpm add -D openapi-typescript

# Generate types from Swagger JSON
npx openapi-typescript http://localhost:3000/api-json -o web/src/types/api.ts

# Types generated include:
# - TradeGroupResponseDto
# - CreateTradeGroupDto
# - UpdateTradeGroupDto
# - StrategyType enum
# - All other API types
```

### Security Considerations

- **Input validation:** Zod schema validates all inputs client-side before API call
- **XSS prevention:** React automatically escapes user input in JSX
- **CSRF protection:** Not required for MVP (same-origin API)
- **Data sanitization:** Zod schema strips unexpected fields
- **Error messages:** Don't expose sensitive backend details to users

### Edge Cases

1. **Creating group with no trades initially:**
   - Backend requires 2+ trades in CreateTradeGroupDto.tradeUuids
   - Solution: Create group with empty tradeUuids[], then assign trades later via PUT /v1/trades/:uuid
   - **OR** require user to select 2+ trades before creating group

2. **Editing group while trades are being assigned:**
   - TanStack Query cache may be stale during concurrent mutations
   - Solution: Invalidate cache after all mutations complete
   - Loading states prevent user from triggering duplicate requests

3. **Assigning already-grouped trade to different group:**
   - Backend allows reassignment (overwrites tradeGroupUuid)
   - No confirmation needed (user intention is clear from action)

4. **Network failure during multi-trade assignment:**
   - Some trades may succeed, others fail
   - Solution: Show detailed error: "3 of 5 trades assigned successfully. [Retry failed trades]"

5. **Group list empty after creation (cache invalidation delay):**
   - TanStack Query refetches after invalidation
   - Loading state shows user that refresh is in progress

6. **Very long group names (100+ characters):**
   - Zod validation prevents submission
   - Backend also validates (max 100 characters)
   - UI truncates display with ellipsis if needed

---

## Dependencies

### Prerequisite Stories

- **STORY-001:** Monorepo Setup with pnpm Workspaces (COMPLETED)
  - Provides frontend monorepo structure (web/)
  - Establishes shared packages for types

- **STORY-005:** Group CRUD API Endpoints (MUST COMPLETE FIRST)
  - Provides backend API this UI consumes
  - POST /v1/trade-groups, GET /v1/trade-groups, PUT /v1/trade-groups/:uuid
  - TradeGroupResponseDto, CreateTradeGroupDto, UpdateTradeGroupDto types

- **STORY-004:** Trade CRUD API Endpoints (COMPLETED)
  - Provides PUT /v1/trades/:uuid for trade assignment
  - TradeResponseDto types

- **STORY-006:** Trade Entry Form UI (RECOMMENDED)
  - Establishes patterns for React Hook Form + Zod + shadcn/ui
  - Form validation patterns to follow
  - Modal dialog patterns

### Blocked Stories

- **STORY-009:** Hierarchical Trade List View
  - Will integrate trade assignment UI from this story
  - Will display groups created via this UI

- **STORY-010:** Dashboard Metrics & Filtering
  - Uses group management UI for creating/editing groups from dashboard

### External Dependencies

**Required npm packages (should already be installed from STORY-006):**
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod resolver for React Hook Form
- `@tanstack/react-query` - Server state management
- `sonner` - Toast notifications
- `lucide-react` - Icons

**Required shadcn/ui components:**
- Dialog (modal)
- Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- Input
- Textarea
- Select, SelectTrigger, SelectValue, SelectContent, SelectItem
- Button
- Badge
- Checkbox
- Table
- Toast

**Type generation:**
- `openapi-typescript` - Generate TypeScript types from Swagger

---

## Definition of Done

### Code Quality

- [ ] All acceptance criteria satisfied
- [ ] TypeScript strict mode enabled, no `any` types
- [ ] ESLint passes with no warnings or errors
- [ ] Prettier formatting applied
- [ ] Code reviewed (self-review for solo developer)
- [ ] No console.log or debug statements in production code

### Testing

- [ ] Manual testing completed for all user flows:
  - [ ] Create group with valid data
  - [ ] Create group with invalid data (validation errors shown)
  - [ ] Edit group (name, strategy type, notes)
  - [ ] Assign trades to group (single and multiple)
  - [ ] Ungroup trades
  - [ ] Cancel actions (modal closes without saving)
  - [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Error handling tested:
  - [ ] API errors show toast notifications
  - [ ] Network failures handled gracefully
  - [ ] Retry functionality works
- [ ] Responsive testing:
  - [ ] Desktop (1920x1080, 1366x768)
  - [ ] Tablet (768x1024)
- [ ] Accessibility testing:
  - [ ] Keyboard navigation works
  - [ ] Screen reader compatible (NVDA/VoiceOver spot check)
  - [ ] Focus management correct
- [ ] No unit tests required for MVP
- [ ] No E2E tests required for MVP

### Documentation

- [ ] Code comments for complex logic only
- [ ] Component props documented with JSDoc (optional but recommended)
- [ ] README updated if new dependencies added

### Integration

- [ ] Code committed to git with descriptive message
- [ ] Merged to main branch (or feature branch if multi-day work)
- [ ] Works with Docker backend (api running on localhost:3000)
- [ ] No breaking changes to existing components
- [ ] STORY-005 API confirmed working via manual API testing

### Functional

- [ ] Feature demonstrates correctly in browser
- [ ] Groups can be created with name, strategy type, notes
- [ ] Groups can be edited
- [ ] Groups display in list with correct badges
- [ ] Trades can be assigned to groups
- [ ] Trades can be ungrouped
- [ ] Form validation works (client-side Zod)
- [ ] API errors handled with clear messages
- [ ] Loading states visible during async operations
- [ ] Success/error toast notifications shown
- [ ] UI matches shadcn/ui design system
- [ ] Responsive layout works on desktop and tablet

### Performance

- [ ] Form submission completes within 2 seconds
- [ ] Group list renders within 1 second for 100 groups
- [ ] No UI blocking during API calls
- [ ] Trade assignment for 10 trades completes within 5 seconds

---

## Story Points Breakdown

**Total: 5 points**

### Breakdown

- **Component Structure (1 point):**
  - GroupManagement container
  - GroupList display component
  - GroupFormModal and GroupForm
  - GroupStrategyBadge component
  - File organization and barrel exports

- **Form Management (1.5 points):**
  - React Hook Form setup with Zod resolver
  - Zod schema validation (group.schema.ts)
  - Form field binding and error handling
  - Pre-population for edit mode
  - Form reset and dirty state management

- **API Integration (1 point):**
  - TanStack Query hooks (useGroups, useCreateGroup, useUpdateGroup)
  - Cache invalidation strategy
  - Error handling and retry logic
  - Loading states

- **Trade Assignment (1 point):**
  - Checkbox selection UI
  - Group dropdown selector
  - useAssignTradesToGroup and useUngroupTrades hooks
  - Multi-trade operation handling
  - Progress indicators

- **UI/UX Polish (0.5 points):**
  - shadcn/ui component integration
  - Strategy badge with icons
  - Toast notifications
  - Loading/error states
  - Responsive design
  - Keyboard navigation and accessibility

### Rationale

This is a moderate-complexity story (5 points) because:

1. **Established patterns:** STORY-006 Trade Entry Form provides React Hook Form + Zod + shadcn/ui blueprint
2. **Straightforward CRUD:** Create/edit/list operations with standard TanStack Query patterns
3. **Reusable components:** GroupForm component reused for both create and edit modes
4. **Simple validation:** Basic field validation (required, length limits)
5. **No complex state:** TanStack Query handles server state, React Hook Form handles form state
6. **Trade assignment adds complexity:** Multi-trade operations with progress tracking

**Complexity factors:**
- Trade assignment/ungrouping requires coordination with trade list (STORY-009)
- Multi-trade operations need error handling for partial failures
- Strategy badge component needs icon mapping and styling

**Originally estimated 5 points based on:**
- Similar scope to STORY-006 Trade Entry Form (5 points)
- Additional complexity from trade assignment (+0.5 points)
- Simpler validation than trade form (-0.5 points)
- **Net: 5 points**

---

## Additional Notes

### Why Separate Group Management from Trade List?

**Decision:** Group Management UI is a separate page/section from Hierarchical Trade List.

**Rationale:**
- **Focused user flows:** Creating/editing groups is a distinct task from viewing trades
- **Reusability:** GroupFormModal can be triggered from multiple locations (dashboard, trade list, dedicated page)
- **Cleaner separation of concerns:** Group CRUD logic isolated from trade display logic
- **Future flexibility:** Easier to add group-specific features (templates, bulk operations)

**Integration point:** Trade assignment UI integrates with trade list (STORY-009) via shared hooks.

### Why Allow Creating Groups Without Initial Trades?

**Decision:** Users can create empty groups, then assign trades later.

**Alternative approach:** Require 2+ trades selected before creating group.

**Rationale:**
- **User flexibility:** Sometimes users want to set up group structure before adding trades
- **Simpler workflow:** Create group first, assign trades second (two-step process)
- **Backend constraint:** Backend requires 2+ trades in `tradeUuids[]` on creation
- **Solution:** Pass empty `tradeUuids: []` on creation, assign via PUT /v1/trades/:uuid afterward

**Trade-off:** Groups may exist with 0 trades temporarily (acceptable for MVP).

### Strategy Type Badge Design

**Visual Design:**
- **Calendar Spread:** Blue background, calendar icon
- **Ratio Calendar Spread:** Purple background, layers icon
- **Custom:** Gray background, wrench icon

**Why these colors/icons:**
- **Blue (calendar):** Intuitive association with time-based strategies
- **Purple (layers):** Implies ratio/complexity with stacked layers
- **Gray (wrench):** Neutral color for custom/miscellaneous

**Implementation:** Use Tailwind CSS utility classes for consistency:
```tsx
<Badge className="bg-blue-500 hover:bg-blue-600 text-white">
  <CalendarDays className="mr-1 h-3 w-3" />
  Calendar Spread
</Badge>
```

### Trade Assignment UX Considerations

**Checkbox vs. Drag-and-Drop:**
- **MVP approach:** Checkbox selection + dropdown (simpler implementation)
- **Future enhancement:** Drag-and-drop reordering and assignment (better UX, more complex)

**Why checkbox for MVP:**
- **Faster to implement:** Standard HTML checkboxes + onClick handlers
- **Accessible:** Keyboard navigation works out-of-box
- **Proven pattern:** Familiar to users from email clients, file managers
- **Mobile-friendly:** Works on touch devices (drag-drop requires extra library like dnd-kit)

**Future drag-drop enhancement:**
```tsx
// Post-MVP: dnd-kit integration
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
// Allow dragging trades into group rows
```

### Performance Optimization Notes

**TanStack Query Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds - data considered fresh
      cacheTime: 300000, // 5 minutes - cache kept in memory
      refetchOnWindowFocus: false, // Don't refetch on tab focus (MVP)
      retry: 1, // Retry failed requests once
    },
  },
});
```

**Form Optimization:**
- Use `react-hook-form` uncontrolled mode (better performance than controlled)
- Debounce search inputs if filtering groups (300ms delay)
- Lazy load modal content (only render when open)

**List Rendering:**
- For 100 groups: Standard list rendering sufficient (<1s)
- For 1000+ groups: Consider virtualization with `@tanstack/react-virtual`
- No need for virtualization in MVP (target <100 groups)

---

## Implementation Pivot (2026-01-11)

**Original Approach (Discarded):**
- Separate Group Management page with CRUD UI
- Users create empty groups, then assign existing trades
- Disconnected workflow requiring navigation between pages
- Backend required 2+ trades but UI created empty groups (awkward workaround)

**New Approach (Strategy Builder):**
- Integrated strategy builder within trade modal
- Toggle switch enables multi-leg strategy mode
- Atomic creation: group + all trades in single transaction
- Intuitive single-modal workflow
- Backend endpoint: POST /v1/strategies for atomic creation

**Rationale for Pivot:**
- Creating empty groups is counterintuitive
- Users naturally think "I'm building a strategy" not "I'm creating a container for trades"
- Atomic creation ensures data consistency
- Single-modal flow is faster and more intuitive
- Aligns with trader mental model: "Build a calendar spread" not "Create group, then add trades"

**Impact:**
- Story points increased from 5 → 8 (additional backend endpoint, more complex frontend state)
- Group Management components removed (simpler overall)
- Better UX alignment with user needs
- Cleaner backend transaction management

---

## Progress Tracking

**Status History:**
- 2026-01-11: Created by user
- 2026-01-11: Pivoted to Strategy Builder approach
- 2026-01-11: Started implementation
- 2026-01-11: Implementation completed
- 2026-01-11: Testing completed - all acceptance criteria met

**Actual Effort:** ~1 hour 15 minutes (8 story points estimated, completed faster than expected)

**Implementation Summary:**
- Backend: CreateStrategyDto, POST /v1/strategies with atomic transaction
- Frontend: Complete TradeForm refactor with strategy builder toggle
- Removed: Separate group management UI (no longer needed)
- Testing: Single trade creation ✓, Multi-leg strategy creation ✓, Validation ✓

---

**This story was created using BMAD Method v6 - Phase 4 (Implementation Planning)**
**Updated with Strategy Builder pivot (2026-01-11)**
