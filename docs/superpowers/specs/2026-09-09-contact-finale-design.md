# Contact Finale Design

## Approved outcome

Add one final desktop section after the last project row. It acts as a quiet closing poster for the personal portfolio rather than a conventional boxed footer.

## Content

- Primary name: `高振翔`
- Role: `AIGC CREATOR`
- Phone: label `电话`, value `13293941800`
- Email: label `邮箱`, value `13293941800@163.com`

The phone value links to `tel:13293941800`. The email value links to `mailto:13293941800@163.com`. The visible labels remain Chinese exactly as approved.

## Visual design

The section fills one desktop viewport with a clean white background and black typography. The name is the dominant element, set at a large poster scale and aligned slightly left of center to echo the editorial feeling of the existing gallery. `AIGC CREATOR` sits directly beneath it at a smaller scale. Phone and email sit near the bottom edge in one restrained horizontal row.

There are no cards, icons, borders, shadows, gradients, or decorative illustrations. The only transition is a gentle upward entrance as the gallery reaches its end.

## Gallery transition

The contact finale participates in the existing wheel and drag motion rather than introducing native document scrolling. The gallery receives enough additional travel for the last project row to leave upward and for the contact section to settle into a full, readable viewport. It must not overlap the fixed title/filter area while entering.

The contact section uses the same shared gallery position as the project grid. It starts below the project list, moves upward with wheel or drag input, and stops at a bounded final position. Scrolling or dragging upward returns to the projects.

## Structure and content ownership

The personal name, role, phone, and email live in the existing centralized `siteContent` module. The contact finale is a focused component that only renders this content and its links. The gallery page composes it after the project metadata grid.

## Scope

This iteration adds only the bottom contact finale. The cover screen, project content replacement, filter behavior, mobile layout, and public deployment remain deferred.

## Verification

- Unit/component tests verify the exact Chinese labels and personal content, plus correct `tel:` and `mailto:` links.
- Motion tests verify the gallery maximum includes the contact viewport and remains bounded.
- Chrome and Edge tests reach the finale by wheel and drag, confirm the name and links are visible, and return to the gallery.
- Visual QA confirms white background, black type, large-name hierarchy, clear spacing, and no footer cards or decorative clutter.
- `design-qa.md` must end with `final result: passed` before handoff.
