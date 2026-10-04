Apply the following guidelines to new code or code related to changes, not retroactively to unrelated code. When in doubt, ask the prompter before continuing.

Code instructions:
- Avoid repeated code. Reuse existing code and extract to functions or components when possible.
- Frontend components should be written in separate files.
- Avoid large frontend files. Separate in components instead.
- The frontend logic should be inside the component to which the responsibility belongs. A good criteria for this is minimizing the number of props.
- In TailwindCSS use ```text-(--foreground)``` instead of ```text-[var(--foreground)]``` (and the same for any color variable usage).
- Never run git commands that affect git state unless asked explicitly, readonly commands are ok.
- New commits should never add any unused code (variables, functions, parameters, etc.) unless asked explicitly.
- In the frontend we are using shadcn, so try using it instead of writing custom components and styles. If you need to write custom components, preserve our styling.
- Always ask before adding a new dependency.
- Don't add tests unless asked explicitly.
- Always use cn to join class names.
- Never create or edit migrations unless explicitly asked.
- Don't update README files unless asked explicitly.