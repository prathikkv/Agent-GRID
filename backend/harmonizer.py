"""
Data Harmonizer module for standardizing results from different databases.
Ensures consistent data format regardless of source database.
"""

import pandas as pd
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class DataHarmonizer:
    def __init__(self):
        """Initialize the data harmonizer with standard schema"""
        
        # Standard schema for harmonized results
        self.standard_schema = {
            'drug': str,
            'drug_id': str,
            'disease_name': str,
            'efo_id': str,
            'phase': str,
            'source': str,
            'toxicity_type': str,
            'target_symbol': str,
            'ensembl_id': str,
            'score': float,
            'expression_level': float,
            'snp_id': str,
            'phenotype': str,
            'localization': str,
            'evidence': str,
            'frequency': str,
            'severity': str
        }
        
        # Field mappings from different databases to standard schema
        self.field_mappings = {
            'OpenTargets': {
                'drug_name': 'drug',
                'chembl_id': 'drug_id',
                'disease_id': 'efo_id',
                'clinical_phase': 'phase',
                'evidence_score': 'score'
            },
            'ClinicalTrials': {
                'intervention_name': 'drug',
                'condition': 'disease_name',
                'study_phase': 'phase'
            },
            'ClinVar': {
                'gene_symbol': 'target_symbol',
                'variant_id': 'snp_id',
                'clinical_significance': 'evidence'
            }
        }
    
    def harmonize_results(self, results: List[Dict[str, Any]], intent: str) -> List[Dict[str, Any]]:
        """
        Harmonize results from multiple databases into a standard format.
        
        Args:
            results: Raw results from database queries
            intent: Query intent to determine which fields to prioritize
            
        Returns:
            Harmonized list of results with consistent schema
        """
        if not results:
            return []
        
        try:
            # Convert to DataFrame for easier manipulation
            df = pd.DataFrame(results)
            
            # Fill missing values
            df = df.fillna('-')
            
            # Standardize field names based on source
            df = self._standardize_fields(df)
            
            # Apply intent-specific processing
            df = self._apply_intent_processing(df, intent)
            
            # Ensure all standard fields exist
            df = self._ensure_standard_fields(df)
            
            # Sort by relevance score if available
            if 'score' in df.columns:
                df = df.sort_values('score', ascending=False)
            
            # Convert back to list of dictionaries
            harmonized_results = df.to_dict('records')
            
            logger.info(f"Harmonized {len(harmonized_results)} results for intent: {intent}")
            return harmonized_results
            
        except Exception as e:
            logger.error(f"Error harmonizing results: {str(e)}")
            # Return original results if harmonization fails
            return results
    
    def _standardize_fields(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize field names based on source database"""
        
        # Apply field mappings if source is specified
        if 'source' in df.columns:
            for source in df['source'].unique():
                if source in self.field_mappings:
                    source_mask = df['source'] == source
                    mapping = self.field_mappings[source]
                    
                    for old_field, new_field in mapping.items():
                        if old_field in df.columns:
                            df.loc[source_mask, new_field] = df.loc[source_mask, old_field]
        
        return df
    
    def _apply_intent_processing(self, df: pd.DataFrame, intent: str) -> pd.DataFrame:
        """Apply intent-specific data processing"""
        
        if intent == 'list_diseases':
            # Ensure disease information is present
            if 'disease_name' not in df.columns and 'condition' in df.columns:
                df['disease_name'] = df['condition']
            
            # Standardize phase information
            if 'phase' in df.columns:
                df['phase'] = df['phase'].apply(self._standardize_phase)
        
        elif intent == 'list_toxicities':
            # Standardize toxicity information
            if 'adverse_event' in df.columns and 'toxicity_type' not in df.columns:
                df['toxicity_type'] = df['adverse_event']
        
        elif intent == 'list_drugs':
            # Ensure drug information is present
            if 'compound_name' in df.columns and 'drug' not in df.columns:
                df['drug'] = df['compound_name']
        
        return df
    
    def _standardize_phase(self, phase: Any) -> str:
        """Standardize clinical trial phase information"""
        if pd.isna(phase) or phase == '-':
            return 'Unknown'
        
        phase_str = str(phase).lower().strip()
        
        # Map various phase representations to standard format
        phase_mapping = {
            'phase 1': '1',
            'phase-1': '1',
            'phase i': '1',
            'phase 2': '2', 
            'phase-2': '2',
            'phase ii': '2',
            'phase 3': '3',
            'phase-3': '3',
            'phase iii': '3',
            'phase 4': '4',
            'phase-4': '4',
            'phase iv': '4',
            'approved': 'approved',
            'preclinical': 'preclinical'
        }
        
        return phase_mapping.get(phase_str, str(phase))
    
    def _ensure_standard_fields(self, df: pd.DataFrame) -> pd.DataFrame:
        """Ensure all standard schema fields exist in the DataFrame"""
        
        for field, dtype in self.standard_schema.items():
            if field not in df.columns:
                if dtype == str:
                    df[field] = '-'
                elif dtype == float:
                    df[field] = 0.0
                else:
                    df[field] = None
        
        # Reorder columns to match standard schema
        standard_columns = list(self.standard_schema.keys())
        existing_columns = [col for col in standard_columns if col in df.columns]
        extra_columns = [col for col in df.columns if col not in standard_columns]
        
        df = df[existing_columns + extra_columns]
        
        return df