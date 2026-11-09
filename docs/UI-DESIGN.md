# Quote reader UI

The main tasks are to read today's passage, choose one of three passages for tomorrow, and change that vote. Source links provide context without competing with the passages. This is a brief reading visit, not a dashboard.

Preserve the project's Terminess font, dark coffee palette, and links back to GitHub and epicliem.com. These are existing project choices. The quote itself is the visual identity; extra illustrations, logos and decorative assets would compete with it.

The wide layout reads like an open notebook: today's larger passage on the left, tomorrow's smaller choices on the right. At intermediate widths it becomes a single reading column with vote controls beside the choices. On phones the controls move below each passage; a jump link reaches voting. Selected rows have a copper rule, background and an explicit "Your vote" label. Borders separate passages; they are not decorative cards.

Energy 2, rhythm 2, motion 1. The two reading tasks have different scale and spacing. Motion is limited to short color changes, disabled for reduced motion. No entrance animation or ambient movement.

Reading and voting stream independently from sibling server boundaries and have separate client loading/retry state. A server section that exceeds 1.5 seconds yields to its client retry; browser requests time out after 15 seconds. A failed change identifies the last confirmed vote beside the attempted choice. A successful vote is confirmed immediately while totals refresh separately; version checks prevent an older refresh from overwriting a newer choice. Closed ballots have an explicit heading and recovery action. Optional source and voting details remain in a native disclosure at the bottom.

Streaming section replacement needs JavaScript. Without JavaScript, a visible fallback links to the already-published GitHub passage and explains that voting requires JavaScript.

Validate short and long passages at 320, 390, 768, 1024, 1280 and 1440 CSS pixels; check keyboard focus, 200% zoom, saving, changing, saved-state reload, failures, retry and midnight rollover. Browser UI tests use mocked APIs so they do not add production votes.
