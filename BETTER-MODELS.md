# Base Impact — Better Free Models on Hermes (Ollama + OpenRouter)

## 🎯 Current Model Inventory (Ollama Local)

| Model | Size | Strengths | Best For |
|-------|------|-----------|----------|
| `qwen2.5-coder:14b` | 9.0 GB | **Best code model locally** — 92% HumanEval, strong TypeScript/Astro | Coding, PR reviews, architecture decisions |
| `qwen2.5-coder:7b` | 4.7 GB | Fast, good for autocomplete | Quick edits, inline suggestions |
| `nemotron-3-nano:4b` | 2.8 GB | NVIDIA's efficient model, good reasoning | General chat, analysis |
| `qwen3.5:4b-q4_K_M` | 3.3 GB | Latest Qwen, strong multilingual | Spanish/Creole translation, reasoning |
| `qwen3.5:2b` | 2.7 GB | Very fast | Quick tasks, summaries |
| `bonsai-2:latest` | 3.2 GB | Compact, efficient | Lightweight tasks |
| `nomic-embed-text` | 274 MB | Embeddings | RAG, semantic search |

---

## 🚀 Immediate Upgrades (Pull Today)

### 1. Better Coding Models
```bash
# DeepSeek Coder V2 — SOTA open code model (236B params, 16B active)
ollama pull deepseek-coder-v2:16b      # 16B active params, best for complex code
ollama pull deepseek-coder-v2:236b     # Full MoE if you have VRAM

# CodeLlama 70B — Meta's code specialist
ollama pull codellama:70b              # 40 GB — needs 48GB+ RAM

# StarCoder2 15B — BigCode's latest
ollama pull starcoder2:15b             # 9 GB — excellent for TypeScript/React
```

### 2. Better Reasoning/Analysis
```bash
# Nemotron 3 Ultra — NVIDIA's flagship (your current provider on OpenRouter!)
ollama pull nemotron3:4b               # 4B — runs locally!
ollama pull nemotron3:8b               # 8B — better reasoning

# Qwen 2.5 32B/72B — Strong generalists
ollama pull qwen2.5:32b                # 19 GB
ollama pull qwen2.5:72b                # 41 GB

# Llama 3.3 70B — Meta's latest (Nov 2024)
ollama pull llama3.3:70b               # 40 GB
```

### 3. Specialized for Your Work
```bash
# Multilingual (Cohere-style translation)
ollama pull aya:35b                    # Cohere's Aya 101 languages — 20 GB
ollama pull aya:8b                     # 8B version — 5 GB

# Embeddings (better than nomic)
ollama pull mxbai-embed-large          # 335M — SOTA open embeddings
ollama pull bge-m3                     # 567M — multilingual embeddings

# Spanish-optimized
ollama pull qwen2.5:14b                # Strong Spanish
ollama pull llama3.2:3b                # Meta's small multilingual
```

---

## 🌐 OpenRouter Free Models (Better Than Local for Quality)

**You're already on OpenRouter with `nvidia/nemotron-3-ultra-550b-a55b:free` — this is excellent!**

### Top Free Models on OpenRouter (as of Nov 2024)

| Model | Context | Best For | Access |
|-------|---------|----------|--------|
| `nvidia/nemotron-3-ultra-550b-a55b:free` | 4K | **Your current — SOTA reasoning** | ✅ Active |
| `google/gemini-flash-1.5:free` | 1M | Long context, multimodal | ✅ Available |
| `google/gemini-pro-1.5:free` | 2M | Deep analysis, huge context | ✅ Available |
| `meta-llama/llama-3.3-70b-instruct:free` | 8K | General chat, coding | ✅ Available |
| `mistralai/mistral-large:free` | 32K | Multilingual, reasoning | ✅ Available |
| `qwen/qwen-2.5-72b-instruct:free` | 32K | Coding, Chinese/English | ✅ Available |
| `cohere/command-r-plus:free` | 128K | RAG, enterprise tasks | ✅ Available |
| `gryphe/mythomax-l2-13b:free` | 4K | Creative writing | ✅ Available |

### How to Use in Hermes
1. **Settings → Models → OpenRouter** → Add your API key
2. **Model selector** → Choose per task:
   - **Coding/Architecture:** `nvidia/nemotron-3-ultra` (current) or `deepseek/deepseek-coder-v2:free`
   - **Long docs/analysis:** `google/gemini-pro-1.5:free` (2M context!)
   - **Multilingual:** `mistralai/mistral-large:free` or `cohere/command-r-plus:free`
   - **Quick tasks:** `meta-llama/llama-3.3-70b-instruct:free`

---

## ⚙️ Hermes Configuration for Best Quality

### Recommended `config.yaml` Model Setup
```yaml
models:
  # Primary — your current, best reasoning
  - name: "nemotron-3-ultra"
    provider: "openrouter"
    model: "nvidia/nemotron-3-ultra-550b-a55b:free"
    temperature: 0.3
    max_tokens: 4000
    use_for: ["coding", "architecture", "grants", "analysis"]

  # Long context — for reading large files, specs
  - name: "gemini-pro-1.5"
    provider: "openrouter"
    model: "google/gemini-pro-1.5:free"
    temperature: 0.2
    max_tokens: 8000
    use_for: ["document-analysis", "codebase-review", "long-form"]

  # Multilingual — for Spanish/Creole translation
  - name: "mistral-large"
    provider: "openrouter"
    model: "mistralai/mistral-large:free"
    temperature: 0.3
    max_tokens: 4000
    use_for: ["translation", "multilingual-content"]

  # Local fallback — when offline or privacy needed
  - name: "qwen2.5-coder-14b"
    provider: "ollama"
    model: "qwen2.5-coder:14b"
    temperature: 0.2
    max_tokens: 4000
    use_for: ["local-coding", "privacy-sensitive"]

  # Embeddings for RAG
  - name: "mxbai-embed-large"
    provider: "ollama"
    model: "mxbai-embed-large"
    use_for: ["embeddings", "semantic-search"]
```

### Per-Task Model Selection in Chat
```
/model nemotron-3-ultra      # Default: grants, architecture, complex reasoning
/model gemini-pro-1.5        # Large files, specs, long analysis
/model mistral-large         # Translation, multilingual
/model qwen2.5-coder-14b     # Local coding, offline
```

---

## 🎯 Model Recommendations by Base Impact Task

| Task | Best Model | Why |
|------|------------|-----|
| **Grant writing** | `nemotron-3-ultra` (OpenRouter) | Best reasoning, persuasive writing |
| **Code review / PR** | `qwen2.5-coder:14b` (local) or `deepseek-coder-v2:free` (OR) | Code-specialized, catches bugs |
| **Architecture decisions** | `nemotron-3-ultra` | Systems thinking, trade-offs |
| **Spanish translation** | `mistral-large:free` or `cohere/command-r-plus:free` | Native multilingual |
| **Haitian Creole** | `aya:35b` (local) or `cohere/command-r-plus:free` | 101 languages including Creole |
| **Long doc analysis** | `gemini-pro-1.5:free` (2M context) | Entire codebase in context |
| **Impact story drafting** | `nemotron-3-ultra` | Empathetic, structured writing |
| **Directory data scripts** | `qwen2.5-coder:14b` | TypeScript/Astro/Cloudflare expertise |
| **Quick summaries** | `qwen3.5:4b` (local) | Fast, decent quality |
| **Embeddings/RAG** | `mxbai-embed-large` (local) | SOTA open embeddings |

---

## 🔧 Pull Script — Run This Today

```bash
#!/bin/bash
# save as pull-models.sh, chmod +x, run

echo "=== Pulling Better Models for Base Impact ==="

# Coding (pick ONE based on your RAM)
# Option A: 16GB+ RAM — Best local coder
ollama pull deepseek-coder-v2:16b

# Option B: 10GB RAM — Excellent balance
ollama pull starcoder2:15b

# Option C: 6GB RAM — Current best (already have)
# ollama pull qwen2.5-coder:14b  # Already have

# Reasoning/Analysis
ollama pull nemotron3:8b
ollama pull qwen2.5:32b

# Multilingual (for Cohere grant work)
ollama pull aya:8b
ollama pull qwen2.5:14b

# Embeddings (for RAG on directory)
ollama pull mxbai-embed-large
ollama pull bge-m3

echo "=== Done! Run 'ollama list' to verify ==="
```

---

## 💡 Pro Tips for Quality

### 1. Use System Prompts
Create `.hermes/prompts/baseimpact.md`:
```markdown
# Base Impact Context
You are assisting the Founder/ED of Base Impact (baseimpact.org), a Florida nonprofit building:
- Open-source crisis resource directory (115+ resources, Brevard/Volusia/Orange)
- Nonprofit tech program (free devices, digital skills, security for 1-5 person orgs)
- Stack: Astro 7.4, Cloudflare Workers, D1, TypeScript, Tailwind v3
- Mission: "Everyone deserves a working device, a working connection, and someone to show them how"
- Audiences: Neighbors in crisis (24/7, mobile-first) + Small nonprofits

Guidelines:
- Prioritize accessibility (WCAG AA), mobile-first, crisis usability
- Prefer practical, shippable solutions over perfect architecture
- Consider bilingual (EN/ES) and future multilingual (HT/PT)
- Code must be MIT-licensed, production-ready
- Reference PRODUCT.md, impact-log.md, design-recommendations.md
```

### 2. Temperature by Task
```yaml
coding: 0.1-0.2          # Deterministic, correct
grants: 0.3-0.4          # Persuasive, varied
translation: 0.2-0.3     # Accurate, natural
analysis: 0.2            # Precise reasoning
creative: 0.5-0.7        # Story drafting, brainstorming
```

### 3. Context Management
- **Large codebase review:** Use `gemini-pro-1.5:free` with entire repo as context
- **Single file edits:** Use `qwen2.5-coder:14b` local
- **Grant narratives:** Use `nemotron-3-ultra` with PRODUCT.md + impact-log.md loaded

---

## 📊 Model Comparison for Your Stack

| Aspect | Nemotron 3 Ultra (OR) | Qwen2.5-Coder 14B (Local) | Gemini Pro 1.5 (OR) |
|--------|----------------------|---------------------------|---------------------|
| **Astro/TypeScript** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cloudflare Workers** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Grant Writing** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Spanish Translation** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Context Window** | 4K | 32K (local) | 2M |
| **Privacy** | ❌ Cloud | ✅ Local | ❌ Cloud |
| **Cost** | Free tier | Free (local) | Free tier |
| **Speed** | Medium | Fast | Medium |

**Recommendation:** Keep Nemotron 3 Ultra as primary (your current), add Gemini Pro 1.5 for long-context tasks, use Qwen2.5-Coder 14B for local coding privacy.
