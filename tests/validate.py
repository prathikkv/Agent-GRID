"""
Validation script to test the Drug Query Tool against expected results.
Ensures that the tool produces correct outputs for known test cases.
"""

import pandas as pd
import requests
import json
import os
from typing import Dict, List, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryValidator:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.validation_data_path = "public/validation"
        
        # Test cases with expected CSV files
        self.test_cases = [
            {
                "query": "List diseases in Phase-2 for Imatinib",
                "databases": ["OpenTargets"],
                "expected_csv": "imatinib_phase2_diseases.csv",
                "description": "Imatinib Phase-2 diseases from OpenTargets"
            },
            {
                "query": "List diseases in Phase-2 for Gleevec",  # Synonym test
                "databases": ["OpenTargets"],
                "expected_csv": "imatinib_phase2_diseases.csv",
                "description": "Gleevec (Imatinib synonym) Phase-2 diseases"
            },
            {
                "query": "List diseases for which Rituximab is approved",
                "databases": ["OpenTargets"],
                "expected_csv": "rituximab_approved_diseases.csv",
                "description": "Rituximab approved diseases"
            },
            {
                "query": "List toxicities for Dasatinib",
                "databases": ["OpenTargets"],
                "expected_csv": "dasatinib_toxicities_opentargets.csv",
                "description": "Dasatinib toxicities from OpenTargets"
            },
            {
                "query": "List diseases associated with JAK2",
                "databases": ["OpenTargets"],
                "expected_csv": "jak2_associated_diseases_opentarget.csv",
                "description": "JAK2 associated diseases"
            },
            {
                "query": "List approved compounds for Alopecia",
                "databases": ["OpenTargets"],
                "expected_csv": "EFO_0000756_approved_compounds_opentarget.csv",
                "description": "Approved compounds for Alopecia"
            }
        ]
    
    def run_all_validations(self) -> Dict[str, bool]:
        """Run all validation test cases"""
        results = {}
        
        logger.info("Starting validation tests...")
        
        for i, test_case in enumerate(self.test_cases, 1):
            logger.info(f"\nRunning test {i}/{len(self.test_cases)}: {test_case['description']}")
            
            try:
                success = self.validate_query(
                    test_case["query"],
                    test_case["databases"],
                    test_case["expected_csv"]
                )
                results[test_case["description"]] = success
                
                if success:
                    logger.info(f"✅ Test {i} PASSED")
                else:
                    logger.error(f"❌ Test {i} FAILED")
                    
            except Exception as e:
                logger.error(f"❌ Test {i} ERROR: {str(e)}")
                results[test_case["description"]] = False
        
        # Summary
        passed = sum(results.values())
        total = len(results)
        logger.info(f"\n{'='*50}")
        logger.info(f"VALIDATION SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"Passed: {passed}/{total}")
        logger.info(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            logger.info("🎉 All tests passed!")
        else:
            logger.warning(f"⚠️  {total-passed} tests failed")
        
        return results
    
    def validate_query(self, query: str, databases: List[str], expected_csv: str) -> bool:
        """
        Validate a single query against expected results
        
        Args:
            query: Natural language query to test
            databases: List of databases to query
            expected_csv: Name of CSV file with expected results
            
        Returns:
            True if validation passes, False otherwise
        """
        try:
            # Make API request
            response = requests.post(
                f"{self.base_url}/api/query",
                json={"query": query, "databases": databases},
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"API request failed with status {response.status_code}: {response.text}")
                return False
            
            # Parse response
            result_data = response.json()
            actual_results = result_data.get("data", [])
            
            # Load expected results
            expected_path = os.path.join(self.validation_data_path, expected_csv)
            if not os.path.exists(expected_path):
                logger.warning(f"Expected CSV file not found: {expected_path}")
                # For MVP, we'll create mock expected data
                expected_results = self._create_mock_expected_data(expected_csv)
            else:
                expected_df = pd.read_csv(expected_path)
                expected_results = expected_df.to_dict('records')
            
            # Compare results
            return self._compare_results(actual_results, expected_results, query)
            
        except Exception as e:
            logger.error(f"Validation error for query '{query}': {str(e)}")
            return False
    
    def _compare_results(self, actual: List[Dict], expected: List[Dict], query: str) -> bool:
        """Compare actual results with expected results"""
        
        # Basic checks
        if len(actual) == 0 and len(expected) > 0:
            logger.error(f"No results returned for query: {query}")
            return False
        
        if len(actual) == 0 and len(expected) == 0:
            logger.info("Both actual and expected results are empty - validation passed")
            return True
        
        # Convert to DataFrames for comparison
        actual_df = pd.DataFrame(actual).fillna('-')
        expected_df = pd.DataFrame(expected).fillna('-')
        
        # Check if key fields match
        key_fields = ['drug', 'disease_name', 'phase', 'toxicity_type']
        
        matches = 0
        for _, expected_row in expected_df.iterrows():
            for _, actual_row in actual_df.iterrows():
                if self._rows_match(actual_row, expected_row, key_fields):
                    matches += 1
                    break
        
        match_rate = matches / len(expected_df) if len(expected_df) > 0 else 0
        
        logger.info(f"Match rate: {matches}/{len(expected_df)} ({match_rate*100:.1f}%)")
        
        # Consider validation successful if at least 80% of expected results match
        return match_rate >= 0.8
    
    def _rows_match(self, actual_row: pd.Series, expected_row: pd.Series, key_fields: List[str]) -> bool:
        """Check if two rows match on key fields"""
        for field in key_fields:
            if field in actual_row and field in expected_row:
                actual_val = str(actual_row[field]).lower().strip()
                expected_val = str(expected_row[field]).lower().strip()
                
                if actual_val != '-' and expected_val != '-':
                    if actual_val != expected_val:
                        return False
        return True
    
    def _create_mock_expected_data(self, csv_filename: str) -> List[Dict]:
        """Create mock expected data for validation when CSV files are not available"""
        
        mock_data = {
            "imatinib_phase2_diseases.csv": [
                {
                    "drug": "Imatinib",
                    "drug_id": "CHEMBL941",
                    "disease_name": "Chronic Myeloid Leukemia",
                    "efo_id": "EFO_0000220",
                    "phase": "2",
                    "source": "OpenTargets"
                },
                {
                    "drug": "Imatinib", 
                    "drug_id": "CHEMBL941",
                    "disease_name": "Gastrointestinal Stromal Tumor",
                    "efo_id": "EFO_0000559",
                    "phase": "2",
                    "source": "OpenTargets"
                }
            ],
            "rituximab_approved_diseases.csv": [
                {
                    "drug": "Rituximab",
                    "drug_id": "CHEMBL1201576",
                    "disease_name": "Non-Hodgkin Lymphoma",
                    "efo_id": "EFO_0000403",
                    "phase": "approved",
                    "source": "OpenTargets"
                }
            ],
            "dasatinib_toxicities_opentargets.csv": [
                {
                    "drug": "Dasatinib",
                    "drug_id": "CHEMBL1421",
                    "toxicity_type": "Pleural Effusion",
                    "severity": "Grade 3",
                    "source": "OpenTargets"
                }
            ]
        }
        
        return mock_data.get(csv_filename, [])

def main():
    """Main function to run validation tests"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Validate Drug Query Tool")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL of the API")
    parser.add_argument("--test", help="Run specific test by description")
    
    args = parser.parse_args()
    
    validator = QueryValidator(args.url)
    
    if args.test:
        # Run specific test
        test_case = next((tc for tc in validator.test_cases if args.test.lower() in tc["description"].lower()), None)
        if test_case:
            success = validator.validate_query(test_case["query"], test_case["databases"], test_case["expected_csv"])
            print(f"Test result: {'PASSED' if success else 'FAILED'}")
        else:
            print(f"Test not found: {args.test}")
    else:
        # Run all tests
        results = validator.run_all_validations()
        
        # Exit with error code if any tests failed
        if not all(results.values()):
            exit(1)

if __name__ == "__main__":
    main()