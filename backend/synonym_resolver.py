"""
Synonym Resolver module for handling different naming conventions across databases.
Maps drug names (Imatinib vs CHEMBL941), target names (JAK2 vs ENSG00000096968),
and disease names (Breast Cancer vs EFO_0000305) between different database formats.
"""

import asyncio
import requests
from typing import Dict, List, Optional, Any
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class SynonymResolver:
    def __init__(self):
        """Initialize synonym resolver with hardcoded mappings for MVP"""
        
        # Hardcoded synonym mappings for MVP (expandable with API calls)
        self.synonym_map = {
            # Drug synonyms with database-specific identifiers
            "imatinib": {
                "synonyms": ["gleevec", "imatinib mesylate", "sti571"],
                "identifiers": {
                    "OpenTargets": "CHEMBL941",
                    "ChEMBL": "CHEMBL941", 
                    "PubChem": "CID5291",
                    "ClinicalTrials": "Imatinib"
                }
            },
            "rituximab": {
                "synonyms": ["rituxan", "mabthera"],
                "identifiers": {
                    "OpenTargets": "CHEMBL1201576",
                    "ChEMBL": "CHEMBL1201576",
                    "PubChem": "CID387447",
                    "ClinicalTrials": "Rituximab"
                }
            },
            "dasatinib": {
                "synonyms": ["sprycel", "bms-354825"],
                "identifiers": {
                    "OpenTargets": "CHEMBL1421",
                    "ChEMBL": "CHEMBL1421",
                    "PubChem": "CID3062316",
                    "ClinicalTrials": "Dasatinib"
                }
            },
            
            # Target synonyms
            "jak2": {
                "synonyms": ["janus kinase 2", "jak-2"],
                "identifiers": {
                    "OpenTargets": "ENSG00000096968",
                    "UniProt": "P52333",
                    "ClinVar": "JAK2",
                    "Human Protein Atlas": "JAK2"
                }
            },
            "tp53": {
                "synonyms": ["tumor protein p53", "p53"],
                "identifiers": {
                    "OpenTargets": "ENSG00000141510",
                    "UniProt": "P04637",
                    "ClinVar": "TP53",
                    "Human Protein Atlas": "TP53"
                }
            },
            
            # Disease synonyms
            "breast cancer": {
                "synonyms": ["mammary cancer", "breast carcinoma"],
                "identifiers": {
                    "OpenTargets": "EFO_0000305",
                    "MONDO": "MONDO_0007254",
                    "ClinicalTrials": "Breast Cancer"
                }
            },
            "alopecia": {
                "synonyms": ["hair loss", "baldness"],
                "identifiers": {
                    "OpenTargets": "EFO_0000756",
                    "MONDO": "MONDO_0000001",
                    "ClinicalTrials": "Alopecia"
                }
            }
        }
        
        # Cache for API-resolved synonyms
        self.cache = {}
    
    async def resolve_entity(self, entity: str, entity_type: str, databases: List[str]) -> Dict[str, Any]:
        """
        Resolve an entity to appropriate identifiers for the selected databases.
        
        Args:
            entity: The entity name to resolve (e.g., "Imatinib")
            entity_type: Type of entity ("drug", "target", "disease")
            databases: List of databases to get identifiers for
            
        Returns:
            Dictionary with resolved identifiers and synonyms
        """
        entity_lower = entity.lower()
        
        # Check cache first
        cache_key = f"{entity_lower}_{entity_type}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Check hardcoded mappings
        if entity_lower in self.synonym_map:
            result = self._format_resolution_result(
                entity, self.synonym_map[entity_lower], databases
            )
            self.cache[cache_key] = result
            return result
        
        # Check if entity matches any synonym
        for main_name, data in self.synonym_map.items():
            if entity_lower in data.get("synonyms", []):
                result = self._format_resolution_result(
                    entity, data, databases
                )
                self.cache[cache_key] = result
                return result
        
        # Try API resolution for unknown entities
        try:
            api_result = await self._resolve_via_api(entity, entity_type, databases)
            if api_result:
                self.cache[cache_key] = api_result
                return api_result
        except Exception as e:
            logger.error(f"API resolution failed for {entity}: {str(e)}")
        
        # Return original entity if no resolution found
        return {
            "original": entity,
            "resolved_identifiers": {db: entity for db in databases},
            "synonyms": [],
            "confidence": 0.5
        }
    
    def _format_resolution_result(self, original_entity: str, synonym_data: Dict, databases: List[str]) -> Dict[str, Any]:
        """Format the resolution result for consistent output"""
        resolved_identifiers = {}
        
        for db in databases:
            # Map database names to identifier keys
            db_key = self._map_database_name(db)
            resolved_identifiers[db] = synonym_data["identifiers"].get(db_key, original_entity)
        
        return {
            "original": original_entity,
            "resolved_identifiers": resolved_identifiers,
            "synonyms": synonym_data.get("synonyms", []),
            "confidence": 0.9
        }
    
    def _map_database_name(self, database_name: str) -> str:
        """Map user-friendly database names to internal keys"""
        mapping = {
            "OpenTargets": "OpenTargets",
            "ClinicalTrials.gov": "ClinicalTrials",
            "ClinVar": "ClinVar",
            "Human Protein Atlas": "Human Protein Atlas",
            "ChEMBL": "ChEMBL",
            "PubChem": "PubChem",
            "UniProt": "UniProt"
        }
        return mapping.get(database_name, database_name)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def _resolve_via_api(self, entity: str, entity_type: str, databases: List[str]) -> Optional[Dict[str, Any]]:
        """
        Resolve entity using external APIs (PubChem, UniProt, etc.)
        This is a simplified version - full implementation would query multiple APIs
        """
        if entity_type == "drug":
            return await self._resolve_drug_via_pubchem(entity, databases)
        elif entity_type == "target":
            return await self._resolve_target_via_uniprot(entity, databases)
        elif entity_type == "disease":
            return await self._resolve_disease_via_bioportal(entity, databases)
        
        return None
    
    async def _resolve_drug_via_pubchem(self, drug: str, databases: List[str]) -> Optional[Dict[str, Any]]:
        """Resolve drug synonyms using PubChem API"""
        try:
            url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{drug}/synonyms/JSON"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                synonyms = data.get("InformationList", {}).get("Information", [])
                if synonyms:
                    synonym_list = synonyms[0].get("Synonym", [])
                    
                    # Map to database identifiers (simplified)
                    resolved_identifiers = {}
                    for db in databases:
                        resolved_identifiers[db] = drug  # Default to original name
                    
                    return {
                        "original": drug,
                        "resolved_identifiers": resolved_identifiers,
                        "synonyms": synonym_list[:5],  # Limit to top 5
                        "confidence": 0.8
                    }
        except Exception as e:
            logger.error(f"PubChem API error for {drug}: {str(e)}")
        
        return None
    
    async def _resolve_target_via_uniprot(self, target: str, databases: List[str]) -> Optional[Dict[str, Any]]:
        """Resolve target synonyms using UniProt API"""
        try:
            url = f"https://rest.uniprot.org/uniprotkb/search?query={target}&format=json&size=1"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                if results:
                    entry = results[0]
                    gene_names = entry.get("genes", [])
                    synonyms = []
                    if gene_names:
                        synonyms = gene_names[0].get("synonyms", [])
                    
                    resolved_identifiers = {}
                    for db in databases:
                        resolved_identifiers[db] = target
                    
                    return {
                        "original": target,
                        "resolved_identifiers": resolved_identifiers,
                        "synonyms": synonyms,
                        "confidence": 0.8
                    }
        except Exception as e:
            logger.error(f"UniProt API error for {target}: {str(e)}")
        
        return None
    
    async def _resolve_disease_via_bioportal(self, disease: str, databases: List[str]) -> Optional[Dict[str, Any]]:
        """Resolve disease synonyms using BioPortal API (simplified - would need API key)"""
        # For MVP, return basic mapping
        resolved_identifiers = {}
        for db in databases:
            resolved_identifiers[db] = disease
        
        return {
            "original": disease,
            "resolved_identifiers": resolved_identifiers,
            "synonyms": [],
            "confidence": 0.6
        }