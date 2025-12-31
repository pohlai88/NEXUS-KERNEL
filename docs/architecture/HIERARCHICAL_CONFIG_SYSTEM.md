# Hierarchical Configuration System

**Date:** 2025-12-30  
**Status:** ✅ Implementation Complete  
**Purpose:** Flexible, hierarchical configuration system with inheritance

---

## 🎯 Executive Summary

**Problem:** Need configuration at multiple levels:
- Portal Global (system defaults)
- Tenant (tenant admin config)
- Tenant User Admin (admin-set user defaults)
- Tenant User Personal (individual preferences)
- Vendor Global (vendor-wide defaults)
- Vendor User Personal (individual vendor user preferences)

**Solution:** Hierarchical configuration system with automatic inheritance and resolution.

---

## 🏗️ Architecture

### Configuration Hierarchy

**Priority Order (Highest to Lowest):**

#### For Tenant Users:
1. **Tenant User Personal Config** (Highest Priority)
   - Individual user preferences
   - Overrides everything

2. **Tenant User Admin Config**
   - Admin-set defaults for all tenant users
   - Can be overridden by personal config

3. **Tenant Config** (`tenants.settings`)
   - Tenant-level settings
   - Overrides portal global

4. **Portal Global Config** (Lowest Priority)
   - System-wide defaults
   - Base configuration

#### For Vendor Users:
1. **Vendor User Personal Config** (Highest Priority)
   - Individual vendor user preferences
   - Overrides everything

2. **Vendor Global Config**
   - Vendor-wide defaults
   - Overrides portal global

3. **Portal Global Config** (Lowest Priority)
   - System-wide defaults
   - Base configuration

---

## 📊 Database Schema

### Tables Created

1. **`portal_global_config`**
   - `config_type`: 'tenant_defaults' | 'vendor_defaults' | 'system_defaults'
   - `config_data`: JSONB configuration
   - Managed by portal super admins

2. **`tenant_user_admin_config`**
   - `tenant_id`: Tenant reference
   - `config_data`: JSONB configuration
   - Managed by tenant admins

3. **`tenant_user_personal_config`**
   - `tenant_id`, `user_id`: Composite key
   - `config_data`: JSONB configuration
   - Managed by individual users

4. **`vendor_global_config`**
   - `vendor_id`: Vendor reference
   - `config_data`: JSONB configuration
   - Managed by vendor admins

5. **`vendor_user_personal_config`**
   - `vendor_id`, `user_id`: Composite key
   - `config_data`: JSONB configuration
   - Managed by individual vendor users

---

## 🔧 Implementation

### Repository

**File:** `apps/portal/src/repositories/config-repository.ts`

**Key Methods:**
- `getPortalGlobalConfig()` - Get portal global config
- `setPortalGlobalConfig()` - Set portal global config
- `getTenantConfig()` - Get tenant config (from `tenants.settings`)
- `setTenantConfig()` - Set tenant config
- `getTenantUserAdminConfig()` - Get tenant user admin defaults
- `setTenantUserAdminConfig()` - Set tenant user admin defaults
- `getTenantUserPersonalConfig()` - Get user personal config
- `setTenantUserPersonalConfig()` - Set user personal config
- `getVendorGlobalConfig()` - Get vendor global config
- `setVendorGlobalConfig()` - Set vendor global config
- `getVendorUserPersonalConfig()` - Get vendor user personal config
- `setVendorUserPersonalConfig()` - Set vendor user personal config
- `resolveTenantUserConfig()` - Resolve merged config for tenant user
- `resolveVendorUserConfig()` - Resolve merged config for vendor user

### Service

**File:** `apps/portal/src/services/config-resolver.ts`

**Key Methods:**
- `resolveTenantUserConfig()` - Resolve with deep merging
- `resolveVendorUserConfig()` - Resolve with deep merging
- `getConfigValue()` - Get specific config value with fallback chain

---

## 🎨 UI Pages

### 1. Portal Global Config
**Route:** `/admin/config/portal-global`
- Portal admins configure system defaults
- Three config types: Tenant Defaults, Vendor Defaults, System Defaults

### 2. Tenant Config
**Route:** `/admin/config/tenant?tenant_id=xxx`
- Tenant admins configure tenant-level settings
- Two configs: Tenant Settings, Tenant User Admin Defaults

### 3. User Profile Config
**Route:** `/profile/config?tenant_id=xxx&vendor_id=xxx`
- Users configure personal preferences
- Shows resolved config (merged) and personal config (editable)

---

## 📝 Configuration Examples

### Portal Global Config (Tenant Defaults)
```json
{
  "payment_config": {
    "payment_mode": "standalone",
    "auto_payment_enabled": true,
    "payment_terms_default": "NET30"
  },
  "notifications": {
    "email_enabled": true,
    "push_enabled": true
  }
}
```

### Tenant Config Override
```json
{
  "payment_config": {
    "payment_mode": "erp_sync",
    "erp_system": "sap",
    "erp_api_endpoint": "https://sap.example.com/api"
  }
}
```

### Tenant User Personal Config
```json
{
  "notifications": {
    "email_enabled": false,
    "push_enabled": true
  },
  "ui": {
    "theme": "dark",
    "language": "en"
  }
}
```

---

## 🔄 Integration

### Payment System Integration

The payment system now uses hierarchical config:

```typescript
// Before (direct tenant.settings access)
const config = await paymentRepo.getPaymentConfig(tenantId);

// After (hierarchical resolution)
const config = await paymentRepo.getPaymentConfig(tenantId, userId);
// Automatically resolves from: Portal Global → Tenant → Tenant User Admin → User Personal
```

### Usage Pattern

```typescript
import { ConfigResolver } from '@/src/services/config-resolver';

const configResolver = new ConfigResolver();

// Get specific config value
const paymentMode = await configResolver.getConfigValue<string>(
  tenantId,
  userId,
  null,
  'payment_config.payment_mode',
  'standalone' // default
);

// Resolve full config
const resolved = await configResolver.resolveTenantUserConfig(tenantId, userId);
console.log(resolved.config); // Merged config
console.log(resolved.sources); // Which levels contributed
```

---

## ✅ Benefits

1. **Flexibility** - Configure at any level
2. **Inheritance** - Lower levels inherit from higher levels
3. **Override** - Higher priority levels override lower levels
4. **Audit Trail** - All config changes logged
5. **RLS Protected** - Row-level security on all config tables
6. **Type Safe** - TypeScript interfaces for all config types

---

## 🚀 Next Steps

1. **Create Config UI Forms** - Replace JSON editors with proper forms
2. **Add Validation** - Validate config values against schemas
3. **Add Config Templates** - Pre-defined config templates
4. **Add Config Import/Export** - Bulk config management
5. **Add Config History** - View config change history

---

## 📁 Files Created

### Repositories
- `apps/portal/src/repositories/config-repository.ts` (600 lines)

### Services
- `apps/portal/src/services/config-resolver.ts` (150 lines)

### UI Pages
- `apps/portal/app/admin/config/portal-global/page.tsx`
- `apps/portal/app/admin/config/tenant/page.tsx`
- `apps/portal/app/profile/config/page.tsx`

### Database
- Migration: `create_hierarchical_config_tables` (5 tables + RLS policies)

---

**Status:** ✅ **COMPLETE** - Hierarchical configuration system ready for use!

