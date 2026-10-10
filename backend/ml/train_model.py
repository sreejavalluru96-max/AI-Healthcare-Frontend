import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==================================================
# TRAINING DATA
# ==================================================

data = {
    "heart_rate": [
        78, 102, 82, 128, 86,
        76, 80, 94, 135, 118,
        72, 110, 125, 88, 140,
        95, 82, 130, 115, 75
    ],

    "systolic_bp": [
        120, 110, 118, 88, 122,
        125, 118, 115, 85, 92,
        130, 105, 90, 120, 80,
        115, 125, 95, 100, 135
    ],

    "diastolic_bp": [
        80, 72, 76, 60, 80,
        82, 78, 75, 58, 62,
        85, 70, 65, 78, 55,
        75, 80, 60, 68, 88
    ],

    "temperature": [
        36.7, 38.6, 36.8, 37.2, 36.6,
        36.7, 36.5, 37.0, 39.2, 38.8,
        36.6, 37.9, 38.5, 36.9, 39.5,
        37.2, 36.8, 38.9, 37.8, 36.7
    ],

    "oxygen_saturation": [
        98, 96, 98, 89, 97,
        98, 99, 97, 86, 90,
        99, 94, 88, 98, 84,
        96, 99, 87, 92, 98
    ],

    "respiratory_rate": [
        16, 20, 17, 26, 18,
        16, 16, 19, 30, 25,
        15, 22, 27, 18, 32,
        20, 17, 29, 23, 16
    ],

    # 0 = normal/non-emergency
    # 1 = high-risk/emergency
    "high_risk": [
        0, 0, 0, 1, 0,
        0, 0, 0, 1, 1,
        0, 0, 1, 0, 1,
        0, 0, 1, 1, 0
    ]
}


# ==================================================
# CREATE DATAFRAME
# ==================================================

df = pd.DataFrame(data)

print("\nTraining Dataset:")
print(df)

print("\nDataset Shape:")
print(df.shape)


# ==================================================
# FEATURES AND TARGET
# ==================================================

X = df[
    [
        "heart_rate",
        "systolic_bp",
        "diastolic_bp",
        "temperature",
        "oxygen_saturation",
        "respiratory_rate"
    ]
]

y = df["high_risk"]


# ==================================================
# TRAIN / TEST SPLIT
# ==================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y
)


# ==================================================
# RANDOM FOREST MODEL
# ==================================================

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)


# ==================================================
# MODEL EVALUATION
# ==================================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("\nModel Accuracy:")
print(f"{accuracy * 100:.2f}%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)


# ==================================================
# SAVE MODEL
# ==================================================

model_path = "ml/risk_model.pkl"

joblib.dump(
    model,
    model_path
)

print("\nModel saved successfully!")
print(f"Model location: {model_path}")