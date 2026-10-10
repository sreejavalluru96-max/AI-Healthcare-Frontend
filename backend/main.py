
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date, time
from typing import Optional

from database import engine, get_patients
from sqlalchemy import text


app = FastAPI(
    title="AI-Powered Healthcare & Patient Information Management System",
    version="0.1.0"
)


# ==================================================
# CORS CONFIGURATION
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5178",
        "http://127.0.0.1:5178",
        "http://localhost:5179",
        "http://127.0.0.1:5179",
        "https://sreejavalluru96-max.github.io",
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
# RESET DEMO DATASET
# ==================================================

@app.post("/reset-demo")
def reset_demo_database():
    try:
        with engine.begin() as conn:
            # Delete non-baseline records
            conn.execute(text("DELETE FROM ai_assessments WHERE encounter_id NOT IN (1, 2, 3, 4, 5, 6, 7, 8, 11, 12);"))
            conn.execute(text("DELETE FROM prescriptions WHERE encounter_id NOT IN (1, 2, 3, 4, 5, 6, 7, 8, 11, 12);"))
            conn.execute(text("DELETE FROM symptoms WHERE encounter_id NOT IN (1, 2, 3, 4, 5, 6, 7, 8, 11, 12);"))
            conn.execute(text("DELETE FROM vital_signs WHERE encounter_id NOT IN (1, 2, 3, 4, 5, 6, 7, 8, 11, 12);"))
            conn.execute(text("DELETE FROM appointments WHERE patient_id NOT IN (1, 2, 3, 4, 5, 6, 7, 8);"))
            conn.execute(text("DELETE FROM encounters WHERE patient_id NOT IN (1, 2, 3, 4, 5, 6, 7, 8) OR encounter_id NOT IN (1, 2, 3, 4, 5, 6, 7, 8, 11, 12);"))
            conn.execute(text("DELETE FROM patients WHERE patient_id NOT IN (1, 2, 3, 4, 5, 6, 7, 8);"))

            # Restore baseline patients 1 to 8
            conn.execute(text("""
                INSERT INTO patients (patient_id, name, date_of_birth, gender, blood_group, phone, email, address, emergency_contact, created_at)
                VALUES
                (1, 'Sreeja Valluru', '2008-01-01', 'Female', 'O+', '9876502001', 'sreeja@example.com', 'Hyderabad', '9876503001', '2026-09-10 20:12:35.646216'),
                (2, 'Aarav Sharma', '1995-08-21', 'Male', 'B+', '9876502002', 'aarav@example.com', 'Hyderabad', '9876503002', '2026-09-10 20:12:35.646216'),
                (3, 'Ananya Reddi', '1989-01-01', 'Female', 'A+', '9876502003', 'ananya@example.com', 'Secunderabad', '9876503003', '2026-09-10 20:12:35.646216'),
                (4, 'Rahul Verma', '1975-02-18', 'Male', 'O-', '9876502004', 'rahul@example.com', 'Hyderabad', '9876503004', '2026-09-10 20:12:35.646216'),
                (5, 'Meera Nair', '2001-06-27', 'Female', 'AB+', '9876502005', 'meera@example.com', 'Kondapur', '9876503005', '2026-09-10 20:12:35.646216'),
                (6, 'Vikram Singh', '1968-09-12', 'Male', 'B-', '9876502006', 'vikram@example.com', 'Madhapur', '9876503006', '2026-09-10 20:12:35.646216'),
                (7, 'Kavya Reddy', '1992-12-05', 'Female', 'A-', '9876502007', 'kavya@example.com', 'Gachibowli', '9876503007', '2026-09-10 20:12:35.646216'),
                (8, 'Rohan Kumar', '1982-03-30', 'Male', 'O+', '9876502008', 'rohan@example.com', 'Miyapur', '9876503008', '2026-09-10 20:12:35.646216')
                ON CONFLICT (patient_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    date_of_birth = EXCLUDED.date_of_birth,
                    gender = EXCLUDED.gender,
                    blood_group = EXCLUDED.blood_group,
                    phone = EXCLUDED.phone,
                    email = EXCLUDED.email,
                    address = EXCLUDED.address,
                    emergency_contact = EXCLUDED.emergency_contact;
            """))

            # Restore baseline encounters (IDs 1-8, 11, 12) with original statuses
            conn.execute(text("""
                INSERT INTO encounters (encounter_id, patient_id, doctor_id, department_id, encounter_type, visit_date, status, chief_complaint, notes)
                VALUES
                (1, 1, 1, 1, 'Routine', '2026-09-10 10:00:00', 'Open', 'Mild headache', 'Routine intake'),
                (2, 2, 3, 3, 'Routine', '2026-09-10 10:15:00', 'In Treatment', 'Fever and weakness', 'In Treatment'),
                (3, 3, 2, 2, 'Follow-up', '2026-09-10 11:00:00', 'Completed', 'Headache', 'Follow-up consultation for recurring headaches.'),
                (4, 4, 4, 4, 'Emergency', '2026-09-10 11:30:00', 'Open', 'Chest discomfort and breathlessness', 'Treatment initiated'),
                (5, 5, 5, 5, 'Routine', '2026-09-10 12:00:00', 'Open', 'Knee pain', 'Patient reported pain while walking.'),
                (6, 6, 1, 1, 'Follow-up', '2026-09-10 13:00:00', 'Open', 'Blood pressure follow-up', 'Routine blood pressure monitoring.'),
                (7, 7, 3, 3, 'Routine', '2026-09-10 14:00:00', 'Open', 'General health consultation', 'General health assessment.'),
                (8, 8, 2, 2, 'Routine', '2026-09-10 15:00:00', 'Open', 'Migraine consultation', 'Patient reported recurring migraine symptoms.'),
                (11, 1, 1, 1, 'Emergency', '2026-10-02 12:00:00', 'Open', 'Severe headache and dizziness', 'In Treatment'),
                (12, 4, 1, 1, 'Emergency', '2026-10-02 12:10:27', 'Open', 'Severe chest pain and difficulty breathing', 'In Treatment')
                ON CONFLICT (encounter_id) DO UPDATE SET
                    patient_id = EXCLUDED.patient_id,
                    doctor_id = EXCLUDED.doctor_id,
                    department_id = EXCLUDED.department_id,
                    encounter_type = EXCLUDED.encounter_type,
                    visit_date = EXCLUDED.visit_date,
                    status = EXCLUDED.status,
                    chief_complaint = EXCLUDED.chief_complaint,
                    notes = EXCLUDED.notes;
            """))

            # Delete extra prescriptions for baseline encounters and re-insert baseline ones
            conn.execute(text("DELETE FROM prescriptions WHERE encounter_id IN (1,2,3,4,5,6,7,8,11,12);"))
            conn.execute(text("""
                INSERT INTO prescriptions (prescription_id, encounter_id, doctor_id, medicine_name, dosage, frequency, duration, instructions)
                VALUES
                (2, 2, 3, 'Paracetamol', '500 mg', 'Twice daily', '3 days', 'Take after food.'),
                (3, 3, 2, 'Sumatriptan', '50 mg', 'As needed', '5 days', 'Use only as prescribed.'),
                (4, 4, 4, 'Emergency medication', 'As prescribed', 'Immediate', 'As required', 'Emergency treatment under medical supervision.'),
                (5, 5, 5, 'Ibuprofen', '400 mg', 'Twice daily', '5 days', 'Take after food.'),
                (6, 6, 1, 'Amlodipine', '5 mg', 'Once daily', '30 days', 'Take at the same time each day.'),
                (7, 7, 3, 'Multivitamin', '1 tablet', 'Once daily', '15 days', 'Take after breakfast.'),
                (8, 8, 2, 'Migraine relief medication', 'As prescribed', 'As needed', '7 days', 'Use according to doctor instructions.'),
                (9, 12, 1, 'Paracetamol', '500 mg', 'Twice daily', '3 days', 'Take after food. Follow the doctor''s instructions.')
                ON CONFLICT (prescription_id) DO UPDATE SET
                    encounter_id = EXCLUDED.encounter_id,
                    doctor_id = EXCLUDED.doctor_id,
                    medicine_name = EXCLUDED.medicine_name,
                    dosage = EXCLUDED.dosage,
                    frequency = EXCLUDED.frequency,
                    duration = EXCLUDED.duration,
                    instructions = EXCLUDED.instructions;
            """))

            # Restore vital signs
            conn.execute(text("DELETE FROM vital_signs WHERE encounter_id IN (1,2,3,4,5,6,7,8,11,12);"))
            conn.execute(text("""
                INSERT INTO vital_signs (vital_id, encounter_id, heart_rate, systolic_bp, diastolic_bp, temperature, oxygen_saturation, respiratory_rate, recorded_at)
                VALUES
                (1, 1, 78, 120, 80, 36.7, 98.00, 16, '2026-09-10 10:00:00'),
                (2, 2, 102, 110, 72, 38.6, 96.00, 20, '2026-09-10 10:15:00'),
                (3, 3, 82, 118, 76, 36.8, 98.00, 17, '2026-09-10 11:00:00'),
                (4, 4, 128, 88, 60, 37.2, 89.00, 26, '2026-09-10 11:30:00'),
                (5, 5, 86, 122, 80, 36.6, 97.00, 18, '2026-09-10 12:00:00'),
                (6, 6, 76, 125, 82, 36.7, 98.00, 16, '2026-09-10 13:00:00'),
                (7, 7, 80, 118, 78, 36.5, 99.00, 16, '2026-09-10 14:00:00'),
                (8, 8, 94, 115, 75, 37.0, 97.00, 19, '2026-09-10 15:00:00'),
                (11, 11, 110, 150, 95, 38.5, 92.00, 22, '2026-10-02 12:00:00'),
                (12, 12, 128, 88, 60, 38.5, 89.00, 24, '2026-10-02 12:11:24')
                ON CONFLICT (vital_id) DO UPDATE SET
                    encounter_id = EXCLUDED.encounter_id,
                    heart_rate = EXCLUDED.heart_rate,
                    systolic_bp = EXCLUDED.systolic_bp,
                    diastolic_bp = EXCLUDED.diastolic_bp,
                    temperature = EXCLUDED.temperature,
                    oxygen_saturation = EXCLUDED.oxygen_saturation,
                    respiratory_rate = EXCLUDED.respiratory_rate,
                    recorded_at = EXCLUDED.recorded_at;
            """))

            # Restore symptoms
            conn.execute(text("DELETE FROM symptoms WHERE encounter_id IN (1,2,3,4,5,6,7,8,11,12);"))
            conn.execute(text("""
                INSERT INTO symptoms (symptom_id, encounter_id, symptom_name, severity, duration)
                VALUES
                (1, 1, 'Mild headache', 'Mild', '1 day'),
                (2, 2, 'Fever', 'Moderate', '2 days'),
                (3, 2, 'Weakness', 'Moderate', '2 days'),
                (4, 3, 'Headache', 'Moderate', '1 week'),
                (5, 4, 'Chest pain', 'Severe', '1 hour'),
                (6, 4, 'Breathlessness', 'Severe', '30 minutes'),
                (7, 5, 'Knee pain', 'Moderate', '2 weeks'),
                (8, 6, 'Dizziness', 'Mild', '3 days'),
                (9, 7, 'Fatigue', 'Mild', '1 week'),
                (10, 8, 'Migraine', 'Moderate', '2 days'),
                (11, 11, 'Severe headache', 'Severe', '1 hour'),
                (12, 11, 'Dizziness', 'Moderate', '2 hours'),
                (13, 12, 'Severe chest pain', 'Severe', '30 minutes')
                ON CONFLICT (symptom_id) DO UPDATE SET
                    encounter_id = EXCLUDED.encounter_id,
                    symptom_name = EXCLUDED.symptom_name,
                    severity = EXCLUDED.severity,
                    duration = EXCLUDED.duration;
            """))

            # Restore appointments
            conn.execute(text("DELETE FROM appointments WHERE appointment_id IN (15, 19);"))
            conn.execute(text("""
                INSERT INTO appointments (appointment_id, patient_id, doctor_id, department_id, appointment_date, appointment_time, reason, status)
                VALUES
                (15, 3, 1, 1, '2026-10-03', '10:00:00', 'Outpatient Consultation', 'Scheduled'),
                (19, 2, 1, 1, '2026-10-03', '10:30:00', 'Routine consultation', 'Scheduled')
                ON CONFLICT (appointment_id) DO UPDATE SET
                    patient_id = EXCLUDED.patient_id,
                    doctor_id = EXCLUDED.doctor_id,
                    department_id = EXCLUDED.department_id,
                    appointment_date = EXCLUDED.appointment_date,
                    appointment_time = EXCLUDED.appointment_time,
                    reason = EXCLUDED.reason,
                    status = EXCLUDED.status;
            """))

            # Reset auto-increment sequences
            conn.execute(text("SELECT setval(pg_get_serial_sequence('patients', 'patient_id'), COALESCE(MAX(patient_id), 1)) FROM patients;"))
            conn.execute(text("SELECT setval(pg_get_serial_sequence('encounters', 'encounter_id'), COALESCE(MAX(encounter_id), 1)) FROM encounters;"))
            conn.execute(text("SELECT setval(pg_get_serial_sequence('prescriptions', 'prescription_id'), COALESCE(MAX(prescription_id), 1)) FROM prescriptions;"))
            conn.execute(text("SELECT setval(pg_get_serial_sequence('vital_signs', 'vital_id'), COALESCE(MAX(vital_id), 1)) FROM vital_signs;"))
            conn.execute(text("SELECT setval(pg_get_serial_sequence('symptoms', 'symptom_id'), COALESCE(MAX(symptom_id), 1)) FROM symptoms;"))
            conn.execute(text("SELECT setval(pg_get_serial_sequence('appointments', 'appointment_id'), COALESCE(MAX(appointment_id), 1)) FROM appointments;"))

        return {
            "status": "success",
            "message": "MediQueueAI demo database reset to original state."
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset demo database: {str(e)}"
        )


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

        # --------------------------------------------------
        # PATIENT
        # --------------------------------------------------

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

        # --------------------------------------------------
        # ENCOUNTERS + VITAL SIGNS
        # --------------------------------------------------

        clinical_result = connection.execute(
            text("""
                SELECT
                    e.encounter_id,
                    e.patient_id,
                    e.doctor_id,
                    d.name AS doctor_name,
                    e.department_id,
                    dp.department_name,
                    e.encounter_type,
                    e.visit_date,
                    e.status,
                    e.chief_complaint,
                    e.notes,

                    v.vital_id,
                    v.heart_rate,
                    v.systolic_bp,
                    v.diastolic_bp,
                    v.temperature,
                    v.oxygen_saturation,
                    v.respiratory_rate,
                    v.recorded_at

                FROM encounters e

                LEFT JOIN doctors d
                    ON e.doctor_id = d.doctor_id

                LEFT JOIN departments dp
                    ON e.department_id = dp.department_id

                LEFT JOIN vital_signs v
                    ON e.encounter_id = v.encounter_id

                WHERE e.patient_id = :patient_id

                ORDER BY
                    e.visit_date DESC,
                    e.encounter_id DESC
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

        # --------------------------------------------------
        # SYMPTOMS
        # --------------------------------------------------

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

                ORDER BY
                    s.encounter_id DESC,
                    s.symptom_id
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

        # --------------------------------------------------
        # AI ASSESSMENTS
        # ONLY LATEST ASSESSMENT PER ENCOUNTER
        # --------------------------------------------------

        assessment_result = connection.execute(
            text("""
                SELECT
                    a.assessment_id,
                    a.encounter_id,
                    a.triage_id,
                    a.risk_score,
                    a.risk_level,
                    a.priority_score,
                    a.priority_level,
                    a.explanation,
                    a.model_name,
                    a.model_version,
                    a.created_at

                FROM ai_assessments a

                JOIN encounters e
                    ON a.encounter_id = e.encounter_id

                WHERE e.patient_id = :patient_id

                  AND a.assessment_id = (
                      SELECT a2.assessment_id
                      FROM ai_assessments a2
                      WHERE a2.encounter_id = a.encounter_id
                      ORDER BY
                          a2.created_at DESC,
                          a2.assessment_id DESC
                      LIMIT 1
                  )

                ORDER BY
                    a.created_at DESC,
                    a.assessment_id DESC
            """),
            {
                "patient_id": patient_id
            }
        )

        assessments = []

        for row in assessment_result:

            assessments.append(
                dict(row._mapping)
            )

        # --------------------------------------------------
        # PRESCRIPTIONS
        # --------------------------------------------------

        prescription_result = connection.execute(
            text("""
                SELECT
                    p.prescription_id,
                    p.encounter_id,
                    p.doctor_id,
                    d.name AS doctor_name,
                    p.medicine_name,
                    p.dosage,
                    p.frequency,
                    p.duration,
                    p.instructions

                FROM prescriptions p

                JOIN encounters e
                    ON p.encounter_id = e.encounter_id

                LEFT JOIN doctors d
                    ON p.doctor_id = d.doctor_id

                WHERE e.patient_id = :patient_id

                ORDER BY
                    p.prescription_id DESC
            """),
            {
                "patient_id": patient_id
            }
        )

        prescriptions = []

        for row in prescription_result:

            prescriptions.append(
                dict(row._mapping)
            )

        return {
            "patient_id": patient["patient_id"],
            "patient_name": patient["name"],
            "encounters": encounters,
            "symptoms": symptoms,
            "ai_assessments": assessments,
            "prescriptions": prescriptions
        }


# ==================================================
# ENCOUNTER REQUEST MODEL
# ==================================================

class EncounterRequest(BaseModel):

    patient_id: int
    doctor_id: Optional[int] = None
    department_id: Optional[int] = None
    encounter_type: str
    chief_complaint: Optional[str] = None
    notes: Optional[str] = None
    appointment_id: Optional[int] = None


# ==================================================
# CREATE ENCOUNTER
# ==================================================

@app.post("/encounters")
def create_encounter(request: EncounterRequest):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CHECK PATIENT
        # --------------------------------------------------

        patient_result = connection.execute(
            text("""
                SELECT
                    patient_id,
                    name
                FROM patients
                WHERE patient_id = :patient_id
            """),
            {
                "patient_id": request.patient_id
            }
        )

        patient = patient_result.fetchone()

        if patient is None:

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )

        # --------------------------------------------------
        # CHECK APPOINTMENT FOR NORMAL VISIT
        # --------------------------------------------------

        if request.encounter_type.lower() != "emergency":

            if request.appointment_id is not None:

                appointment_result = connection.execute(
                    text("""
                        SELECT
                            appointment_id,
                            patient_id,
                            doctor_id,
                            department_id,
                            status
                        FROM appointments
                        WHERE appointment_id = :appointment_id
                          AND patient_id = :patient_id
                    """),
                    {
                        "appointment_id": request.appointment_id,
                        "patient_id": request.patient_id
                    }
                )

                appointment = appointment_result.fetchone()

                if appointment is None:

                    raise HTTPException(
                        status_code=404,
                        detail="Appointment not found for this patient"
                    )

                appointment = appointment._mapping

                if appointment["status"] not in [
                    "Scheduled",
                    "Confirmed"
                ]:

                    raise HTTPException(
                        status_code=400,
                        detail="Appointment is not available for encounter creation"
                    )

                # Use appointment doctor and department
                if request.doctor_id is None:

                    request.doctor_id = appointment["doctor_id"]

                if request.department_id is None:

                    request.department_id = appointment["department_id"]

        # --------------------------------------------------
        # CHECK DEPARTMENT
        # --------------------------------------------------

        if request.department_id is not None:

            department_result = connection.execute(
                text("""
                    SELECT
                        department_id,
                        department_name
                    FROM departments
                    WHERE department_id = :department_id
                """),
                {
                    "department_id": request.department_id
                }
            )

            department = department_result.fetchone()

            if department is None:

                raise HTTPException(
                    status_code=404,
                    detail="Department not found"
                )

        # --------------------------------------------------
        # CHECK DOCTOR
        # --------------------------------------------------

        if request.doctor_id is not None:

            if request.department_id is not None:

                doctor_result = connection.execute(
                    text("""
                        SELECT
                            doctor_id,
                            name,
                            department_id
                        FROM doctors
                        WHERE doctor_id = :doctor_id
                          AND department_id = :department_id
                    """),
                    {
                        "doctor_id": request.doctor_id,
                        "department_id": request.department_id
                    }
                )

            else:

                doctor_result = connection.execute(
                    text("""
                        SELECT
                            doctor_id,
                            name,
                            department_id
                        FROM doctors
                        WHERE doctor_id = :doctor_id
                    """),
                    {
                        "doctor_id": request.doctor_id
                    }
                )

            doctor = doctor_result.fetchone()

            if doctor is None:

                raise HTTPException(
                    status_code=400,
                    detail="Selected doctor is invalid"
                )

        # --------------------------------------------------
        # CREATE ENCOUNTER
        # --------------------------------------------------

        result = connection.execute(
            text("""
                INSERT INTO encounters
                (
                    patient_id,
                    doctor_id,
                    department_id,
                    encounter_type,
                    visit_date,
                    status,
                    chief_complaint,
                    notes
                )
                VALUES
                (
                    :patient_id,
                    :doctor_id,
                    :department_id,
                    :encounter_type,
                    CURRENT_TIMESTAMP,
                    'Open',
                    :chief_complaint,
                    :notes
                )
                RETURNING encounter_id
            """),
            {
                "patient_id": request.patient_id,
                "doctor_id": request.doctor_id,
                "department_id": request.department_id,
                "encounter_type": request.encounter_type,
                "chief_complaint": request.chief_complaint,
                "notes": request.notes
            }
        )

        encounter_id = result.scalar_one()

        # --------------------------------------------------
        # MARK APPOINTMENT AS COMPLETED/USED
        # --------------------------------------------------

        if request.appointment_id is not None:

            connection.execute(
                text("""
                    UPDATE appointments
                    SET status = 'Completed'
                    WHERE appointment_id = :appointment_id
                """),
                {
                    "appointment_id": request.appointment_id
                }
            )

        connection.commit()

        return {
            "message": "Encounter created successfully",
            "encounter_id": encounter_id,
            "patient_id": request.patient_id,
            "doctor_id": request.doctor_id,
            "department_id": request.department_id,
            "encounter_type": request.encounter_type,
            "status": "Open"
        }


# ==================================================
# SYMPTOM REQUEST MODEL
# ==================================================

class SymptomRequest(BaseModel):

    symptom_name: str
    severity: Optional[str] = None
    duration: Optional[str] = None


# ==================================================
# ADD SYMPTOM
# ==================================================

@app.post("/encounters/{encounter_id}/symptoms")
def add_symptom(
    encounter_id: int,
    request: SymptomRequest
):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CHECK ENCOUNTER
        # --------------------------------------------------

        encounter_result = connection.execute(
            text("""
                SELECT
                    encounter_id
                FROM encounters
                WHERE encounter_id = :encounter_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        encounter = encounter_result.fetchone()

        if encounter is None:

            raise HTTPException(
                status_code=404,
                detail="Encounter not found"
            )

        # --------------------------------------------------
        # INSERT SYMPTOM
        # --------------------------------------------------

        result = connection.execute(
            text("""
                INSERT INTO symptoms
                (
                    encounter_id,
                    symptom_name,
                    severity,
                    duration
                )
                VALUES
                (
                    :encounter_id,
                    :symptom_name,
                    :severity,
                    :duration
                )
                RETURNING symptom_id
            """),
            {
                "encounter_id": encounter_id,
                "symptom_name": request.symptom_name,
                "severity": request.severity,
                "duration": request.duration
            }
        )

        symptom_id = result.scalar_one()

        connection.commit()

        return {
            "message": "Symptom added successfully",
            "symptom_id": symptom_id,
            "encounter_id": encounter_id,
            "symptom_name": request.symptom_name
        }


# ==================================================
# VITAL SIGNS REQUEST MODEL
# ==================================================

class VitalSignsRequest(BaseModel):

    heart_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    temperature: Optional[float] = None
    oxygen_saturation: Optional[float] = None
    respiratory_rate: Optional[int] = None


# ==================================================
# ADD VITAL SIGNS
# ==================================================

@app.post("/encounters/{encounter_id}/vitals")
def add_vital_signs(
    encounter_id: int,
    request: VitalSignsRequest
):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CHECK ENCOUNTER
        # --------------------------------------------------

        encounter_result = connection.execute(
            text("""
                SELECT
                    encounter_id
                FROM encounters
                WHERE encounter_id = :encounter_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        encounter = encounter_result.fetchone()

        if encounter is None:

            raise HTTPException(
                status_code=404,
                detail="Encounter not found"
            )

        # --------------------------------------------------
        # INSERT VITAL SIGNS
        # --------------------------------------------------

        result = connection.execute(
            text("""
                INSERT INTO vital_signs
                (
                    encounter_id,
                    heart_rate,
                    systolic_bp,
                    diastolic_bp,
                    temperature,
                    oxygen_saturation,
                    respiratory_rate,
                    recorded_at
                )
                VALUES
                (
                    :encounter_id,
                    :heart_rate,
                    :systolic_bp,
                    :diastolic_bp,
                    :temperature,
                    :oxygen_saturation,
                    :respiratory_rate,
                    CURRENT_TIMESTAMP
                )
                RETURNING vital_id
            """),
            {
                "encounter_id": encounter_id,
                "heart_rate": request.heart_rate,
                "systolic_bp": request.systolic_bp,
                "diastolic_bp": request.diastolic_bp,
                "temperature": request.temperature,
                "oxygen_saturation": request.oxygen_saturation,
                "respiratory_rate": request.respiratory_rate
            }
        )

        vital_id = result.scalar_one()

        connection.commit()

        return {
            "message": "Vital signs recorded successfully",
            "vital_id": vital_id,
            "encounter_id": encounter_id
        }


# ==================================================
# AI ASSESSMENT HELPER
# ==================================================

def calculate_ai_assessment(
    connection,
    encounter_id: int
):

    # --------------------------------------------------
    # GET ENCOUNTER + VITALS
    # --------------------------------------------------

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

            ORDER BY
                v.recorded_at DESC NULLS LAST,
                v.vital_id DESC

            LIMIT 1
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

    # --------------------------------------------------
    # GET SYMPTOMS
    # --------------------------------------------------

    symptom_result = connection.execute(
        text("""
            SELECT
                symptom_name,
                severity,
                duration
            FROM symptoms
            WHERE encounter_id = :encounter_id
        """),
        {
            "encounter_id": encounter_id
        }
    )

    symptoms = [
        dict(row._mapping)
        for row in symptom_result
    ]

    # --------------------------------------------------
    # RISK CALCULATION
    # --------------------------------------------------

    risk_score = 0
    reasons = []

    heart_rate = data["heart_rate"]
    systolic_bp = data["systolic_bp"]
    oxygen = data["oxygen_saturation"]
    respiratory_rate = data["respiratory_rate"]
    temperature = data["temperature"]

    # --------------------------------------------------
    # 1. VITALS SCORING
    # --------------------------------------------------

    # Heart Rate
    if heart_rate is not None:
        if heart_rate >= 120:
            risk_score += 20
            reasons.append("Very high heart rate (>= 120 bpm)")
        elif heart_rate >= 100:
            risk_score += 10
            reasons.append("Elevated heart rate (100-119 bpm)")
        elif heart_rate < 55:
            risk_score += 10
            reasons.append("Low heart rate (< 55 bpm)")

    # Blood Pressure (Systolic)
    if systolic_bp is not None:
        if systolic_bp < 90:
            risk_score += 20
            reasons.append("Low systolic blood pressure (< 90 mmHg)")
        elif systolic_bp >= 160:
            risk_score += 20
            reasons.append("Stage 2 hypertension (>= 160 mmHg)")
        elif systolic_bp >= 140:
            risk_score += 10
            reasons.append("High systolic blood pressure (140-159 mmHg)")

    # Oxygen Saturation (SpO2)
    if oxygen is not None:
        if oxygen < 90:
            risk_score += 30
            reasons.append("Very low oxygen saturation (< 90%)")
        elif oxygen < 94:
            risk_score += 15
            reasons.append("Low oxygen saturation (90-93%)")
        elif oxygen < 96:
            risk_score += 5
            reasons.append("Borderline oxygen saturation (94-95%)")

    # Respiratory Rate
    if respiratory_rate is not None:
        if respiratory_rate >= 25:
            risk_score += 20
            reasons.append("High respiratory rate (>= 25 bpm)")
        elif respiratory_rate >= 20:
            risk_score += 10
            reasons.append("Elevated respiratory rate (20-24 bpm)")
        elif respiratory_rate < 12:
            risk_score += 10
            reasons.append("Low respiratory rate (< 12 bpm)")

    # Temperature
    if temperature is not None:
        temp_val = float(temperature)
        if temp_val >= 39.0:
            risk_score += 15
            reasons.append(f"High fever ({temp_val}°C)")
        elif temp_val >= 38.0:
            risk_score += 10
            reasons.append(f"Fever ({temp_val}°C)")
        elif temp_val >= 37.5:
            risk_score += 5
            reasons.append(f"Low-grade fever ({temp_val}°C)")

    # --------------------------------------------------
    # 2. SYMPTOMS & SEVERITY SCORING
    # --------------------------------------------------

    chief_complaint = (data["chief_complaint"] or "").lower()

    for symptom in symptoms:
        symptom_name = (symptom.get("symptom_name") or "").lower()
        severity = (symptom.get("severity") or "").lower()
        duration = (symptom.get("duration") or "").lower()

        # Severity Weighting
        if severity == "severe":
            risk_score += 20
            reasons.append(f"Severe intensity: {symptom.get('symptom_name')}")
        elif severity == "moderate":
            risk_score += 10
            reasons.append(f"Moderate intensity: {symptom.get('symptom_name')}")
        elif severity == "mild":
            risk_score += 5
            reasons.append(f"Mild intensity: {symptom.get('symptom_name')}")

        # Duration Weighting (Long-standing/persistent symptoms)
        if "week" in duration or "month" in duration or "chronic" in duration or "persistent" in duration:
            risk_score += 5
            reasons.append(f"Persistent duration ({symptom.get('duration')})")

        # Category Specific Keyword Matching
        matched_category = False
        if "chest" in symptom_name:
            risk_score += 25
            reasons.append("Chest pain / Cardiovascular symptom")
            matched_category = True
        if "breath" in symptom_name or "dyspnea" in symptom_name or "shortness" in symptom_name:
            risk_score += 25
            reasons.append("Respiratory distress / Breathlessness")
            matched_category = True
        if "seizure" in symptom_name or "stroke" in symptom_name or "paralysis" in symptom_name or "unconscious" in symptom_name:
            risk_score += 25
            reasons.append("Acute neurological symptom")
            matched_category = True

        # Moderate Risk Symptoms
        if "headache" in symptom_name or "migraine" in symptom_name:
            risk_score += 15
            reasons.append("Headache / Migraine presentation")
            matched_category = True
        if "dizziness" in symptom_name or "vertigo" in symptom_name or "lightheaded" in symptom_name:
            risk_score += 15
            reasons.append("Dizziness / Balance symptom")
            matched_category = True
        if "abdominal" in symptom_name or "stomach" in symptom_name or "belly" in symptom_name:
            risk_score += 15
            reasons.append("Abdominal discomfort")
            matched_category = True
        if "vomit" in symptom_name or "nausea" in symptom_name:
            risk_score += 10
            reasons.append("Gastrointestinal symptom")
            matched_category = True
        if "fever" in symptom_name and "high fever" not in [r.lower() for r in reasons]:
            risk_score += 10
            reasons.append("Febrile illness symptom")
            matched_category = True
        if "cough" in symptom_name:
            risk_score += 10
            reasons.append("Respiratory cough")
            matched_category = True

        # Mild / Localized Symptoms
        if "knee" in symptom_name or "joint" in symptom_name or "back" in symptom_name or "muscle" in symptom_name or "leg" in symptom_name or "arm" in symptom_name:
            risk_score += 10
            reasons.append("Musculoskeletal / Joint pain")
            matched_category = True
        if "fatigue" in symptom_name or "weakness" in symptom_name or "lethargy" in symptom_name:
            risk_score += 10
            reasons.append("Systemic fatigue / Weakness")
            matched_category = True
        if "rash" in symptom_name or "skin" in symptom_name:
            risk_score += 5
            reasons.append("Dermatological symptom")
            matched_category = True

        if not matched_category:
            risk_score += 5
            reasons.append(f"Clinical symptom: {symptom.get('symptom_name')}")

    # Fallback to Chief Complaint if no symptoms in symptoms table
    if not symptoms and chief_complaint:
        if "chest" in chief_complaint or "breath" in chief_complaint:
            risk_score += 25
            reasons.append(f"Chief complaint: {data['chief_complaint']}")
        elif "headache" in chief_complaint or "fever" in chief_complaint or "pain" in chief_complaint:
            risk_score += 15
            reasons.append(f"Chief complaint: {data['chief_complaint']}")
        else:
            risk_score += 10
            reasons.append(f"Chief complaint: {data['chief_complaint']}")

    # Encounter Type Triage Boost
    enc_type = (data["encounter_type"] or "").lower()
    if enc_type == "emergency":
        risk_score += 10
        reasons.append("Emergency triage designation")

    # Limit Risk Score to 100
    risk_score = min(risk_score, 100)

    # Risk Level Categorization
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Priority Score & Level Calculation
    priority_score = risk_score
    if enc_type == "emergency":
        priority_score = min(priority_score + 15, 100)

    if priority_score >= 85:
        priority_level = "Critical"
    elif priority_score >= 70:
        priority_level = "High"
    elif priority_score >= 40:
        priority_level = "Medium"
    else:
        priority_level = "Low"

    # --------------------------------------------------
    # EXPLANATION & RECOMMENDATIONS
    # --------------------------------------------------

    if reasons:
        explanation = (
            "Risk assessment based on: "
            + ", ".join(reasons)
            + ". This assessment is decision support "
            + "and should be reviewed by a doctor."
        )
    else:
        explanation = (
            "No major abnormal clinical indicators "
            "were detected in the available data. "
            "This assessment is decision support "
            "and should be reviewed by a doctor."
        )

    all_symptom_text = " ".join([
        (s.get("symptom_name") or "").lower() for s in symptoms
    ]) + " " + chief_complaint

    if "chest" in all_symptom_text or "breath" in all_symptom_text or risk_level in ["High", "Critical"] or priority_level == "Critical":
        causes = "Elevated cardiovascular or respiratory risk profile requiring close clinical observation and urgent triage evaluation."
        precautions = [
            "Continuous vital signs and pulse oximetry monitoring",
            "Immediate physician evaluation and diagnostic workup if indicated",
            "Keep emergency resuscitation equipment accessible"
        ]
        food_diet = [
            "NPO (nothing by mouth) pending physician evaluation if acute intervention is required",
            "Low sodium diet upon clinical stabilization"
        ]
        medication_recommendation = {
            "medicine_name": "Aspirin",
            "dosage": "75mg",
            "frequency": "Once daily",
            "duration": "5 days",
            "instructions": "Take under direct medical supervision following clinical evaluation.",
            "reason": "Indicated for acute risk management pending senior physician assessment."
        }
    elif "headache" in all_symptom_text or "migraine" in all_symptom_text:
        causes = "Cephalgia / Headache presentation evaluated with recorded vital signs. Absence of acute red flags."
        precautions = [
            "Monitor symptom progression over the next 24-48 hours",
            "Maintain adequate rest and minimize mental strain or screen time",
            "Seek medical evaluation if severe headache, fever, or vision changes occur"
        ]
        food_diet = [
            "Maintain adequate oral hydration (2-3 Liters of water daily)",
            "Eat balanced meals at regular intervals to prevent hypoglycemia-triggered headache",
            "Avoid excess caffeine, alcohol, and processed foods"
        ]
        medication_recommendation = {
            "medicine_name": "Paracetamol",
            "dosage": "500mg",
            "frequency": "Twice daily",
            "duration": "3 days",
            "instructions": "Take after meals with water as needed for headache relief.",
            "reason": "Indicated for headache relief in stable outpatient context."
        }
    elif "fever" in all_symptom_text:
        causes = "Febrile presentation evaluated with recorded body temperature and systemic symptoms."
        precautions = [
            "Regular body temperature tracking every 4-6 hours",
            "Ensure adequate hydration and fluid intake",
            "Seek immediate care if temperature exceeds 39°C or chills develop"
        ]
        food_diet = [
            "Increase fluid intake (water, clear broths, electrolyte solutions)",
            "Light, easily digestible meals"
        ]
        medication_recommendation = {
            "medicine_name": "Paracetamol",
            "dosage": "500mg",
            "frequency": "Three times daily",
            "duration": "3 days",
            "instructions": "Take after food as needed for fever control.",
            "reason": "Antipyretic therapy for febrile presentation."
        }
    elif "knee" in all_symptom_text or "joint" in all_symptom_text or "back" in all_symptom_text or "pain" in all_symptom_text:
        causes = "Localized musculoskeletal / joint pain presentation with stable systemic vitals."
        precautions = [
            "Avoid heavy strain or strenuous physical load on affected area",
            "Apply local warm/cold compress as tolerated",
            "Consult orthopedic or physical therapy if pain persists"
        ]
        food_diet = [
            "Anti-inflammatory diet rich in omega-3 fatty acids and fresh vegetables",
            "Adequate fluid hydration"
        ]
        medication_recommendation = {
            "medicine_name": "Ibuprofen",
            "dosage": "400mg",
            "frequency": "Twice daily",
            "duration": "3 days",
            "instructions": "Take strictly after meals with water.",
            "reason": "Analgesic and anti-inflammatory relief for musculoskeletal discomfort."
        }
    else:
        causes = "General outpatient clinical presentation evaluated based on recorded vitals and reported symptoms."
        precautions = [
            "Routine outpatient monitoring and follow-up",
            "Report any new or worsening symptoms promptly to the attending physician"
        ]
        food_diet = [
            "Maintain balanced dietary intake and adequate fluid hydration",
            "Follow general wellness guidelines"
        ]
        medication_recommendation = {
            "medicine_name": "Multivitamin Supplement",
            "dosage": "1 Tablet",
            "frequency": "Once daily",
            "duration": "7 days",
            "instructions": "Take after breakfast with water.",
            "reason": "General supportive therapy for stable outpatient presentation."
        }

    return {
        "patient_id": data["patient_id"],
        "risk_score": risk_score,
        "risk_level": risk_level,
        "priority_score": priority_score,
        "priority_level": priority_level,
        "explanation": explanation,
        "causes": causes,
        "precautions": precautions,
        "food_diet": food_diet,
        "medication_recommendation": medication_recommendation
    }


# ==================================================
# AI RISK & EMERGENCY PRIORITY ASSESSMENT
# ==================================================

@app.get("/ai-assessment/{encounter_id}")
def ai_assessment(encounter_id: int):

    with engine.connect() as connection:

        # --------------------------------------------------
        # FIRST CHECK EXISTING ASSESSMENT
        # --------------------------------------------------

        existing_result = connection.execute(
            text("""
                SELECT
                    assessment_id,
                    encounter_id,
                    risk_score,
                    risk_level,
                    priority_score,
                    priority_level,
                    explanation,
                    model_name,
                    model_version,
                    created_at
                FROM ai_assessments
                WHERE encounter_id = :encounter_id
                ORDER BY
                    created_at DESC,
                    assessment_id DESC
                LIMIT 1
            """),
            {
                "encounter_id": encounter_id
            }
        )

        existing = existing_result.fetchone()

        if existing is not None:

            existing = existing._mapping

            # Get patient ID
            encounter_result = connection.execute(
                text("""
                    SELECT patient_id
                    FROM encounters
                    WHERE encounter_id = :encounter_id
                """),
                {
                    "encounter_id": encounter_id
                }
            )

            encounter = encounter_result.fetchone()

            if encounter is None:

                raise HTTPException(
                    status_code=404,
                    detail="Encounter not found"
                )

            calc = calculate_ai_assessment(connection, encounter_id)
            return {
                "assessment_id": existing["assessment_id"],
                "encounter_id": existing["encounter_id"],
                "patient_id": encounter._mapping["patient_id"],
                "risk_score": existing["risk_score"],
                "risk_level": existing["risk_level"],
                "priority_score": existing["priority_score"],
                "priority_level": existing["priority_level"],
                "explanation": existing["explanation"],
                "causes": calc.get("causes"),
                "precautions": calc.get("precautions"),
                "food_diet": calc.get("food_diet"),
                "medication_recommendation": calc.get("medication_recommendation"),
                "model_name": existing["model_name"],
                "model_version": existing["model_version"],
                "created_at": existing["created_at"]
            }

        # --------------------------------------------------
        # CALCULATE NEW ASSESSMENT
        # --------------------------------------------------

        assessment = calculate_ai_assessment(
            connection,
            encounter_id
        )

        # --------------------------------------------------
        # SAVE ASSESSMENT
        # --------------------------------------------------

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
                    model_version,
                    created_at
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
                    :model_version,
                    CURRENT_TIMESTAMP
                )
                RETURNING
                    assessment_id,
                    created_at
            """),
            {
                "encounter_id": encounter_id,
                "risk_score": assessment["risk_score"],
                "risk_level": assessment["risk_level"],
                "priority_score": assessment["priority_score"],
                "priority_level": assessment["priority_level"],
                "explanation": assessment["explanation"],
                "model_name": "Healthcare Risk Priority Model",
                "model_version": "1.0"
            }
        )

        inserted = insert_result.fetchone()

        connection.commit()

        return {
            "assessment_id": inserted._mapping["assessment_id"],
            "encounter_id": encounter_id,
            "patient_id": assessment["patient_id"],
            "risk_score": assessment["risk_score"],
            "risk_level": assessment["risk_level"],
            "priority_score": assessment["priority_score"],
            "priority_level": assessment["priority_level"],
            "explanation": assessment["explanation"],
            "causes": assessment.get("causes"),
            "precautions": assessment.get("precautions"),
            "food_diet": assessment.get("food_diet"),
            "medication_recommendation": assessment.get("medication_recommendation"),
            "model_name": "Healthcare Risk Priority Model",
            "model_version": "1.0",
            "created_at": inserted._mapping["created_at"]
        }


# ==================================================
# REFRESH / RE-RUN AI ASSESSMENT
# ==================================================

@app.post("/ai-assessment/{encounter_id}")
def refresh_ai_assessment(encounter_id: int):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CALCULATE NEW ASSESSMENT
        # --------------------------------------------------

        assessment = calculate_ai_assessment(
            connection,
            encounter_id
        )

        # --------------------------------------------------
        # SAVE NEW ASSESSMENT
        # --------------------------------------------------

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
                    model_version,
                    created_at
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
                    :model_version,
                    CURRENT_TIMESTAMP
                )
                RETURNING
                    assessment_id,
                    created_at
            """),
            {
                "encounter_id": encounter_id,
                "risk_score": assessment["risk_score"],
                "risk_level": assessment["risk_level"],
                "priority_score": assessment["priority_score"],
                "priority_level": assessment["priority_level"],
                "explanation": assessment["explanation"],
                "model_name": "Healthcare Risk Priority Model",
                "model_version": "1.0"
            }
        )

        inserted = insert_result.fetchone()

        connection.commit()

        return {
            "message": "AI assessment completed successfully",
            "assessment_id": inserted._mapping["assessment_id"],
            "encounter_id": encounter_id,
            "patient_id": assessment["patient_id"],
            "risk_score": assessment["risk_score"],
            "risk_level": assessment["risk_level"],
            "priority_score": assessment["priority_score"],
            "priority_level": assessment["priority_level"],
            "explanation": assessment["explanation"],
            "causes": assessment.get("causes"),
            "precautions": assessment.get("precautions"),
            "food_diet": assessment.get("food_diet"),
            "medication_recommendation": assessment.get("medication_recommendation"),
            "model_name": "Healthcare Risk Priority Model",
            "model_version": "1.0",
            "created_at": inserted._mapping["created_at"]
        }


# ==================================================
# DEPARTMENTS
# ==================================================

@app.get("/departments")
def get_departments():

    with engine.connect() as connection:

        result = connection.execute(
            text("""
                SELECT
                    d.department_id,
                    d.department_name,
                    d.location,
                    COUNT(dr.doctor_id) AS doctor_count
                FROM departments d
                LEFT JOIN doctors dr
                    ON d.department_id = dr.department_id
                GROUP BY
                    d.department_id,
                    d.department_name,
                    d.location
                ORDER BY d.department_id
            """)
        )

        return [
            dict(row._mapping)
            for row in result
        ]


# ==================================================
# DOCTORS BY DEPARTMENT
# ==================================================

@app.get("/departments/{department_id}/doctors")
def get_doctors_by_department(department_id: int):

    with engine.connect() as connection:

        department_result = connection.execute(
            text("""
                SELECT
                    department_id,
                    department_name
                FROM departments
                WHERE department_id = :department_id
            """),
            {
                "department_id": department_id
            }
        )

        department = department_result.fetchone()

        if department is None:

            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )

        department = department._mapping

        result = connection.execute(
            text("""
                SELECT
                    doctor_id,
                    name,
                    specialization,
                    department_id,
                    phone,
                    email,
                    license_number
                FROM doctors
                WHERE department_id = :department_id
                ORDER BY name
            """),
            {
                "department_id": department_id
            }
        )

        doctors = [
            dict(row._mapping)
            for row in result
        ]

        return {
            "department_id": department["department_id"],
            "department_name": department["department_name"],
            "doctor_count": len(doctors),
            "doctors": doctors
        }


# ==================================================
# APPOINTMENT REQUEST MODEL
# ==================================================

class AppointmentRequest(BaseModel):

    patient_id: int
    doctor_id: int
    department_id: int
    appointment_date: date
    appointment_time: time
    reason: str


# ==================================================
# CREATE APPOINTMENT
# ==================================================

@app.post("/appointments")
def create_appointment(request: AppointmentRequest):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CHECK PATIENT
        # --------------------------------------------------

        patient_result = connection.execute(
            text("""
                SELECT
                    patient_id,
                    name
                FROM patients
                WHERE patient_id = :patient_id
            """),
            {
                "patient_id": request.patient_id
            }
        )

        patient = patient_result.fetchone()

        if patient is None:

            raise HTTPException(
                status_code=404,
                detail="Patient not found"
            )

        # --------------------------------------------------
        # CHECK DEPARTMENT
        # --------------------------------------------------

        department_result = connection.execute(
            text("""
                SELECT
                    department_id,
                    department_name
                FROM departments
                WHERE department_id = :department_id
            """),
            {
                "department_id": request.department_id
            }
        )

        department = department_result.fetchone()

        if department is None:

            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )

        # --------------------------------------------------
        # CHECK DOCTOR BELONGS TO DEPARTMENT
        # --------------------------------------------------

        doctor_result = connection.execute(
            text("""
                SELECT
                    doctor_id,
                    name,
                    specialization,
                    department_id
                FROM doctors
                WHERE doctor_id = :doctor_id
                  AND department_id = :department_id
            """),
            {
                "doctor_id": request.doctor_id,
                "department_id": request.department_id
            }
        )

        doctor = doctor_result.fetchone()

        if doctor is None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Selected doctor does not belong "
                    "to the selected department"
                )
            )

        # --------------------------------------------------
        # CREATE APPOINTMENT
        # --------------------------------------------------

        result = connection.execute(
            text("""
                INSERT INTO appointments
                (
                    patient_id,
                    doctor_id,
                    department_id,
                    appointment_date,
                    appointment_time,
                    reason,
                    status
                )
                VALUES
                (
                    :patient_id,
                    :doctor_id,
                    :department_id,
                    :appointment_date,
                    :appointment_time,
                    :reason,
                    'Scheduled'
                )
                RETURNING appointment_id
            """),
            {
                "patient_id": request.patient_id,
                "doctor_id": request.doctor_id,
                "department_id": request.department_id,
                "appointment_date": request.appointment_date,
                "appointment_time": request.appointment_time,
                "reason": request.reason
            }
        )

        appointment_id = result.scalar_one()

        connection.commit()

        return {
            "message": "Appointment created successfully",
            "appointment_id": appointment_id,
            "patient_id": request.patient_id,
            "doctor_id": request.doctor_id,
            "department_id": request.department_id,
            "status": "Scheduled"
        }


# ==================================================
# GET PATIENT APPOINTMENTS
# ==================================================

@app.get("/patients/{patient_id}/appointments")
def get_patient_appointments(patient_id: int):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CHECK PATIENT
        # --------------------------------------------------

        patient_result = connection.execute(
            text("""
                SELECT
                    patient_id
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

        # --------------------------------------------------
        # GET APPOINTMENTS
        # --------------------------------------------------

        result = connection.execute(
            text("""
                SELECT
                    a.appointment_id,
                    a.patient_id,
                    a.doctor_id,
                    d.name AS doctor_name,
                    d.specialization,
                    a.department_id,
                    dp.department_name,
                    a.appointment_date,
                    a.appointment_time,
                    a.reason,
                    a.status

                FROM appointments a

                JOIN doctors d
                    ON a.doctor_id = d.doctor_id

                JOIN departments dp
                    ON a.department_id = dp.department_id

                WHERE a.patient_id = :patient_id

                ORDER BY
                    a.appointment_date DESC,
                    a.appointment_time DESC
            """),
            {
                "patient_id": patient_id
            }
        )

        return [
            dict(row._mapping)
            for row in result
        ]


# ==================================================
# DOCTOR / DEPARTMENT ASSIGNMENT MODEL
# ==================================================

class AssignmentRequest(BaseModel):

    doctor_id: int
    department_id: int


# ==================================================
# ASSIGN DOCTOR + DEPARTMENT TO ENCOUNTER
# ==================================================

@app.put("/encounters/{encounter_id}/assignment")
def assign_doctor(
    encounter_id: int,
    request: AssignmentRequest
):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CHECK ENCOUNTER
        # --------------------------------------------------

        encounter_result = connection.execute(
            text("""
                SELECT
                    encounter_id
                FROM encounters
                WHERE encounter_id = :encounter_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        encounter = encounter_result.fetchone()

        if encounter is None:

            raise HTTPException(
                status_code=404,
                detail="Encounter not found"
            )

        # --------------------------------------------------
        # CHECK DEPARTMENT
        # --------------------------------------------------

        department_result = connection.execute(
            text("""
                SELECT
                    department_id,
                    department_name
                FROM departments
                WHERE department_id = :department_id
            """),
            {
                "department_id": request.department_id
            }
        )

        department = department_result.fetchone()

        if department is None:

            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )

        # --------------------------------------------------
        # CHECK DOCTOR
        # --------------------------------------------------

        doctor_result = connection.execute(
            text("""
                SELECT
                    doctor_id,
                    name,
                    specialization
                FROM doctors
                WHERE doctor_id = :doctor_id
                  AND department_id = :department_id
            """),
            {
                "doctor_id": request.doctor_id,
                "department_id": request.department_id
            }
        )

        doctor = doctor_result.fetchone()

        if doctor is None:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Doctor does not belong "
                    "to the selected department"
                )
            )

        # --------------------------------------------------
        # UPDATE ENCOUNTER
        # --------------------------------------------------

        connection.execute(
            text("""
                UPDATE encounters

                SET
                    doctor_id = :doctor_id,
                    department_id = :department_id

                WHERE encounter_id = :encounter_id
            """),
            {
                "doctor_id": request.doctor_id,
                "department_id": request.department_id,
                "encounter_id": encounter_id
            }
        )

        connection.commit()

        return {
            "message": "Doctor and department assigned successfully",
            "encounter_id": encounter_id,
            "doctor_id": request.doctor_id,
            "department_id": request.department_id,
            "doctor_name": doctor._mapping["name"],
            "specialization": doctor._mapping["specialization"]
        }


# ==================================================
# ENCOUNTER STATUS MODEL
# ==================================================

class EncounterStatusRequest(BaseModel):

    status: str
    notes: Optional[str] = None


# ==================================================
# UPDATE ENCOUNTER STATUS
# ==================================================

@app.patch("/encounters/{encounter_id}/status")
def update_encounter_status(
    encounter_id: int,
    request: EncounterStatusRequest
):

    allowed_statuses = [
        "Open",
        "Waiting",
        "In Treatment",
        "Completed",
        "Cancelled"
    ]

    if request.status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed values: "
                + ", ".join(allowed_statuses)
            )
        )

    with engine.connect() as connection:

        encounter_result = connection.execute(
            text("""
                SELECT
                    encounter_id,
                    notes
                FROM encounters
                WHERE encounter_id = :encounter_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        encounter = encounter_result.fetchone()

        if encounter is None:

            raise HTTPException(
                status_code=404,
                detail="Encounter not found"
            )

        existing_notes = encounter._mapping["notes"]

        updated_notes = request.notes

        if updated_notes is None:

            updated_notes = existing_notes

        connection.execute(
            text("""
                UPDATE encounters

                SET
                    status = :status,
                    notes = :notes

                WHERE encounter_id = :encounter_id
            """),
            {
                "status": request.status,
                "notes": updated_notes,
                "encounter_id": encounter_id
            }
        )

        connection.commit()

        return {
            "message": "Encounter status updated successfully",
            "encounter_id": encounter_id,
            "status": request.status
        }


# ==================================================
# PRESCRIPTION REQUEST MODEL
# ==================================================

class PrescriptionRequest(BaseModel):

    encounter_id: int
    doctor_id: int
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None


# ==================================================
# CREATE PRESCRIPTION
# ==================================================

@app.post("/prescriptions")
def create_prescription(
    request: PrescriptionRequest
):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CHECK ENCOUNTER
        # --------------------------------------------------

        encounter_result = connection.execute(
            text("""
                SELECT
                    encounter_id,
                    doctor_id,
                    department_id
                FROM encounters
                WHERE encounter_id = :encounter_id
            """),
            {
                "encounter_id": request.encounter_id
            }
        )

        encounter = encounter_result.fetchone()

        if encounter is None:

            raise HTTPException(
                status_code=404,
                detail="Encounter not found"
            )

        encounter = encounter._mapping

        # --------------------------------------------------
        # CHECK DOCTOR
        # --------------------------------------------------

        doctor_result = connection.execute(
            text("""
                SELECT
                    doctor_id,
                    name,
                    department_id
                FROM doctors
                WHERE doctor_id = :doctor_id
            """),
            {
                "doctor_id": request.doctor_id
            }
        )

        doctor = doctor_result.fetchone()

        if doctor is None:

            raise HTTPException(
                status_code=404,
                detail="Doctor not found"
            )

        doctor = doctor._mapping

        # --------------------------------------------------
        # DOCTOR MUST BE ASSIGNED TO ENCOUNTER
        # --------------------------------------------------

        if encounter["doctor_id"] is not None:

            if encounter["doctor_id"] != request.doctor_id:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Prescription doctor must match "
                        "the doctor assigned to the encounter"
                    )
                )

        # --------------------------------------------------
        # INSERT PRESCRIPTION
        # --------------------------------------------------

        result = connection.execute(
            text("""
                INSERT INTO prescriptions
                (
                    encounter_id,
                    doctor_id,
                    medicine_name,
                    dosage,
                    frequency,
                    duration,
                    instructions
                )
                VALUES
                (
                    :encounter_id,
                    :doctor_id,
                    :medicine_name,
                    :dosage,
                    :frequency,
                    :duration,
                    :instructions
                )
                RETURNING prescription_id
            """),
            {
                "encounter_id": request.encounter_id,
                "doctor_id": request.doctor_id,
                "medicine_name": request.medicine_name,
                "dosage": request.dosage,
                "frequency": request.frequency,
                "duration": request.duration,
                "instructions": request.instructions
            }
        )

        prescription_id = result.scalar_one()

        connection.commit()

        return {
            "message": "Prescription created successfully",
            "prescription_id": prescription_id,
            "encounter_id": request.encounter_id,
            "doctor_id": request.doctor_id,
            "doctor_name": doctor["name"],
            "medicine_name": request.medicine_name
        }


# ==================================================
# GET PRESCRIPTIONS FOR ENCOUNTER
# ==================================================

@app.get("/prescriptions/{encounter_id}")
def get_prescription(encounter_id: int):

    with engine.connect() as connection:

        # --------------------------------------------------
        # CHECK ENCOUNTER
        # --------------------------------------------------

        encounter_result = connection.execute(
            text("""
                SELECT
                    encounter_id,
                    patient_id
                FROM encounters
                WHERE encounter_id = :encounter_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        encounter = encounter_result.fetchone()

        if encounter is None:

            raise HTTPException(
                status_code=404,
                detail="Encounter not found"
            )

        # --------------------------------------------------
        # GET LATEST AI ASSESSMENT
        # --------------------------------------------------

        assessment_result = connection.execute(
            text("""
                SELECT
                    assessment_id,
                    encounter_id,
                    risk_score,
                    risk_level,
                    priority_score,
                    priority_level,
                    explanation

                FROM ai_assessments

                WHERE encounter_id = :encounter_id

                ORDER BY
                    created_at DESC,
                    assessment_id DESC

                LIMIT 1
            """),
            {
                "encounter_id": encounter_id
            }
        )

        assessment = assessment_result.fetchone()

        # --------------------------------------------------
        # GET PRESCRIPTIONS
        # --------------------------------------------------

        result = connection.execute(
            text("""
                SELECT
                    p.prescription_id,
                    p.encounter_id,
                    p.doctor_id,
                    d.name AS doctor_name,
                    p.medicine_name,
                    p.dosage,
                    p.frequency,
                    p.duration,
                    p.instructions

                FROM prescriptions p

                LEFT JOIN doctors d
                    ON p.doctor_id = d.doctor_id

                WHERE p.encounter_id = :encounter_id

                ORDER BY p.prescription_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        prescriptions = [
            dict(row._mapping)
            for row in result
        ]

        response = {
            "encounter_id": encounter_id,
            "prescription_allowed": True,
            "prescriptions": prescriptions
        }

        # --------------------------------------------------
        # ADD AI DATA IF AVAILABLE
        # --------------------------------------------------

        if assessment is not None:

            assessment = assessment._mapping

            response.update({
                "risk_score": assessment["risk_score"],
                "risk_level": assessment["risk_level"],
                "priority_score": assessment["priority_score"],
                "priority_level": assessment["priority_level"],
                "explanation": assessment["explanation"]
            })

        else:

            response.update({
                "risk_score": None,
                "risk_level": None,
                "priority_score": None,
                "priority_level": None,
                "explanation": None
            })

        return response


# ==================================================
# COMPLETE PATIENT WORKFLOW
# ==================================================

@app.get("/patient-workflow/{encounter_id}")
def patient_workflow(encounter_id: int):

    with engine.connect() as connection:

        # --------------------------------------------------
        # GET ENCOUNTER
        # --------------------------------------------------

        result = connection.execute(
            text("""
                SELECT
                    e.encounter_id,
                    e.patient_id,
                    p.name AS patient_name,
                    e.doctor_id,
                    d.name AS doctor_name,
                    e.department_id,
                    dp.department_name,
                    e.encounter_type,
                    e.chief_complaint,
                    e.status,
                    e.notes

                FROM encounters e

                JOIN patients p
                    ON e.patient_id = p.patient_id

                LEFT JOIN doctors d
                    ON e.doctor_id = d.doctor_id

                LEFT JOIN departments dp
                    ON e.department_id = dp.department_id

                WHERE e.encounter_id = :encounter_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        encounter = result.fetchone()

        if encounter is None:

            raise HTTPException(
                status_code=404,
                detail="Encounter not found"
            )

        encounter = encounter._mapping

        # --------------------------------------------------
        # GET LATEST AI ASSESSMENT
        # --------------------------------------------------

        assessment_result = connection.execute(
            text("""
                SELECT
                    assessment_id,
                    risk_score,
                    risk_level,
                    priority_score,
                    priority_level,
                    explanation,
                    created_at

                FROM ai_assessments

                WHERE encounter_id = :encounter_id

                ORDER BY
                    created_at DESC,
                    assessment_id DESC

                LIMIT 1
            """),
            {
                "encounter_id": encounter_id
            }
        )

        assessment = assessment_result.fetchone()

        # --------------------------------------------------
        # IF AI HAS NOT RUN YET
        # --------------------------------------------------

        if assessment is None:

            return {
                "patient_id": encounter["patient_id"],
                "patient_name": encounter["patient_name"],
                "encounter_id": encounter_id,
                "doctor_id": encounter["doctor_id"],
                "doctor_name": encounter["doctor_name"],
                "department_id": encounter["department_id"],
                "department_name": encounter["department_name"],
                "encounter_type": encounter["encounter_type"],
                "chief_complaint": encounter["chief_complaint"],
                "status": encounter["status"],
                "notes": encounter["notes"],
                "assessment_available": False,
                "message": (
                    "AI assessment must be completed "
                    "after symptoms and vital signs are recorded."
                )
            }

        assessment = assessment._mapping

        risk_level = assessment["risk_level"]
        priority_level = assessment["priority_level"]

        # --------------------------------------------------
        # DETERMINE WORKFLOW
        # --------------------------------------------------

        if (
            risk_level in ["Low", "Medium"]
            and priority_level not in ["High", "Critical"]
        ):

            workflow = "Appointment"
            appointment_required = True
            emergency = False
            treatment_type = "Normal treatment workflow"

        else:

            workflow = "Emergency"
            appointment_required = False
            emergency = True
            treatment_type = "Immediate doctor review and treatment"

        # --------------------------------------------------
        # GET PRESCRIPTIONS
        # --------------------------------------------------

        prescription_result = connection.execute(
            text("""
                SELECT
                    p.prescription_id,
                    p.doctor_id,
                    d.name AS doctor_name,
                    p.medicine_name,
                    p.dosage,
                    p.frequency,
                    p.duration,
                    p.instructions

                FROM prescriptions p

                LEFT JOIN doctors d
                    ON p.doctor_id = d.doctor_id

                WHERE p.encounter_id = :encounter_id

                ORDER BY p.prescription_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        prescriptions = [
            dict(row._mapping)
            for row in prescription_result
        ]

        # --------------------------------------------------
        # GET SYMPTOMS
        # --------------------------------------------------

        symptom_result = connection.execute(
            text("""
                SELECT
                    symptom_id,
                    symptom_name,
                    severity,
                    duration

                FROM symptoms

                WHERE encounter_id = :encounter_id

                ORDER BY symptom_id
            """),
            {
                "encounter_id": encounter_id
            }
        )

        symptoms = [
            dict(row._mapping)
            for row in symptom_result
        ]

        # --------------------------------------------------
        # GET VITALS
        # --------------------------------------------------

        vital_result = connection.execute(
            text("""
                SELECT
                    vital_id,
                    heart_rate,
                    systolic_bp,
                    diastolic_bp,
                    temperature,
                    oxygen_saturation,
                    respiratory_rate,
                    recorded_at

                FROM vital_signs

                WHERE encounter_id = :encounter_id

                ORDER BY
                    recorded_at DESC,
                    vital_id DESC
            """),
            {
                "encounter_id": encounter_id
            }
        )

        vitals = [
            dict(row._mapping)
            for row in vital_result
        ]

        return {
            "patient_id": encounter["patient_id"],
            "patient_name": encounter["patient_name"],

            "encounter_id": encounter_id,
            "encounter_type": encounter["encounter_type"],
            "chief_complaint": encounter["chief_complaint"],
            "status": encounter["status"],
            "notes": encounter["notes"],

            "doctor_id": encounter["doctor_id"],
            "doctor_name": encounter["doctor_name"],

            "department_id": encounter["department_id"],
            "department_name": encounter["department_name"],

            "assessment_available": True,

            "risk_score": assessment["risk_score"],
            "risk_level": risk_level,

            "priority_score": assessment["priority_score"],
            "priority_level": priority_level,

            "explanation": assessment["explanation"],

            "workflow": workflow,
            "appointment_required": appointment_required,
            "emergency": emergency,

            "treatment_type": treatment_type,

            "symptoms": symptoms,
            "vitals": vitals,
            "prescriptions": prescriptions
        }
