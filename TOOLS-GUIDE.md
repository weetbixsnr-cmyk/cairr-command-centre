# TOOLS-GUIDE.md — What You Can & Can't Do

## ✅ YOU CAN
- **read** — Read files in your workspace
- **write** — Create/overwrite files in your workspace
- **edit** — Edit files in your workspace
- **sessions_send** — Message Brain or other agents
- **memory_search** — Search your memory files
- **memory_get** — Read memory file snippets

## ✅ SOME AGENTS ALSO GET
- **web_search** — Search the web (Brave API)
- **web_fetch** — Fetch and read web pages
- **image** — Analyse images

Check your own tools list at startup — if a tool isn't listed, you don't have it.

## ❌ YOU CANNOT (enforced — will fail)
- **exec** — No shell commands, no scripts, no CLI tools
- **browser** — No browser automation
- **message** — No sending Discord/WhatsApp messages directly
- **canvas** — No canvas/UI rendering
- **nodes** — No device control
- **sessions_spawn** — No spawning sub-agents
- **tts** — No text-to-speech
- **subagents** — No sub-agent management

## ❌ FILE RESTRICTIONS (enforced)
- **Workspace-only** — You can ONLY read/write files inside your own workspace folder
- You CANNOT access other agents' workspaces, Brain's workspace, or system files
- If you need a file from outside your workspace, ask Brain via sessions_send

## 🔑 HOW TO GET THINGS DONE
| Need | Do This |
|------|---------|
| Run a script | Ask Brain — only Brain has exec |
| Send a message to Discord/WhatsApp | Ask Brain — only Brain has message |
| Access another agent's files | Ask Brain to copy/relay |
| Deploy to staging/live | Ask Brain — only Brain deploys |
| Browse a website interactively | Ask Brain — only Brain has browser |
| Need data from an API | Use web_fetch if you have it, otherwise ask Brain |

## ⚠️ COMMON MISTAKES TO AVOID
1. Don't try to use exec — it will fail silently or error
2. Don't try to read files outside your workspace — permission denied
3. Don't try to send messages directly — use sessions_send to ask Brain
4. Don't assume you have web_search/web_fetch — check first
5. Don't try to open email attachments — blocked system-wide

## 📡 CONTACTING BRAIN
Use sessions_send with your message. Brain will action it or delegate.
Keep requests clear and specific. Include what you need and why.
