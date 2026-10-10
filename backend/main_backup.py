from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import engine, get_patients
from sqlalchemy import text


app = FastAPI(
    title="AI-Powered Healthcare & Patient Information Management System"
)


# ==================================================
# CORS CONFIGURATION
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# ROOT
# ==================================================

@app.get("/")
def root():
    return {
        "message": "Healthcare Management System API is running"
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
def health_check():

    try:
        with engine.connect():
            return {
                "status": "healthy",
                "database": "PostgreSQL connected"
            }

    except Exception as e:
        return {
            "status": "error",
            "database": "PostgreSQL connection failed",
            "details": str(e)
        }


# ==================================================
# GET ALL PATIENTS
# ==================================================

@app.get("/patients")
def get_all_patients():

    return get_patients()


# ==================================================
# GET ONE PATIENT
# ==================================================

@app.get("/patients/{patient_id}")
def get_patient(patient_id: int):

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
                WHERE patient_id = :patient_id
            """),
            {
                "patient_id": patient_id
            }
        )

        patient = result.fetchone()

        if patient is None:
            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )

        return dict(patient._mapping)


# ==================================================
# GET PATIENT CLINICAL DATA
# ==================================================

@app.get("/patients/{patient_id}/clinical-data")
def get_patient_clinical_data(patient_id: int):

    with engine.connect() as connection:

        # ------------------------------------------
        # Check patient
        # ------------------------------------------

        patient_result = connection.execute(
            text("""
                SELECT
                    patient_id,
                    name
                FROM patients
                WHERE patient_id = :patient_id
            """),
            {
                "patient_id": patient_id
            }
        )

        patient = patient_result.fetchone()

        if patient is None:
            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )

        patient = patient._mapping

        # ------------------------------------------
        # Get encounters + vital signs
        # ------------------------------------------

        clinical_result = connection.execute(
            text("""
                SELECT
                    e.encounter_id,
                    e.encounter_type,
                    e.visit_date,
                    e.status,
                    e.chief_complaint,

                    v.heart_rate,
                    v.systolic_bp,
                    v.diastolic_bp,
                    v.temperature,
                    v.oxygen_saturation,
                    v.respiratory_rate

                FROM encounters e

                LEFT JOIN vital_signs v
                    ON e.encounter_id = v.encounter_id

                WHERE e.patient_id = :patient_id

                ORDER BY e.visit_date DESC
            """),
            {
                "patient_id": patient_id
            }
        )

        encounters = []

        for row in clinical_result:
            encounters.append(
                dict(row._mapping)
            )

        # ------------------------------------------
        # Get symptoms
        # ------------------------------------------

        symptom_result = connection.execute(
            text("""
                SELECT
                    s.symptom_id,
                    s.encounter_id,
                    s.symptom_name,
                    s.severity,
                    s.duration

                FROM symptoms s

                JOIN encounters e
                    ON s.encounter_id = e.encounter_id

                WHERE e.patient_id = :patient_id

                ORDER BY s.symptom_id
            """),
            {
                "patient_id": patient_id
            }
        )

        symptoms = []

        for row in symptom_result:
            symptoms.append(
                dict(row._mapping)
            )

        # ------------------------------------------
        # Return clinical data
        # ------------------------------------------

        return {
            "patient_id": patient["patient_id"],
            "patient_name": patient["name"],
            "encounters": encounters,
            "symptoms": symptoms
        }


# ==================================================
# AI RISK & EMERGENCY PRIORITY ASSESSMENT
# ==================================================

@app.get("/ai-assessment/{encounter_id}")
def ai_assessment(encounter_id: int):

    with engine.connect() as connection:

        # ------------------------------------------
        # Get encounter + vital signs
        # ------------------------------------------

        result = connection.execute(
            text("""
                SELECT
                    e.encounter_id,
                    e.patient_id,
                    e.encounter_type,
                    e.chief_complaint,

                    v.heart_rate,
                    v.systolic_bp,
                    v.diastolic_bp,
                    v.temperature,
                    v.oxygen_saturation,
                    v.respiratory_rate

                FROM encounters e

                LEFT JOIN vital_signs v
                    ON e.encounter_id = v.encounter_id

                WHERE e.encounter_id = :encounter_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        data = result.fetchone()

        if data is None:
            raise HTTPException(
                status_code=404,
                detail="Encounter not found"
            )

        data = data._mapping

        # ------------------------------------------
        # Get symptoms
        # ------------------------------------------

        symptom_result = connection.execute(
            text("""
                SELECT
                    symptom_name,
                    severity
                FROM symptoms
                WHERE encounter_id = :encounter_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        symptoms = []

        for row in symptom_result:
            symptoms.append(
                dict(row._mapping)
            )

        # ------------------------------------------
        # AI RISK SCORE
        # ------------------------------------------

        risk_score = 0
        reasons = []

        heart_rate = data["heart_rate"]
        systolic_bp = data["systolic_bp"]
        oxygen = data["oxygen_saturation"]
        respiratory_rate = data["respiratory_rate"]
        temperature = data["temperature"]

        # ------------------------------------------
        # Heart rate analysis
        # ------------------------------------------

        if heart_rate is not None:

            if heart_rate >= 120:
                risk_score += 20
                reasons.append("Very high heart rate")

            elif heart_rate >= 100:
                risk_score += 10
                reasons.append("Elevated heart rate")

        # ------------------------------------------
        # Blood pressure analysis
        # ------------------------------------------

        if systolic_bp is not None:

            if systolic_bp < 90:
                risk_score += 20
                reasons.append("Low systolic blood pressure")

            elif systolic_bp >= 140:
                risk_score += 10
                reasons.append("High systolic blood pressure")

        # ------------------------------------------
        # Oxygen saturation analysis
        # ------------------------------------------

        if oxygen is not None:

            if oxygen < 90:
                risk_score += 30
                reasons.append("Very low oxygen saturation")

            elif oxygen < 94:
                risk_score += 15
                reasons.append("Low oxygen saturation")

        # ------------------------------------------
        # Respiratory rate analysis
        # ------------------------------------------

        if respiratory_rate is not None:

            if respiratory_rate >= 25:
                risk_score += 20
                reasons.append("High respiratory rate")

            elif respiratory_rate >= 20:
                risk_score += 10
                reasons.append("Elevated respiratory rate")

        # ------------------------------------------
        # Temperature analysis
        # ------------------------------------------

        if temperature is not None:

            if temperature >= 39:
                risk_score += 10
                reasons.append("High temperature")

        # ------------------------------------------
        # Symptom analysis
        # ------------------------------------------

        for symptom in symptoms:

            symptom_name = (
                symptom["symptom_name"].lower()
            )

            severity = symptom["severity"]

            # Severe symptoms
            if severity is not None:

                if severity.lower() == "severe":

                    risk_score += 10

                    reasons.append(
                        f"Severe symptom: "
                        f"{symptom['symptom_name']}"
                    )

            # Chest-related symptom
            if "chest" in symptom_name:

                risk_score += 15

                reasons.append(
                    "Chest pain detected"
                )

            # Breathing-related symptom
            if "breath" in symptom_name:

                risk_score += 15

                reasons.append(
                    "Breathlessness detected"
                )

        # ------------------------------------------
        # Limit risk score to 100
        # ------------------------------------------

        risk_score = min(
            risk_score,
            100
        )

        # ------------------------------------------
        # Determine risk level
        # ------------------------------------------

        if risk_score >= 70:
            risk_level = "High"

        elif risk_score >= 40:
            risk_level = "Medium"

        else:
            risk_level = "Low"

        # ------------------------------------------
        # Emergency priority score
        # ------------------------------------------

        priority_score = risk_score

        if data["encounter_type"] == "Emergency":
            priority_score += 10

        priority_score = min(
            priority_score,
            100
        )

        # ------------------------------------------
        # Determine priority level
        # ------------------------------------------

        if priority_score >= 85:
            priority_level = "Critical"

        elif priority_score >= 70:
            priority_level = "High"

        elif priority_score >= 40:
            priority_level = "Medium"

        else:
            priority_level = "Low"

        # ------------------------------------------
        # Generate explanation
        # ------------------------------------------

        if reasons:

            explanation = (
                "Risk assessment based on: "
                + ", ".join(reasons)
                + "."
            )

        else:

            explanation = (
                "No major abnormal clinical "
                "indicators were detected in "
                "the available data."
            )

        # ------------------------------------------
        # Save AI assessment to PostgreSQL
        # ------------------------------------------

        insert_result = connection.execute(
            text("""
                INSERT INTO ai_assessments
                (
                    encounter_id,
                    risk_score,
                    risk_level,
                    priority_score,
                    priority_level,
                    explanation,
                    model_name,
                    model_version
                )
                VALUES
                (
                    :encounter_id,
                    :risk_score,
                    :risk_level,
                    :priority_score,
                    :priority_level,
                    :explanation,
                    :model_name,
                    :model_version
                )
                RETURNING assessment_id
            """),
            {
                "encounter_id": encounter_id,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "priority_score": priority_score,
                "priority_level": priority_level,
                "explanation": explanation,
                "model_name": "Healthcare Risk Priority Model",
                "model_version": "1.0"
            }
        )

        assessment_id = insert_result.scalar_one()

        connection.commit()

        # ------------------------------------------
        # Return AI result
        # ------------------------------------------

        return {
            "assessment_id": assessment_id,
            "encounter_id": encounter_id,
            "patient_id": data["patient_id"],
            "risk_score": risk_score,
            "risk_level": risk_level,
            "priority_score": priority_score,
            "priority_level": priority_level,
            "explanation": explanation
        }