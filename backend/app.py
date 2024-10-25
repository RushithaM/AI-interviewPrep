from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from PyPDF2 import PdfReader
import docx2txt
from flask_migrate import Migrate
import json
import re
import threading
import http.client

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///interview_qa.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Configure AI models
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# File upload configuration
UPLOAD_FOLDER = 'uploads/'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit

class User(db.Model):
    id = db.Column(db.String(120), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=True)
    role = db.Column(db.String(120), nullable=True)
    resume_text = db.Column(db.Text, nullable=True)
    is_pro = db.Column(db.Boolean, default=False)
    questions_generated = db.Column(db.Boolean, default=False)

    analyses = db.relationship('ResumeAnalysis', backref='user', lazy=True)
    quizzes = db.relationship('Quiz', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), db.ForeignKey('user.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    options = db.Column(db.Text, nullable=False)  # JSON string
    correct_answer = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __repr__(self):
        return f'<Quiz {self.id}: {self.question[:30]}>'
    
# class QuizGeneration(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.String(120), db.ForeignKey('user.id'), nullable=False)
#     status = db.Column(db.String(20), nullable=False, default='pending')  # pending, completed, failed
#     timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

#     def __repr__(self):
#         return f'<QuizGeneration {self.id} for User {self.user_id} Status: {self.status}>'

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), db.ForeignKey('user.id'), nullable=False)
    question_type = db.Column(db.String(20), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Question {self.question_type}: {self.question[:30]}>'

class ResumeAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(120), db.ForeignKey('user.id'), nullable=False)
    resume_score = db.Column(db.Float, nullable=True)
    improvements = db.Column(db.Text, nullable=True)
    strong_points = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed

    def __repr__(self):
        return f'<ResumeAnalysis {self.id} for User {self.user_id}>'

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_file(file_path):
    file_extension = file_path.split('.')[-1].lower()
    if file_extension == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension in ['doc', 'docx']:
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted
    return text

def extract_text_from_docx(file_path):
    return docx2txt.process(file_path)

def fetch_website_content(link):
    try:
        url = f'https://r.jina.ai/{link}'
        headers = {
            'Authorization': 'Bearer jina_c8b3402a0250459b83e2b502feaac07dtE9y0RR5cFe5dp-w2xW6Km8xkP_f'
        }
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            return soup.get_text()
        else:
            return f"Error fetching website content: {response.status_code}"
    except Exception as e:
        return f"Error fetching website content: {e}"
    
def analyze_text_with_groq(extracted_text):
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 5,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }
    gemini = genai.GenerativeModel('gemini-1.5-flash-8b', generation_config=generation_config)

    prompt = f"Extract all the interview Q&A present in the text if any: {extracted_text}"

    response = gemini.generate_content(prompt)
    return response.text

def generate_questions(context, question_type, role=None, company=None):
    conn = http.client.HTTPSConnection("google.serper.dev")
    payload = json.dumps({"q": f"50 Interview Questions for {role} role at {company} from simplelearn"})
    headers = {
        'X-API-KEY': os.getenv("SERPER_API_KEY"),
        'Content-Type': 'application/json'
    }
    conn.request("POST", "/search", payload, headers)
    res = conn.getresponse()
    data = res.read()
    response_json = json.loads(data.decode("utf-8"))
    links = []
    # Extract links from organic results
    for result in response_json.get("organic", []):
        link = result.get("link")
        if link and not link.startswith("https://www.geeksforgeeks.org/"):
            links.append(link)

    # Extract link from knowledge graph
    if "knowledgeGraph" in response_json:
        knowledge_graph_link = response_json["knowledgeGraph"].get("website")
        if knowledge_graph_link and not knowledge_graph_link.startswith("https://www.geeksforgeeks.org/"):
            links.append(knowledge_graph_link)

    extracted_text = ""
    for link in links:
        extracted_text += fetch_website_content(link) + "\n\n"
    
    analyzed_text = analyze_text_with_groq(extracted_text)
    
    prompt = ""
    if question_type == "company":
        prompt = f"""
        Generate 10 interview questions based on the following company context and analyzed text:
        Company: {company}
        Role: {role}
        Context: {context}
        Analyzed Text: {analyzed_text}
        
        Format the output as a JSON array of strings, where each string is a question.
        Focus on company-specific questions that assess the candidate's knowledge and interest in {company}.
        """
    elif question_type == "role":
        prompt = f"""
        Generate 10 interview questions based on the following role context, resume, and analyzed text:
        Role: {role}
        Company: {company}
        Resume: {context}
        Analyzed Text: {analyzed_text}
        
        Format the output as a JSON array of strings, where each string is a question.
        Focus on role-specific questions that assess the candidate's skills and experience for the {role} position.
        """
    elif question_type == "resume":
        prompt = f"""
        Generate 10 interview questions based on the following resume, role, and company:
        Resume: {context}
        Role: {role}
        Company: {company}
        
        Format the output as a JSON array of strings, where each string is a question.
        Focus on questions that are tailored to the candidate's specific experience and skills mentioned in their resume.
        """
    
    completion = groq_client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=500,
        top_p=1,
        stream=False,
        stop=None,
    )
    response = completion.choices[0].message.content
    
    cleaned_response = re.sub(r'^.*?\[', '[', response.strip(), flags=re.DOTALL)
    cleaned_response = re.sub(r'\].*?$', ']', cleaned_response, flags=re.DOTALL)
    
    try:
        questions = json.loads(cleaned_response)
        return questions if isinstance(questions, list) else []
    except json.JSONDecodeError as e:
        app.logger.error(f"Failed to parse JSON response: {response}")
        app.logger.error(f"JSON error: {str(e)}")
        questions = re.findall(r'"([^"]*)"', cleaned_response)
        return questions if questions else []

def save_questions_to_db(user_id, resume_questions, role_questions, company_questions):
    for q_type, questions in [("resume", resume_questions), ("role", role_questions), ("company", company_questions)]:
        for question in questions:
            new_question = Question(user_id=user_id, question_type=q_type, question=question)
            db.session.add(new_question)
    db.session.commit()

def generate_answer_with_llm(question, question_type, user):
    prompt = f"""
    You are an experienced professional in a job interview for the role of {user.role} at {user.company}. Respond to the following {question_type} question as if you're speaking directly to the interviewer:

    {question}

    In your response:
    - Speak in the first person
    - Be concise and to the point (aim for 3-5 sentences)
    - Highlight your relevant experience and achievements, especially from your resume: {user.resume_text}
    - Use a conversational yet professional tone
    - Include a brief example or result if applicable
    Remember, you're in an interview, so make your answer impactful and relevant.
    """
    generation_config = {
        "temperature": 0.8,
        "top_p": 0.95,
        "top_k": 5,
        "max_output_tokens": 250,
        "response_mime_type": "text/plain",
    }
    gemini = genai.GenerativeModel('gemini-1.5-flash-8b', generation_config=generation_config)

    response = gemini.generate_content(prompt)
    return response.text

import re

def analyze_resume(user):
    if not user.resume_text or not user.role:
        app.logger.error(f"User {user.id} lacks resume text or role information.")
        return None
    
    prompt = f"""
    Analyze the following resume for the role of {user.role}. Provide a detailed evaluation in JSON format with the following structure:

    {{
        "resume_score": <score>,
        "improvements": [
            "<improvement_1>",
            "<improvement_2>",
            ...
        ],
        "strong_points": [
            "<strength_1>",
            "<strength_2>",
            ...
        ]
    }}

    Where:
    - <score> is an integer from 0 to 100
    - Each improvement and strong point is a brief, actionable statement

    Resume Text:
    {user.resume_text}

    Ensure your response is valid JSON and includes only the requested fields.
    """
    
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.9,
        "top_k": 5,
        "max_output_tokens": 540,
        "response_mime_type": "text/plain",
    }
    gemini = genai.GenerativeModel('gemini-1.5-flash-8b', generation_config=generation_config)

    response = gemini.generate_content(prompt)
    analysis_text = response.text.strip()

    # Remove the ```json and ``` tags if present
    analysis_text = re.sub(r'^```json\s*', '', analysis_text)
    analysis_text = re.sub(r'\s*```$', '', analysis_text)

    try:
        analysis = json.loads(analysis_text)
        resume_score = analysis.get('resume_score')
        improvements = analysis.get('improvements', [])
        strong_points = analysis.get('strong_points', [])
        return resume_score, improvements, strong_points
    except json.JSONDecodeError:
        app.logger.error(f"Failed to parse Gemini analysis response: {analysis_text}")
        return None

def save_resume_analysis(user_id, score, improvements, strong_points):
    analysis = ResumeAnalysis(
        user_id=user_id,
        resume_score=score,
        improvements=json.dumps(improvements),
        strong_points=json.dumps(strong_points),
        status='completed'
    )
    db.session.add(analysis)
    db.session.commit()

def process_questions(user_id):
    with app.app_context():
        try:
            print(f"Starting question generation for user {user_id}")
            user = User.query.get(user_id)
            if not user:
                raise ValueError(f"User not found: {user_id}")

            resume_questions = generate_questions(user.resume_text, "resume")
            role_questions = generate_questions(user.resume_text, "role", user.role, user.company)
            company_info = fetch_website_content(user.company)
            company_questions = generate_questions(company_info, "company", user.role, user.company)

            if not (resume_questions and role_questions and company_questions):
                raise ValueError("Failed to generate one or more sets of questions")

            save_questions_to_db(user_id, resume_questions, role_questions, company_questions)

            user.questions_generated = True
            db.session.commit()

            # Analyze resume and save analysis
            analysis = analyze_resume(user)
            if analysis:
                resume_score, improvements, strong_points = analysis
                save_resume_analysis(user_id, resume_score, improvements, strong_points)

            print(f"Questions and resume analysis generated successfully for user {user_id}")
        except Exception as e:
            app.logger.error(f"Error generating questions for user {user_id}: {str(e)}")
            db.session.rollback()
        finally:
            db.session.close()

@app.route('/api/user-input', methods=['POST'])
def user_input():
    try:
        print("Request Form:", request.form)
        print("Request Files:", request.files)
        
        user_id = request.form.get('userId')
        name = request.form.get('name')
        email = request.form.get('email')
        company = request.form.get('company')
        role = request.form.get('role')
        
        print(f"Received data: userId={user_id}, name={name}, email={email}, company={company}, role={role}")
        
        if not all([user_id, name, email, company, role]):
            raise ValueError("Missing required fields")

        user = User.query.get(user_id)
        if not user:
            user = User(id=user_id, name=name, email=email)
            db.session.add(user)
        else:
            user.name = name
            user.email = email

        user.company = company
        user.role = role
        user.questions_generated = False

        if 'resume' in request.files:
            file = request.files['resume']
            if file and allowed_file(file.filename):
                filename = secure_filename(f"{user_id}_{file.filename}")
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)
                user.resume_text = extract_text_from_file(file_path)
                print(f"Resume saved and text extracted for user {user_id}")
            else:
                raise ValueError("Invalid file format or no file uploaded")
        else:
            print(f"No resume file uploaded for user {user_id}")

        db.session.commit()
        
        threading.Thread(target=process_questions, args=(user_id,)).start()
        
        return jsonify({
            "success": True,
            "message": "Input received and question generation started"
        }), 202

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error in user_input: {str(e)}")
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


@app.route('/api/question-status', methods=['GET'])
def check_question_status():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'success': False, 'error': 'User ID is required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    return jsonify({
        'success': True,
        'questionsGenerated': 1 if user.questions_generated else 0,
        'status': 'complete' if user.questions_generated else 'pending'
    })

@app.route('/api/resume-questions', methods=['GET'])
def get_resume_questions():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'success': False, 'error': 'User ID is required'}), 400

    questions = Question.query.filter_by(user_id=user_id, question_type='resume').all()
    return jsonify({
        'success': True,
        'questions': [{'id': q.id, 'question': q.question, 'answer': q.answer} for q in questions]
    })

@app.route('/api/role-questions', methods=['GET'])
def get_role_questions():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'success': False, 'error': 'User ID is required'}), 400

    questions = Question.query.filter_by(user_id=user_id, question_type='role').all()
    return jsonify({
        'success': True,
        'questions': [{'id': q.id, 'question': q.question, 'answer': q.answer} for q in questions]
    })

@app.route('/api/company-questions', methods=['GET'])
def get_company_questions():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'success': False, 'error': 'User ID is required'}), 400

    questions = Question.query.filter_by(user_id=user_id, question_type='company').all()
    return jsonify({
        'success': True,
        'questions': [{'id': q.id, 'question': q.question, 'answer': q.answer} for q in questions]
    })

@app.route('/api/user-profile', methods=['GET'])
def get_user_profile():
    user_id = request.args.get('userId')
    email = request.args.get('email')
    
    if not user_id or not email:
        return jsonify({'success': False, 'error': 'User ID and email are required.'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found.'}), 404

    is_new_user = not user.questions_generated

    return jsonify({
        'success': True,
        'is_new_user': is_new_user,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'company': user.company,
            'role': user.role,
            'resume_text': user.resume_text,
            'is_pro': user.is_pro,
            'questions_generated': user.questions_generated
        }
    })

@app.route('/api/update-profile', methods=['POST'])
def update_profile():
    try:
        data = request.form  # Use request.form for form data including file uploads
        user_id = data.get('userId')
        company = data.get('company')
        role = data.get('role')

        user = User.query.get(user_id)
        if not user:
            user = User(id=user_id)
            db.session.add(user)

        user.company = company
        user.role = role

        # Handling the resume file upload
        if 'resume' in request.files:
            resume_file = request.files['resume']
            if resume_file and allowed_file(resume_file.filename):
                filename = secure_filename(f"{user_id}_{resume_file.filename}")
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                resume_file.save(file_path)
                user.resume_text = extract_text_from_file(file_path)  # Correctly extract text
                print(f"Resume updated and text extracted for user {user_id}")

        db.session.commit()

        # After updating the profile, reprocess the questions and analysis
        threading.Thread(target=process_questions, args=(user_id,)).start()

        return jsonify({'message': 'Profile updated successfully', 'resume': user.resume_text}), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error in update_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-answer', methods=['POST'])
def generate_answer():
    question_id = request.json.get('questionId')
    question = Question.query.get(question_id)
    if not question:
        return jsonify({'error': 'Question not found'}), 404
    
    if question.answer:
        return jsonify({'answer': question.answer}), 200
    
    user = User.query.get(question.user_id)
    answer = generate_answer_with_llm(question.question, question.question_type, user)
    
    question.answer = answer
    db.session.commit()
    return jsonify({'answer': answer}), 200

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    user_id = request.args.get('userId')
    # Implement your logic to fetch analytics data
    analytics = {
        "timeSpent": 10,
        "successRate": 75,
        "areasToImprove": "Communication skills"
    }
    return jsonify(analytics), 200

@app.route('/api/question-counts', methods=['GET'])
def get_question_counts():
    user_id = request.args.get('userId')
    # Implement your logic to fetch question counts
    counts = {
        "resume": 5,
        "role": 3,
        "company": 2
    }
    return jsonify(counts), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

@app.route('/api/check-user', methods=['GET'])
def check_user():
    email = request.args.get('email')
    user = User.query.filter_by(email=email).first()
    return jsonify({'exists': user is not None})

@app.route('/api/questions/<question_type>', methods=['GET'])
def get_questions(question_type):
    user_id = request.args.get('userId')
    
    if not user_id:
        return jsonify({'success': False, 'error': 'User ID is required.'}), 400

    if question_type not in ['resume', 'company', 'role']:
        return jsonify({'success': False, 'error': 'Invalid question type.'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found.'}), 404

    # Fetch questions from the database
    questions = Question.query.filter_by(user_id=user_id, question_type=question_type).all()
    questions_list = [
        {
            'id': q.id,
            'question': q.question,
            'answer': q.answer
        } for q in questions
    ]
    return jsonify({
        'success': True,
        'questions': questions_list
    }), 200

@app.route('/api/resume-analysis', methods=['GET'])
def get_resume_analysis():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({'success': False, 'error': 'User ID is required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404
    
    # Fetch the most recent resume analysis for the user
    analysis = ResumeAnalysis.query.filter_by(user_id=user_id).order_by(ResumeAnalysis.timestamp.desc()).first()
    
    if not analysis:
        # If no analysis exists, create a new pending analysis
        analysis = ResumeAnalysis(user_id=user_id, status='pending')
        db.session.add(analysis)
        db.session.commit()
        
        # Start the analysis process in a background thread
        threading.Thread(target=process_resume_analysis, args=(user_id,)).start()
        
        return jsonify({'success': True, 'status': 'pending'}), 202
    
    if analysis.status == 'pending':
        return jsonify({'success': True, 'status': 'pending'}), 202
    
    if analysis.status == 'failed':
        return jsonify({'success': False, 'error': 'Failed to generate resume analysis'}), 500
    
    # Prepare the response for completed analysis
    analysis_data = {
        'score': analysis.resume_score,
        'improvements': json.loads(analysis.improvements),
        'strengths': json.loads(analysis.strong_points),
        'timestamp': analysis.timestamp.isoformat()
    }
    
    return jsonify({'success': True, 'status': 'completed', 'analysis': analysis_data}), 200

def process_resume_analysis(user_id):
    with app.app_context():
        try:
            user = User.query.get(user_id)
            analysis_result = analyze_resume(user)
            if analysis_result:
                resume_score, improvements, strong_points = analysis_result
                save_resume_analysis(user_id, resume_score, improvements, strong_points)
            else:
                # Update the analysis status to failed if the analysis fails
                analysis = ResumeAnalysis.query.filter_by(user_id=user_id).order_by(ResumeAnalysis.timestamp.desc()).first()
                analysis.status = 'failed'
                db.session.commit()
        except Exception as e:
            app.logger.error(f"Error in process_resume_analysis: {str(e)}")
            analysis = ResumeAnalysis.query.filter_by(user_id=user_id).order_by(ResumeAnalysis.timestamp.desc()).first()
            analysis.status = 'failed'
            db.session.commit()

# New Function to Generate Quiz Questions in a Single Shot
def generate_quiz_questions_single(user_id):
    user = User.query.get(user_id)
    if not user:
        return None

    # One-shot prompt to generate 20 questions with 4 options each
    prompt = f"""
    Generate 20 interview questions for a {user.role} at {user.company}. For each question, provide four options (A, B, C, D), and indicate the correct option.

    Format the output as a JSON array of objects with the following structure:
    [
        {{
            "question": "Your question here",
            "options": {{
                "A": "Option A",
                "B": "Option B",
                "C": "Option C",
                "D": "Option D"
            }},
            "correctAnswer": "A"
        }},
        ...
    ]
    """

    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 5,
        "max_output_tokens": 5000,
        "response_mime_type": "application/json",
    }
    gemini = genai.GenerativeModel('gemini-1.5-flash-8b', generation_config=generation_config)

    try:
        response = gemini.generate_content(prompt)
        analysis_text = response.text

        # Remove the ```json and ``` tags if present
        analysis_text = re.sub(r'^```json\s*', '', analysis_text, flags=re.MULTILINE)
        analysis_text = re.sub(r'\s*```$', '', analysis_text, flags=re.MULTILINE)

        quiz_questions = json.loads(analysis_text)
        if not isinstance(quiz_questions, list):
            raise ValueError("Response is not a list of questions.")
    except (json.JSONDecodeError, ValueError) as e:
        app.logger.error(f"Failed to parse quiz questions: {e}")
        app.logger.error(f"Response received: {response.text}")
        return None
    except google.api_core.exceptions.ResourceExhausted as e:
        app.logger.error(f"API quota exhausted: {e}")
        return None
    except Exception as e:
        app.logger.error(f"An unexpected error occurred during quiz generation: {e}")
        return None

    # Save to database
    saved_quiz_questions = []
    for q in quiz_questions:
        new_quiz = Quiz(
            user_id=user_id,
            question=q['question'],
            correct_answer=q['correctAnswer'],
            options=json.dumps(q['options']),
            question_type='quiz',
            status='completed'
        )
        db.session.add(new_quiz)
        saved_quiz_questions.append(new_quiz)
    db.session.commit()

    return saved_quiz_questions

# Updated API Route to Generate Quiz Questions
@app.route('/api/generate-quiz-questions', methods=['GET'])
def api_generate_quiz_questions():
    user_id = request.args.get('userId')
    app.logger.info(f"Received request to generate quiz questions for user_id: {user_id}")
    
    if not user_id:
        return jsonify({'success': False, 'error': 'User ID is required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'error': 'User not found'}), 404

    app.logger.info(f"User found: {user.name}, questions_generated: {user.questions_generated}")

    # Check if questions are already generated
    if user.questions_generated:
        quiz_questions = Quiz.query.filter_by(user_id=user_id).all()
        if quiz_questions:
            app.logger.info(f"Returning {len(quiz_questions)} existing quiz questions for user {user_id}")
            return jsonify({
                'success': True,
                'status': 'completed',
                'questions': [{
                    'id': q.id,
                    'question': q.question,
                    'options': json.loads(q.options),
                    'correctAnswer': q.correct_answer,
                    'question_type': q.question_type
                } for q in quiz_questions]
            })
        else:
            app.logger.warning(f"Questions marked as generated but not found for user {user_id}. Resetting flag.")
            user.questions_generated = False
            db.session.commit()

    # Check if generation is already in progress
    if getattr(user, 'generation_in_progress', False):
        app.logger.info(f"Quiz generation already in progress for user {user_id}")
        return jsonify({
            'success': True,
            'status': 'in_progress',
            'message': 'Quiz generation is in progress. Please check back in a few moments.'
        })

    # Start generation if not already in progress
    user.generation_in_progress = True
    db.session.commit()
    threading.Thread(target=generate_quiz_questions_background, args=(user_id,)).start()

    return jsonify({
        'success': True,
        'status': 'started',
        'message': 'Quiz generation has been started. Please check back in a few moments.'
    })

def generate_quiz_questions_background(user_id):
    with app.app_context():
        user = User.query.get(user_id)
        if not user:
            app.logger.error(f"User not found for ID: {user_id} in background task")
            return

        app.logger.info(f"Starting quiz generation for user {user_id}")
        quiz_questions = generate_quiz_questions_single(user_id)
        
        if quiz_questions:
            user.questions_generated = True
            app.logger.info(f"Successfully generated {len(quiz_questions)} quiz questions for user {user_id}")
        else:
            app.logger.error(f"Failed to generate quiz questions for user {user_id}")
        
        user.generation_in_progress = False
        db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)