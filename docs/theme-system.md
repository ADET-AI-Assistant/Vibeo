# Theme System & UI Design 🎨

Vibeo features a premium, modern visual aesthetic that sets it apart. The primary design language used is an implementation of "Glassmorphism," paired with deep, immersive background aesthetics reminiscent of an elite streaming platform

## Visual Identity

*   **Dark Theme Default**: Vibeo is built exclusively around a dark environment (`#0b0a0f` base background), which naturally reduces eye strain in dark environments common during movie watching.
*   **Vibrant Accents**: Core interactive elements utilize vibrant purple (`#a855f7`) and blue gradients to signal action and focus.
*   **Glassmorphism**: Panels, modals, and certain cards utilize heavy background blurs (`backdrop-blur-xl`) with semi-transparent, brightened borders to create a layered, frosted glass effect. This adds depth without visual clutter.

## Tailwind Configuration

Our styling is driven almost entirely by the utility classes provided by **Tailwind CSS (v4)**.

*   To maintain standard implementations across the app, custom configuration has been injected directly within our stylesheet via standard Tailwind `@layer` abstractions.
*   We've added custom CSS variables (`--radius-sm`, `--glass-bg`, etc.) to standardise our glassmorphic properties.

## Interactions & Animations

Smoothness is paramount in Vibeo. Our UI includes extensive micro-interactions:
*   **Hover States**: Subtle scale bumps (`hover:scale-105`) and shadow reveals on movie cards.
*   **Focus Rings**: Clear, accessible focus indicators on forms and buttons.
*   **Transition Timing**: Unified `ease-in-out` curves on interactions prevent harsh flashes, creating a more sophisticated feel.
