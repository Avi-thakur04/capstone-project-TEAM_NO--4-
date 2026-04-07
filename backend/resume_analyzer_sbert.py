#!/usr/bin/env python3

"""
NLP-Based Resume Analysis System (S-BERT Engine)

This script provides the ResumeAnalyzer class.
It is designed to be imported by a web server (e.g., app.py).

It uses:
- S-BERT (Sentence-Transformers) for semantic similarity.
- spaCy for skill extraction and entity recognition.
- pypdf for extracting text from the PDF.
- fuzzywuzzy for skill matching.
"""

import re
import spacy
from spacy.matcher import PhraseMatcher
from sklearn.metrics.pairwise import cosine_similarity
from fuzzywuzzy import fuzz, process
import json
import os
from pypdf import PdfReader  # For reading PDFs
from sentence_transformers import SentenceTransformer  # For S-BERT

# --- Constants ---

# A comprehensive list of skills.
SKILL_LIST = [
    'python', 'java', 'c++', 'c#', 'javascript', 'typescript', 'sql', 'mysql', 'postgresql',
    'mongodb', 'nosql', 'react', 'angular', 'vue.js', 'node.js', 'django', 'flask',
    'spring boot', 'aws', 'azure', 'google cloud platform', 'gcp', 'docker', 'kubernetes',
    'terraform', 'ansible', 'git', 'jira', 'confluence', 'agile', 'scrum', 'kanban',
    'project management', 'product management', 'data analysis', 'data science',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
    'pandas', 'numpy', 'matplotlib', 'tableau', 'power bi', 'big data', 'spark',
    'hadoop', 'natural language processing', 'nlp', 'computer vision', 'cv',
    'cybersecurity', 'network security', 'penetration testing', 'devops', 'ci/cd',
    'system design', 'architecture', 'rest api', 'graphql', 'microservices',
    'leadership', 'team management', 'communication', 'problem solving', 'ux/ui design'
]

class ResumeAnalyzer:
    """
    A class to analyze a resume against a job description.
    """

    def __init__(self):
        """
        Initializes the spaCy model, PhraseMatcher, and S-BERT model.
        """
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print(
                "Error: spaCy model 'en_core_web_sm' not found.\n"
                "Please run: python -m spacy download en_core_web_sm"
            )
            exit(1)
            
        self.skill_matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER")
        patterns = [self.nlp.make_doc(skill) for skill in SKILL_LIST]
        self.skill_matcher.add("SKILL", patterns)

        try:
            print("Loading S-BERT model (this may take a moment)...")
            self.sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("S-BERT model loaded.")
        except Exception as e:
            print(f"Error loading S-BERT model. Do you have an internet connection? {e}")
            exit(1)

    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extracts all text from a given PDF file.
        This is kept as a helper for the API server to use.
        """
        try:
            reader = PdfReader(pdf_path)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
        except FileNotFoundError:
            print(f"Error: PDF file not found at {pdf_path}")
            return None
        except Exception as e:
            print(f"Error reading PDF file: {e}")
            return None

    def _extract_skills(self, text: str) -> set:
        """
        Extracts skills from text using the PhraseMatcher.
        """
        doc = self.nlp(text)
        matches = self.skill_matcher(doc)
        
        skills = set()
        for _, start, end in matches:
            span = doc[start:end]
            skills.add(span.text.lower())
        return skills

    def _match_skills(self, jd_skills: set, resume_skills: set, fuzzy_threshold: int = 80) -> (list, list):
        """
        Compares JD skills to resume skills, allowing for fuzzy matching.
        """
        matched_skills = []
        missing_skills = []
        resume_skills_list = list(resume_skills)
        
        if not resume_skills_list:
            return [], list(jd_skills)

        for skill in jd_skills:
            if skill in resume_skills:
                matched_skills.append(skill)
            else:
                best_match, score = process.extractOne(
                    skill, 
                    resume_skills_list, 
                    scorer=fuzz.token_sort_ratio
                )
                
                if score >= fuzzy_threshold:
                    matched_skills.append(f"{skill} (Similar to: {best_match}, Score: {score}%)")
                else:
                    missing_skills.append(skill)
                    
        return matched_skills, missing_skills

    def _extract_experience_years(self, text: str) -> int:
        """
        Extracts the total years of experience from text using regex.
        """
        patterns = [
            r'(\d+)\s*\+?\s*years?.?of.experience',
            r'(\d+)\s*\+?\s*years?.?experience',
            r'experience.of.(\d+)\s*\+?\s*years?',
            r'(\d+)\s*\+?\s*years?',
            r'(\d+)\s*yrs'
        ]
        
        years_found = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    years_found.append(int(match[0]))
                else:
                    years_found.append(int(match))
        
        return max(years_found) if years_found else 0

    def _analyze_experience(self, jd_text: str, resume_text: str) -> dict:
        """
        Compares required experience from JD with experience found in resume.
        """
        required_exp = self._extract_experience_years(jd_text)
        found_exp = self._extract_experience_years(resume_text)
        
        fit = "Not Specified"
        if required_exp > 0:
            if found_exp >= required_exp:
                fit = "Met"
            elif found_exp >= required_exp * 0.7:
                fit = "Partial"
            else:
                fit = "Below Requirement"
        
        return {
            "required_years": required_exp,
            "found_years": found_exp,
            "fit_status": fit,
            "explanation": f"Required: {required_exp}+ years. Found: {found_exp} years. ({fit})"
        }

    def _calculate_semantic_similarity(self, jd_text: str, resume_text: str) -> float:
        """
        Calculates the S-BERT cosine similarity between the JD and resume.
        """
        if not jd_text or not resume_text:
            return 0.0
            
        try:
            jd_embedding = self.sbert_model.encode([jd_text])
            resume_embedding = self.sbert_model.encode([resume_text])
            sim_score = cosine_similarity(jd_embedding, resume_embedding)[0][0]
            return float(sim_score)
        
        except Exception as e:
            print(f"Warning: S-BERT similarity calculation error: {e}. Returning 0 similarity.")
            return 0.0

    def _calculate_match_score(self, similarity_score: float, skill_score: float, exp_fit: str) -> int:
        """
        Calculates a final match score (0-100) based on weighted inputs.
        """
        WEIGHT_SIMILARITY = 0.45
        WEIGHT_SKILLS = 0.35
        WEIGHT_EXPERIENCE = 0.20
        
        if exp_fit == "Met":
            exp_score = 1.0
        elif exp_fit == "Partial":
            exp_score = 0.7
        elif exp_fit == "Not Specified":
            exp_score = 0.5
        else:
            exp_score = 0.2
            
        final_score = (
            (similarity_score * WEIGHT_SIMILARITY) +
            (skill_score * WEIGHT_SKILLS) +
            (exp_score * WEIGHT_EXPERIENCE)
        )
        
        return int(final_score * 100)

    def _generate_summary_recommendations(self, score: int, skill_score: float, missing_skills: list, exp_fit: str) -> (str, str):
        """
        Generates a human-readable summary and recommendation.
        """
        summary = f"The candidate's profile is a {score}% match for the role. "
        
        if score > 80:
             summary += "Excellent semantic and skill alignment. "
        elif score > 60:
            summary += "Good overall alignment. "
        
        if skill_score >= 0.8:
            summary += "Strong skill coverage. "
        elif skill_score >= 0.5:
            summary += "Partial skill coverage. "
        else:
            summary += "Weak skill coverage, several key skills missing. "
            
        if exp_fit == "Met":
            summary += "The candidate meets the required years of experience."
        elif exp_fit == "Partial":
            summary += "The candidate is close to the required experience level."
        elif exp_fit == "Below Requirement":
            summary += "The candidate is below the required experience level."

        if score >= 80:
            recommendation = "Strong Candidate. Highly recommend proceeding to interview."
        elif score >= 60:
            recommendation = "Good Candidate. Recommend for technical screening."
        elif score >= 40:
            recommendation = "Potential Candidate. Review missing elements before proceeding."
        else:
            recommendation = "Weak Match. May not be suitable for this role."

        if missing_skills and score >= 40:
            recommendation += f" Consider asking about: {', '.join(missing_skills[:3])}."
            
        return summary, recommendation

    def analyze(self, job_description: str, resume_text: str) -> dict:
        
        
    
        
        # --- 2. Skill Extraction & Matching ---
        jd_skills = self._extract_skills(job_description)
        resume_skills = self._extract_skills(resume_text)
        
        if not jd_skills:
            print("Warning: No skills extracted from Job Description. Skill match will be 0.")
            matched_skills, missing_skills = [], []
            skill_score = 0.0
        else:
            matched_skills, missing_skills = self._match_skills(jd_skills, resume_skills)
            skill_score = len(matched_skills) / len(jd_skills) if jd_skills else 0.0
            
        # --- 3. Experience Analysis ---
        experience_analysis = self._analyze_experience(job_description, resume_text)
        
        # --- 4. Similarity Scoring (Using S-BERT) ---
        similarity_score = self._calculate_semantic_similarity(job_description, resume_text)
        
        # --- 5. Final Output Format ---
        final_score = self._calculate_match_score(
            similarity_score,
            skill_score,
            experience_analysis["fit_status"]
        )
        
        summary, recommendation = self._generate_summary_recommendations(
            final_score,
            skill_score,
            missing_skills,
            experience_analysis["fit_status"]
        )
        
        result = {
            "Match Score": final_score,
            "S-BERT Similarity": f"{similarity_score:.2%}",
            "Skill Analysis": {
                "JD Skills": sorted(list(jd_skills)),
                "Matched Skills": matched_skills,
                "Missing Skills": missing_skills,
                "Skill Match": f"{skill_score:.2%}"
            },
            "Experience Fit": experience_analysis,
            "Summary": summary,
            "Recommendations": recommendation
        }
        
        return result

# --- Main execution block (Removed) ---
# This file is now intended to be imported as a module by `app.py`.