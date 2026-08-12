from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(str(BACKEND_DIR / ".env"), str(BACKEND_DIR / ".env.local")),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_name: str = "Quantia Backend"
    api_v1_prefix: str = "/api"
    debug: bool = False

    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_anon_key: str = Field(default="", alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_key: str = Field(default="", alias="SUPABASE_KEY")

    ocr_engine: str = Field(default="tesseract", alias="OCR_ENGINE")
    embedding_model: str = Field(default="sentence-transformers/all-MiniLM-L6-v2", alias="EMBEDDING_MODEL")
    embedding_dimension: int = Field(default=384, ge=1, alias="EMBEDDING_DIMENSION")
    upload_dir: Path = Field(default=BACKEND_DIR / "tmp_documents", alias="UPLOAD_DIR")
    document_persistence_backend: str = Field(default="local", alias="DOCUMENT_PERSISTENCE_BACKEND")
    document_table_name: str = Field(default="documents", alias="DOCUMENT_TABLE_NAME")
    document_storage_bucket: str = Field(default="quantia-documents", alias="DOCUMENT_STORAGE_BUCKET")
    document_max_upload_bytes: int = Field(
        default=20 * 1024 * 1024,
        ge=1024,
        alias="DOCUMENT_MAX_UPLOAD_BYTES",
    )
    auth_token_secret: str = Field(default="", alias="AUTH_TOKEN_SECRET")
    auth_token_ttl_seconds: int = Field(default=8 * 60 * 60, ge=60, alias="AUTH_TOKEN_TTL_SECONDS")
    vector_store_backend: str = Field(default="local", alias="VECTOR_STORE_BACKEND")
    vector_table_name: str = Field(default="document_chunks", alias="VECTOR_TABLE_NAME")
    rag_top_k: int = Field(default=3, alias="RAG_TOP_K")

    ollama_host: str = Field(default="http://localhost:11434", alias="OLLAMA_HOST")
    ollama_model: str = Field(default="llama3.1:8b", alias="OLLAMA_MODEL")
    ollama_timeout_seconds: float = Field(default=30.0, alias="OLLAMA_TIMEOUT_SECONDS")
    ollama_temperature: float = Field(default=0.2, alias="OLLAMA_TEMPERATURE")

    backend_cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]
    )
    backend_cors_origin_regex: str | None = Field(
        default=r"^https://([a-z0-9-]+\.)*vercel\.app$",
        alias="BACKEND_CORS_ORIGIN_REGEX",
    )

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):  # noqa: ANN001
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return []
            return [item.strip() for item in value.split(",") if item.strip()]
        return []

    @field_validator("backend_cors_origin_regex", mode="before")
    @classmethod
    def parse_cors_origin_regex(cls, value):  # noqa: ANN001
        if value is None:
            return None
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return None

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value):  # noqa: ANN001
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"1", "true", "yes", "on", "debug", "dev"}:
                return True
            if normalized in {"0", "false", "no", "off", "release", "prod", "production", ""}:
                return False
        return False

    @field_validator("ollama_host", mode="before")
    @classmethod
    def normalize_ollama_host(cls, value):  # noqa: ANN001
        if not isinstance(value, str) or not value.strip():
            return "http://localhost:11434"
        return value.strip().rstrip("/")

    @field_validator("ollama_model", mode="before")
    @classmethod
    def normalize_ollama_model(cls, value):  # noqa: ANN001
        if not isinstance(value, str) or not value.strip():
            return "llama3.1:8b"
        return value.strip()

    @field_validator("ocr_engine", mode="before")
    @classmethod
    def normalize_ocr_engine(cls, value):  # noqa: ANN001
        if not isinstance(value, str) or not value.strip():
            return "tesseract"
        return value.strip()

    @field_validator("embedding_model", mode="before")
    @classmethod
    def normalize_embedding_model(cls, value):  # noqa: ANN001
        if not isinstance(value, str) or not value.strip():
            return "sentence-transformers/all-MiniLM-L6-v2"
        return value.strip()

    @field_validator("vector_store_backend", mode="before")
    @classmethod
    def normalize_vector_store_backend(cls, value):  # noqa: ANN001
        if not isinstance(value, str) or not value.strip():
            return "local"
        return value.strip().lower()

    @field_validator("document_persistence_backend", mode="before")
    @classmethod
    def normalize_document_persistence_backend(cls, value):  # noqa: ANN001
        if not isinstance(value, str) or not value.strip():
            return "local"
        return value.strip().lower()

    @field_validator("document_table_name", "document_storage_bucket", mode="before")
    @classmethod
    def normalize_document_resource_name(cls, value, info):  # noqa: ANN001
        fallback = "documents" if info.field_name == "document_table_name" else "quantia-documents"
        if not isinstance(value, str) or not value.strip():
            return fallback
        return value.strip()

    @field_validator("auth_token_secret", mode="before")
    @classmethod
    def normalize_auth_token_secret(cls, value):  # noqa: ANN001
        normalized = str(value or "").strip()
        if normalized and len(normalized) < 32:
            raise ValueError("AUTH_TOKEN_SECRET debe tener al menos 32 caracteres.")
        return normalized

    @field_validator("vector_table_name", mode="before")
    @classmethod
    def normalize_vector_table_name(cls, value):  # noqa: ANN001
        if not isinstance(value, str) or not value.strip():
            return "document_chunks"
        return value.strip()

    @field_validator("upload_dir", mode="before")
    @classmethod
    def normalize_upload_dir(cls, value):  # noqa: ANN001
        if isinstance(value, Path):
            return value
        if isinstance(value, str):
            value = value.strip()
            if value:
                return Path(value)
        return BACKEND_DIR / "tmp_documents"

    @property
    def supabase_admin_key(self) -> str:
        return self.supabase_service_role_key or self.supabase_key or self.supabase_anon_key


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
