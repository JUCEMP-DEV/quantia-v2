from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class InferenciaRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    preliminares: dict[str, Any] = Field(default_factory=dict)
    modulos: dict[str, Any] = Field(default_factory=dict)
    datos_generales_obra: dict[str, Any] = Field(default_factory=dict, alias="datosGeneralesObra")
    variables_entrada: dict[str, Any] = Field(default_factory=dict, alias="variablesEntrada")
    estructura_espacial: dict[str, Any] = Field(default_factory=dict, alias="estructuraEspacial")
    colindancias_recorrido: dict[str, Any] = Field(default_factory=dict, alias="colindanciasRecorrido")
    validacion_espacial: dict[str, Any] = Field(default_factory=dict, alias="validacionEspacial")
    required_module_keys: list[str] = Field(default_factory=list, alias="requiredModuleKeys")
    perfil: str = "oficial"


class InferenciaResponse(BaseModel):
    resultadoFinal: float = 0
    desglose: dict[str, Any] = Field(default_factory=dict)
    estadoResultado: str = "pendiente"
    metadata: dict[str, Any] = Field(default_factory=dict)


class SimulacionPreliminaresRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    preliminares: dict[str, Any] = Field(default_factory=dict)
    datos_generales_obra: dict[str, Any] = Field(default_factory=dict, alias="datosGeneralesObra")
    estructura_espacial: dict[str, Any] = Field(default_factory=dict, alias="estructuraEspacial")
    colindancias_recorrido: dict[str, Any] = Field(default_factory=dict, alias="colindanciasRecorrido")
    source_name: str = Field(default="CONSTRUBASE_PU_48_CONSTRUCTOR", alias="sourceName")


class SimulacionPreliminaresResponse(BaseModel):
    activeConcepts: list[dict[str, Any]] = Field(default_factory=list)
    technicalConcepts: list[dict[str, Any]] = Field(default_factory=list)
    officialSummary: list[dict[str, Any]] = Field(default_factory=list)
    costoEstimado: float = 0
    sourceName: str = ""
    contextSnapshot: dict[str, Any] = Field(default_factory=dict)
    pendingDefinitions: list[str] = Field(default_factory=list)


class SimulacionModuloRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    controles: dict[str, Any] = Field(default_factory=dict)
    selected_concept_keys: list[str] = Field(default_factory=list, alias="selectedConceptKeys")
    force_select_all: bool = Field(default=True, alias="forceSelectAll")
    preliminares: dict[str, Any] = Field(default_factory=dict)
    datos_generales_obra: dict[str, Any] = Field(default_factory=dict, alias="datosGeneralesObra")
    estructura_espacial: dict[str, Any] = Field(default_factory=dict, alias="estructuraEspacial")
    colindancias_recorrido: dict[str, Any] = Field(default_factory=dict, alias="colindanciasRecorrido")
    source_name: str = Field(default="CONSTRUBASE_PU_48_CONSTRUCTOR", alias="sourceName")


class SimulacionModuloResponse(BaseModel):
    moduleKey: str = ""
    availableConcepts: list[dict[str, Any]] = Field(default_factory=list)
    selectedConcepts: list[dict[str, Any]] = Field(default_factory=list)
    selectedConceptKeys: list[str] = Field(default_factory=list)
    summaryByPartida: list[dict[str, Any]] = Field(default_factory=list)
    costoEstimado: float = 0
    sourceName: str = ""
    contextSnapshot: dict[str, Any] = Field(default_factory=dict)
