Install dependencies

bash# Frontend dependencies
npm install

# Backend dependencies  
pip install -r requirements.txt

# Install spaCy model
python -m spacy download en_core_web_sm

Start the application

bash# Terminal 1: Start backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend
npm run dev

Open your browser
Navigate to http://localhost:3000

📖 How to Use
Basic Query Examples
Drug-related queries:

"List diseases in Phase-2 for Imatinib"
"List toxicities for Dasatinib"
"For Rituximab, list approved diseases"

Target-related queries:

"List diseases associated with JAK2"
"List interacting partners for TP53"
"List compounds for JAK2 target"

Disease-related queries:

"List approved compounds for Alopecia"
"List clinical compounds for Breast Cancer"

Database Selection
Choose from these databases:

OpenTargets: Drug-target-disease associations
ClinicalTrials.gov: Clinical trial data
ClinVar: Genetic variants and pathogenicity
Human Protein Atlas: Protein expression data
MGI: Mouse genomics information
ChEMBL: Bioactivity and drug data
IUPHAR: Pharmacology database

Understanding Results
Table View:

Sort columns by clicking headers
Filter results using the search box
Export to CSV for further analysis

Visualizations:

Bar Charts: Distribution across phases/categories
Pie Charts: Proportional breakdowns
Heatmaps: Expression levels across tissues

🧬 Supported Use Cases
Drug Queries (15 use cases)

List diseases in specific phases for a drug
List approved diseases for a drug
List drug targets and binding affinities
List drug toxicities and adverse events
List pathogenic SNPs for drug targets
List other indications in trials
List terminated clinical trials
List expression levels of drug targets
List neurological disease symptoms by phase
List patient enrollment and demographics
List signs and symptoms by phase
And more...

Disease Queries (12 use cases)

List approved compounds for a disease
List clinical compounds by phase
List pathogenic SNPs for disease
List mouse models for disease
List black box warnings
List targets by trial phase
List phenotypes in mouse models
Retrieve protein expression in tissues
And more...

Target Queries (9 use cases)

List compounds by development phase
List compounds and binding affinities
List PAN inhibitors (e.g., JAK1/2/3)
List associated diseases
List interacting partners
List expression across tissues
List knockout mouse models
Describe adverse events
And more...

🔧 Technical Details
Architecture

Frontend: Next.js with React and Tailwind CSS
Backend: FastAPI with Python
NLP: spaCy with biomedical entity recognition
Synonym Resolution: PubChem, UniProt, BioPortal APIs
Deployment: Vercel (serverless)

Data Sources Integration

OpenTargets: GraphQL API for drug-target-disease data
ClinicalTrials.gov: REST API for clinical trials
PubChem: Chemical compound synonyms
UniProt: Protein/target information
BioPortal: Disease ontology mapping

Synonym Handling
The tool automatically handles different naming conventions:

Drugs: Imatinib ↔ Gleevec ↔ CHEMBL941
Targets: JAK2 ↔ ENSG00000096968 ↔ P52333
Diseases: Breast Cancer ↔ EFO_0000305

🧪 Testing
Run the validation tests to ensure everything works:
bash# Test all functionality
python tests/validate.py

# Test specific query
python tests/validate.py --test "Imatinib"

# Test against live deployment
python tests/validate.py --url "https://your-app.vercel.app"
📊 Example Queries and Expected Results
Query: "List diseases in Phase-2 for Imatinib"
Expected Results:

Chronic Myeloid Leukemia (Phase 2)
Gastrointestinal Stromal Tumor (Phase 2)
Acute Lymphoblastic Leukemia (Phase 2)

Query: "List toxicities for Dasatinib"
Expected Results:

Pleural Effusion (Grade 3, 28% frequency)
Thrombocytopenia (Grade 4, 15% frequency)
Neutropenia (Grade 3, 21% frequency)

🚀 Deployment
Deploy to Vercel

Push to GitHub

bashgit add .
git commit -m "Initial commit"
git push origin main

Deploy with Vercel

bashnpm install -g vercel
vercel --prod

Set Environment Variables (in Vercel dashboard)


BIOPORTAL_API_KEY (if using BioPortal)
PYTHONPATH=/var/task

Manual Deployment

Build the application

bashnpm run build

Deploy backend (to your preferred platform)
Deploy frontend (to Vercel, Netlify, etc.)

🔍 Troubleshooting
Common Issues
"spaCy model not found"
bashpython -m spacy download en_core_web_sm
"No results found"

Try synonyms (e.g., "Gleevec" instead of "Imatinib")
Check spelling
Verify database selection

API timeouts

Reduce number of selected databases
Try simpler queries first

CSV export not working

Ensure papaparse is installed: npm install papaparse
Check browser popup blockers

Getting Help

Check the browser console for errors
Review the validation test results
Ensure all dependencies are installed
Verify API endpoints are accessible

🧑‍💻 For Developers
Adding New Databases

Add API client in backend/api_clients.py
Update synonym mappings in backend/synonym_resolver.py
Add harmonization rules in backend/harmonizer.py
Update frontend database list in components/QueryForm.js

Adding New Query Types

Update NLP patterns in backend/nlp.py
Add API query logic in backend/api_clients.py
Test with validation script

Performance Optimization

Caching: Implement Redis for synonym caching
Rate Limiting: Add rate limiting for API calls
Database Indexing: Optimize database queries
CDN: Use CDN for static assets

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🤝 Contributing

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📞 Support
For questions or issues:

Check the troubleshooting section above
Review test cases in tests/validate.py
Open an issue in the GitHub repository


Built for biologists, by developers who understand science.