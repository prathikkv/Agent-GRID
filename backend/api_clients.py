"""
API Client Manager for querying different biomedical databases.
Handles OpenTargets (GraphQL), ClinicalTrials (REST), and other databases.
"""

import asyncio
import requests
import pandas as pd
from typing import Dict, List, Any, Optional
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class APIClientManager:
    def __init__(self):
        """Initialize API clients for different databases"""
        self.base_urls = {
            "OpenTargets": "https://api.platform.opentargets.org/api/v4/graphql",
            "ClinicalTrials": "https://clinicaltrials.gov/api/v2/studies",
            "ClinVar": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils",
            "Human Protein Atlas": "https://www.proteinatlas.org/api",
            "ChEMBL": "https://www.ebi.ac.uk/chembl/api/data",
            "PubChem": "https://pubchem.ncbi.nlm.nih.gov/rest/pug"
        }
        
        # Sample data for MVP (simulates real API responses)
        self.mock_data = self._load_mock_data()
    
    async def query_database(self, database: str, parsed_query: Dict, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """
        Query a specific database based on the parsed query and resolved entities.
        
        Args:
            database: Name of the database to query
            parsed_query: Parsed query with intent and entities
            resolved_entities: Entities resolved to database-specific identifiers
            
        Returns:
            List of results from the database
        """
        try:
            if database == "OpenTargets":
                return await self._query_opentargets(parsed_query, resolved_entities)
            elif database == "ClinicalTrials.gov":
                return await self._query_clinicaltrials(parsed_query, resolved_entities)
            elif database == "ClinVar":
                return await self._query_clinvar(parsed_query, resolved_entities)
            elif database == "Human Protein Atlas":
                return await self._query_hpa(parsed_query, resolved_entities)
            else:
                logger.warning(f"Database {database} not implemented yet")
                return []
                
        except Exception as e:
            logger.error(f"Error querying {database}: {str(e)}")
            return []
    
    async def _query_opentargets(self, parsed_query: Dict, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """Query OpenTargets using GraphQL"""
        intent = parsed_query.get('intent')
        
        if intent == 'list_diseases':
            return await self._opentargets_drug_diseases(resolved_entities)
        elif intent == 'list_toxicities':
            return await self._opentargets_drug_toxicities(resolved_entities)
        elif intent == 'list_drugs':
            return await self._opentargets_disease_drugs(resolved_entities)
        elif intent == 'list_interactions':
            return await self._opentargets_target_interactions(resolved_entities)
        else:
            return await self._opentargets_drug_diseases(resolved_entities)  # Default
    
    async def _opentargets_drug_diseases(self, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """Get diseases for a drug from OpenTargets"""
        drug_entity = resolved_entities.get('drug', {})
        drug_id = drug_entity.get('resolved_identifiers', {}).get('OpenTargets')
        phase = resolved_entities.get('phase', {}).get('original', 'all')
        
        # For MVP, return mock data based on known examples
        if drug_id == "CHEMBL941" or drug_entity.get('original', '').lower() in ['imatinib', 'gleevec']:
            if phase in ['2', 'phase-2', 'phase 2']:
                return self.mock_data.get('imatinib_phase2_diseases', [])
            else:
                return self.mock_data.get('imatinib_all_diseases', [])
        elif drug_id == "CHEMBL1201576" or drug_entity.get('original', '').lower() == 'rituximab':
            return self.mock_data.get('rituximab_approved_diseases', [])
        elif drug_id == "CHEMBL1421" or drug_entity.get('original', '').lower() == 'dasatinib':
            return self.mock_data.get('dasatinib_diseases', [])
        
        return []
    
    async def _opentargets_drug_toxicities(self, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """Get toxicities for a drug from OpenTargets"""
        drug_entity = resolved_entities.get('drug', {})
        drug_id = drug_entity.get('resolved_identifiers', {}).get('OpenTargets')
        
        if drug_id == "CHEMBL1421" or drug_entity.get('original', '').lower() == 'dasatinib':
            return self.mock_data.get('dasatinib_toxicities', [])
        
        return []
    
    async def _opentargets_disease_drugs(self, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """Get drugs for a disease from OpenTargets"""
        disease_entity = resolved_entities.get('disease', {})
        disease_id = disease_entity.get('resolved_identifiers', {}).get('OpenTargets')
        
        if disease_id == "EFO_0000756" or disease_entity.get('original', '').lower() == 'alopecia':
            return self.mock_data.get('alopecia_compounds', [])
        
        return []
    
    async def _opentargets_target_interactions(self, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """Get interactions for a target from OpenTargets"""
        target_entity = resolved_entities.get('target', {})
        target_id = target_entity.get('resolved_identifiers', {}).get('OpenTargets')
        
        if target_id == "ENSG00000141510" or target_entity.get('original', '').lower() == 'tp53':
            return self.mock_data.get('tp53_interactions', [])
        
        return []
    
    async def _query_clinicaltrials(self, parsed_query: Dict, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """Query ClinicalTrials.gov"""
        # Mock implementation for MVP
        return []
    
    async def _query_clinvar(self, parsed_query: Dict, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """Query ClinVar for genetic variants"""
        # Mock implementation for MVP
        return []
    
    async def _query_hpa(self, parsed_query: Dict, resolved_entities: Dict) -> List[Dict[str, Any]]:
        """Query Human Protein Atlas"""
        # Mock implementation for MVP
        return []
    
    def _load_mock_data(self) -> Dict[str, List[Dict]]:
        """Load mock data that simulates real API responses"""
        return {
            'imatinib_phase2_diseases': [
                {
                    'drug': 'Imatinib',
                    'drug_id': 'CHEMBL941',
                    'disease_name': 'Chronic Myeloid Leukemia',
                    'efo_id': 'EFO_0000220',
                    'phase': '2',
                    'source': 'OpenTargets',
                    'evidence_score': 0.95
                },
                {
                    'drug': 'Imatinib',
                    'drug_id': 'CHEMBL941', 
                    'disease_name': 'Gastrointestinal Stromal Tumor',
                    'efo_id': 'EFO_0000559',
                    'phase': '2',
                    'source': 'OpenTargets',
                    'evidence_score': 0.88
                }
            ],
            'rituximab_approved_diseases': [
                {
                    'drug': 'Rituximab',
                    'drug_id': 'CHEMBL1201576',
                    'disease_name': 'Non-Hodgkin Lymphoma',
                    'efo_id': 'EFO_0000403',
                    'phase': 'approved',
                    'source': 'OpenTargets',
                    'evidence_score': 0.99
                },
                {
                    'drug': 'Rituximab',
                    'drug_id': 'CHEMBL1201576',
                    'disease_name': 'Chronic Lymphocytic Leukemia',
                    'efo_id': 'EFO_0000095',
                    'phase': 'approved',
                    'source': 'OpenTargets',
                    'evidence_score': 0.97
                }
            ],
            'dasatinib_toxicities': [
                {
                    'drug': 'Dasatinib',
                    'drug_id': 'CHEMBL1421',
                    'toxicity_type': 'Pleural Effusion',
                    'severity': 'Grade 3',
                    'frequency': '28%',
                    'source': 'OpenTargets'
                },
                {
                    'drug': 'Dasatinib',
                    'drug_id': 'CHEMBL1421',
                    'toxicity_type': 'Thrombocytopenia',
                    'severity': 'Grade 4',
                    'frequency': '15%',
                    'source': 'OpenTargets'
                }
            ],
            'alopecia_compounds': [
                {
                    'disease_name': 'Alopecia',
                    'efo_id': 'EFO_0000756',
                    'drug': 'Minoxidil',
                    'drug_id': 'CHEMBL807',
                    'phase': 'approved',
                    'source': 'OpenTargets'
                }
            ],
            'tp53_interactions': [
                {
                    'target_symbol': 'TP53',
                    'ensembl_id': 'ENSG00000141510',
                    'interacting_partner': 'MDM2',
                    'partner_ensembl_id': 'ENSG00000135679',
                    'interaction_score': 0.95,
                    'source': 'OpenTargets'
                }
            ]
        }

# Real API implementation examples (commented for reference):
"""
async def _real_opentargets_query(self, query: str) -> Dict:
    '''Example of real GraphQL query to OpenTargets'''
    graphql_query = '''
    query drugDiseases($chemblId: String!) {
        drug(chemblId: $chemblId) {
            knownDrugs {
                disease {
                    id
                    name
                }
                phase
                studyStartDate
                studyStopReason
            }
        }
    }
    '''
    
    response = requests.post(
        self.base_urls["OpenTargets"],
        json={
            "query": graphql_query,
            "variables": {"chemblId": "CHEMBL941"}
        },
        timeout=30
    )
    
    return response.json()
"""