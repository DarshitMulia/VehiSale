import os
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler, PolynomialFeatures

# Get the current directory of this script
current_dir = os.path.dirname(__file__)

# Define the absolute paths for the model, scaler, etc.
model_filename = os.path.join(current_dir, '..', 'models', 'random_forest_model.pkl')
columns_filename = os.path.join(current_dir, '..', 'models', 'train_columns.pkl')
scaler_filename = os.path.join(current_dir, '..', 'models', 'scaler.pkl')
poly_filename = os.path.join(current_dir, '..', 'models', 'poly_features.pkl')

# Load the saved model
with open(model_filename, 'rb') as model_file:
    model = pickle.load(model_file)

# Load the saved training columns
with open(columns_filename, 'rb') as columns_file:
    train_columns = pickle.load(columns_file)

# Load the scaler used during training
with open(scaler_filename, 'rb') as scaler_file:
    scaler = pickle.load(scaler_file)

# Load the PolynomialFeatures object used during training
with open(poly_filename, 'rb') as poly_file:
    poly = pickle.load(poly_file)

# Function to preprocess input features
def preprocess_input(input_data):
    """Preprocess the input data for prediction."""
    # Define categorical columns that were one-hot encoded
    categorical_cols = ['Name', 'Category', 'Company', 'Color', 'Transmission', 'FuelType']

    # Create a DataFrame for the input data
    df = pd.DataFrame([input_data])

    # One-hot encode the categorical columns based on your training data
    df_encoded = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

    # Scale the numerical features ('Year', 'Mileage') using the loaded scaler
    df_encoded[['Year', 'Mileage']] = scaler.transform(df_encoded[['Year', 'Mileage']])

    # Handle missing columns (if a category from training data is missing in user input)
    missing_cols = set(train_columns) - set(df_encoded.columns)
    for col in missing_cols:
        df_encoded[col] = 0

    # Ensure the DataFrame has the same structure as the training data
    df_encoded = df_encoded[train_columns]

    # Add polynomial features
    df_poly = poly.transform(df_encoded)

    return df_poly

# Input example (replace these values with actual user input)
user_input = {
    'Name': 'Maruti Suzuki',      # Example
    'Category': 'SUV',            # Example
    'Company': 'Maruti',          # Example
    'Year': 2018,                 # Example
    'Mileage': 20000,             # Example
    'Color': 'White',             # Example
    'Transmission': 'Manual',     # Example
    'FuelType': 'Petrol'          # Example
}

# Preprocess the user input
X_input = preprocess_input(user_input)

# Predict the car price using the loaded model
predicted_log_price = model.predict(X_input)

# Reverse the log transformation to get the actual price
predicted_price = np.expm1(predicted_log_price)

print("Predicted Car Price (INR):", predicted_price[0])




# import os
# import pickle
# import numpy as np
# import pandas as pd

# # Function to load the trained model pipeline (preprocessing + model)
# def load_model(model_path):
#     with open(model_path, 'rb') as file:
#         model_pipeline = pickle.load(file)  # Make sure this is a pipeline with preprocessing
#     return model_pipeline

# # Function to prepare user input
# def prepare_input(user_input):
#     """
#     user_input: dict containing car features
#     """
#     # Convert the input dictionary to a DataFrame
#     df = pd.DataFrame([user_input])
#     return df

# def main():
#     # Define the path to the trained model
#     model_path = 'D:/Vehisale/backend/AI/models/random_forest_model.pkl'

#     # Load the trained model pipeline
#     try:
#         model_pipeline = load_model(model_path)
#         print("Model loaded successfully.")
#     except Exception as e:
#         print(f"Error loading the model: {e}")
#         return

#     # Example user input
#     user_input = {
#         'Name': 'Swift',
#         'Category': 'Hatchback',
#         'Company': 'Maruti',
#         'Year': 2015,
#         'Mileage': 18,
#         'Color': 'White',
#         'Transmission': 'Manual',
#         'FuelType': 'Petrol',
#         'KMsDriven': 48406
#     }

#     # Prepare the input data
#     input_df = prepare_input(user_input)

#     # Predict the price
#     try:
#         predicted_price = model_pipeline.predict(input_df)  # The pipeline should handle all transformations
#         print(f"Predicted Car Price (INR): {predicted_price[0]:,.2f}")
#     except Exception as e:
#         print(f"Error during prediction: {e}")

# if __name__ == "__main__":
#     main()
