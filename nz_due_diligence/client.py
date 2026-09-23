import httpx
import logging
from typing import Dict, Any, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NZDueDiligenceClient")

class NZDueDiligenceClient:
    def __init__(self, base_url: str = "http://127.0.0.1:8000"):
        self.base_url = base_url
        # Increase timeout globally for this client to handle slow government APIs
        self.timeout = httpx.Timeout(120.0, read=120.0)

    async def get_boundary(self, address_params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Resolves property boundary and RID using the LINZ pipeline.
        """
        url = f"{self.base_url}/api/orders/property/boundary"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.info(f"Requesting boundary for: {address_params.get('street_name')}")
            response = await client.get(url, params=address_params)
            response.raise_for_status()
            return response.json()

    async def trigger_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Triggers the scraping of the Napier Council property report.
        """
        url = f"{self.base_url}/api/orders/property/report"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.info(f"Triggering report for RID: {payload.get('rid')}")
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return response.json()

    async def generate_pdf(self, rid: str, report_level: str = "standard") -> bytes:
        """
        Triggers PDF generation and returns the raw PDF bytes.
        """
        url = f"{self.base_url}/api/orders/property/pdf"
        payload = {"rid": rid, "report_level": report_level}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.info(f"Generating PDF for RID: {rid} (Level: {report_level})")
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return response.content

    async def get_risk_assessment(self, rid: str, report_level: str) -> Dict[str, Any]:
        """
        Explicitly calls the AI risk assessment endpoint (used for Advanced reports).
        """
        url = f"{self.base_url}/api/analysis/risk-assessment"
        payload = {"rid": rid, "report_level": report_level}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            logger.info(f"Fetching risk assessment for RID: {rid}")
            response = await client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
