# System Architecture

## Level 1: System Context

The following diagram illustrates how the Kernel interacts with the wider ecosystem.

```mermaid
C4Context
    title System Context Diagram for @aibos/kernel

    Person(developer, "Developer", "A developer consuming the kernel package")
    
    System(kernel, "@aibos/kernel", "L0 SSOT Kernel. Provides core types, schemas, and utility contracts.")
    
    System_Ext(npm, "NPM Registry", "Hosts the package versions")
    System_Ext(apps, "Downstream Apps", "L1/L2 applications consuming the kernel")
    System_Ext(db, "Database", "Runtime state storage (validated against kernel)")

    Rel(developer, kernel, "Installs and imports")
    Rel(kernel, npm, "Published to")
    Rel(apps, kernel, "Inherits types from")
    Rel(apps, db, "Validates against kernel snapshot")
```

## Level 2: Container (Module Structure)

Internal high-level structure of the kernel package.

```mermaid
graph TD
    subgraph "@aibos/kernel Package"
        Contracts["Contracts & Interfaces<br/>(kernel.contract.ts)"]
        Concepts["Concepts Registry<br/>(concepts.ts)"]
        Values["Values Registry<br/>(values.ts)"]
        Schemas["Zod Schemas<br/>(zod.ts)"]
        Utils["Utility Functions<br/>(canonId, errors, etc.)"]
        Manifest["Manifest Layer<br/>(manifest.ts)"]
    end
    
    subgraph "Downstream Systems"
        L1["L1 Domain Canon<br/>(@nexus/canon-*)"]
        L2["L2 Cluster<br/>(Workflows, Approvals)"]
        L3["L3 Cell<br/>(UI, API, Runtime)"]
    end
    
    L1 --> Contracts
    L1 --> Concepts
    L1 --> Values
    L2 --> Manifest
    L3 --> Utils
    L3 --> Schemas
```

## Level 3: Component (Internal Structure)

Detailed component view of the kernel package.

```mermaid
graph LR
    subgraph "Core Exports"
        A[concepts.ts<br/>181 Concepts]
        B[values.ts<br/>68 Value Sets<br/>307 Values]
        C[version.ts<br/>Version & Validation]
    end
    
    subgraph "Contract Layer"
        D[kernel.contract.ts<br/>Frozen Schemas]
        E[kernel.validation.ts<br/>Zod Validators]
    end
    
    subgraph "Utilities"
        F[canonId.ts<br/>ID Generation]
        G[errors.ts<br/>Error Types]
        H[zod.ts<br/>Zod Helpers]
    end
    
    A --> D
    B --> D
    C --> D
    E --> D
    F --> A
    F --> B
```

## Layer Model (L0 → L3)

The kernel implements a four-layer architecture where truth flows one-way.

```mermaid
graph TD
    L0["L0: Kernel<br/>(@aibos/kernel)<br/>Constitutional Layer<br/>Defines WHAT exists"]
    
    L1["L1: Domain Canon<br/>(@nexus/canon-*)<br/>Policy & Ownership<br/>Restricts usage"]
    
    L2["L2: Cluster<br/>(Workflows, Approvals)<br/>Operational Strategy<br/>Defines workflows"]
    
    L3["L3: Cell<br/>(UI, API, Runtime)<br/>Execution & Ledger<br/>Executes & renders"]
    
    L0 -->|"Defines"| L1
    L1 -->|"Restricts"| L2
    L2 -->|"Orchestrates"| L3
    
    style L0 fill:#e1f5ff
    style L1 fill:#fff4e1
    style L2 fill:#ffe1f5
    style L3 fill:#e1ffe1
```

**Critical Rule:** Truth flows ONE-WAY. Downstream layers may restrict or execute, but **never redefine** what the Kernel defines.

## Data Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Kernel as @aibos/kernel
    participant Pack as Pack Files
    participant DB as Database
    
    Dev->>Kernel: Import CONCEPT, VALUE
    Kernel->>Kernel: Validate integrity
    Kernel-->>Dev: Type-safe exports
    
    Dev->>Pack: Load pack.json
    Pack->>Kernel: Validate against contract
    Kernel-->>Pack: Validation result
    
    Pack->>DB: Seed kernel_metadata
    DB->>Kernel: Compare snapshot_id
    Kernel-->>DB: Drift detection
```

## Key Principles

1. **Immutable by Default** - Kernel changes require version bumps
2. **Type-Safe** - Zero raw strings, compile-time validation
3. **One-Way Truth** - L0 → L1 → L2 → L3 (never reversed)
4. **Pack-Based** - Modular, parallelizable architecture
5. **Industrialized** - Code generated from data tables

## Technology Stack

- **Language:** TypeScript 5.7+ (strict mode)
- **Validation:** Zod 3.24+
- **Build:** TypeScript Compiler
- **Testing:** Vitest
- **Package Manager:** pnpm

## Related Documentation

- **[Layer Model Details](./layer-model.md)** - Detailed L0/L1/L2/L3 explanation
- **[Design Principles](./design-principles.md)** - Core architectural principles
- **[Architecture Decision Records](../adr/README.md)** - Design decisions
- **[Getting Started Guide](../guides/getting-started.md)** - Quick start
- **[Usage Guide](../guides/usage.md)** - Practical examples
- **[Glossary](../guides/glossary.md)** - Ubiquitous Language

