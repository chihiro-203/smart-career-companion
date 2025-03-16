# Backend with FastAPI & Google Gemini API

This project's backend is built with FastAPI and ultilizes Google Gemini's API to analyze CVs from users.

## Table of Contents

- [Backend with FastAPI \& Google Gemini API](#backend-with-fastapi--google-gemini-api)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [API Endpoint](#api-endpoint)

## Features

- **FastAPI Setup:** A minimal FastAPI application with basic routing.
- **CORS Configuration:** Preconfigured to allow requests from a local Next.js development environment (`http://localhost:3000`).
- **Google Gemini Integration:** Leverages the Google Gemini API to generate chatbot responses.

## Prerequisites

- **Python 3.10+**  
  Ensure you have Python version 3.10 or newer.
- **Pip:**  
  Python package installer.
- **Virtual Environment/Conda (Optional):**  
  It is recommended to use a virtual environment or Conda environment to manage dependencies.

## Installation

1. **Clone the Repository**

```bash
git clone https://github.com/chihiro-203/smart-career-companion.git
cd smart-career-companion
```

2. **Create and Activate a Virtual Environment**

Using venv:

```bash
# env is the environment name and can be changed
python3 -m venv env 
source env/bin/activate  # On Windows: env\Scripts\activate
```

Or using Conda :

```bash
conda create --name backend_fastapi python=3.10
conda activate backend_fastapi
```
To use conda environment, you need to install Anaconda first

3. **Install Required Libraries**

Install FastAPI with standard extras and the Google Gemini API client library:

```bash
pip install -r requirements.txt
```

4. **Configuration**

Before running the application, configure your Google API key. Create a .env file in the `./backend` folder and add your API key to it:

```plaintext
GOOGLE_API_KEY=your-api-key
```

5. **Running the backend**

Using the FastAPI CLI:

```bash
fastapi dev main.py
```

Note: If you encounter an error about the FastAPI command, ensure you are in the correct environment where fastapi[standard] is installed.

## API Endpoint

TODO
