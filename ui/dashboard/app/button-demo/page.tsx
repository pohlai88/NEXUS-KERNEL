import Button, { 
  IconCheck, 
  IconPlus, 
  IconArrowRight, 
  IconTrash, 
  IconDownload,
  IconEdit,
  type ButtonProps 
} from '@/components/ui-primitives/Button';
import { DashboardLayout } from '@/components/layout';

export default function ButtonDemoPage() {
  return (
    <DashboardLayout title="UI Primitives" count={36}>
      <div className="space-y-12">
        {/* Page Header */}
        <div>
          <h2 className="text-title font-bold mb-2" style={{ color: 'var(--color-text)' }}>
            Button Component - 36 Variants
          </h2>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Material Design 3 button with Quantum Obsidian tokens. 3 variants × 4 states × 3 icon positions.
          </p>
        </div>

        {/* Primary Buttons */}
        <section>
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Primary Variant
          </h3>
          
          <div 
            className="p-6 rounded-lg space-y-6"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Default State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Default State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Save Changes</Button>
                <Button variant="primary" iconLeft={<IconCheck />}>Done</Button>
                <Button variant="primary" iconRight={<IconArrowRight />}>Continue</Button>
                <Button variant="primary" iconLeft={<IconPlus />} iconRight={<IconArrowRight />}>
                  Add More
                </Button>
                <Button variant="primary" iconLeft={<IconPlus />} />
              </div>
            </div>

            {/* Hover State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Hover State (simulated)
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" state="hover">Save Changes</Button>
                <Button variant="primary" state="hover" iconLeft={<IconCheck />}>Done</Button>
                <Button variant="primary" state="hover" iconRight={<IconArrowRight />}>Continue</Button>
              </div>
            </div>

            {/* Focus State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Focus State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" state="focus">Save Changes</Button>
                <Button variant="primary" state="focus" iconLeft={<IconCheck />}>Done</Button>
                <Button variant="primary" state="focus" iconRight={<IconArrowRight />}>Continue</Button>
              </div>
            </div>

            {/* Disabled State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Disabled State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" disabled>Save Changes</Button>
                <Button variant="primary" disabled iconLeft={<IconCheck />}>Done</Button>
                <Button variant="primary" disabled iconRight={<IconArrowRight />}>Continue</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Buttons */}
        <section>
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Secondary Variant
          </h3>
          
          <div 
            className="p-6 rounded-lg space-y-6"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Default State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Default State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary">Cancel</Button>
                <Button variant="secondary" iconLeft={<IconEdit />}>Edit</Button>
                <Button variant="secondary" iconRight={<IconDownload />}>Export</Button>
                <Button variant="secondary" iconLeft={<IconEdit />} />
              </div>
            </div>

            {/* Hover State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Hover State (simulated)
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" state="hover">Cancel</Button>
                <Button variant="secondary" state="hover" iconLeft={<IconEdit />}>Edit</Button>
                <Button variant="secondary" state="hover" iconRight={<IconDownload />}>Export</Button>
              </div>
            </div>

            {/* Focus State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Focus State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" state="focus">Cancel</Button>
                <Button variant="secondary" state="focus" iconLeft={<IconEdit />}>Edit</Button>
                <Button variant="secondary" state="focus" iconRight={<IconDownload />}>Export</Button>
              </div>
            </div>

            {/* Disabled State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Disabled State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" disabled>Cancel</Button>
                <Button variant="secondary" disabled iconLeft={<IconEdit />}>Edit</Button>
                <Button variant="secondary" disabled iconRight={<IconDownload />}>Export</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Destructive Buttons */}
        <section>
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Destructive Variant
          </h3>
          
          <div 
            className="p-6 rounded-lg space-y-6"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Default State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Default State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="destructive">Delete</Button>
                <Button variant="destructive" iconLeft={<IconTrash />}>Remove</Button>
                <Button variant="destructive" iconRight={<IconTrash />}>Delete Account</Button>
                <Button variant="destructive" iconLeft={<IconTrash />} />
              </div>
            </div>

            {/* Hover State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Hover State (simulated)
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="destructive" state="hover">Delete</Button>
                <Button variant="destructive" state="hover" iconLeft={<IconTrash />}>Remove</Button>
                <Button variant="destructive" state="hover" iconRight={<IconTrash />}>Delete Account</Button>
              </div>
            </div>

            {/* Focus State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Focus State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="destructive" state="focus">Delete</Button>
                <Button variant="destructive" state="focus" iconLeft={<IconTrash />}>Remove</Button>
                <Button variant="destructive" state="focus" iconRight={<IconTrash />}>Delete Account</Button>
              </div>
            </div>

            {/* Disabled State */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Disabled State
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="destructive" disabled>Delete</Button>
                <Button variant="destructive" disabled iconLeft={<IconTrash />}>Remove</Button>
                <Button variant="destructive" disabled iconRight={<IconTrash />}>Delete Account</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section>
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Common Patterns
          </h3>
          
          <div 
            className="p-6 rounded-lg space-y-6"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Button Group */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Modal Actions
              </p>
              <div className="flex gap-3">
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>

            {/* Full Width */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Full Width
              </p>
              <Button variant="primary" fullWidth iconRight={<IconArrowRight />}>
                Continue to Payment
              </Button>
            </div>

            {/* Icon Only */}
            <div>
              <p className="text-small mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                Icon Only Buttons
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" iconLeft={<IconEdit />} />
                <Button variant="secondary" iconLeft={<IconDownload />} />
                <Button variant="destructive" iconLeft={<IconTrash />} />
              </div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section>
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Usage
          </h3>
          
          <div 
            className="p-6 rounded-lg"
            style={{ 
              backgroundColor: '#EDEDFC',
              border: '1px solid var(--color-primary)'
            }}
          >
            <pre 
              className="text-small overflow-x-auto"
              style={{ color: 'var(--color-text)' }}
            >
{`import Button, { IconCheck, IconTrash } from '@/components/ui-primitives/Button';

// Primary button
<Button variant="primary">Save Changes</Button>

// With icon
<Button variant="primary" iconLeft={<IconCheck />}>
  Done
</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Destructive with icon
<Button variant="destructive" iconLeft={<IconTrash />}>
  Delete
</Button>

// Disabled
<Button variant="primary" disabled>
  Save Changes
</Button>

// Full width
<Button variant="primary" fullWidth>
  Continue
</Button>`}
            </pre>
          </div>
        </section>

        {/* Props Documentation */}
        <section>
          <h3 className="text-subtitle font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Props
          </h3>
          
          <div 
            className="overflow-hidden rounded-lg"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <table className="w-full text-small">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface)' }}>
                  <th className="text-left p-4" style={{ color: 'var(--color-text)' }}>Prop</th>
                  <th className="text-left p-4" style={{ color: 'var(--color-text)' }}>Type</th>
                  <th className="text-left p-4" style={{ color: 'var(--color-text)' }}>Default</th>
                  <th className="text-left p-4" style={{ color: 'var(--color-text)' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td className="p-4" style={{ color: 'var(--color-text)' }}>variant</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>
                    'primary' | 'secondary' | 'destructive'
                  </td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>'primary'</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>Button style variant</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td className="p-4" style={{ color: 'var(--color-text)' }}>iconLeft</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>ReactNode</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>-</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>Icon on the left</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td className="p-4" style={{ color: 'var(--color-text)' }}>iconRight</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>ReactNode</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>-</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>Icon on the right</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td className="p-4" style={{ color: 'var(--color-text)' }}>fullWidth</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>boolean</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>false</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>Full width button</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td className="p-4" style={{ color: 'var(--color-text)' }}>disabled</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>boolean</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>false</td>
                  <td className="p-4" style={{ color: 'var(--color-text-secondary)' }}>Disabled state</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
