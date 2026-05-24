#!/usr/bin/env python3
"""Validate Command Centre consumed JSON snapshots.

Checks each input file for: existence, valid JSON, top-level object,
required keys, and array fields where expected.
"""

import json
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUTS = [
    {
        "path": "public/data/bts/content.json",
        "required_keys": ["version", "items", "statusValues"],
        "array_fields": ["items"],
    },
    {
        "path": "public/data/bts/seo.json",
        "required_keys": ["seo", "seoAudit", "keywords", "seoPlan"],
        "array_fields": [],
        "nested_arrays": [("keywords", "keywords")],
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


def main():
    all_pass = True
    for spec in INPUTS:
        errors = check_file(spec)
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
