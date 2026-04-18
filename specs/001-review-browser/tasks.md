---

description: "Task list for 酒店评论浏览网页 feature implementation"
---

# Tasks: 酒店评论浏览网页

**Input**: Design documents from `/specs/001-review-browser/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: Tests are OPTIONAL. Core API logic should have basic unit tests per project constitution quality standards.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` (Next.js App Router)
- **API routes**: `src/app/api/`
- **Components**: `src/components/`
- **Database scripts**: `src/scripts/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js project and configure dependencies

- [x] T001 Create Next.js project with TypeScript and Tailwind CSS
- [x] T002 [P] Install dependencies (@supabase/supabase-js, lucide-react, csv-parser)
- [x] T003 Configure Supabase client in `src/lib/supabase.ts` and environment variables in `.env.local.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database setup and API layer that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `comments` table in Insforge with all fields, indexes, and RLS policy (SQL documented in data-model.md)
- [x] T005 Create data import script `src/scripts/import-data.ts` to parse CSV and map fields (score→star, categories→category1/2/3)
- [x] T006 Execute data import and verify: 2542 records imported correctly with all transformations applied
- [x] T007 [P] Implement GET `/api/comments/route.ts` with filtering, search, pagination, and sorting
- [x] T008 [P] Implement GET `/api/comments/stats/route.ts` with dynamic statistics based on current filters
- [x] T009 Implement GET `/api/filters/route.ts` returning distinct filter options (room types, travel types, categories)

**Checkpoint**: API layer ready — all endpoints return correct data from Insforge

---

## Phase 3: User Story 1 - 浏览评论列表 (Priority: P1) 🎯 MVP

**Goal**: Display a paginated list of hotel comments with rating, date, room type, travel type, text, and tags

**Independent Test**: Open the page — a list of comment cards should render with correct data from Insforge; pagination should work

### Implementation for User Story 1

- [x] T010 [P] [US1] Create TypeScript type definitions in `src/types/comment.ts`
- [x] T011 [P] [US1] Create base UI components (styles embedded in components)
- [x] T012 [P] [US1] Implement `CommentCard` component in `src/components/CommentCard.tsx`
- [x] T013 [US1] Implement `CommentList` with pagination in `src/components/CommentList.tsx`
- [x] T014 [US1] Create main page layout and data fetching hook in `src/app/page.tsx` and `src/hooks/useComments.ts`

**Checkpoint**: User Story 1 should be fully functional — page loads, lists comments, pagination works

---

## Phase 4: User Story 2 - 筛选与搜索评论 (Priority: P1)

**Goal**: Allow users to filter by score range, room type, travel type, category, and search by keywords

**Independent Test**: Apply filters and search terms — the list should update to show only matching comments; URL should reflect filter state

### Implementation for User Story 2

- [x] T015 [P] [US2] Implement `SearchBar` component in `src/components/SearchBar.tsx`
- [x] T016 [P] [US2] Implement `FilterPanel` component in `src/components/FilterPanel.tsx` (score range, room type, travel type)
- [x] T017 [US2] Implement `CategoryFilter` component in `src/components/CategoryFilter.tsx` (grouped by category class)
- [x] T018 [US2] Integrate filter state with URL query parameters in `src/hooks/useComments.ts`

**Checkpoint**: User Stories 1 AND 2 should both work independently — filtering and searching update the list correctly

---

## Phase 5: User Story 3 - 查看评论图片 (Priority: P2)

**Goal**: Display image thumbnails in comment cards and open a lightbox viewer on click

**Independent Test**: Click an image thumbnail — a lightbox should open showing the full-size image; click to close

### Implementation for User Story 3

- [x] T019 [P] [US3] Implement `ImageViewer` (Lightbox) component in `src/components/ImageViewer.tsx`
- [x] T020 [US3] Integrate image thumbnails into `CommentCard` in `src/components/CommentCard.tsx` (show up to 4 thumbnails with +N badge)

**Checkpoint**: User Story 3 should be fully functional — images display and lightbox works

---

## Phase 6: User Story 4 - 查看评论统计 (Priority: P2)

**Goal**: Display comment statistics (total count, average score, score distribution) that update with filters

**Independent Test**: Page loads — stats panel shows total comments and average score; apply filters — stats update to reflect filtered results

### Implementation for User Story 4

- [x] T021 [P] [US4] Implement `StatsPanel` component in `src/components/StatsPanel.tsx` (total count, avg score, star distribution)
- [x] T022 [US4] Integrate `StatsPanel` into main page in `src/app/page.tsx`

**Checkpoint**: User Story 4 should be fully functional — stats display and update correctly

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive design, performance, testing, and final validation

- [x] T023 [P] Responsive layout optimization for mobile and tablet devices (Tailwind grid-cols-1 lg:grid-cols-4)
- [x] T024 [P] Performance optimization: image lazy loading, debounced search input implemented
- [ ] T025 [P] Add API route unit tests for `/api/comments`, `/api/comments/stats`, `/api/filters`
- [ ] T026 Final end-to-end validation: verify all user stories, edge cases, and success criteria from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (Phase 4)**: Can start after Phase 3 (or in parallel if team capacity allows) — depends on CommentCard and CommentList
- **User Story 3 (Phase 5)**: Can start after Phase 3 — extends CommentCard
- **User Story 4 (Phase 6)**: Can start after Phase 3 — adds to main page
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### Within Each User Story

- Models/types before components
- Components before page integration
- Core implementation before edge case handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational API routes marked [P] can run in parallel (T007, T008)
- All component tasks within a story marked [P] can run in parallel
- T010, T011, T012 (types + UI + CommentCard) can run in parallel
- T015, T016 (SearchBar + FilterPanel) can run in parallel
- T023, T024, T025 (responsive + perf + tests) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (评论列表浏览)
4. Complete Phase 4: User Story 2 (筛选与搜索)
5. **STOP and VALIDATE**: Test core browsing and filtering functionality
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: 浏览列表)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP+: 筛选搜索)
4. Add User Story 3 → Test independently → Deploy/Demo (完整功能: 图片查看)
5. Add User Story 4 → Test independently → Deploy/Demo (完整功能: 统计面板)
6. Phase 7: Polish → Final deployment

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify data import correctness before starting frontend work
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
