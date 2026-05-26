import sys
import os
sys.path.append('.')

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal
from app.models.system_config import SystemConfig

def create_default_configs():
    db = SessionLocal()
    try:
        default_configs = [
            {"config_key": "storage_quota", "config_value": "10"},
            {"config_key": "allow_register", "config_value": "true"},
            {"config_key": "max_file_size", "config_value": "100"},
            {"config_key": "allowed_extensions", "config_value": "*"},
        ]
        
        for config in default_configs:
            existing = db.query(SystemConfig).filter(SystemConfig.config_key == config["config_key"]).first()
            if not existing:
                new_config = SystemConfig(
                    config_key=config["config_key"],
                    config_value=config["config_value"]
                )
                db.add(new_config)
                print(f"Created config: {config['config_key']} = {config['config_value']}")
        
        db.commit()
        print("Default configs created successfully")
    finally:
        db.close()

if __name__ == "__main__":
    create_default_configs()
