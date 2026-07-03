"""minimal SWE agent(Python 版)

SandboxAgent(OpenAI Agents SDK)+ unix_local 沙箱 + Chat Completions API。
兼容任意 OpenAI 兼容端点的 LLM;配置从 .env 读:
OPENAI_BASE_URL / OPENAI_API_KEY / OPENAI_MODEL。
"""

from __future__ import annotations

import asyncio
import os
import sys
from base64 import b64encode

from dotenv import load_dotenv
from openai import AsyncOpenAI

from agents import (
    Runner,
    RunConfig,
    OpenAIChatCompletionsModel,
    set_default_openai_client,
    set_default_openai_api,
    set_tracing_disabled,
)
from agents.sandbox import SandboxAgent, SandboxRunConfig
from agents.sandbox.manifest import Manifest, Environment
from agents.sandbox.capabilities import Shell
from agents.sandbox.sandboxes.unix_local import UnixLocalSandboxClient

INSTRUCTIONS = """You are a minimal SWE agent working inside an isolated sandbox.
Use exec_command to inspect, run, and edit code — write files with the shell
(e.g. a here-doc: cat > file <<'EOF' ... EOF).
Verify your work by running the relevant command before you finish."""

DEFAULT_TASK = (
    "Write calc.py exporting add(a, b), add a unittest test in test_calc.py, "
    "run `python -m unittest`, and report the result."
)


def build_agent() -> SandboxAgent:
    """从 .env 读 OpenAI 兼容端点配置,构造一个走 Chat Completions 的 SandboxAgent。"""
    load_dotenv()
    api_key = os.environ.get("OPENAI_API_KEY")
    base_url = os.environ.get("OPENAI_BASE_URL")
    model = os.environ.get("OPENAI_MODEL")
    if not (api_key and base_url and model):
        raise RuntimeError(
            "请在 .env 配置 OPENAI_BASE_URL / OPENAI_API_KEY / OPENAI_MODEL"
        )
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    set_default_openai_client(client)
    set_default_openai_api("chat_completions")  # 用 Chat Completions,兼容任意厂商
    set_tracing_disabled(True)
    return SandboxAgent(
        name="mini-swe",
        instructions=INSTRUCTIONS,
        model=OpenAIChatCompletionsModel(model, client),
        # 只用 Shell()→exec_command(跑命令 + 用 shell 改文件)。
        # Filesystem() 的 apply_patch 是 hosted grammar tool,Chat Completions 不支持;
        # 用 shell 改文件既兼容任意厂商,也是弱模型的实际行为。
        capabilities=[Shell()],
    )


def sandbox_manifest() -> Manifest:
    """沙箱默认 PATH 不含本机 python,注入当前解释器目录,保证沙箱里能跑 python。"""
    python_dir = os.path.dirname(sys.executable)
    path = f"{python_dir}:/usr/local/bin:/usr/bin:/bin"
    return Manifest(environment=Environment(value={"PATH": path}))


def seed_command(path: str, content: str) -> str:
    """用 base64 生成「把文本写进沙箱文件」的 shell 命令(规避 shell 转义)。"""
    b64 = b64encode(content.encode("utf-8")).decode("ascii")
    return f"printf %s '{b64}' | base64 -d > {path}"


async def main() -> None:
    """入口:把命令行任务交给 agent,在隔离沙箱里执行,打印结果。"""
    agent = build_agent()
    task = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_TASK
    result = await Runner.run(
        agent,
        task,
        max_turns=20,
        run_config=RunConfig(
            sandbox=SandboxRunConfig(
                client=UnixLocalSandboxClient(),
                manifest=sandbox_manifest(),
            )
        ),
    )
    print(result.final_output)


if __name__ == "__main__":
    asyncio.run(main())
