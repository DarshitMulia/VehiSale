import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, KFold, cross_val_score
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

def load_data(file_path):
    """Load dataset from a CSV file."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"The file {file_path} does not exist.")
    data = pd.read_csv(file_path)
    return data

def preprocess_data(data):
    """Preprocess the dataset."""
    # Drop irrelevant or non-numeric columns
    data = data.drop('Name', axis=1)

    # Drop rows with missing values (if any)
    data = data.dropna()

    # Convert Year to age (if applicable)
    data['Age'] = 2024 - data['Year']
    data = data.drop('Year', axis=1)

    # Convert KMsDriven to numeric if it's not already
    data['KMsDriven'] = pd.to_numeric(data['KMsDriven'], errors='coerce')

    # Convert Mileage to numeric; handle potential string formats
    data['Mileage'] = data['Mileage'].astype(str).str.replace(' kmpl', '').astype(float)

    # Handle categorical variables
    categorical_cols = ['Category', 'Company', 'Color', 'Transmission', 'FuelType']
    data_encoded = pd.get_dummies(data, columns=categorical_cols, drop_first=True)

    # Extract features and target variable
    target = data_encoded['Price (INR)']
    features = data_encoded.drop('Price (INR)', axis=1)

    # Scale features
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    return pd.DataFrame(features_scaled, columns=features.columns), target, scaler

def create_pipeline():
    """Create a pipeline for RandomForestRegressor."""
    pipeline = Pipeline([
        ('model', RandomForestRegressor())
    ])
    return pipeline

def train_model(pipeline, X_train, y_train):
    """Train the Random Forest model."""
    param_grid = {
        'model__n_estimators': [100, 200, 300],
        'model__max_features': ['sqrt', 'log2'],
        'model__max_depth': [None, 10, 20],
        'model__min_samples_split': [2, 5],
    }
    
    grid_search = GridSearchCV(pipeline, param_grid, cv=KFold(n_splits=5, shuffle=True, random_state=42),
                               scoring='neg_mean_squared_error', n_jobs=-1)
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_
    return best_model

def evaluate_model(model, X_test, y_test):
    """Evaluate the model and return metrics."""
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    return mse, mae, r2, y_pred, y_test

def perform_cross_validation(model, X, y):
    """Perform cross-validation and return metrics."""
    cv_r2_scores = cross_val_score(model, X, y, cv=5, scoring='r2', n_jobs=-1)
    cv_mse_scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_squared_error', n_jobs=-1)
    cv_mae_scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_absolute_error', n_jobs=-1)

    return np.mean(cv_r2_scores), -np.mean(cv_mse_scores), -np.mean(cv_mae_scores)

def save_model_and_columns(model, X, model_path, columns_path, scaler):
    """Save the trained model and preprocessing objects."""
    joblib.dump(model, model_path)
    joblib.dump(scaler, 'D:/VehiSale/backend/AI/models/scaler.pkl')

    columns = X.columns.tolist()
    with open(columns_path, 'w') as f:
        for column in columns:
            f.write(f"{column}\n")

    print(f"Model and column names saved successfully.")

def main():
    data_file = 'D:/VehiSale/backend/AI/data/usedcar_data.csv'
    model_path = 'D:/VehiSale/backend/AI/models/random_forest_model.pkl'
    columns_path = 'D:/VehiSale/backend/AI/models/train_columns.pkl'

    data = load_data(data_file)

    target_column = 'Price (INR)'
    if target_column not in data.columns:
        raise KeyError(f"Target column '{target_column}' not found in the dataset.")

    data_encoded, target, scaler = preprocess_data(data)

    X = data_encoded
    y = target

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    pipeline = create_pipeline()
    best_model = train_model(pipeline, X_train, y_train)

    mse, mae, r2, y_pred, y_test_actual = evaluate_model(best_model, X_test, y_test)

    print("Random Forest Mean Squared Error:", mse)
    print("Random Forest Mean Absolute Error:", mae)
    print("R-squared:", r2)
    print("Sample Predictions:", y_pred[:5])
    print("Actual Prices:", y_test_actual[:5].values)

    cv_r2, cv_mse, cv_mae = perform_cross_validation(best_model, X, y)
    print("Cross-Validation R2:", cv_r2)
    print("Cross-Validation MSE:", cv_mse)
    print("Cross-Validation MAE:", cv_mae)

    save_model_and_columns(best_model, X, model_path, columns_path, scaler)

if __name__ == "__main__":
    main()
