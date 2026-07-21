from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/resources", tags=["resources"])

resources_store: list[dict[str, object]] = [
    {
        "id": "resource-1",
        "title": "Prompt Engineering Handbook",
        "type": "markdown",
        "url": "/resources/prompt-engineering-handbook.md",
        "uploadedAt": "2026-07-20T00:00:00Z",
    }
]


@router.get("", response_model=list[dict[str, object]])
def list_resources() -> list[dict[str, object]]:
    return resources_store


@router.get("/{resource_id}", response_model=dict[str, object])
def get_resource(resource_id: str) -> dict[str, object]:
    resource = next((item for item in resources_store if str(item["id"]) == resource_id), None)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource
