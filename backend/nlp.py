"""
NLP Processing module for extracting entities and intent from biomedical queries.
Uses spaCy for the MVP with fallback rules, designed to be easily upgradeable to BioBERT.
"""

import spacy
import re
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class NLPProcessor:
    def __init__(self):
        """Initialize the NLP processor with spaCy and custom rules"""
        try:
            # Load spaCy model (install with: python -m spacy download en_core_web_sm)
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found, using basic rule-based processing")
            self.nlp = None
        
        # Intent mapping based on keywords in the query
        self.intent_patterns = {
            'list_diseases': ['list diseases', 'diseases for', 'conditions for', 'indications'],
            'list_drugs': ['list compounds', 'list drugs', 'compounds for', 'drugs for'],
            'list_targets': ['list targets', 'targets for', 'proteins for'],
            'list_toxicities': ['toxicities', 'adverse events', 'side effects'],
            'list_trials': ['clinical trials', 'trials for', 'studies for'],
            'list_expression': ['expression', 'expression levels', 'protein levels'],
            'list_interactions': ['interactions', 'interacting partners', 'binding partners'],
            'list_snps': ['SNPs', 'variants', 'mutations', 'pathogenic variants']
        }
        
        # Entity patterns for biomedical entities
        self.entity_patterns = {
            'drug': [
                'imatinib', 'gleevec', 'rituximab', 'dasatinib', 'sprycel',
                'chembl941', 'chembl1201576', 'chembl1421'
            ],
            'target': [
                'jak1', 'jak2', 'jak3', 'tp53', 'egfr', 'her2',
                'ensg00000096968', 'ensg00000141510', 'p52333'
            ],
            'disease': [
                'breast cancer', 'lung cancer', 'alopecia', 'leukemia',
                'efo_0000305', 'mondo_0007254'
            ],
            'phase': ['phase-1', 'phase-2', 'phase-3', 'phase 1', 'phase 2', 'phase 3', 'approved']
        }
    
    def parse_query(self, query: str) -> Dict[str, Any]:
        """
        Parse a natural language query to extract intent and entities.
        
        Args:
            query: Natural language query from the user
            
        Returns:
            Dictionary with parsed intent, entities, and metadata
        """
        query_lower = query.lower().strip()
        
        # Extract intent
        intent = self._extract_intent(query_lower)
        
        # Extract entities
        entities = self._extract_entities(query_lower)
        
        # Extract phase information
        phase = self._extract_phase(query_lower)
        if phase:
            entities['phase'] = phase
        
        return {
            'original_query': query,
            'intent': intent,
            'entities': entities,
            'confidence': 0.9  # Static confidence for rule-based system
        }
    
    def _extract_intent(self, query: str) -> str:
        """Extract the user's intent from the query"""
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if pattern in query:
                    return intent
        
        # Default intent based on common query structures
        if 'list' in query or 'show' in query:
            if 'disease' in query or 'condition' in query:
                return 'list_diseases'
            elif 'drug' in query or 'compound' in query:
                return 'list_drugs'
            elif 'target' in query or 'protein' in query:
                return 'list_targets'
        
        return 'list_diseases'  # Default fallback
    
    def _extract_entities(self, query: str) -> Dict[str, str]:
        """Extract biomedical entities from the query"""
        entities = {}
        
        # Use spaCy if available for named entity recognition
        if self.nlp:
            doc = self.nlp(query)
            for ent in doc.ents:
                if ent.label_ in ['PERSON', 'ORG', 'PRODUCT']:
                    # Map spaCy entities to biomedical categories
                    entity_type = self._classify_biomedical_entity(ent.text.lower())
                    if entity_type:
                        entities[entity_type] = ent.text
        
        # Rule-based entity extraction
        for entity_type, patterns in self.entity_patterns.items():
            for pattern in patterns:
                if pattern in query:
                    entities[entity_type] = pattern
                    break
        
        return entities
    
    def _extract_phase(self, query: str) -> Optional[str]:
        """Extract clinical trial phase information"""
        # Pattern matching for phases
        phase_patterns = [
            (r'phase[-\s]*(\d)', r'\1'),
            (r'phase[-\s]*(i{1,3})', lambda m: str(len(m.group(1)))),
            (r'approved', 'approved'),
            (r'preclinical', 'preclinical')
        ]
        
        for pattern, replacement in phase_patterns:
            match = re.search(pattern, query)
            if match:
                if callable(replacement):
                    return replacement(match)
                else:
                    return replacement
        
        return None
    
    def _classify_biomedical_entity(self, entity: str) -> Optional[str]:
        """Classify an entity into biomedical categories"""
        # Check against known patterns
        for entity_type, patterns in self.entity_patterns.items():
            if entity in patterns:
                return entity_type
        
        # Heuristic classification based on common patterns
        if any(keyword in entity for keyword in ['cancer', 'disease', 'syndrome']):
            return 'disease'
        elif any(keyword in entity for keyword in ['kinase', 'receptor', 'protein']):
            return 'target'
        elif len(entity) > 3 and entity.isalnum():
            return 'drug'  # Likely a drug name or code
        
        return None

# TODO: BioBERT Integration (for future enhancement)
"""
For production deployment with BioBERT:

1. Install transformers: pip install transformers torch
2. Load BioBERT model:
   from transformers import AutoTokenizer, AutoModel
   tokenizer = AutoTokenizer.from_pretrained("dmis-lab/biobert-base-cased-v1.2")
   model = AutoModel.from_pretrained("dmis-lab/biobert-base-cased-v1.2")

3. Fine-tune on biomedical NER dataset
4. Replace _extract_entities with BioBERT-based extraction

This would provide much higher accuracy for complex biomedical queries.
"""