# HRIS Client Admin — Production Design System

## 1. Design System Philosophy

The **HRIS Client Admin Design System** is engineered specifically for human resources operators, people managers, and organizational administrators.

### Core Principles

* **Professional & Trustworthy**: Calm color palette, refined typography, and dependable layouts that inspire confidence when handling sensitive employee and payroll records.
* **Modern & Clean**: Rational visual hierarchy, generous whitespace, and sharp 1px borders.
* **Enterprise-Ready**: Optimized for high information density, tabular scans, status clarity, and rapid operational workflows.
* **Efficient for HR Teams**: Fast keyboard navigation, predictable layout patterns, and explicit feedback states.
* **Accessible (WCAG 2.1 AA Compliant)**: High-contrast text, visible focus rings, ARIA semantics, and screen-reader-friendly form bindings.
* **Anti-Consumer App**: Explicitly avoids distracting gradients, decorative illustrations, playful animations, or low-density consumer layouts.

---

## 2. Design Tokens

### 2.1 Typography

The system utilizes a modern system font stack prioritizing legibility across all operating systems, paired with a monospace stack for IDs and financial codes.

| Role | Font Size | Weight | Line Height | Tracking | CSS Variable / Utility Class |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Font Family** | Sans Stack | 400–700 | — | — | `var(--font-sans)` |
| **Code / Monospace** | Monospace | 400–600 | — | — | `var(--font-mono)` |
| **Page Heading** | `1.75rem` (28px) | 700 (Bold) | 1.25 | `-0.015em` | `var(--text-3xl)` / `.text-page-title` |
| **Section Heading** | `1.25rem` (20px) | 600 (Semibold) | 1.375 | `-0.015em` | `var(--text-xl)` / `.text-section-title` |
| **Subheading** | `1rem` (16px) | 600 (Semibold) | 1.5 | `0` | `var(--text-md)` / `.text-subheading` |
| **Body Text** | `0.875rem` (14px) | 400 (Regular) | 1.5 | `0` | `var(--text-base)` / `.text-body` |
| **Small Text** | `0.75rem` (12px) | 400 (Regular) | 1.375 | `0` | `var(--text-xs)` / `.text-small` |
| **Form Labels** | `0.8125rem` (13px) | 500 (Medium) | 1.0 | `0` | `var(--text-sm)` / `.text-label` |
| **Table Header** | `0.75rem` (12px) | 600 (Semibold) | 1.0 | `0.05em` | `var(--text-xs)` / `.text-table-header` |
| **Table Cell** | `0.875rem` (14px) | 400 (Regular) | 1.5 | `0` | `var(--text-base)` / `.text-table-cell` |
| **Button Text** | `0.875rem` (14px) | 500 (Medium) | 1.0 | `0` | `var(--text-base)` / `.text-button` |

---

### 2.2 Spacing Scale (4px Base Grid)

All margins, paddings, and flex/grid gaps must adhere strictly to the 4px geometric scale:

| Token | Value (rem) | Value (px) | Primary Application |
| :--- | :--- | :--- | :--- |
| `--space-0` | `0` | 0px | Reset |
| `--space-1` | `0.25rem` | 4px | Inline icon gaps, badge vertical padding |
| `--space-2` | `0.5rem` | 8px | Button inline gaps, input inner padding |
| `--space-3` | `0.75rem` | 12px | Compact padding, table cell vertical padding |
| `--space-4` | `1rem` | 16px | Standard component padding, card headers |
| `--space-5` | `1.25rem` | 20px | Section gaps, card grid gaps |
| `--space-6` | `1.5rem` | 24px | Page container padding, card inner body |
| `--space-8` | `2rem` | 32px | Major layout block separation |
| `--space-10`| `2.5rem` | 40px | Hero sections |
| `--space-12`| `3rem` | 48px | Empty state containers |
| `--space-16`| `4rem` | 64px | Page bottom breathing room |

---

### 2.3 Border Radius

| Token | Value | Recommended Usage |
| :--- | :--- | :--- |
| `--radius-sm` | `4px` | Form inputs, tooltips, nested badges |
| `--radius-md` | `6px` | Buttons, select dropdowns, alert banners |
| `--radius-lg` | `8px` | Cards, table containers, panel sections |
| `--radius-xl` | `12px`| Modal dialogs, floating drawers |
| `--radius-full`| `9999px`| Status pills, user avatar circles |

---

### 2.4 Shadows & Elevation

The design system uses subtle, sharp elevations that avoid muddy, low-contrast blurs:

| Token | CSS Definition | Purpose |
| :--- | :--- | :--- |
| `--elevation-0` | `none` | Flat elements, sunken table rows |
| `--elevation-1` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Resting cards, data tables, secondary buttons |
| `--elevation-2` | `0 4px 6px -1px rgb(0 0 0 / 0.08)` | Hovered cards, dropdown menus, popovers |
| `--elevation-3` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modal dialogs, sliding slide-over drawers |
| `--focus-ring` | `0 0 0 2px #fff, 0 0 0 4px #0f766e` | Universal high-contrast keyboard focus ring |

---

### 2.5 Semantic Color System

All colors are chosen to guarantee WCAG 2.1 AA compliance (>= 4.5:1 contrast for normal text):

| Semantic Category | Token | Hex | Role & Contrast Ratio |
| :--- | :--- | :--- | :--- |
| **Primary** | `--color-primary` | `#0f766e` | Primary actions, links, active tab indicator (4.6:1 on white) |
| | `--color-primary-hover` | `#115e59` | Hovered state for primary button (5.8:1 on white) |
| | `--color-primary-light` | `#f0fdfa` | Selected rows, subtle active pills |
| | `--color-primary-contrast` | `#ffffff` | Button text on primary fill (4.6:1 on primary) |
| **Secondary** | `--color-secondary` | `#475569` | Secondary action outlines, secondary controls |
| | `--color-secondary-hover` | `#334155` | Secondary hover fill |
| **Canvas** | `--color-bg-app` | `#f8fafc` | Main application backdrop |
| | `--color-bg-subtle` | `#f1f5f9` | Sunken backgrounds, table headers |
| **Surface** | `--color-surface` | `#ffffff` | Card surfaces, modal bodies, dropdown menus |
| **Borders** | `--color-border-default` | `#e2e8f0` | Standard component perimeter line |
| | `--color-border-strong` | `#cbd5e1` | Emphasized divider lines, input hover border |
| | `--color-border-focus` | `#0f766e` | Focused input border |
| **Text** | `--color-text-primary` | `#0f172a` | High-contrast headings and primary labels (16.2:1) |
| | `--color-text-secondary` | `#475569` | Readable body content, descriptions (5.9:1) |
| | `--color-text-muted` | `#64748b` | Timestamps, placeholder text, table headers (4.6:1) |
| **Success** | `--color-success-text` | `#065f46` | Active statuses, approved leaves (7.2:1) |
| | `--color-success-bg` | `#ecfdf5` | Success badge & alert background |
| | `--color-success-border`| `#a7f3d0` | Success badge & alert border |
| **Warning** | `--color-warning-text` | `#92400e` | Pending approvals, expiring licenses (6.1:1) |
| | `--color-warning-bg` | `#fffbeb` | Warning badge & alert background |
| | `--color-warning-border`| `#fde68a` | Warning badge & alert border |
| **Error** | `--color-error-text` | `#991b1b` | Rejected requests, critical alerts, validation (6.5:1) |
| | `--color-error-bg` | `#fef2f2` | Error badge & alert background |
| | `--color-error-border` | `#fecaca` | Error badge & alert border |
| **Information** | `--color-info-text` | `#075985` | Informational announcements, help notices (6.0:1) |
| | `--color-info-bg` | `#f0f9ff` | Info badge & alert background |
| | `--color-info-border` | `#bae6fd` | Info badge & alert border |

---

## 3. Accessibility Standards (WCAG 2.1 AA)

1. **Visible Focus Rings**:
   All interactive elements (`button`, `input`, `select`, `textarea`, `a`, `[tabindex]`) display a prominent 2px solid primary ring with 2px offset whenever focused via keyboard (`:focus-visible`).
2. **Accessible Forms**:
   Every form control is linked to its label via `htmlFor` and `id`. Error messages use `role="alert"` and are connected to inputs using `aria-invalid="true"` and `aria-describedby`.
3. **Modal Dialogs**:
   Include `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and `aria-describedby`. They listen to keyboard `Escape` to close and trap focus.
4. **Tabs**:
   Follow the W3C WAI-ARIA Authoring Practices for Tabs (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and Arrow Key navigation).

---

## 4. Reusable UI Component Primitives

The design system exports the following primitives from `src/components/`:

* **`Button`**: Variants (`primary`, `secondary`, `outline`, `ghost`, `danger`), sizes (`sm`, `md`, `lg`), `isLoading` state with spinner.
* **`Input`**: Accessible text input with label, required asterisk, start icon slot, helper text, and error states.
* **`Select`**: Accessible dropdown select with label, options list, helper text, and validation feedback.
* **`Card`**: Surface container with composable `CardHeader`, `CardBody`, and `CardFooter`.
* **`Badge`**: Status indicator with semantic variants (`neutral`, `primary`, `success`, `warning`, `danger`, `info`).
* **`Table`**: Enterprise table primitives (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`).
* **`Alert`**: Semantic notification banners with icons, titles, and dismissible actions.
* **`Modal`**: Accessible dialog overlay with backdrop dismiss, escape key listener, and footer action slots.
* **`Tabs`**: Accessible tab navigation bar with pill count badges and keyboard arrows.
* **`Divider`**: Semantic horizontal or vertical separator line.
* **`EmptyState`**: Empty dashboard or list state with icon, title, description, and CTA.
* **`ActionGuard`**: Declarative RBAC protection wrapper for action buttons.
