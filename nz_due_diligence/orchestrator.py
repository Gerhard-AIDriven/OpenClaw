import asyncio
import logging
import os
from typing import Dict, Any, Optional
from client import NZDueDiligenceClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NZDueDiligenceOrchestrator")

class DueDiligenceOrchestrator:
    def __init__(self, client: NZDueDiligenceClient, output_dir: str = "reports_automation"):
        self.client = client
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    async def run_full_pipeline(
        self, 
        address_data: Dict[str, Any], 
        report_level: str = "standard",
        selected_amenities: Optional[list] = None
    ) -> Optional[str]:
        """
        Orchestrates the full flow: Boundary -> Report -> PDF.
        Returns the path to the generated PDF if successful.
        """
        try:
            # Default amenities if none provided (matching map_viewer.html defaults)
            if selected_amenities is None:
                selected_amenities = [
                    "school", "supermarket", "pharmacy", "hospital", 
                    "restaurant", "cafe", "bus_stop", "police", 
                    "park", "library", "bank", "post_office"
                ]

            # 1. Resolve Boundary & RID
            logger.info("Step 1: Resolving property boundary...")
            boundary_data = await self.client.get_boundary(address_data)
            rid = boundary_data.get("rid")
            lon = boundary_data.get("lon")
            lat = boundary_data.get("lat")
            geojson = boundary_data.get("geojson")

            if not rid:
                logger.error("Failed to resolve RID for the given address.")
                return None

            # 2. Trigger Report Generation
            logger.info(f"Step 2: Triggering report for RID {rid}...")
            report_payload = {
                "rid": rid,
                "report_level": report_level,
                "address": f"{address_data.get('street_number', '')} {address_data.get('street_name', '')}".strip(),
                "street_number": address_data.get('street_number', ''),
                "street_name": address_data.get('street_name', ''),
                "street_type": address_data.get('street_type', ''),
                "lon": lon,
                "lat": lat,
                "boundary_geojson": geojson,
                "selected_amenities": selected_amenities,
                "force_refresh": address_data.get("force_refresh", False)
            }
            await self.client.trigger_report(report_payload)

            # 3. Handle Advanced Report Risk Assessment
            if report_level == "advanced":
                logger.info("Step 3: Performing Advanced AI Risk Assessment...")
                await self.client.get_risk_assessment(rid, report_level)

            # 4. Generate and Save PDF
            logger.info("Step 4: Generating final PDF...")
            pdf_bytes = await self.client.generate_pdf(rid, report_level)
            
            file_path = os.path.join(self.output_dir, f"automation_report_{rid}.pdf")
            with open(file_path, "wb") as f:
                f.write(pdf_bytes)

            logger.info(f"Pipeline complete. Report saved to: {file_path}")
            return file_path

        except Exception as e:
            logger.exception(f"Pipeline failed: {str(e)}")
            return None

async def main():
    # Example test run
    client = NZDueDiligenceClient()
    orchestrator = DueDiligenceOrchestrator(client)
    
    test_address = {
        "street_number": "31",
        "street_name": "Douglas McLean",
        "street_type": "avenue",
        "city": "Napier"
    }
    
    result = await orchestrator.run_full_pipeline(test_address, report_level="standard")
    if result:
        print(f"SUCCESS: Report generated at {result}")
    else:
        print("FAILURE: Could not generate report.")

if __name__ == "__main__":
    asyncio.run(main())
