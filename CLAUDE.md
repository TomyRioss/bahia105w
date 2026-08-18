@AGENTS.md

# Reglas del proyecto

- Siempre usar la skill `/caveman ultra` para comunicación comprimida.
- Errores siempre atrapados (try/catch) con feedback visible: log en consola + feedback visual UX/UI correspondiente (toast, estado de error, etc).
- Antes de escribir lógica o UI desde cero, investigar si existe una librería de terceros que resuelva el problema y plantearla antes de implementar.
- Usar shadcn/ui para componentes prefabricados generales.
- Usar TailwindCSS para todo el CSS. Nunca CSS puro, nunca tocar `globals.css`.
- Nunca usar SVG inline/custom. Usar siempre iconos de librería (react-icons u otra librería de iconos establecida).
- Cambios en la base de datos: siempre preguntar primero y ejecutar solo con consentimiento explícito del usuario en el mensaje.
- Diseño siempre responsivo (mobile + desktop).
- Metodología MVC, componentes modulares.
- Ningún componente mayor a 500 líneas — modularizar si se acerca al límite.
- Para problemas desconocidos, buscar en internet (Stack Overflow, Reddit, docs oficiales) antes de improvisar.

# Skills por tarea

- **Base de datos**: skill `supabase/agent-skills` + MCP de Supabase, modelo Sonnet.
  Ej: "Help me set up Supabase Auth with Next.js", "Help me add proper indexes to this table".
- **Testing / interacción con navegador**: skill de Playwright, modelo Haiku, gasto mínimo de tokens (combinar con `/caveman ultra` para maximizar ahorro).
- **Code review / auditoría**: skills `code-simplifier` y `code-reviewer`, modelo Haiku.
- **Commits / GitHub**: skills `commit-commands` + MCP de GitHub.
- **Componentes y diseño**: `frontend-design`, `superpowers` (plugin oficial de Claude) con `brainstorming` para pensar diseños antes de implementar, `ui-ux-pro-max`, y `expo-design` para proyectos Expo.
