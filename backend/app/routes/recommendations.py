from fastapi import APIRouter, HTTPException, Query
from app.services.firestore import get_firestore
from app.models.event import Event
import math

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def _extract_lat_lon(coord: dict) -> tuple[float, float] | None:
    if not isinstance(coord, dict):
        return None
    lat = coord.get("lat") if coord.get("lat") is not None else coord.get("latitude")
    lon = coord.get("lng") if coord.get("lng") is not None else coord.get("longitude")
    if lat is None or lon is None:
        return None
    try:
        return float(lat), float(lon)
    except (TypeError, ValueError):
        return None

@router.get("/", response_model=list[Event])
async def recommend_events(device_id: str = Query(...), limit: int = Query(5, gt=0, le=50), radius_km: float = Query(15, gt=0, le=200)):
    try:
        firestore = get_firestore()

        history = firestore.list_attendances_by_device(device_id)
        attended_event_ids = {h["event_id"] for h in history}
        attended_events = [firestore.get_event(eid) for eid in attended_event_ids]
        attended_events = [e for e in attended_events if e]

        category_counts = {}
        amenity_counts = {}
        for ev in attended_events:
            category = ev.get("category")
            if category:
                category_counts[category] = category_counts.get(category, 0) + 1
            for am in ev.get("amenities", []) or []:
                amenity_counts[am] = amenity_counts.get(am, 0) + 1

        preference = firestore.get_preference_by_device(device_id)
        pref_coords = _extract_lat_lon(preference.get("location")) if preference else None

        candidates = []
        for ev in firestore.list_events():
            if ev["id"] in attended_event_ids:
                continue
            current_count = firestore.count_attendances_for_event(ev["id"])
            if current_count >= ev.get("max_attendance", 0):
                continue

            if pref_coords:
                ev_coords = _extract_lat_lon(ev.get("coordinates"))
                if not ev_coords:
                    continue
                distance_km = _haversine_km(pref_coords[0], pref_coords[1], ev_coords[0], ev_coords[1])
                if distance_km > radius_km:
                    continue

            cat_score = category_counts.get(ev.get("category"), 0) * 3
            shared_amenities = sum(1 for a in ev.get("amenities", []) if a in amenity_counts)
            capacity_bonus = 0
            max_att = ev.get("max_attendance") or 0
            if max_att > 0:
                capacity_bonus = (max_att - current_count) / max_att
            score = cat_score + shared_amenities + capacity_bonus
            ev["_score"] = score
            candidates.append(ev)

        if not attended_events:
            for ev in candidates:
                current_count = firestore.count_attendances_for_event(ev["id"])
                max_att = ev.get("max_attendance") or 0
                if max_att > 0:
                    ev["_score"] = (max_att - current_count) / max_att
                else:
                    ev["_score"] = 0

        ranked = sorted(candidates, key=lambda x: x["_score"], reverse=True)
        return [Event(**e) for e in ranked[:limit]]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")
