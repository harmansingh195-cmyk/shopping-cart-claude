#!/usr/bin/env python3
import json
import sys
from pathlib import Path

DOC_PRECONDITIONS = {
    "architecture.md": ["requirements.md"],
    "design-review.md": ["architecture.mxd"],
    "impl-plan.md": ["architecture.md"],
    "review-report.md": ["verification-report.md"],
    "pr-description.md": ["review-report.md"],
}

PATH_KEYS = ("path", "file_path", "filePath", "target", "targetFile")


def emit_allow(reason=None):
    out = {"permissionDecision": "allow"}
    if reason:
        out["permissionDecisionReason"] = reason
    print(json.dumps(out))
    sys.exit(0)


def emit_deny(reason):
    print(
        json.dumps(
            {
                "permissionDecision": "deny",
                "permissionDecisionReason": reason,
            }
        )
    )
    sys.exit(0)


def extract_target_doc(tool_args):
    if not isinstance(tool_args, dict):
        return None

    for key in PATH_KEYS:
        value = tool_args.get(key)
        if (
            isinstance(value, str)
            and "src/docs/" in value.replace("\\", "/")
            and value.endswith(".md")
        ):
            return Path(value.replace("\\", "/")).name

    return None


def main():
    try:
        payload = json.load(sys.stdin)
    except Exception:
        emit_allow()
        return

    cwd = payload.get("cwd") or "."
    tool_args = payload.get("toolArgs", payload.get("tool_input", {}))

    target = extract_target_doc(tool_args)
    if not target:
        emit_allow()
        return

    required = DOC_PRECONDITIONS.get(target)
    if not required:
        emit_allow()
        return

    docs_dir = Path(cwd) / "src" / "docs"

    missing = [
        prereq
        for prereq in required
        if not (docs_dir / prereq).exists()
    ]

    if missing:
        emit_deny(
            f"Cannot create or edit src/docs/{target}. "
            f"Required prerequisite file(s) missing: "
            f"{', '.join('src/docs/' + m for m in missing)}."
        )

    emit_allow(
        f"All prerequisite files exist for src/docs/{target}."
    )


if __name__ == "__main__":
    main()