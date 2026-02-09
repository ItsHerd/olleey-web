// ============================================================
// OLLEEY FRONTEND DIAGNOSTIC SCRIPT
// Run this in your browser console to diagnose empty pages
// ============================================================

console.log('%c🔍 Olleey Diagnostic Check', 'background: #FBC02D; color: black; padding: 8px; font-weight: bold; font-size: 14px;');
console.log('Running diagnostics...\n');

// Check 1: localStorage userId
const userId = localStorage.getItem('userId');
console.log('%c1. User Authentication', 'font-weight: bold; color: #FBC02D');
if (userId) {
  console.log('✅ userId found:', userId);
} else {
  console.log('❌ userId NOT found in localStorage');
  console.log('   Fix: Run localStorage.setItem("userId", "test_user_001")');
}
console.log('');

// Check 2: API Base URL
console.log('%c2. API Configuration', 'font-weight: bold; color: #FBC02D');
console.log('   API Base URL:', window.location.origin.includes('localhost') ? 'http://localhost:8000' : 'Production URL');
console.log('');

// Check 3: Network requests (async check)
console.log('%c3. Testing API Connection', 'font-weight: bold; color: #FBC02D');
const API_BASE_URL = 'http://localhost:8000';

// Test videos endpoint
fetch(`${API_BASE_URL}/api/videos`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    filters: { user_id: userId || 'test_user_001' } 
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('   Videos API Response:');
    if (data.videos && Array.isArray(data.videos)) {
      console.log('   ✅ Videos found:', data.videos.length);
      if (data.videos.length === 0) {
        console.log('   ⚠️  No videos in database. Run seed script: SUPABASE_SEED_DATA.sql');
      }
    } else {
      console.log('   ❌ Unexpected response format:', data);
    }
  })
  .catch(err => {
    console.log('   ❌ API Error:', err.message);
    console.log('   Check: Is backend running on port 8000?');
  });

// Test dashboard endpoint
fetch(`${API_BASE_URL}/api/dashboard`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    project_id: null,
    user_id: userId || 'test_user_001'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log('   Dashboard API Response:');
    if (data.user_id) {
      console.log('   ✅ Dashboard data loaded');
      console.log('   User:', data.name, '(' + data.email + ')');
      console.log('   Projects:', data.projects?.length || 0);
      console.log('   Jobs:', data.total_jobs || 0);
      console.log('   Connections:', data.youtube_connections?.length || 0);
    } else {
      console.log('   ⚠️  Dashboard returned empty data');
    }
  })
  .catch(err => {
    console.log('   ❌ Dashboard API Error:', err.message);
  });

console.log('');

// Check 4: Supabase connection (if available)
console.log('%c4. Database Connection', 'font-weight: bold; color: #FBC02D');
if (typeof window !== 'undefined' && window.supabase) {
  console.log('   ✅ Supabase client initialized');
} else {
  console.log('   ⚠️  Supabase client not found (this is normal if using REST API)');
}
console.log('');

// Check 5: Page state
console.log('%c5. Current Page State', 'font-weight: bold; color: #FBC02D');
console.log('   URL:', window.location.href);
console.log('   Path:', window.location.pathname);
console.log('   Search:', window.location.search);
console.log('');

// Summary
console.log('%c📋 Quick Fix Summary', 'background: #1976D2; color: white; padding: 8px; font-weight: bold;');
if (!userId) {
  console.log('%c1. Set User ID:', 'font-weight: bold');
  console.log('   localStorage.setItem("userId", "test_user_001");');
  console.log('   location.reload();');
  console.log('');
  console.log('%cOR visit: /dev-init', 'font-weight: bold; color: #FBC02D');
}
console.log('%c2. Ensure seed data is loaded:', 'font-weight: bold');
console.log('   Run SUPABASE_SEED_DATA.sql in Supabase SQL Editor');
console.log('');
console.log('%c3. Check backend is running:', 'font-weight: bold');
console.log('   Backend should be at: http://localhost:8000');
console.log('   Test: curl http://localhost:8000/health');
console.log('');

// Auto-fix option
if (!userId) {
  console.log('%c🔧 Auto-Fix Available!', 'background: #4CAF50; color: white; padding: 8px; font-weight: bold;');
  console.log('Run this to fix automatically:');
  console.log('%cautofixOlleey()', 'background: #000; color: #4CAF50; padding: 4px 8px; font-family: monospace;');
  
  window.autofixOlleey = function() {
    console.log('🔧 Applying auto-fix...');
    localStorage.setItem('userId', 'test_user_001');
    console.log('✅ userId set to test_user_001');
    console.log('🔄 Reloading page...');
    setTimeout(() => location.reload(), 500);
  };
}

console.log('\n%cDiagnostics complete! Check results above. ↑', 'color: #4CAF50; font-weight: bold;');
