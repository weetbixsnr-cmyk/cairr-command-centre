#!/usr/bin/env python3
"""Validate Command Centre consumed JSON snapshots.

Checks each input file for: existence, valid JSON, top-level object,
required keys, array fields where expected, and BTS contract fields.
"""

import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUTS = [
    {
        "path": "public/data/bts/content.json",
        "required_keys": ["version", "items", "statusValues", "weeklyReview"],
        "array_fields": ["items"],
    },
    {
        "path": "public/data/bts/seo.json",
        "required_keys": ["seo", "seoAudit", "keywords", "seoPlan", "weeklyReview"],
        "array_fields": [],
        "nested_arrays": [("keywords", "keywords")],
    },
    {
        "path": "public/data/bts/seo-findings-ledger.json",
        "required_keys": ["_meta", "findings"],
        "array_fields": ["findings"],
    },
    {
        "path": "public/data/bts/news-bank.json",
        "required_keys": ["meta", "stories"],
        "array_fields": ["stories"],
    },
    {
        "path": "public/data/bts-status.json",
        "required_keys": ["id", "name", "status", "lastUpdated"],
        "array_fields": [],
    },
    {
        "path": "public/data/nbhw-status.json",
        "required_keys": ["id", "name", "status", "lastUpdated"],
        "array_fields": [],
    },
    {
        "path": "public/data/dashboard-status.json",
        "required_keys": ["id", "name", "status", "lastUpdated"],
        "array_fields": [],
    },
    {
        "path": "public/data/bts/readiness.json",
        "required_keys": ["gate", "weekOf", "staleDays", "tabs", "exceptions"],
        "array_fields": ["exceptions"],
    },
]

BTS_READINESS_TAB_KEYS = [
    "seoHealth", "rankings", "competitors", "coverageMatrix",
    "googleSafety", "traffic", "conversions", "courses",
    "futurePosts", "gbpPosts", "newsBank",
]


def check_file(spec):
    full = os.path.join(REPO_ROOT, spec["path"])
    errors = []

    if not os.path.isfile(full):
        return [f"file missing: {spec['path']}"]

    try:
        with open(full) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        return [f"invalid JSON: {e}"]

    if not isinstance(data, dict):
        return [f"top-level is {type(data).__name__}, expected object"]

    for key in spec["required_keys"]:
        if key not in data:
            errors.append(f"missing required key: {key}")

    for field in spec.get("array_fields", []):
        if field in data and not isinstance(data[field], list):
            errors.append(f"{field} is {type(data[field]).__name__}, expected array")

    for parent, child in spec.get("nested_arrays", []):
        if parent in data and isinstance(data[parent], dict):
            if child in data[parent] and not isinstance(data[parent][child], list):
                errors.append(
                    f"{parent}.{child} is "
                    f"{type(data[parent][child]).__name__}, expected array"
                )

    return errors


def check_bts_readiness(data):
    errors = []
    tabs = data.get("tabs", {})
    for key in BTS_READINESS_TAB_KEYS:
        if key not in tabs:
            errors.append(f"tabs missing BTS key: {key}")
        else:
            t = tabs[key]
            if "status" not in t:
                errors.append(f"tabs.{key} missing status")
            elif t["status"] not in ("current", "stale", "blocked"):
                errors.append(f"tabs.{key}.status invalid: {t['status']}")
    if data.get("gate") not in ("PASS", "BLOCK"):
        errors.append(f"gate invalid: {data.get('gate')}")
    return errors


def check_bts_content(data):
    errors = []
    wr = data.get("weeklyReview")
    if wr and not isinstance(wr, dict):
        errors.append("weeklyReview is not an object")
    items = data.get("items", [])
    has_preview = sum(1 for i in items if i.get("previewText") is not None)
    if items and has_preview == 0:
        errors.append("no items have previewText field")
    return errors


def check_bts_seo(data):
    errors = []
    wr = data.get("weeklyReview")
    if wr and not isinstance(wr, dict):
        errors.append("weeklyReview is not an object")
    return errors


def check_bts_news_bank(data):
    errors = []
    meta = data.get("meta", {})
    if "weeklyReview" not in meta:
        errors.append("meta.weeklyReview missing")
    stories = data.get("stories", [])
    if stories:
        s0 = stories[0]
        for field in ("dateAdded", "attentionSignal", "curatedRank"):
            if field not in s0:
                errors.append(f"stories[0] missing field: {field}")
    return errors


BTS_EXTRA_CHECKS = {
    "public/data/bts/readiness.json": check_bts_readiness,
    "public/data/bts/content.json": check_bts_content,
    "public/data/bts/seo.json": check_bts_seo,
    "public/data/bts/news-bank.json": check_bts_news_bank,
}


def main():
    all_pass = True
    for spec in INPUTS:
        full = os.path.join(REPO_ROOT, spec["path"])
        errors = check_file(spec)

        if not errors and spec["path"] in BTS_EXTRA_CHECKS:
            with open(full) as f:
                data = json.load(f)
            errors.extend(BTS_EXTRA_CHECKS[spec["path"]](data))

        if errors:
            all_pass = False
            print(f"FAIL  {spec['path']}")
            for e in errors:
                print(f"      - {e}")
        else:
            print(f"PASS  {spec['path']}")

    if all_pass:
        print("\nAll inputs valid.")
    else:
        print("\nValidation failed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
