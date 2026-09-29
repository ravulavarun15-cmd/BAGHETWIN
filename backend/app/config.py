from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    database_url:str='postgresql+psycopg2://sih:sih_password@localhost:5432/sih26120'
    jwt_secret:str='sih26120-development-secret'
    cors_origins:str='http://localhost:5173'
    class Config: env_file='.env'
settings=Settings()
