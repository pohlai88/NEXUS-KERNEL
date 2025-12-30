# Supabase MCP Optimization Report

**Version:** 1.0.0  
**Last Updated:** 2025-01-22  
**Status:** Active  
**Purpose:** Comprehensive Supabase audit and optimization recommendations based on best practices

---

## Executive Summary

This report provides a comprehensive audit and optimization recommendations for the Supabase database, PostgreSQL configuration, metadata, and all Supabase services (Storage, Real-time, Edge Functions, Auth, Client Libraries, Management API, CLI, Integrations) based on Supabase official documentation and best practices.

**Key Findings:**
- ✅ **RLS Coverage:** 100% of tables have RLS enabled (50+ tables)
- ⚠️ **Security Issues:** 4 critical security advisor warnings
- ⚠️ **Performance Issues:** Multiple RLS performance optimizations needed
- ⚠️ **Index Optimization:** 30+ unused indexes identified
- ✅ **Edge Functions:** 3 active functions deployed
- ✅ **Extensions:** Properly configured with many available

---

## 1. Database Schema & Structure Audit

### 1.1 Current State

**Total Tables:** 50+ tables in `public` schema
- **Nexus Canon Tables:** 20+ tables (nexus_*)
- **MDM Tables:** 15+ tables (mdm_*)
- **VMP Tables:** 10+ tables (documents, messages, payments, etc.)
- **System Tables:** 5+ tables (users, tenants, organizations, etc.)

**RLS Status:**
- ✅ **100% RLS Coverage:** All 50+ tables have RLS enabled
- ✅ **Compliance:** Matches DB_GUARDRAIL_MATRIX.md requirements

**Key Tables (from SSOT):**
- `nexus_tenants` - Master tenant table
- `nexus_cases` - Case management
- `nexus_invoices` - Invoice shadow ledger
- `nexus_payments` - Payment records
- `nexus_notifications` - User notifications
- `nexus_audit_log` - System audit log

### 1.2 Schema Compliance

**✅ Compliant with DB_GUARDRAIL_MATRIX.md:**
- All tenant-scoped tables have RLS enabled
- JSONB contracts are registered
- Core columns are immutable
- Index requirements are documented

**⚠️ Areas for Improvement:**
- Some tables may need additional indexes for RLS performance
- JSONB contract validation needs CI enforcement (currently L1 Documented)

---

## 2. Security Audit (Supabase Advisor)

### 2.1 Critical Security Issues

**Issue 1: SECURITY DEFINER Views**
- **Severity:** HIGH
- **Description:** Views created with SECURITY DEFINER bypass RLS by default
- **Impact:** Views may expose data without proper RLS enforcement
- **Recommendation:**
  ```sql
  -- Convert to SECURITY INVOKER (Postgres 15+)
  ALTER VIEW view_name SET (security_invoker = true);
  
  -- Or move views to unexposed schema
  CREATE SCHEMA private;
  -- Move views to private schema
  ```

**Issue 2: Function Search Path Mutable**
- **Severity:** MEDIUM
- **Description:** Functions with mutable search_path can be exploited
- **Impact:** Potential SQL injection via search_path manipulation
- **Recommendation:**
  ```sql
  -- Set search_path to empty or specific schema
  ALTER FUNCTION function_name SET search_path = '';
  -- Or use SECURITY DEFINER with fixed search_path
  ```

**Issue 3: Extension in Public Schema**
- **Severity:** MEDIUM
- **Description:** Extensions installed in public schema
- **Impact:** Potential security exposure
- **Recommendation:**
  ```sql
  -- Move extensions to extensions schema
  CREATE SCHEMA IF NOT EXISTS extensions;
  -- Reinstall extensions in extensions schema
  ```

**Issue 4: Leaked Password Protection Disabled**
- **Severity:** HIGH
- **Description:** Password leak protection is disabled
- **Impact:** Users may use compromised passwords
- **Recommendation:**
  - Enable password leak protection in Supabase Dashboard
  - Settings → Auth → Password → Enable "Check for leaked passwords"

### 2.2 Security Best Practices Compliance

**✅ Compliant:**
- RLS enabled on all tables
- Service role policies properly configured
- Authenticated role policies in place

**⚠️ Needs Attention:**
- View security (SECURITY INVOKER)
- Function search_path hardening
- Password leak protection

---

## 3. Performance Optimization

### 3.1 RLS Performance Issues

**Problem:** Many RLS policies use `auth.uid()` directly without wrapping in `SELECT`, causing performance degradation.

**Current Pattern (Slow):**
```sql
CREATE POLICY "users_view_tenant_documents"
ON documents FOR SELECT
USING (tenant_id IN (
  SELECT users.tenant_id
  FROM users
  WHERE users.id = auth.uid()  -- ❌ Slow: called per row
));
```

**Optimized Pattern (Fast):**
```sql
CREATE POLICY "users_view_tenant_documents"
ON documents FOR SELECT
USING (tenant_id IN (
  SELECT users.tenant_id
  FROM users
  WHERE users.id = (SELECT auth.uid())  -- ✅ Fast: cached per statement
));
```

**Performance Impact:**
- **Before:** 171ms for 100K rows
- **After:** <0.1ms for 100K rows
- **Improvement:** 99.94% faster

**Recommendation:**
1. Wrap all `auth.uid()` calls in `(SELECT auth.uid())`
2. Wrap all `auth.jwt()` calls in `(SELECT auth.jwt())`
3. Wrap all security definer functions in `(SELECT function_name())`

### 3.2 Index Optimization

**Unused Indexes Identified:** 30+ indexes with 0 scans

**Top Unused Indexes:**
- `audit_events_pkey` - 0 scans
- `idx_audit_events_action` - 0 scans
- `idx_audit_events_created_at` - 0 scans
- `company_groups_tenant_id_name_key` - 0 scans
- `document_embeddings_pkey` - 0 scans
- `idx_document_embeddings_embedding_hnsw` - 0 scans (vector index)

**Recommendation:**
```sql
-- Review and potentially drop unused indexes
-- But first verify they're not needed for:
-- 1. Foreign key constraints
-- 2. Unique constraints
-- 3. Future query patterns

-- Example: Drop unused index (after verification)
DROP INDEX IF EXISTS idx_audit_events_action;
```

**Missing Indexes for RLS:**
- Add indexes on columns used in RLS policies
- Example: `tenant_id` columns used in RLS should be indexed

### 3.3 RLS Policy Optimization Checklist

**✅ Best Practices to Apply:**

1. **Wrap Functions in SELECT:**
   ```sql
   -- ❌ Bad
   USING (auth.uid() = user_id)
   
   -- ✅ Good
   USING ((SELECT auth.uid()) = user_id)
   ```

2. **Add Indexes on RLS Columns:**
   ```sql
   -- Add index for RLS performance
   CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
   ```

3. **Specify Roles in Policies:**
   ```sql
   -- ❌ Bad
   CREATE POLICY "policy_name" ON table_name USING (...);
   
   -- ✅ Good
   CREATE POLICY "policy_name" ON table_name
   TO authenticated
   USING (...);
   ```

4. **Use Security Definer Functions for Joins:**
   ```sql
   -- Create security definer function to bypass RLS on join table
   CREATE FUNCTION private.get_user_teams()
   RETURNS TABLE(team_id uuid)
   LANGUAGE sql
   SECURITY DEFINER
   SET search_path = ''
   AS $$
     SELECT team_id FROM team_user WHERE user_id = (SELECT auth.uid());
   $$;
   
   -- Use in policy
   CREATE POLICY "users_view_team_data"
   ON team_data FOR SELECT
   USING (team_id IN (SELECT team_id FROM private.get_user_teams()));
   ```

5. **Add Filters to Queries:**
   ```javascript
   // ❌ Bad: Relying only on RLS
   const { data } = await supabase.from('documents').select();
   
   // ✅ Good: Add explicit filter
   const { data } = await supabase
     .from('documents')
     .select()
     .eq('tenant_id', tenantId);  // Helps query planner
   ```

---

## 4. PostgreSQL Extensions

### 4.1 Current Extensions

**Installed Extensions:**
- `vector` - Vector similarity search (pgvector)
- `uuid-ossp` - UUID generation
- `pg_graphql` - GraphQL support
- `pg_net` - Network requests
- `pg_cron` - Scheduled jobs
- `pg_stat_statements` - Query statistics
- `supabase_vault` - Secrets management

**Available Extensions (Not Installed):**
- Many additional extensions available

### 4.2 Extension Best Practices

**✅ Compliant:**
- Extensions properly installed
- Vector extension for embeddings
- pg_stat_statements for monitoring

**⚠️ Recommendations:**
1. **Update Extensions:**
   ```sql
   -- Check for outdated extensions
   SELECT name, installed_version, default_version
   FROM pg_available_extensions
   WHERE installed_version IS NOT NULL
     AND installed_version != default_version;
   
   -- Update to default version
   ALTER EXTENSION extension_name UPDATE;
   ```

2. **Extension Schema:**
   - Consider moving extensions to `extensions` schema (security best practice)

---

## 5. Storage Configuration

### 5.1 Current State

**Buckets:** Need to verify bucket configuration via Storage API

**Best Practices:**

1. **Bucket Organization:**
   ```sql
   -- Create buckets with appropriate access models
   INSERT INTO storage.buckets (id, name, public)
   VALUES
     ('avatars', 'avatars', true),      -- Public bucket
     ('documents', 'documents', false), -- Private bucket
     ('temp', 'temp', false);           -- Private bucket
   ```

2. **Storage Policies:**
   ```sql
   -- Public bucket: Allow read access
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'avatars');
   
   -- Private bucket: Tenant-scoped access
   CREATE POLICY "Users can view tenant documents"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'documents' AND
     (storage.foldername(name))[1] = (
       SELECT tenant_id::text FROM users WHERE id = auth.uid()
     )
   );
   ```

3. **Storage Optimization:**
   - Use image transformation for resizing
   - Set high cache-control values
   - Limit upload sizes at bucket level
   - Use Smart CDN for better caching

---

## 6. Real-time Configuration

### 6.1 Current Setup

**Publication:** `supabase_realtime`
**Tables in Publication:**
- `nexus_case_messages`
- `nexus_payments`
- `nexus_notifications`
- `nexus_tenant_relationships`

**Views:**
- `nexus_realtime_status` - Shows realtime publication status

### 6.2 Real-time Best Practices

**✅ Current Approach:**
- Using Postgres Changes (simpler, but less scalable)

**⚠️ Recommendation: Migrate to Broadcast**

**Why Broadcast is Better:**
- More scalable (handles 250K+ concurrent users)
- Better security (RLS-based authorization)
- Lower latency
- More flexible (custom payloads)

**Migration Pattern:**

1. **Create Broadcast Trigger:**
   ```sql
   CREATE OR REPLACE FUNCTION broadcast_case_message_changes()
   RETURNS TRIGGER AS $$
   BEGIN
     PERFORM realtime.broadcast_changes(
       'case:' || NEW.case_id::text || ':messages',
       TG_OP,
       TG_OP,
       TG_TABLE_NAME,
       TG_TABLE_SCHEMA,
       NEW,
       OLD
     );
     RETURN NULL;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   
   CREATE TRIGGER case_messages_broadcast_trigger
   AFTER INSERT OR UPDATE OR DELETE ON nexus_case_messages
   FOR EACH ROW EXECUTE FUNCTION broadcast_case_message_changes();
   ```

2. **Create Broadcast Authorization Policy:**
   ```sql
   CREATE POLICY "Authenticated users can receive broadcasts"
   ON realtime.messages FOR SELECT
   TO authenticated
   USING (true);
   ```

3. **Client-Side Subscription:**
   ```javascript
   const channel = supabase.channel(`case:${caseId}:messages`, {
     config: { private: true }
   });
   
   await supabase.realtime.setAuth(); // Required for authorization
   
   channel
     .on('broadcast', { event: 'INSERT' }, (payload) => {
       console.log('New message:', payload);
     })
     .subscribe();
   ```

**Performance Comparison:**
- **Postgres Changes:** ~10K changes/sec (database bottleneck)
- **Broadcast:** 224K+ messages/sec (WebSocket-based)

---

## 7. Edge Functions

### 7.1 Current Functions

**Active Functions:** 3 functions deployed

**Best Practices:**

1. **Function Organization:**
   ```
   supabase/
   ├── functions/
   │   ├── _shared/          # Shared code
   │   │   ├── supabaseAdmin.ts
   │   │   └── cors.ts
   │   ├── function-one/     # Use hyphens
   │   │   └── index.ts
   │   └── function-two/
   │       └── index.ts
   ```

2. **Error Handling:**
   ```typescript
   import { FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'
   
   const { data, error } = await supabase.functions.invoke('function-name')
   
   if (error instanceof FunctionsHttpError) {
     const errorMessage = await error.context.json()
     console.log('Function error:', errorMessage)
   }
   ```

3. **Regional Invocation:**
   ```typescript
   // Execute in same region as database
   const { data } = await supabase.functions.invoke('function-name', {
     region: FunctionRegion.UsEast1
   })
   ```

4. **Resource Limits:**
   - Wall-clock time: 400 seconds
   - CPU time: 200ms
   - Memory: Monitor via logs
   - Use streaming for large responses
   - Process data in chunks

---

## 8. Auth Integration

### 8.1 Current Setup

**Auth Tables:**
- `users` - User management
- `tenants` - Tenant management
- `organizations` - Organization management

**JWT Functions:**
- `jwt_nexus_user_id()` - Get user ID from JWT
- `jwt_nexus_tenant_id()` - Get tenant ID from JWT
- `jwt_nexus_tenant_client_id()` - Get client ID from JWT
- `jwt_nexus_tenant_vendor_id()` - Get vendor ID from JWT

### 8.2 Auth Best Practices

**✅ Compliant:**
- Custom JWT claims properly implemented
- RLS policies use JWT claims

**⚠️ Recommendations:**

1. **Enable Password Leak Protection:**
   - Dashboard → Auth → Password → Enable "Check for leaked passwords"

2. **MFA Enforcement:**
   ```sql
   -- Enforce MFA for sensitive operations
   CREATE POLICY "Require MFA for payment updates"
   ON nexus_payments FOR UPDATE
   TO authenticated
   USING (
     (SELECT auth.jwt()->>'aal') = 'aal2'  -- Assurance Level 2
   );
   ```

3. **Session Management:**
   - Use `nexus_sessions` table for session tracking
   - Implement proper session cleanup

---

## 9. Client Libraries Usage

### 9.1 Best Practices

**TypeScript/JavaScript:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!  // Use publishable key (sb_publishable_*)
)

// Always add filters (helps query planner)
const { data } = await supabase
  .from('documents')
  .select()
  .eq('tenant_id', tenantId)  // Explicit filter
  .order('created_at', { ascending: false })
```

**Connection Pooling:**
- Use shared pooler for most queries
- Use dedicated pooler for long-running transactions
- Monitor connection usage via Reports

---

## 10. Management API & CLI

### 10.1 CLI Best Practices

**Migration Management:**
```bash
# Create migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > types/database.ts
```

**Local Development:**
```bash
# Start local Supabase
supabase start

# Reset local database
supabase db reset

# Seed data
supabase db seed
```

### 10.2 Management API

**Use Cases:**
- Project management
- User management
- Database operations
- Storage management

**Best Practice:**
- Use Management API for administrative tasks
- Use Client Libraries for application code
- Never expose service role key in client code

---

## 11. Integration Patterns

### 11.1 Database Functions vs Edge Functions

**Use Database Functions For:**
- Data-intensive operations
- Complex queries with joins
- Operations requiring transactions
- Operations that benefit from being close to data

**Use Edge Functions For:**
- Low-latency requirements
- External API calls
- File processing
- Global distribution needs

### 11.2 Storage Integration

**Cache-First Pattern:**
```typescript
// Check storage before generating
const storageResponse = await fetch(
  `${STORAGE_URL}/avatars/${username}.png`
)

if (storageResponse.ok) {
  return storageResponse  // Return cached version
}

// Generate and upload
const generated = await generateAvatar(username)
await supabase.storage
  .from('images')
  .upload(`avatars/${username}.png`, generated, {
    cacheControl: '86400'  // 24 hours
  })
```

---

## 12. Optimization Action Plan

### 12.1 Priority 1: Security (Critical)

1. **Enable Password Leak Protection**
   - Dashboard → Auth → Password → Enable
   - **ETA:** Immediate
   - **Owner:** Security Team

2. **Fix SECURITY DEFINER Views**
   - Convert views to SECURITY INVOKER
   - Or move to private schema
   - **ETA:** 1 week
   - **Owner:** Database Team

3. **Harden Function Search Paths**
   - Set `search_path = ''` on all functions
   - **ETA:** 1 week
   - **Owner:** Database Team

### 12.2 Priority 2: Performance (High)

1. **Optimize RLS Policies**
   - Wrap `auth.uid()` in `(SELECT auth.uid())`
   - Add indexes on RLS columns
   - Specify roles in policies
   - **ETA:** 2 weeks
   - **Owner:** Database Team

2. **Review Unused Indexes**
   - Analyze index usage
   - Drop truly unused indexes
   - **ETA:** 1 week
   - **Owner:** Database Team

3. **Migrate to Broadcast (Real-time)**
   - Create broadcast triggers
   - Update client code
   - **ETA:** 3 weeks
   - **Owner:** Backend Team

### 12.3 Priority 3: Best Practices (Medium)

1. **Update Extensions**
   - Check for outdated versions
   - Update to default versions
   - **ETA:** 1 week
   - **Owner:** Database Team

2. **Storage Optimization**
   - Review bucket policies
   - Implement cache-first patterns
   - **ETA:** 2 weeks
   - **Owner:** Backend Team

3. **Edge Function Optimization**
   - Review resource usage
   - Implement streaming where needed
   - **ETA:** 2 weeks
   - **Owner:** Backend Team

---

## 13. Compliance with Project SSOT

### 13.1 DB_GUARDRAIL_MATRIX.md Compliance

**✅ Compliant:**
- All tables have RLS enabled
- JSONB contracts are registered
- Core columns are documented
- Index requirements are specified

**⚠️ Needs Improvement:**
- CI enforcement for drift checks (currently L1 Documented)
- Need to implement DRIFT-01, DRIFT-02, DRIFT-03 in CI

### 13.2 NEXUS_CANON_V5_KERNEL_DOCTRINE.md Alignment

**✅ Aligned:**
- L0-L3 layer architecture respected
- Tenant isolation properly implemented
- Audit logging in place

---

## 14. Monitoring & Observability

### 14.1 Supabase Reports

**Available Reports:**
- Database: Memory, CPU, IOPS, Connections
- Auth: Active users, sign-ins, errors
- Storage: Requests, response speed, traffic
- Realtime: Connections, events, joins
- Edge Functions: Execution status, time, region

**Recommendation:**
- Monitor Reports dashboard regularly
- Set up alerts for critical metrics
- Review performance trends weekly

### 14.2 Query Performance

**Tools:**
- `pg_stat_statements` - Query statistics
- `EXPLAIN ANALYZE` - Query plans
- Supabase Reports - Performance metrics

**Best Practice:**
- Review slow queries weekly
- Optimize queries with high execution time
- Add indexes based on query patterns

---

## 15. Conclusion

### 15.1 Summary

**Strengths:**
- ✅ 100% RLS coverage
- ✅ Proper tenant isolation
- ✅ Good extension usage
- ✅ Edge Functions deployed

**Areas for Improvement:**
- ⚠️ Security hardening needed
- ⚠️ RLS performance optimization
- ⚠️ Index cleanup
- ⚠️ Real-time migration to Broadcast

### 15.2 Next Steps

1. **Immediate:** Enable password leak protection
2. **Week 1:** Fix security issues (views, functions)
3. **Week 2:** Optimize RLS policies
4. **Week 3:** Review and clean up indexes
5. **Week 4:** Plan Broadcast migration

### 15.3 Resources

**Supabase Documentation:**
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [RLS Performance Best Practices](https://github.com/orgs/supabase/discussions/14576)
- [Storage Best Practices](https://supabase.com/docs/guides/storage)
- [Real-time Best Practices](https://supabase.com/docs/guides/realtime)
- [Edge Functions Best Practices](https://supabase.com/docs/guides/functions)

**Project Documentation:**
- `DB_GUARDRAIL_MATRIX.md` - SSOT for database schema
- `NEXUS_CANON_V5_KERNEL_DOCTRINE.md` - Business operating constitution

---

**Report Generated By:** Supabase MCP  
**Last Updated:** 2025-01-22  
**Next Review:** 2025-02-22

