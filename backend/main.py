"""
Main FastAPI application for the Drug Query Tool.
This serves as the entry point for all API requests and coordinates
between different modules (NLP, synonym resolution, API clients).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import traceback

from nlp import NLPProcessor
from synonym_resolver import SynonymResolver
from api_clients import APIClientManager
from harmonizer import DataHarmonizer

# Configure logging for debugging and monitoring
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Drug Query Tool", version="1.0.0")

# Enable CORS for frontend-backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core components
nlp_processor = NLPProcessor()
synonym_resolver = SynonymResolver()
api_client_manager = APIClientManager()
data_harmonizer = DataHarmonizer()

class QueryRequest(BaseModel):
    """Data model for incoming query requests"""
    query: str
    databases: List[str] = ["OpenTargets"]

class QueryResponse(BaseModel):
    """Data model for query responses"""
    data: List[Dict[str, Any]]
    message: str
    total_records: int
    query_info: Dict[str, Any]

@app.post("/api/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """
    Main endpoint that processes natural language queries about drugs, targets, and diseases.
    
    This function:
    1. Parses the natural language query to extract entities and intent
    2. Resolves synonyms to get correct database identifiers
    3. Queries the appropriate databases
    4. Harmonizes and returns the results
    """
    try:
        logger.info(f"Processing query: {request.query}")
        logger.info(f"Selected databases: {request.databases}")
        
        # Step 1: Parse the natural language query
        parsed_query = nlp_processor.parse_query(request.query)
        logger.info(f"Parsed query: {parsed_query}")
        
        # Step 2: Resolve synonyms to get database-specific identifiers
        resolved_entities = {}
        for entity_type, entity_value in parsed_query.get('entities', {}).items():
            if entity_value:
                resolved = await synonym_resolver.resolve_entity(
                    entity_value, entity_type, request.databases
                )
                resolved_entities[entity_type] = resolved
        
        logger.info(f"Resolved entities: {resolved_entities}")
        
        # Step 3: Query the selected databases
        results = []
        for database in request.databases:
            try:
                db_results = await api_client_manager.query_database(
                    database, parsed_query, resolved_entities
                )
                if db_results:
                    results.extend(db_results)
            except Exception as e:
                logger.error(f"Error querying {database}: {str(e)}")
                # Continue with other databases even if one fails
                continue
        
        # Step 4: Harmonize results from different databases
        harmonized_data = data_harmonizer.harmonize_results(results, parsed_query['intent'])
        
        return QueryResponse(
            data=harmonized_data,
            message="Query processed successfully",
            total_records=len(harmonized_data),
            query_info={
                "parsed_query": parsed_query,
                "resolved_entities": resolved_entities,
                "databases_queried": request.databases
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "message": "Drug Query Tool API is running"}

@app.get("/api/databases")
async def get_available_databases():
    """Returns list of available databases"""
    return {
        "databases": [
            "OpenTargets",
            "ClinicalTrials.gov", 
            "ClinVar",
            "Human Protein Atlas",
            "MGI",
            "ChEMBL",
            "IUPHAR"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)