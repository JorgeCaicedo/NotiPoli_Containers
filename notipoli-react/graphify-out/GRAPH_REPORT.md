# Graph Report - notipoli-react  (2026-10-27)

## Corpus Check
- Corpus is ~14,909 words - fits in a single context window. You may not need a graph.

## Summary
- 165 nodes · 320 edges · 19 communities (10 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- React Frontend Application
- Project Config & Dependencies
- Auth JS Module (Static)
- Main JS Module (Static)
- CRUD JS Module (Static)
- Favorites JS Module (Static)
- Static HTML Pages (Assets)
- Lint Config
- NPM Scripts
- Contact JS Module (Static)
- Root Index HTML
- Favicon SVG
- Icons SVG
- README
- Hero Image
- React Logo
- Vite Logo

## God Nodes (most connected - your core abstractions)
1. `react` - 17 edges
2. `App()` - 13 edges
3. `react-router-dom` - 11 edges
4. `useFavorites()` - 11 edges
5. `useAuth()` - 9 edges
6. `useNews()` - 9 edges
7. `renderHero()` - 7 edges
8. `renderGrid()` - 7 edges
9. `renderCards()` - 7 edges
10. `renderDetalle()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `NotiPoli Docs` --references--> `Admin HTML`  [EXTRACTED]
  assets/data/README.md → assets/data/admin.html
- `NotiPoli Docs` --references--> `Contacto HTML`  [EXTRACTED]
  assets/data/README.md → assets/data/contacto.html
- `NotiPoli Docs` --references--> `Detalle HTML`  [EXTRACTED]
  assets/data/README.md → assets/data/detalle.html
- `NotiPoli Docs` --references--> `Index HTML (Assets)`  [EXTRACTED]
  assets/data/README.md → assets/data/index.html
- `NotiPoli Docs` --references--> `Login HTML`  [EXTRACTED]
  assets/data/README.md → assets/data/login.html

## Import Cycles
- None detected.

## Communities (19 total, 9 thin omitted)

### Community 0 - "React Frontend Application"
Cohesion: 0.18
Nodes (22): react, react-router-dom, App(), Footer(), Header(), HeroSection(), NewsCard(), AuthContext (+14 more)

### Community 1 - "Project Config & Dependencies"
Cohesion: 0.08
Nodes (32): dependencies, bootstrap@^5.3.3, bootstrap-icons@^1.13.2, react@^19.3.1, react-dom@^19.3.1, react-router-dom@^7.18.5, devDependencies, autoprefixer@^10.6.2 (+24 more)

### Community 2 - "Auth JS Module (Static)"
Cohesion: 0.16
Nodes (18): aplicarNavbar(), buildNavLinks(), cargarUsuariosJSON(), decodeSession(), encodeSession(), escAuth(), getAllUsuarios(), getPaginaActual() (+10 more)

### Community 3 - "Main JS Module (Static)"
Cohesion: 0.30
Nodes (17): cargarNoticiasBD(), CAT_CLASS, CAT_LABEL, catClass(), catLabel(), esc(), FALLBACK_NOTICIAS, formatearFecha() (+9 more)

### Community 4 - "CRUD JS Module (Static)"
Cohesion: 0.38
Nodes (10): confirmarEliminar(), crearNoticia(), eliminarNoticia(), escAttr(), formatearFechaCrud(), generarId(), getNoticiasCustom(), mostrarAlertaCrud() (+2 more)

### Community 5 - "Favorites JS Module (Static)"
Cohesion: 0.36
Nodes (7): actualizarBotonesFavoritos(), actualizarContadorFavoritos(), getFavoritos(), getFavoritosKey(), importarFavoritosDesdeURL(), isFavorito(), toggleFavorito()

### Community 6 - "Static HTML Pages (Assets)"
Cohesion: 0.29
Nodes (7): Admin HTML, Contacto HTML, Detalle HTML, Index HTML (Assets), Login HTML, Noticias HTML, NotiPoli Docs

### Community 7 - "Lint Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 8 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 9 - "Contact JS Module (Static)"
Cohesion: 0.83
Nodes (3): esEmailValido(), setEstado(), validarCampo()

## Knowledge Gaps
- **13 isolated node(s):** `README`, `Admin HTML`, `Contacto HTML`, `Detalle HTML`, `Index HTML (Assets)` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 41 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `React Frontend Application` to `Project Config & Dependencies`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `README`, `Admin HTML`, `Contacto HTML` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Config & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08199643493761141 - nodes in this community are weakly interconnected._
- **Why does `react-router-dom` connect `React Frontend Application` to `Project Config & Dependencies`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._