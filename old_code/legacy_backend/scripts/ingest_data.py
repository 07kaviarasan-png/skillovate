import json
import os
import re
import sys
import requests # For fetching logos
import json5 # Import json5 library

from sqlalchemy.orm import Session

# Get the directory of the current script
print(f"Current working directory: {os.getcwd()}")
script_dir = os.path.dirname(os.path.abspath(__file__))
# Get the project root directory (two levels up from scripts/)
project_root = os.path.abspath(os.path.join(script_dir, '..', '..'))

# Add the backend directory to sys.path to allow 'app' to be imported as a package
sys.path.append(os.path.abspath(os.path.join(script_dir, '..')))

# Corrected imports for ingest_data.py
from app.database import SessionLocal, engine
from app import models
from app.models import Base, Question, MNC, JobRole, College
from app.repositories.question_repo import question_repo
from app.repositories.college_repo import college_repo
from app.repositories.batch_repo import batch_repo
from app.schemas import QuestionCreate, MNCCreate, JobRoleCreate, CollegeCreate

def create_question(db, obj_in): return question_repo.create(db, obj_in=obj_in)
def create_mnc(db, obj_in): 
    db_obj = models.MNC(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
def create_job_role(db, obj_in):
    db_obj = models.JobRole(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
def create_college(db, obj_in): return college_repo.create(db, obj_in=obj_in)


# Create database tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def extract_logo_url(html_img_tag):
    if not html_img_tag:
        return None
    # Try to match with double quotes first
    match = re.search(r'src="([^"]*)"', html_img_tag)
    if match:
        return match.group(1)
    # If not found, try with single quotes
    match = re.search(r"src='([^']*)'", html_img_tag)
    if match:
        return match.group(1)
    return None

def preprocess_js_string_to_json(js_string):
    # json5 handles unquoted keys, single quotes, and trailing commas.
    # It does NOT handle multi-line comments and backtick string literals as JSON strings natively.

    # Convert JS backtick strings to properly escaped JSON strings
    def _convert_backticks_to_json_string(match):
        content = match.group(1)
        # Escape any double quotes and backslashes within the content
        content = content.replace('\\', '\\\\').replace('"', '\\"')
        # Handle multi-line backticks by replacing newlines with \n
        content = content.replace('\n', '\\n')
        return f'"{content}"'
    
    # Corrected regex to match backtick strings with potential escaped characters
    js_string = re.sub(r'`((?:[^`\\]|\\.)*)`', _convert_backticks_to_json_string, js_string)

    # Remove multi-line comments (json5 handles single-line comments)
    js_string = re.sub(r'/\*.*?\*/', '', js_string, flags=re.DOTALL)
    
    return js_string

def ingest_data_from_js(db: Session, js_file_path: str):
    print(f"Ingesting data from {js_file_path}...")
    try:
        with open(js_file_path, 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {js_file_path} not found.")
        return

    # Ingest Qs data
    qs_match = re.search(r"const Qs = ({.*?});", content, re.DOTALL)
    if qs_match:
        qs_data_str = preprocess_js_string_to_json(qs_match.group(1))
        try:
            qs_data = json5.loads(qs_data_str) # Use json5.loads
            for category, questions in qs_data.items():
                for q_data in questions:
                    correct_answer = q_data['opts'][q_data['ans']]
                    question_data = QuestionCreate(
                        category=category,
                        question_text=q_data['q'],
                        options=q_data['opts'],
                        correct_answer=correct_answer,
                        explanation=q_data.get('exp'),
                        data_presentation=None
                    )
                    existing_q = db.query(Question).filter(
                        Question.category == category,
                        Question.question_text == q_data['q']
                    ).first()
                    if not existing_q:
                        create_question(db, question_data)
                    else:
                        print(f"Skipping duplicate question (Qs): {q_data['q'][:50]}...")
            print("Qs data ingested.")
        except (ValueError, json.JSONDecodeError) as e: # Catch ValueError for json5 errors
            print(f"Error parsing Qs JSON: {e}")
            print(f"Problematic string: {qs_data_str}")

    # Ingest MNCs data
    mncs_match = re.search(r"const MNCs = (\[.*?\]);", content, re.DOTALL)
    if mncs_match:
        mncs_data_str = preprocess_js_string_to_json(mncs_match.group(1))
        try:
            mncs_data = json5.loads(mncs_data_str) # Use json5.loads
            for mnc_data in mncs_data:
                # The 'logo' field is a string containing an <img> tag in the JS file.
                # Extract the URL from it.
                logo_url = extract_logo_url(mnc_data.get('logo', ''))
                mnc_schema = MNCCreate(
                    name=mnc_data['name'],
                    short_name=mnc_data['short'],
                    logo_url=logo_url,
                    sections=mnc_data['secs'],
                    test_time_minutes=mnc_data['time'],
                    num_questions=mnc_data['qs'],
                    question_bank_size=mnc_data['qb'],
                    note=mnc_data.get('note')
                )
                existing_mnc = db.query(models.MNC).filter(models.MNC.name == mnc_data['name']).first()
                if not existing_mnc:
                    create_mnc(db, mnc_schema)
                else:
                    print(f"Skipping duplicate MNC: {mnc_data['name']}")
            print("MNCs data ingested.")
        except (ValueError, json.JSONDecodeError) as e: # Catch ValueError for json5 errors
            print(f"Error parsing MNCs JSON: {e}")
            print(f"Problematic string: {mncs_data_str}")

    # Ingest MNCQs data (similar to Qs but flat)
    mncqs_match = re.search(r"const MNCQs = (\[.*?\]);", content, re.DOTALL)
    if mncqs_match:
        mncqs_data_str = preprocess_js_string_to_json(mncqs_match.group(1))
        try:
            mncqs_data = json5.loads(mncqs_data_str) # Use json5.loads
            for q_data in mncqs_data:
                correct_answer = q_data['opts'][q_data['ans']]
                question_data = QuestionCreate(
                    category="mnc_general", # A new category for these questions
                    question_text=q_data['q'],
                    options=q_data['opts'],
                    correct_answer=correct_answer,
                    explanation=q_data.get('exp'),
                    data_presentation=None
                )
                existing_q = db.query(Question).filter(
                    Question.category == "mnc_general",
                    Question.question_text == q_data['q']
                ).first()
                if not existing_q:
                    create_question(db, question_data)
                else:
                    print(f"Skipping duplicate MNCQ: {q_data['q'][:50]}...")
            print("MNCQs data ingested.")
        except (ValueError, json.JSONDecodeError) as e: # Catch ValueError for json5 errors
            print(f"Error parsing MNCQs JSON: {e}")
            print(f"Problematic string: {mncqs_data_str}")

    # Ingest ivQs data (Interview Questions)
    ivqs_match = re.search(r"const ivQs = (\[.*?\]);", content, re.DOTALL)
    if ivqs_match:
        ivqs_data_str = preprocess_js_string_to_json(ivqs_match.group(1))
        try:
            ivqs_data = json5.loads(ivqs_data_str) # Use json5.loads
            for q_data in ivqs_data:
                suggestions_json = json.dumps(q_data['sugs'])
                question_data = QuestionCreate(
                    category="interview",
                    question_text=q_data['q'],
                    options=[], # Interview questions don't have multiple choice options
                    correct_answer="N/A", # Placeholder
                    explanation=suggestions_json, # Store suggestions in explanation field
                    data_presentation=None
                )
                existing_q = db.query(Question).filter(
                    Question.category == "interview",
                    Question.question_text == q_data['q']
                ).first()
                if not existing_q:
                    create_question(db, question_data)
                else:
                    print(f"Skipping duplicate interview question: {q_data['q'][:50]}...")
            print("Interview questions (ivQs) data ingested.")
        except (ValueError, json.JSONDecodeError) as e: # Catch ValueError for json5 errors
            print(f"Error parsing ivQs JSON: {e}")
            print(f"Problematic string: {ivqs_data_str}")

    # Ingest jobRoles data
    job_roles_match = re.search(r"const jobRoles = (\[.*?\]);", content, re.DOTALL)
    if job_roles_match:
        job_roles_data_str = preprocess_js_string_to_json(job_roles_match.group(1))
        job_roles_data_str = job_roles_data_str.replace('"∞"', '"-1"') # Use -1 for infinity for easier parsing
        try:
            job_roles_data = json5.loads(job_roles_data_str) # Use json5.loads
            for jr_data in job_roles_data:
                job_role_schema = JobRoleCreate(
                    name=jr_data['n'],
                    category=jr_data['cat'],
                    icon=jr_data['icon'],
                    num_questions_estimate=str(jr_data['q']) # Store as string as per schema
                )
                existing_jr = db.query(models.JobRole).filter(models.JobRole.name == jr_data['n']).first()
                if not existing_jr:
                    create_job_role(db, job_role_schema)
                else:
                    print(f"Skipping duplicate Job Role: {jr_data['n']}")
            print("Job Roles data ingested.")
        except (ValueError, json.JSONDecodeError) as e: # Catch ValueError for json5 errors
            print(f"Error parsing Job Roles JSON: {e}")
            print(f"Problematic string: {job_roles_data_str}")

    # Ingest colleges data
    colleges_match = re.search(r"const colleges = (\[.*?\]);", content, re.DOTALL)
    if colleges_match:
        colleges_data_str = preprocess_js_string_to_json(colleges_match.group(1))
        try:
            colleges_data = json5.loads(colleges_data_str) # Use json5.loads
            for col_data in colleges_data:
                college_schema = CollegeCreate(
                    name=col_data['name'],
                    code=col_data['code'],
                    num_students=col_data['students'],
                    is_enabled=col_data['enabled']
                )
                existing_college = db.query(models.College).filter(models.College.code == col_data['code']).first()
                if not existing_college:
                    create_college(db, college_schema)
                else:
                    print(f"Skipping duplicate College: {col_data['name']}")
            print("Colleges data ingested.")
        except (ValueError, json.JSONDecodeError) as e: # Catch ValueError for json5 errors
            print(f"Error parsing Colleges JSON: {e}")
            print(f"Problematic string: {colleges_data_str}")

def ingest_json_files(db: Session, json_dir: str, category: str):
    print(f"Ingesting JSON files from {json_dir} for category '{category}'...")
    if not os.path.isdir(json_dir):
        print(f"Error: Directory {json_dir} not found. Skipping.")
        return

    try:
        for filename in os.listdir(json_dir):
            if filename.endswith(".json"):
                filepath = os.path.join(json_dir, filename)
                try:
                    with open(filepath, 'r') as f:
                        data = json.load(f) # Still using json.load for strict JSON files
                        if isinstance(data, list):
                            for item in data:
                                if 'question' in item and 'options' in item and 'answer' in item:
                                    question_text = item['question']
                                    options = item['options']
                                    correct_answer = item['answer']
                                    data_presentation = item.get('data_presentation')
                                    explanation = item.get('exp') # Some JSONs might have this

                                    # Handle cases where 'options' might be a string (e.g., comma separated)
                                    if isinstance(options, str):
                                        options = [opt.strip() for opt in options.split(',')]

                                    question_data = QuestionCreate(
                                        category=category,
                                        question_text=question_text,
                                        options=options,
                                        correct_answer=correct_answer,
                                        explanation=explanation,
                                        data_presentation=data_presentation
                                    )
                                    existing_q = db.query(Question).filter(
                                        Question.category == category,
                                        Question.question_text == question_text
                                    ).first()
                                    if not existing_q:
                                        create_question(db, question_data)
                                    else:
                                        print(f"Skipping duplicate question from {filename}: {question_text[:50]}...")
                                elif 'question' in item and 'answer' in item: # Handle simple Q&A without options
                                    question_text = item['question']
                                    correct_answer = item['answer']
                                    explanation = item.get('explanation', item.get('exp')) # Use explanation if available
                                    data_presentation = item.get('data_presentation') # Keep if it exists

                                    question_data = QuestionCreate(
                                        category=category,
                                        question_text=question_text,
                                        options=[], # No options for this type
                                        correct_answer=correct_answer,
                                        explanation=explanation,
                                        data_presentation=data_presentation
                                    )
                                    existing_q = db.query(Question).filter(
                                        Question.category == category,
                                        Question.question_text == question_text
                                    ).first()
                                    if not existing_q:
                                        create_question(db, question_data)
                                    else:
                                        print(f"Skipping duplicate question from {filename}: {question_text[:50]}...")
                                else:
                                    print(f"Skipping malformed item in {filename}: {item}")
                        else: # Handle JSON files that are objects, not lists
                            if 'question' in data and 'options' in data and 'answer' in data: # Single question object
                                question_text = data['question']
                                options = data['options']
                                correct_answer = data['answer']
                                data_presentation = data.get('data_presentation')
                                explanation = data.get('exp')

                                if isinstance(options, str):
                                    options = [opt.strip() for opt in options.split(',')]

                                question_data = QuestionCreate(
                                    category=category,
                                    question_text=question_text,
                                    options=options,
                                    correct_answer=correct_answer,
                                    explanation=explanation,
                                    data_presentation=data_presentation
                                )
                                existing_q = db.query(Question).filter(
                                    Question.category == category,
                                    Question.question_text == question_text
                                ).first()
                                if not existing_q:
                                    create_question(db, question_data)
                                else:
                                    print(f"Skipping duplicate question from {filename}: {question_text[:50]}...")
                            elif 'questions' in data and isinstance(data['questions'], list): # Object with a "questions" list
                                print(f"Processing questions list from object in {filename}")
                                for item in data['questions']:
                                    if 'question' in item and 'options' in item and 'answer' in item:
                                        question_text = item['question']
                                        options = item['options']
                                        correct_answer = item['answer']
                                        data_presentation = item.get('data_presentation')
                                        explanation = item.get('exp')

                                        if isinstance(options, str):
                                            options = [opt.strip() for opt in options.split(',')]

                                        question_data = QuestionCreate(
                                            category=category,
                                            question_text=question_text,
                                            options=options,
                                            correct_answer=correct_answer,
                                            explanation=explanation,
                                            data_presentation=data_presentation
                                        )
                                        existing_q = db.query(Question).filter(
                                            Question.category == category,
                                            Question.question_text == question_text
                                        ).first()
                                        if not existing_q:
                                            create_question(db, question_data)
                                        else:
                                            print(f"Skipping duplicate question from {filename}: {question_text[:50]}...")
                                    else:
                                        print(f"Skipping malformed item in questions list in {filename}: {item}")
                            else:
                                print(f"Skipping non-question object JSON in {filename}: {data}")
                except json.JSONDecodeError as e:
                    # Fallback to json5 for less strict JSON files
                    try:
                        with open(filepath, 'r', encoding='utf-8-sig') as f_bom:
                            data = json5.load(f_bom) # Use json5.load for JSONDecodeError fallback
                            if isinstance(data, list): # Process list of questions
                                for item in data:
                                    if 'question' in item and 'options' in item and 'answer' in item:
                                        question_text = item['question']
                                        options = item['options']
                                        correct_answer = item['answer']
                                        data_presentation = item.get('data_presentation')
                                        explanation = item.get('exp')
                                        if isinstance(options, str):
                                            options = [opt.strip() for opt in options.split(',')]
                                        question_data = QuestionCreate(
                                            category=category,
                                            question_text=question_text,
                                            options=options,
                                            correct_answer=correct_answer,
                                            explanation=explanation,
                                            data_presentation=data_presentation
                                        )
                                        existing_q = db.query(Question).filter(
                                            Question.category == category,
                                            Question.question_text == question_text
                                        ).first()
                                        if not existing_q:
                                            create_question(db, question_data)
                                        else:
                                            print(f"Skipping duplicate question from {filename}: {question_text[:50]}...")
                                    elif 'question' in item and 'answer' in item:
                                        question_text = item['question']
                                        correct_answer = item['answer']
                                        explanation = item.get('explanation', item.get('exp'))
                                        question_data = QuestionCreate(
                                            category=category,
                                            question_text=question_text,
                                            options=[],
                                            correct_answer=correct_answer,
                                            explanation=explanation,
                                            data_presentation=None
                                        )
                                        existing_q = db.query(Question).filter(
                                            Question.category == category,
                                            Question.question_text == question_text
                                        ).first()
                                        if not existing_q:
                                            create_question(db, question_data)
                                        else:
                                            print(f"Skipping duplicate question from {filename}: {question_text[:50]}...")
                                    else:
                                        print(f"Skipping malformed item (BOM retry) in {filename}: {item}")
                            elif 'questions' in data and isinstance(data['questions'], list): # Object with a "questions" list
                                print(f"Processing questions list from object (BOM retry) in {filename}")
                                for item in data['questions']:
                                    if 'question' in item and 'options' in item and 'answer' in item:
                                        question_text = item['question']
                                        options = item['options']
                                        correct_answer = item['answer']
                                        data_presentation = item.get('data_presentation')
                                        explanation = item.get('exp')

                                        if isinstance(options, str):
                                            options = [opt.strip() for opt in options.split(',')]

                                        question_data = QuestionCreate(
                                            category=category,
                                            question_text=question_text,
                                            options=options,
                                            correct_answer=correct_answer,
                                            explanation=explanation,
                                            data_presentation=data_presentation
                                        )
                                        existing_q = db.query(Question).filter(
                                            Question.category == category,
                                            Question.question_text == question_text
                                        ).first()
                                        if not existing_q:
                                            create_question(db, question_data)
                                        else:
                                            print(f"Skipping duplicate question from {filename}: {question_text[:50]}...")
                                    else:
                                        print(f"Skipping malformed item in questions list (BOM retry) in {filename}: {item}")
                            else:
                                print(f"Skipping non-list/non-object-with-questions JSON (BOM retry) in {filename}")
                    except (ValueError, json.JSONDecodeError) as e_bom: # Catch ValueError for json5 errors
                        print(f"Error parsing JSON file {filename} even with BOM handling (json5 fallback): {e_bom}")
                    except Exception as e_bom:
                        print(f"An unexpected error occurred during BOM retry for {filename}: {e_bom}")
                except Exception as e:
                    print(f"An unexpected error occurred while processing {filename}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while listing directory {json_dir}: {e}")
    print(f"Finished ingesting JSON files for category '{category}'.")


if __name__ == "__main__":
    db_generator = get_db()
    db = next(db_generator) # Get a database session

    # Ingest data from frontend/data.js
    print(f"Current working directory: {os.getcwd()}")
    print(f"Calculated project_root: {project_root}")
    frontend_data_js_path = os.path.join(project_root, "frontend", "data.js")
    print(f"Calculated frontend_data_js_path: {frontend_data_js_path}")
    ingest_data_from_js(db, frontend_data_js_path)

    # Ingest data from other JSON files
    # This assumes the JSON files have a similar structure to the Data Interpretation JSON
    # and contain lists of question objects.
    # Adjust categories as needed based on actual content
    ingest_json_files(db, os.path.join(project_root, "assessment"), "assessment")
    # ingest_json_files(db, os.path.join(project_root, "mnc"), "mnc") # If mnc JSONs contain similar question structure
    ingest_json_files(db, os.path.join(project_root, "mock interview"), "mock_interview")
    ingest_json_files(db, os.path.join(project_root, "frontend"), "frontend_json_data") # For files like datainterpretation_json_20260418_efaa7a.json

    try:
        db.close()
    except Exception:
        pass # Already closed by finally block in get_db
    print("Data ingestion complete.")
