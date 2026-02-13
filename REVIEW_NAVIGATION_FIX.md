# Review Navigation Fix - Stay Within Dashboard

## Problem
When clicking on review cards in the dashboard, users were being redirected to the old `/app/ReviewHubPage` instead of staying within the new dashboard interface.

## Solution
Updated the dashboard to use the new `ReviewView` component and pass job data directly through props instead of relying on external navigation.

## Changes Made

### 1. **CenterPanel.tsx** - Switched to New ReviewView

**Before:**
```typescript
import ReviewHubPage from "@/app/ReviewHubPage";

case "review":
  return <ReviewHubPage />;
```

**After:**
```typescript
import { ReviewView } from "./views/ReviewView";

case "review":
  return <ReviewView
    onViewChange={onViewChange}
    theme={theme}
    selectedJob={selectedItem.type === "job" ? selectedItem.data : null}
  />;
```

**Changes:**
- ✅ Replaced old `ReviewHubPage` with new `ReviewView` component
- ✅ Pass `onViewChange` for navigation within dashboard
- ✅ Pass `theme` for consistent styling
- ✅ Pass `selectedJob` data when a job is selected

### 2. **ReviewView.tsx** - Accept Job Data via Props

**Before:**
```typescript
interface ReviewViewProps {
    onViewChange?: (view: ViewType) => void;
    theme: string;
}

export function ReviewView({ onViewChange, theme }: ReviewViewProps) {
    const videoIdFromUrl = searchParams.get("video_id");
    const langFromUrl = searchParams.get("lang");
    const jobIdFromUrl = searchParams.get("job_id");
```

**After:**
```typescript
interface ReviewViewProps {
    onViewChange?: (view: ViewType) => void;
    theme: string;
    selectedJob?: any; // Job data passed from dashboard
}

export function ReviewView({ onViewChange, theme, selectedJob }: ReviewViewProps) {
    // Prefer selectedJob data, fallback to URL params
    const videoIdFromUrl = selectedJob?.source_video_id || searchParams.get("video_id");
    const langFromUrl = selectedJob?.target_languages?.[0] || searchParams.get("lang");
    const jobIdFromUrl = selectedJob?.job_id || searchParams.get("job_id");

    // Updated useEffect dependency array
}, [videoIdFromUrl, langFromUrl, videos, videosLoading, openReview, selectedJob]);
```

**Changes:**
- ✅ Added `selectedJob` prop to receive job data from dashboard
- ✅ Use job data from prop when available, fallback to URL params
- ✅ Added `selectedJob` to useEffect dependencies to react to changes
- ✅ Maintains backward compatibility with URL-based navigation

## How It Works Now

### Navigation Flow:

1. **User clicks on a review card** in DashboardView
2. **DashboardView** calls:
   ```typescript
   onClick={() => {
     onSelectJob({ type: "job", id: job.job_id, data: job });
     onViewChange("review");
   }}
   ```
3. **DashboardLayout** updates `selectedItem` state with job data
4. **CenterPanel** renders ReviewView with job data:
   ```typescript
   <ReviewView selectedJob={selectedItem.data} />
   ```
5. **ReviewView** uses the job data to load review interface
6. **User stays within dashboard** - no external navigation!

### Benefits:

✅ **Stay in Dashboard**: Navigation happens within dashboard component tree
✅ **No URL Changes**: Cleaner UX without URL manipulations
✅ **Better State Management**: Job data flows through React props
✅ **Backward Compatible**: Still works with URL params for direct links
✅ **Consistent Design**: Uses new dashboard theme and layout

## Testing

To test the fix:

1. Start dev server: `npm run dev`
2. Navigate to `/dashboard`
3. Click on any job card marked "Needs Review"
4. Verify:
   - ✅ Stays within dashboard (no redirect to `/app` route)
   - ✅ Review interface loads with correct job data
   - ✅ Can navigate back to dashboard using back button
   - ✅ Theme remains consistent

### 3. **ReviewContext.tsx** - Prevent URL Navigation in Dashboard

**Problem:** The `openReview` function was calling `router.push()` which navigated away from `/dashboard` to `/workflows/review/`, breaking the dashboard experience.

**Before:**
```typescript
const openReview = useCallback((params: any) => {
    setQuickCheckState({ isOpen: true, ...params });

    // Always navigates to /workflows/review/
    const jobIdParam = params.jobId ? `&job_id=${params.jobId}` : '';
    router.push(`/workflows/review/${params.videoId}?lang=${params.languageCode}${jobIdParam}`);
}, [router]);
```

**After:**
```typescript
interface ReviewContextType {
    openReview: (params: {
        // ... other params
        navigate?: boolean; // New optional flag to control navigation
    }) => void;
}

const openReview = useCallback((params: any) => {
    setQuickCheckState({ isOpen: true, ...params });

    // Only navigate if explicitly requested (defaults to true for backward compatibility)
    if (params.navigate !== false) {
        const jobIdParam = params.jobId ? `&job_id=${params.jobId}` : '';
        router.push(`/workflows/review/${params.videoId}?lang=${params.languageCode}${jobIdParam}`);
    }
}, [router]);
```

**Changes:**
- ✅ Added optional `navigate` parameter to openReview interface
- ✅ Only calls `router.push()` when `navigate !== false`
- ✅ Defaults to `true` for backward compatibility with old code paths
- ✅ Dashboard components pass `navigate: false` to stay within dashboard

### 4. **Dashboard Components** - Pass navigate: false

Updated all dashboard components to prevent URL navigation:

**ReviewView.tsx** (2 occurrences)
```typescript
openReview({
    videoId: videoIdFromUrl,
    languageCode: langCode,
    // ... other params
    navigate: false // Stay within dashboard
});
```

**RightSidebar.tsx** (1 occurrence)
```typescript
openReview({
    videoId: job.source_video_id,
    languageCode: firstTargetLang,
    // ... other params
    navigate: false // Stay within dashboard
});
```

**PreviewView.tsx** (2 occurrences)
```typescript
openReview({
    videoId: currentVideo.video_id,
    languageCode: code,
    // ... other params
    navigate: false // Stay within dashboard
});
```

## Files Modified

- `/components/Dashboard/CenterPanel.tsx` - Switch to ReviewView
- `/components/Dashboard/views/ReviewView.tsx` - Accept selectedJob prop + prevent navigation
- `/lib/ReviewContext.tsx` - Add navigate flag to control URL changes
- `/components/Dashboard/RightSidebar.tsx` - Prevent navigation
- `/components/Dashboard/views/PreviewView.tsx` - Prevent navigation

---

**Date:** 2025-02-12
**Issue:** Review cards redirected to old website + URL changes caused navigation away from dashboard
**Status:** ✅ Fixed
