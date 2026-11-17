# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Three audiences, all confirmed, with one question in common: how much of the cycling plan has been built, and where.
- **Citizens, cyclists and the press.** Want a quick answer for their city and a number they can cite. Do not know the PDC.
- **Public managers and people who hold them to account** (prefeituras, state government, Ministério Público). Want project by project: what was planned, what was built, what is missing.
- **Researchers and people who work with data.** Want the method, the source and how the numbers change over time.

## Product Purpose
The Observatório Cicloviário of Ameciclo (Associação Metropolitana de Ciclistas do Recife) tracks the cycling infrastructure of the Região Metropolitana do Recife (14 municipalities) against the Plano Diretor Cicloviário (PDC, launched 2014), comparing what the plan projected with what exists. Success is a visitor who leaves knowing how much of the PDC was built in the RMR and in their municipality.

## Positioning
Independent civil-society monitoring, built on open data (OpenStreetMap) and a published method, rather than on a government's own report. The data refreshes weekly, so the page shows the evolution, not a photograph.

## Operating Context
- Data: a weekly sync with OpenStreetMap (Overpass) into Ameciclo's Postgres, run from the Coolify VPS (apps/collector). The page reads only from the database.
- "Executed" means: where the PDC planned a structure and something was built there, not necessarily of the same typology. Typology is split in the numbers (as planned / other typology).
- A dual carriageway counts once (half the length of each of its two OSM lines), the rule the Atlas always used. The PDC is therefore about 628 km in the data, against 599 km in the PDC's own catalogue.
- The first weekly measurement is 17/11/2026; the evolution chart needs at least two.
- The page lives in `apps/web` (TanStack Start on Cloudflare Workers); sibling observatories (SAMU, contagens, perfil do ciclista) follow the same pattern and the owner's redesign decisions on them are the reference for this one.

## Capabilities and Constraints
- Figures per municipality: existing structure, projected by the PDC, implanted in the PDC, share covered, and outside the PDC; plus a list of PDC projects per city (planned and built typology and length).
- Map of ~4,700 ways by status (not executed in the PDC / executed in the PDC / executed outside the PDC), served from a cached endpoint.
- Terminology: PDC, tipologia (ciclovia, ciclofaixa, ciclorrota, calçada compartilhada), município, "implantado" / "executado", "pista dupla".
- Undecided: whether the public numbers keep the dual-carriageway rule (PR #208 applies it; the owner is to confirm).

## Brand Commitments
Ameciclo green (#008080, `ameciclo` in the web theme) and the existing site header and footer. Sober, direct Portuguese; no marketing tone. The existing banner image of the page stays.

## Evidence on Hand
Real data in production from run 3 (17/11/2026): 320.3 km existing, 628.1 km in the PDC, 131.8 km implanted (21.0%), 188.5 km outside the PDC. PDC documents (volumes 1 and 2, folder, podcast, wiki) are linked on the page. There are no testimonials or external benchmarks, and none may be invented.

## Product Principles
1. The answer to "how much of the PDC was built?" comes before any chart.
2. Every number can be traced: where it comes from, from when, and under which rule.
3. Layered depth: a quick read at the top, the municipality in the middle, the method and the data at the bottom.
4. Coverage of the plan is shown as a share of the plan, never as a ranking of virtue: some municipalities have almost no PDC projects.

## Accessibility & Inclusion
Map information must also exist as text and tables; colour is never the only carrier of status. Portuguese (pt-BR) throughout, numbers formatted in pt-BR.
