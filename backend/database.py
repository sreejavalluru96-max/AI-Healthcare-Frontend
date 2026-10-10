import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)


def get_patients():
    with engine.connect() as connection:
        result = connection.execute(
            text("""
                SELECT
                    patient_id,
                    name,
                    date_of_birth,
                    gender,
                    blood_group,
                    phone,
                    email,
                    address,
                    emergency_contact,
                    created_at
                FROM patients
                ORDER BY patient_id;
            """)
        )

        patients = []

        for row in result:
            patients.append(dict(row._mapping))

        return patients