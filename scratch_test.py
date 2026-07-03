import asyncio
from leadsmith.config import Settings
from leadsmith.core.gemini import GeminiClient
from leadsmith.core.cache import Cache
from leadsmith.core.rate_limiter import RateLimiter
from leadsmith.core.metrics import Metrics

async def test():
    cfg = Settings()
    cache = Cache(":memory:")
    metrics = Metrics()
    chat_limiter = RateLimiter(cfg.rpm_limit, cfg.max_concurrency)
    embed_limiter = RateLimiter(cfg.embed_rpm_limit, cfg.embed_max_concurrency)
    
    client = GeminiClient(
        openrouter_api_key=cfg.openrouter_api_key,
        openrouter_model=cfg.openrouter_model,
        openrouter_base_url=cfg.openrouter_base_url,
        embedding_model=cfg.embedding_model,
        gemini_api_key=cfg.gemini_api_key,
        tavily_api_key=cfg.tavily_api_key,
        chat_limiter=chat_limiter,
        embed_limiter=embed_limiter,
        cache=cache,
        metrics=metrics,
    )
    
    print("Testing OpenRouter (Chat)...")
    try:
        res = await client._call_chat("Say hello", json_mode=False)
        print("[OK] OpenRouter works! Response:", res.strip()[:100], "...")
    except Exception as e:
        print("[FAILED] OpenRouter failed:", str(e))
        
    print("\nTesting Tavily (Search)...")
    try:
        res = await client.search("Hello world", max_results=1)
        print("[OK] Tavily works! Found", len(res), "results.")
    except Exception as e:
        print("[FAILED] Tavily failed:", str(e))
        
    print("\nTesting Gemini (Embeddings)...")
    try:
        res = await client.embed("Hello world")
        print("[OK] Gemini works! Vector dimension:", len(res))
    except Exception as e:
        print("[FAILED] Gemini failed:", str(e))

if __name__ == "__main__":
    asyncio.run(test())
