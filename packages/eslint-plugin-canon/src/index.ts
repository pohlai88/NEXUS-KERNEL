/**
 * @nexus/eslint-plugin-canon
 * 
 * ESLint plugin to enforce Nexus Canon compliance at coding time.
 * 
 * Rules:
 * - forbid-free-string-status: Prevents using free strings for status values
 * - require-schema-header: Requires schema headers in contract definitions
 * - forbid-bypass-imports: Prevents bypassing @nexus/kernel imports
 */

import type { ESLint } from 'eslint';

export const plugin = {
  meta: {
    name: '@nexus/eslint-plugin-canon',
    version: '0.1.0',
  },
  rules: {
    'forbid-free-string-status': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Forbid free string literals for status values. Use createStatusSet() instead.',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          freeStringStatus: 'Status values must use createStatusSet() from @nexus/kernel, not free strings.',
        },
        schema: [],
      },
      create(context: ESLint.RuleContext) {
        return {
          // Match string literals that look like status values
          Literal(node: any) {
            if (typeof node.value === 'string') {
              const value = node.value.toUpperCase();
              // Common status patterns
              const statusPatterns = [
                'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE',
                'SUCCESS', 'ERROR', 'WARNING', 'COMPLETE', 'CANCELLED', 'ARCHIVED'
              ];
              
              // Check if parent is a status assignment
              const parent = node.parent;
              if (parent && (
                (parent.type === 'Property' && parent.key?.name?.toLowerCase().includes('status')) ||
                (parent.type === 'AssignmentExpression' && parent.left?.property?.name?.toLowerCase().includes('status'))
              )) {
                if (statusPatterns.includes(value)) {
                  context.report({
                    node,
                    messageId: 'freeStringStatus',
                  });
                }
              }
            }
          },
        };
      },
    },
    
    'require-schema-header': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Require schema headers (_schema_id, _schema_version) in contract definitions.',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          missingSchemaHeader: 'Contract definitions must include _schema_id and _schema_version from createContractSchema().',
        },
        schema: [],
      },
      create(context: ESLint.RuleContext) {
        return {
          // Match Zod schema definitions that should have schema headers
          CallExpression(node: any) {
            if (
              node.callee?.name === 'createContractSchema' ||
              (node.callee?.type === 'MemberExpression' &&
               node.callee.object?.name === 'z' &&
               node.callee.property?.name === 'object')
            ) {
              // Check if schema header is present
              const hasSchemaId = node.arguments?.[0]?.properties?.some(
                (prop: any) => prop.key?.name === '_schema_id'
              );
              
              if (!hasSchemaId && node.callee?.name !== 'createContractSchema') {
                context.report({
                  node,
                  messageId: 'missingSchemaHeader',
                });
              }
            }
          },
        };
      },
    },
    
    'forbid-bypass-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Forbid bypassing @nexus/kernel imports. Use canonical imports only.',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          bypassImport: 'Do not bypass @nexus/kernel imports. Use canonical imports from @nexus/kernel, @nexus/cruds, or @nexus/ui-actions.',
        },
        schema: [],
      },
      create(context: ESLint.RuleContext) {
        return {
          // Match direct zod imports when @nexus/kernel should be used
          ImportDeclaration(node: any) {
            if (node.source.value === 'zod') {
              // Check if file should be using @nexus/kernel instead
              const filename = context.getFilename();
              if (
                filename.includes('contract') ||
                filename.includes('schema') ||
                filename.includes('validation')
              ) {
                // Check if @nexus/kernel is already imported
                const hasKernelImport = context.getSourceCode().ast.body.some(
                  (stmt: any) =>
                    stmt.type === 'ImportDeclaration' &&
                    stmt.source.value === '@nexus/kernel'
                );
                
                if (!hasKernelImport) {
                  context.report({
                    node,
                    messageId: 'bypassImport',
                  });
                }
              }
            }
          },
        };
      },
    },
  },
};

// Export for ESLint flat config
export default plugin;

