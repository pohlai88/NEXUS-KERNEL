/**
 * @nexus/eslint-plugin-canon
 * 
 * ESLint plugin to enforce Nexus Canon compliance at coding time.
 */

// Note: This is a simplified version for demonstration.
// Full implementation would use @typescript-eslint/utils for proper AST parsing.

module.exports = {
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
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              const value = node.value.toUpperCase();
              const statusPatterns = [
                'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE',
                'SUCCESS', 'ERROR', 'WARNING', 'COMPLETE', 'CANCELLED', 'ARCHIVED'
              ];
              
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
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee?.name === 'createContractSchema' ||
              (node.callee?.type === 'MemberExpression' &&
               node.callee.object?.name === 'z' &&
               node.callee.property?.name === 'object')
            ) {
              const hasSchemaId = node.arguments?.[0]?.properties?.some(
                (prop) => prop.key?.name === '_schema_id'
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
      create(context) {
        return {
          ImportDeclaration(node) {
            if (node.source.value === 'zod') {
              const filename = context.getFilename();
              if (
                filename.includes('contract') ||
                filename.includes('schema') ||
                filename.includes('validation')
              ) {
                const sourceCode = context.getSourceCode();
                const hasKernelImport = sourceCode.ast.body.some(
                  (stmt) =>
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

