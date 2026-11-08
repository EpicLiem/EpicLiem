# Leonardo quote sources

The catalog contains **72 active passages** and **34 retired prophecies**, all direct quotations or contiguous excerpts from **The Notebooks of Leonardo Da Vinci — Complete**, translated and edited by Jean Paul Richter; Project Gutenberg ebook 5000. This public-domain English edition uses older spelling and punctuation. Text is preserved as transcribed by Gutenberg, with line wrapping collapsed into spaces. No AI-written quotations or modern paraphrases are included.

- [Gutenberg catalog and bibliographic record](https://www.gutenberg.org/ebooks/5000)
- [Complete HTML edition](https://www.gutenberg.org/cache/epub/5000/pg5000-images.html)
- [Plain-text edition](https://www.gutenberg.org/cache/epub/5000/pg5000.txt)
- Reverified 2026-11-08.
- Plain-text file SHA-256: `83e79e107270ea7cbbc4b478913978738ae3d763081e54bc173a663d08ca5b10`.
- HTML file SHA-256: `f19465a8877ef6c7c24b3377abed4d89704e8f10d83be17bd2610d5ac9aab03f`.

Each entry records its numbered section and a direct link to the specific HTML paragraph containing it. IDs are stable descriptive slugs; topics provide context. `data/quotes.json` and `website/lib/quotes.json` must stay identical.

## Selection and retirement

On 2026-11-08, **52 new passages** were added to the 20 existing non-prophecy passages. The active collection favors mortality, bodily processes, perception, light and shadow, unsettling natural imagery, and idiosyncratic human observations. It excludes the **Prophecies**, which are literary riddles about everyday things. "Uncommon" is an editorial judgment, not a measured popularity ranking.

All 34 original prophecy entries are marked `retired: true`. They remain in the catalog with their original IDs and wording so saved editions, votes and published images retain their provenance. They cannot enter a new ballot. If a saved daily edition refers to a retired passage, the website displays the first active candidate for that day without rewriting the database record. Valid active winners remain unchanged. Votes for withdrawn choices remain stored but cannot win a new ballot.

The 72 active passages rotate in groups of three, producing a 24-day cycle. Adjacent days have disjoint choices. Quotes eventually repeat.

## The requested example

The user's "vehicles and conduits of food, tombs of animals, hostels of Death" is a different English rendering. The collection retains Richter's verifiable version, section **847**, beginning "Man and animals are really the passage and the conduit of food". It preserves the source's translator-supplied square brackets in "[bodies]". We do not attribute the user's exact wording to the Richter edition.

## Editorial context

Some entries are excerpts from longer passages and may begin or end within a sentence. Nothing has been spliced together; no ellipses or punctuation have been inserted into the stored text. Readers can follow each source link for its full context.

Historical scientific ideas are presented as Leonardo's writing, not as current scientific facts. Section 9 uses an ironic comparison with unwanted merchandise to describe neglected subjects of study. In section 1177, Richter explicitly notes that there is no clue explaining the sentence about words freezing on Mount Etna. Section 1217 concerns a fossilized sea creature and includes passages whose underlying manuscript Richter found difficult to decipher. Section 1218 speculates on the end of terrestrial nature; it is outside the Prophecies sequence. Section 1339's cave passage describes fear and curiosity.

## Verification

All **106/106** texts were found verbatim after whitespace normalization in the plain-text edition and in their linked HTML paragraphs. Every numbered section was checked against the nearest preceding numbered HTML paragraph. IDs and texts are unique. Active quote lengths range from 51 to 314 characters; every catalog entry is exercised by the image-rendering tests.

Download the two source editions linked above, then run:

```sh
python3 scripts/verify-sources.py /path/pg5000.txt /path/pg5000-images.html
npm test
npm test --prefix website
npm run build --prefix website
```

The source verifier uses only Python's standard library and prints the hashes of the exact downloaded files. The normal tests check catalog synchronization, IDs, retirement, rotation, saved-edition compatibility and rendering without requiring network access.
