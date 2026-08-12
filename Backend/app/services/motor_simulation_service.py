from __future__ import annotations

import logging
from typing import Any

from app.api.v1.endpoints.catalogos import MODULE_PARTIDAS, execute_catalog_query, safe_text
logger = logging.getLogger("app.motor_simulation_service")


def _to_number(value: Any, fallback: float = 0.0) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return fallback
    return parsed


def _round(value: float, decimals: int = 2) -> float:
    return round(float(value or 0.0), decimals)


def _to_text(value: Any, fallback: str = "") -> str:
    text = str(value or "").strip()
    return text if text else fallback


def _safe_area(row: dict[str, Any]) -> float:
    area = _to_number(row.get("areaM2") or 0)
    if area > 0:
        return area
    return max(_to_number(row.get("anchoM") or 0), 0.0) * max(_to_number(row.get("largoM") or 0), 0.0)


def _build_spatial_context(
    datos_generales_obra: dict[str, Any] | None = None,
    estructura_espacial: dict[str, Any] | None = None,
    preliminares: dict[str, Any] | None = None,
) -> dict[str, Any]:
    datos = datos_generales_obra or {}
    estructura = estructura_espacial or {}
    prelim = preliminares or {}
    espacios = estructura.get("espacios")
    espacios = espacios if isinstance(espacios, list) else []

    area_spaces = sum(_safe_area(item if isinstance(item, dict) else {}) for item in espacios)
    area_construccion = max(_to_number(datos.get("areaConstruccionM2") or 0), area_spaces, 0.0)
    area_terreno = max(_to_number(datos.get("areaTerrenoM2") or 0), area_construccion, 0.0)
    area_preliminares = max(
        _to_number(prelim.get("areaPreliminares") or 0),
        _to_number(prelim.get("superficiePreliminar") or 0),
        area_construccion,
    )

    levels = {
        _to_text((item if isinstance(item, dict) else {}).get("nivel"), "")
        for item in espacios
        if _to_text((item if isinstance(item, dict) else {}).get("nivel"), "")
    }

    count_by_type: dict[str, int] = {}
    for item in espacios:
        row = item if isinstance(item, dict) else {}
        key = _to_text(row.get("tipo"), "").lower()
        if not key:
            continue
        count_by_type[key] = count_by_type.get(key, 0) + 1

    total_spaces = len(espacios)
    total_banos = count_by_type.get("bano_1", 0) + count_by_type.get("bano_2", 0) + count_by_type.get("medio_bano", 0)
    total_recamaras = (
        count_by_type.get("recamara_principal", 0)
        + count_by_type.get("recamara_2", 0)
        + count_by_type.get("recamara_3", 0)
        + count_by_type.get("recamara_4", 0)
    )

    total_linear_ml = 0.0
    for item in espacios:
        row = item if isinstance(item, dict) else {}
        w = max(_to_number(row.get("anchoM") or 0), 0.0)
        l = max(_to_number(row.get("largoM") or 0), 0.0)
        lados = row.get("ladosCimentacion") if isinstance(row.get("ladosCimentacion"), dict) else {}
        if lados.get("a1"):
            total_linear_ml += w
        if lados.get("a2"):
            total_linear_ml += w
        if lados.get("l1"):
            total_linear_ml += l
        if lados.get("l2"):
            total_linear_ml += l

    avg_height = max(_to_number(datos.get("alturaPromedioM") or 0), _to_number(datos.get("alturaNivel1M") or 0), 2.6)
    wall_area = max(total_linear_ml * avg_height, 0.0)

    dem = prelim.get("demolicion") if isinstance(prelim.get("demolicion"), dict) else {}
    area_demolicion = max(
        _to_number(dem.get("areaDemolicionM2") or 0),
        _to_number(prelim.get("areaDemolicionM2") or 0),
    )
    if area_demolicion <= 0:
        area_demolicion = max(
            _to_number(dem.get("anchoDemolicionM") or 0) * _to_number(dem.get("largoDemolicionM") or 0),
            0.0,
        )

    topografia = _to_text(prelim.get("topografia"), "").lower()
    depth = max(_to_number(prelim.get("pendienteProfundidadM") or 0), 0.0)
    if depth <= 0:
        depth = 0.25 if topografia in {"con_pendiente", "accidentada"} else 0.2 if topografia == "semiplana" else 0.15

    return {
        "areaConstruccion": _round(area_construccion, 2),
        "areaTerreno": _round(area_terreno, 2),
        "areaPreliminares": _round(area_preliminares, 2),
        "levelsCount": max(len(levels), int(max(_to_number(datos.get("niveles") or 1), 1))),
        "totalSpaces": total_spaces,
        "totalBanos": total_banos,
        "totalRecamaras": total_recamaras,
        "totalLinearMl": _round(total_linear_ml, 2),
        "foundationLinearMl": _round(total_linear_ml, 2),
        "wallAreaM2": _round(wall_area, 2),
        "topografia": topografia,
        "topografiaDepthM": _round(depth, 2),
        "areaDemolicionM2": _round(area_demolicion, 2),
        "tipoCimentacion": _to_text(datos.get("tipoCimentacion"), "").lower(),
        "sistemaEstructural": _to_text(datos.get("sistemaEstructural"), "").lower(),
        "countByType": count_by_type,
    }


def _calculate_pre003_quantity(context: dict[str, Any]) -> float:
    linear = max(_to_number(context.get("foundationLinearMl"), 0.0), 0.0)
    tipo = _to_text(context.get("tipoCimentacion"), "")

    if "corrida" in tipo or "trabe_liga" in tipo:
        gross = linear * 0.6 * 0.55
        discount_zapata = linear * 0.6 * 0.2
        discount_contratrabe = linear * 0.2 * 0.3
        return _round(max(gross - discount_zapata - discount_contratrabe, 0.0), 2)

    gross = linear * 0.6 * 0.7
    discount_masonry = linear * ((0.6 + 0.3) / 2) * 0.65
    return _round(max(gross - discount_masonry, 0.0), 2)


def _infer_generic_quantity(code: str, formula: str, mode: str, context: dict[str, Any]) -> float:
    area = max(_to_number(context.get("areaConstruccion"), 0), 1)
    wall_area = max(_to_number(context.get("wallAreaM2"), 0), 1)
    linear = max(_to_number(context.get("foundationLinearMl"), 0), 1)
    spaces = max(_to_number(context.get("totalSpaces"), 0), 1)
    banos = max(_to_number(context.get("totalBanos"), 0), 1)
    prefix = _to_text(code.split("-")[0], "")

    upper_formula = formula.upper()
    lower_mode = mode.lower()

    if "M2" in upper_formula or "area" in lower_mode:
        if prefix in {"ALB", "ACA"}:
            return _round(wall_area, 2)
        return _round(area, 2)
    if "M3" in upper_formula or "volumen" in lower_mode:
        return _round(max(linear * 0.22, area * 0.12), 2)
    if "ML" in upper_formula or "perimetro" in lower_mode:
        return _round(linear, 2)
    if "SALIDA" in upper_formula or "salida" in lower_mode:
        if prefix == "PLU":
            return max(round(linear / 3.5), 1)
        return max(round((spaces + banos) * 1.1), 1)
    if "PZA" in upper_formula or "pieza" in lower_mode:
        return max(round(spaces * 0.9), 1)
    if "TRAMITE" in upper_formula or "tramite" in lower_mode:
        return 1
    return 1


def _estimate_quantity(code: str, concept: dict[str, Any], context: dict[str, Any], quantities_by_code: dict[str, float]) -> float:
    upper_code = _to_text(code, "").upper()
    formula = _to_text(concept.get("default_formula_code"), "")
    mode = _to_text(concept.get("quantification_mode"), "")
    area_pre = max(_to_number(context.get("areaPreliminares"), 0), 1)
    depth = max(_to_number(context.get("topografiaDepthM"), 0.15), 0.01)
    area_demolicion = max(_to_number(context.get("areaDemolicionM2"), 0), 0)

    if upper_code == "PRE-001":
        return _round(area_pre, 2)
    if upper_code == "PRE-002":
        return _round(area_pre * depth * 1.3, 2)
    if upper_code == "PRE-003":
        return _calculate_pre003_quantity(context)
    if upper_code == "PRE-004":
        return _round(area_pre * depth * 1.3, 2)
    if upper_code == "PRE-005":
        total = _to_number(quantities_by_code.get("PRE-002"), 0) + _to_number(quantities_by_code.get("PRE-003"), 0) + _to_number(quantities_by_code.get("PRE-004"), 0)
        return _round(max(total, 0), 2)
    if upper_code == "PRE-006":
        return _round(max(area_pre * max(depth, 0.1), 0), 2)
    if upper_code in {"PRE-007", "PRE-008"}:
        return _round(max(area_demolicion, 0), 2)
    if upper_code in {"CIM-005", "CIM-005A"}:
        return _round(max(_to_number(context.get("foundationLinearMl"), 0), 0), 2)
    if upper_code == "CIM-006":
        return _round(max(_to_number(context.get("foundationLinearMl"), 0) * 0.2925, 0), 2)
    if upper_code in {"ALB-001", "ALB-002", "ALB-003"}:
        return _round(max(_to_number(context.get("wallAreaM2"), 0), 0), 2)
    if upper_code == "ALB-004":
        return _round(max(_to_number(context.get("wallAreaM2"), 0) * 2, 0), 2)
    if upper_code == "ALB-005":
        return _round(max(_to_number(context.get("areaConstruccion"), 0), 0), 2)

    return _infer_generic_quantity(upper_code, formula, mode, context)


def _group_summary(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[str, dict[str, Any]] = {}
    for row in rows:
        partida = _to_text(row.get("partida"), "General")
        if partida not in grouped:
            grouped[partida] = {"partida": partida, "concepts": 0, "total": 0.0}
        grouped[partida]["concepts"] += 1
        grouped[partida]["total"] += _to_number(row.get("total"), 0)

    return [
        {
            "partida": item["partida"],
            "concepts": int(item["concepts"]),
            "total": _round(item["total"], 2),
        }
        for item in grouped.values()
    ]


def _fetch_catalog_concepts(module_key: str, source_name: str = "CONSTRUBASE_PU_48_CONSTRUCTOR", limit: int = 500) -> list[dict[str, Any]]:
    normalized_module = _to_text(module_key, "").lower()
    partida_codes = MODULE_PARTIDAS.get(normalized_module)
    if not partida_codes:
        return []

    partidas_rows = execute_catalog_query(
        lambda client: (
            client.table("catalog_partidas")
            .select("id,code,name")
            .in_("code", partida_codes)
            .eq("is_active", True)
            .execute()
            .data
            or []
        ),
        operation="catalog_partidas",
        critical=True,
    )
    if not partidas_rows:
        return []

    partida_name_by_id = {safe_text(row.get("id")): safe_text(row.get("name")) for row in partidas_rows}
    partida_code_by_id = {safe_text(row.get("id")): safe_text(row.get("code")) for row in partidas_rows}
    partida_ids = [safe_text(row.get("id")) for row in partidas_rows if safe_text(row.get("id"))]

    concepts_rows = execute_catalog_query(
        lambda client: (
            client.table("catalog_concepts")
            .select(
                "id,code,technical_description,official_description,unit_id,partida_id,"
                "default_formula_code,quantification_mode,is_active"
            )
            .in_("partida_id", partida_ids)
            .eq("is_active", True)
            .limit(limit)
            .execute()
            .data
            or []
        ),
        operation="catalog_concepts",
        critical=True,
    )
    if not concepts_rows:
        return []

    unit_ids = list({safe_text(row.get("unit_id")) for row in concepts_rows if safe_text(row.get("unit_id"))})
    concept_ids = [safe_text(row.get("id")) for row in concepts_rows if safe_text(row.get("id"))]

    units_map: dict[str, dict[str, Any]] = {}
    if unit_ids:
        units_rows = execute_catalog_query(
            lambda client: (
                client.table("catalog_units").select("id,code,symbol").in_("id", unit_ids).execute().data or []
            ),
            operation="catalog_units",
            critical=False,
            default=[],
        )
        units_map = {safe_text(row.get("id")): row for row in units_rows}

    specs_by_concept_id: dict[str, dict[str, Any]] = {}
    spec_ids: list[str] = []
    if concept_ids:
        spec_rows = execute_catalog_query(
            lambda client: (
                client.table("engine_concept_specs")
                .select("id,concept_id,spec_code,is_active")
                .in_("concept_id", concept_ids)
                .eq("is_active", True)
                .execute()
                .data
                or []
            ),
            operation="engine_concept_specs",
            critical=False,
            default=[],
        )
        for row in spec_rows:
            concept_id = safe_text(row.get("concept_id"))
            spec_id = safe_text(row.get("id"))
            if not concept_id or not spec_id:
                continue
            previous = specs_by_concept_id.get(concept_id)
            if previous is None or safe_text(row.get("spec_code")) < safe_text(previous.get("spec_code"), "zzzz"):
                specs_by_concept_id[concept_id] = row
            spec_ids.append(spec_id)

    prices_by_spec_id: dict[str, dict[str, Any]] = {}
    if spec_ids:
        price_rows = execute_catalog_query(
            lambda client: (
                client.table("price_concept_bases")
                .select("concept_spec_id,source_name,unit_price,is_active,updated_at")
                .in_("concept_spec_id", list(set(spec_ids)))
                .eq("is_active", True)
                .execute()
                .data
                or []
            ),
            operation="price_concept_bases",
            critical=False,
            default=[],
        )

        for row in price_rows:
            spec_id = safe_text(row.get("concept_spec_id"))
            if not spec_id:
                continue
            current = prices_by_spec_id.get(spec_id)
            row_source = safe_text(row.get("source_name"))

            if row_source == source_name:
                prices_by_spec_id[spec_id] = row
                continue

            if current is None:
                prices_by_spec_id[spec_id] = row

    payload: list[dict[str, Any]] = []
    for row in concepts_rows:
        concept_id = safe_text(row.get("id"))
        unit = units_map.get(safe_text(row.get("unit_id")), {})
        spec = specs_by_concept_id.get(concept_id, {})
        price = prices_by_spec_id.get(safe_text(spec.get("id")), {})
        unit_price = row.get("unit_price") if isinstance(row.get("unit_price"), (int, float)) else None
        if unit_price is None:
            unit_price = price.get("unit_price")

        payload.append(
            {
                "code": safe_text(row.get("code")),
                "technical_description": safe_text(row.get("technical_description")),
                "official_description": safe_text(row.get("official_description")),
                "unit_code": safe_text(unit.get("code"), "OTRO"),
                "unit_symbol": safe_text(unit.get("symbol"), "u"),
                "partida_code": partida_code_by_id.get(safe_text(row.get("partida_id")), ""),
                "partida_name": partida_name_by_id.get(safe_text(row.get("partida_id")), ""),
                "default_formula_code": safe_text(row.get("default_formula_code")),
                "quantification_mode": safe_text(row.get("quantification_mode")),
                "unit_price": float(unit_price or 0),
                "source_name": safe_text(price.get("source_name")) or source_name,
            }
        )

    payload.sort(key=lambda item: item.get("code") or "")
    return payload


def _resolve_losa_code(tipo_losa: str = "") -> str:
    if tipo_losa == "vigueta_bovedilla":
        return "EST-006"
    if tipo_losa == "aligerada_caseton_nervaduras":
        return "EST-007"
    return "EST-005"


def _filter_estructura_by_rules(concepts: list[dict[str, Any]], sistema: str = "", tipo_losa: str = "") -> list[dict[str, Any]]:
    losa_code = _resolve_losa_code(tipo_losa)
    sistema_norm = _to_text(sistema, "").lower()
    if sistema_norm == "tradicional":
        allowed = {"EST-001", "EST-002", losa_code}
    elif sistema_norm == "concreto_reforzado":
        allowed = {"EST-003", "EST-004", losa_code}
    elif sistema_norm == "mixta":
        allowed = {"EST-001", "EST-002", "EST-003", "EST-004", losa_code}
    else:
        allowed = {losa_code}

    result: list[dict[str, Any]] = []
    for concept in concepts:
        code = _to_text(concept.get("code"), "").upper()
        if code in {"EST-008", "EST-009", "EST-010"}:
            continue
        if code in allowed:
            result.append(concept)
    return result


def _filter_instalaciones_by_services(concepts: list[dict[str, Any]], services: dict[str, Any]) -> list[dict[str, Any]]:
    agua = bool(services.get("agua", True))
    energia = bool(services.get("energia", True))
    drenaje = bool(services.get("drenaje", True))
    gas = bool(services.get("gas", True))

    filtered: list[dict[str, Any]] = []
    for concept in concepts:
        partida_code = _to_text(concept.get("partida_code"), "").upper()
        if partida_code == "HID" and not agua:
            continue
        if partida_code == "ELE" and not energia:
            continue
        if partida_code in {"SAN", "PLU"} and not drenaje:
            continue
        if partida_code == "GAS" and not gas:
            continue
        filtered.append(concept)
    return filtered


def _build_available_concepts(module_key: str, concepts: list[dict[str, Any]], context: dict[str, Any]) -> list[dict[str, Any]]:
    quantities_by_code: dict[str, float] = {}
    rows: list[dict[str, Any]] = []

    for concept in concepts:
        code = _to_text(concept.get("code"), "").upper()
        if not code:
            continue
        quantity = _estimate_quantity(code, concept, context, quantities_by_code)
        quantities_by_code[code] = quantity
        unit_price = _round(_to_number(concept.get("unit_price"), 0), 2)
        total = _round(quantity * unit_price, 2)
        rows.append(
            {
                "key": code,
                "moduleKey": module_key,
                "partida": _to_text(concept.get("partida_name"), _to_text(concept.get("partida_code"), "General")),
                "title": _to_text(
                    concept.get("official_description"),
                    _to_text(concept.get("technical_description"), code),
                ),
                "description": _to_text(
                    concept.get("technical_description"),
                    _to_text(concept.get("official_description"), "Concepto"),
                ),
                "unit": _to_text(concept.get("unit_symbol"), _to_text(concept.get("unit_code"), "u")).lower(),
                "quantity": _round(quantity, 4),
                "unitPrice": unit_price,
                "total": total,
                "formulaCode": _to_text(concept.get("default_formula_code"), ""),
                "quantificationMode": _to_text(concept.get("quantification_mode"), ""),
                "sourceName": _to_text(concept.get("source_name"), ""),
            }
        )

    return rows


def _pending_definitions() -> list[str]:
    return [
        "P-001 frontera exacta de obra_gris en obra_nueva",
        "P-002 catalogo oficial de nivel_acabado por modulo",
        "P-003 matriz tipo_intervencion -> alcance -> partidas activas",
        "P-004 taxonomia final de subalcances por partida",
        "P-005 compatibilidad formal cimentacion-estructura",
        "P-007 matriz de instalaciones por ambiente y numero de salidas",
    ]


def simulate_preliminares(
    *,
    preliminares: dict[str, Any] | None = None,
    datos_generales_obra: dict[str, Any] | None = None,
    estructura_espacial: dict[str, Any] | None = None,
    colindancias_recorrido: dict[str, Any] | None = None,
    source_name: str = "CONSTRUBASE_PU_48_CONSTRUCTOR",
) -> dict[str, Any]:
    _ = colindancias_recorrido
    prelim = preliminares or {}
    context = _build_spatial_context(datos_generales_obra, estructura_espacial, prelim)
    catalog = _fetch_catalog_concepts("preliminares", source_name=source_name)
    available = _build_available_concepts("preliminares", catalog, context)

    technical = [
        {
            "key": f"PRE-{str(index + 1).zfill(3)}",
            "sourceKey": item.get("key"),
            "group": item.get("partida") or "Preliminares",
            "title": item.get("title") or "Concepto preliminar",
            "description": item.get("description") or "Concepto generado desde motor backend.",
            "unit": item.get("unit") or "u",
            "quantity": _round(_to_number(item.get("quantity"), 0), 4),
            "unitPrice": _round(_to_number(item.get("unitPrice"), 0), 2),
            "total": _round(_to_number(item.get("total"), 0), 2),
        }
        for index, item in enumerate(available)
    ]
    official = [
        {
            "group": str(item.get("partida") or "general").lower().replace(" ", "_"),
            "title": item.get("partida") or "General",
            "description": f"Resumen de actividades del grupo {item.get('partida') or 'General'}.",
            "labor": "Cuadrilla de apoyo",
            "materials": "Material menor",
            "total": _round(_to_number(item.get("total"), 0), 2),
        }
        for item in _group_summary(technical)
    ]

    total = _round(sum(_to_number(item.get("total"), 0) for item in technical), 2)
    logger.info(
        "[TRACE][SIM][PRELIMINARES] concepts=%s total=%s source=%s",
        len(technical),
        total,
        source_name,
    )
    return {
        "activeConcepts": [
            {
                "key": item.get("key"),
                "group": item.get("partida") or "Preliminares",
                "title": item.get("title") or "Concepto preliminar",
                "description": item.get("description") or "Concepto generado desde motor backend.",
                "unit": item.get("unit") or "u",
                "quantity": _round(_to_number(item.get("quantity"), 0), 4),
                "unitPrice": _round(_to_number(item.get("unitPrice"), 0), 2),
            }
            for item in available
        ],
        "technicalConcepts": technical,
        "officialSummary": official,
        "costoEstimado": total,
        "sourceName": source_name,
        "contextSnapshot": context,
        "pendingDefinitions": _pending_definitions(),
    }


def simulate_modulo(
    *,
    module_key: str,
    controles: dict[str, Any] | None = None,
    selected_concept_keys: list[str] | None = None,
    force_select_all: bool = True,
    preliminares: dict[str, Any] | None = None,
    datos_generales_obra: dict[str, Any] | None = None,
    estructura_espacial: dict[str, Any] | None = None,
    colindancias_recorrido: dict[str, Any] | None = None,
    source_name: str = "CONSTRUBASE_PU_48_CONSTRUCTOR",
) -> dict[str, Any]:
    controles_data = controles if isinstance(controles, dict) else {}
    context = _build_spatial_context(datos_generales_obra, estructura_espacial, preliminares)
    catalog = _fetch_catalog_concepts(module_key, source_name=source_name)

    if module_key == "estructura":
        catalog = _filter_estructura_by_rules(
            catalog,
            sistema=_to_text(controles_data.get("sistemaEstructural"), context.get("sistemaEstructural", "")),
            tipo_losa=_to_text(controles_data.get("tipoLosa"), "maciza"),
        )
    if module_key == "instalaciones":
        services = controles_data.get("serviciosInstalaciones")
        services = services if isinstance(services, dict) else {}
        catalog = _filter_instalaciones_by_services(catalog, services)

    available = _build_available_concepts(module_key, catalog, context)
    keys = {str(item).strip().upper() for item in (selected_concept_keys or []) if str(item).strip()}
    if force_select_all or not keys:
        selected = [dict(item) for item in available]
        selected_keys = [str(item.get("key") or "") for item in selected]
    else:
        selected = [dict(item) for item in available if str(item.get("key") or "").upper() in keys]
        selected_keys = [str(item.get("key") or "") for item in selected]

    summary = _group_summary(selected)
    costo_estimado = _round(sum(_to_number(item.get("total"), 0) for item in selected), 2)
    logger.info(
        "[TRACE][SIM][MODULO] key=%s available=%s selected=%s total=%s source=%s",
        module_key,
        len(available),
        len(selected),
        costo_estimado,
        source_name,
    )

    return {
        "moduleKey": module_key,
        "availableConcepts": available,
        "selectedConcepts": selected,
        "selectedConceptKeys": selected_keys,
        "summaryByPartida": summary,
        "costoEstimado": costo_estimado,
        "sourceName": source_name,
        "contextSnapshot": context,
    }
