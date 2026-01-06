/**
 * Demo data for DataTable in catalog page
 * Shows metadata concepts as users with documentation status
 */

import type { User } from '@/components/data-table/types';

export const demoMetadataUsers: User[] = [
  {
    id: '1',
    name: 'CONCEPT_ACCOUNT',
    email: 'Chart of Accounts Entry',
    userStatus: 'Active',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Paid',
    paymentDate: '15/APR/2020',
    amount: 200,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Created comprehensive documentation for accounting entity',
        detail: 'Added field-level metadata, business rules, and integration patterns for Chart of Accounts'
      }
    ]
  },
  {
    id: '2',
    name: 'CONCEPT_INVOICE',
    email: 'Commercial Invoice Document',
    userStatus: 'Active',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Paid',
    paymentDate: '15/APR/2020',
    amount: 250,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Updated invoice lifecycle documentation',
        detail: 'Documented compliance requirements, tax calculation rules, and payment reconciliation processes'
      }
    ]
  },
  {
    id: '3',
    name: 'CONCEPT_PAYMENT_METHOD',
    email: 'Payment Execution Method',
    userStatus: 'Inactive',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Paid',
    paymentDate: '15/APR/2020',
    amount: 200,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Reviewed payment method taxonomy',
        detail: 'Pending updates for cryptocurrency and digital wallet payment methods'
      }
    ]
  },
  {
    id: '4',
    name: 'VALUESET_TAX_TYPE',
    email: 'Tax Classification Values',
    userStatus: 'Active',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Overdue',
    paymentDate: '15/APR/2020',
    amount: 300,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Tax authority alignment required',
        detail: 'Need to update GST/VAT definitions for Australia, Canada, UK compliance'
      }
    ]
  },
  {
    id: '5',
    name: 'VALUESET_PAYMENT_METHOD',
    email: 'Payment Method Enumeration',
    userStatus: 'Active',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Paid',
    paymentDate: '15/APR/2020',
    amount: 370,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Extended payment method catalog',
        detail: 'Added BNPL, ACH, Wire Transfer, and Mobile Wallet payment methods'
      }
    ]
  },
  {
    id: '6',
    name: 'CONCEPT_CUSTOMER',
    email: 'Customer Business Entity',
    userStatus: 'Active',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Unpaid',
    paymentDate: '15/APR/2020',
    amount: 200,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Customer data model documentation',
        detail: 'Documenting GDPR compliance, consent management, and data retention policies'
      }
    ]
  },
  {
    id: '7',
    name: 'CONCEPT_PRODUCT',
    email: 'Product Catalog Entry',
    userStatus: 'Inactive',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Paid',
    paymentDate: '15/APR/2020',
    amount: 750,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Product taxonomy review',
        detail: 'Pending updates for variant management and bundle pricing rules'
      }
    ]
  },
  {
    id: '8',
    name: 'VALUESET_ACCOUNT_TYPE',
    email: 'Account Classification Values',
    userStatus: 'Active',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Unpaid',
    paymentDate: '15/APR/2020',
    amount: 200,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Chart of accounts alignment',
        detail: 'Mapping to IFRS and GAAP accounting standards for financial reporting'
      }
    ]
  },
  {
    id: '9',
    name: 'CONCEPT_WAREHOUSE',
    email: 'Warehouse Location Entity',
    userStatus: 'Active',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Paid',
    paymentDate: '15/APR/2020',
    amount: 370,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'Multi-location inventory documentation',
        detail: 'Documented bin location management, stock transfer workflows, and cycle counting'
      }
    ]
  },
  {
    id: '10',
    name: 'CONCEPT_EMPLOYEE',
    email: 'Employee Business Entity',
    userStatus: 'Inactive',
    lastLogin: '14/APR/2020',
    paymentStatus: 'Paid',
    paymentDate: '15/APR/2020',
    amount: 150,
    currency: 'USD',
    activityDetails: [
      {
        date: '14/APR/2020',
        userActivity: 'HR data model review',
        detail: 'Pending updates for payroll integration and benefits administration'
      }
    ]
  },
];
