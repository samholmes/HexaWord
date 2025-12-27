# HexaWord Game Design Guidelines

## Design Approach

**Reference-Based**: Drawing inspiration from successful puzzle games like Wordle, NYT Games, and Duolingo's playful interfaces, adapted for hexagonal grid gameplay with a distinctive purple-focused, modern gaming aesthetic.

## Core Design Principles

- **Playful Clarity**: Clean layouts that feel fun and approachable while maintaining excellent usability
- **Visual Delight**: Strategic use of animations and color to create engagement without distraction
- **Grid-First Design**: The hexagonal game board is the hero element, commanding visual hierarchy
- **Instant Feedback**: UI responds immediately to user actions with satisfying micro-interactions

## Typography

**Primary Font**: 'Fredoka' (Google Fonts) - rounded, friendly, perfect for gaming
**Secondary Font**: 'Inter' (Google Fonts) - clean, modern for UI elements

**Hierarchy**:
- Game Title/Logo: Fredoka, 48px (mobile: 32px), bold
- Section Headers: Fredoka, 32px (mobile: 24px), semi-bold
- Body Text: Inter, 16px (mobile: 14px), regular
- Hexagon Letters: Fredoka, 24px (mobile: 18px), bold
- Stats/Scores: Inter, 20px, medium
- Button Text: Inter, 14px, medium, uppercase tracking

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 16, and 24 for consistent rhythm

**Container Strategy**:
- Main game area: max-w-4xl, centered
- Content sections: max-w-6xl
- Cards/Components: p-6 (mobile: p-4)
- Section spacing: py-16 (mobile: py-8)

**Grid Structure**: Single-column centered layout for game, allowing focus on hexagonal puzzle

## Component Library

### Navigation
**Top Bar**: Fixed position, backdrop-blur, subtle shadow
- Logo (left): Fredoka font with playful hexagon icon
- Stats indicators (center): Round pills showing streak, score
- Menu icon (right): Hamburger transforming to X
- Height: 64px, padding: px-4
- Background: Semi-transparent white with blur effect

### Hero Section (Landing/Welcome State)
**Full-Screen Welcome**: 100vh, centered content
- Large animated hexagon logo with gradient
- Game title in Fredoka
- Tagline: "Find words in the hex"
- Primary CTA button: "Start Playing" (rounded-full, px-8, py-4)
- Background: Subtle geometric pattern with hexagons
- **Hero Image**: Abstract illustration of colorful interlocking hexagons with subtle glow effects, positioned as full-width background with overlay gradient

### Game Board
**Hexagonal Grid Container**: 
- Card with rounded-3xl corners, generous padding (p-8)
- Soft shadow (shadow-2xl)
- White/light background contrasting with purple accents
- Grid: 3-4 rows of hexagons, staggered arrangement
- Each hexagon: 80px diameter (mobile: 60px)
- Gap between hexagons: 12px
- Center alignment with subtle hover scale on hexagons

### Word Input Area
**Below Grid**:
- Large display of selected letters (text-4xl, Fredoka)
- Submit button: Rounded-full, w-full on mobile, px-12 py-4 on desktop
- Clear/Reset button: Ghost style, rounded-full
- Spacing: mt-6 from grid

### Stats Cards
**Score Dashboard**: Grid of 3-4 stat cards
- grid-cols-2 md:grid-cols-4
- Each card: rounded-2xl, p-6, text-center
- Large number display (text-3xl, Fredoka)
- Label below (text-sm, Inter, uppercase)
- Background: Light purple tint with subtle gradient
- Icon above number (32px)

### Word List Panel
**Found Words Display**:
- Rounded-2xl card, p-6
- Scrollable area (max-h-96)
- Words displayed as chips: rounded-full pills, px-4 py-2
- Flex wrap layout with gap-2
- Each word: Purple gradient background, white text
- Appears with slide-in animation as words are found

### Game Controls
**Action Buttons**:
- Primary: Rounded-full, px-8 py-3, bold gradient
- Secondary: Rounded-full, px-6 py-2, outline style
- Icon buttons: Circular (w-12 h-12), centered icon
- Consistent 8px spacing between button groups

### Modals/Overlays
**Game Over/Victory Screen**:
- Centered modal, max-w-md
- Rounded-3xl, p-8
- Backdrop blur on page behind
- Confetti animation trigger on victory
- Stats summary grid
- Share/New Game buttons
- Close icon (top-right)

### Tutorial Overlay
**First-Time User**:
- Step-by-step hexagon highlights
- Floating tooltip cards with rounded-2xl
- Animated pointer/arrow indicators
- "Got it" button to dismiss steps
- Darkened overlay (bg-black/60)

## Animation Guidelines

**Micro-interactions Only** (minimize distractions):
- Hexagon selection: Gentle scale (1.05) + shadow increase, 200ms
- Letter reveal: Fade-in + slight bounce, 300ms stagger
- Word validation: Success = green pulse, Invalid = shake animation (300ms)
- Score update: Number count-up animation, 600ms
- Card entry: Slide-up fade, 400ms ease-out
- Button hover: Subtle scale (1.02), 150ms

**No continuous animations** - keep UI calm when idle

## Images Section

### Hero Background Image
**Placement**: Full-width background for welcome/landing section
**Description**: Vibrant abstract illustration featuring interlocking hexagonal shapes in various sizes. Use gradient overlays with purple tones (#8B5CF6 to #D946EF). Include subtle glow/blur effects on hexagons. Modern, colorful, slightly translucent style. Image should have depth with layered hexagons creating dimension.
**Treatment**: Overlay with gradient (purple to transparent), ensure text remains readable with backdrop-blur on content cards

### Tutorial/Guide Graphics
**Placement**: Within tutorial modal steps
**Description**: Simple, iconic illustrations showing finger tapping hexagons, connecting letters, and forming words. Flat illustration style, purple accent colors, minimal detail.

### Achievement Badges (Optional Future)
Icons representing milestones - hexagonal frame design

## Accessibility

- WCAG AA contrast ratios between purple accents and text
- Hexagon selection states visible without color alone (border thickness increase)
- Focus indicators: 3px purple outline on interactive elements
- Touch targets: Minimum 44px for hexagons and buttons
- Keyboard navigation: Arrow keys to move between hexagons, Enter to select
- Screen reader labels on all interactive hexagons and buttons