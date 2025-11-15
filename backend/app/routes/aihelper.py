from typing import Optional, List
from fastapi import APIRouter, HTTPException, status, File, UploadFile
from app.config import settings
import base64
from pydantic import BaseModel


router = APIRouter(prefix="/aihelper", tags=["aihelper"])


class ScamDetectionResponse(BaseModel):
    likelihood: float
    reasoning: str
    verdict: str
    model: str

class MedicationInstructionsResponse(BaseModel):
    medication_name: str
    simple_instructions: str
    dosage: str
    warnings: str
    model: str

@router.post("/detect-scam-image", response_model=ScamDetectionResponse, status_code=status.HTTP_200_OK)
async def detect_scam_image(
    image: UploadFile = File(...),
    model: str = "gpt-4o"
):
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")
    try:
        from openai import OpenAI
        import json
        
        client = OpenAI(api_key=settings.openai_api_key)
        
        content = await image.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
        
        mime = image.content_type or "image/png"
        b64 = base64.b64encode(content).decode("utf-8")
        
        user_prompt = (
            "Look at this message or screenshot. Is it safe or is someone trying to trick an elderly person? "
            "Check for: asking for money, asking for passwords, urgent scary messages, fake tech support, "
            "lottery or prize tricks, pretending to be family or officials. "
            "Use simple, clear language that elderly people can understand. "
            "Reply with ONLY valid JSON, no markdown: "
            '{"likelihood": 50, "verdict": "scam", "reasoning": "simple explanation here"}'
        )
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
                ],
            },
        ]
        
        resp = client.chat.completions.create(model=model, messages=messages)
        
        if not resp.choices or not resp.choices[0].message.content:
            return ScamDetectionResponse(
                likelihood=50.0,
                reasoning="We couldn't check this message. The image might be unclear. Try taking a clearer photo.",
                verdict="unknown",
                model=model,
            )
        
        raw = resp.choices[0].message.content.strip()
        
        text = raw
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        try:
            data = json.loads(text)
        except:
            import re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                except:
                    data = None
            else:
                data = None
        
        if not data or "likelihood" not in data:
            return ScamDetectionResponse(
                likelihood=50.0,
                reasoning="Unable to analyze the image clearly. Please ensure the screenshot shows readable text or try a clearer photo.",
                verdict="unknown",
                model=model,
            )
        
        return ScamDetectionResponse(
            likelihood=float(data.get("likelihood", 50)),
            reasoning=data.get("reasoning", "Analysis completed."),
            verdict=data.get("verdict", "unknown"),
            model=model,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")


@router.post("/medication-instructions", response_model=MedicationInstructionsResponse, status_code=status.HTTP_200_OK)
async def medication_instructions(
    image: UploadFile = File(...),
    model: str = "gpt-4o"
):
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")
    try:
        from openai import OpenAI
        import json
        
        client = OpenAI(api_key=settings.openai_api_key)
        
        content = await image.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file uploaded.")
        
        mime = image.content_type or "image/png"
        b64 = base64.b64encode(content).decode("utf-8")
        
        user_prompt = (
            "You are helping an elderly person understand their medication. "
            "Analyze this photo of pill packaging, prescription label, or medication information. "
            "Provide clear, simple instructions in large, easy-to-read format. "
            "Use simple language, avoid medical jargon. "
            "For dosage, specify how many pills to take (e.g., '1 pill' or '2 tablets'), not mg amounts. "
            "Reply with ONLY valid JSON, no markdown: "
            '{"medication_name": "Name", "simple_instructions": "Take 1 pill in the morning with food", '
            '"dosage": "1 pill", "warnings": "Do not take with alcohol. Call doctor if dizzy."}'
        )
        
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
                ],
            },
        ]
        
        resp = client.chat.completions.create(model=model, messages=messages)
        
        if not resp.choices or not resp.choices[0].message.content:
            return MedicationInstructionsResponse(
                medication_name="Cannot read label",
                simple_instructions="Sorry, I cannot read your medication label. Please take a clearer photo or ask your pharmacist for help.",
                dosage="Not visible",
                warnings="Always ask your doctor or pharmacist if you have questions about your medication.",
                model=model,
            )
        
        raw = resp.choices[0].message.content.strip()
        
        text = raw
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        
        try:
            data = json.loads(text)
        except:
            import re
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                except:
                    data = None
            else:
                data = None
        
        if not data or "medication_name" not in data:
            return MedicationInstructionsResponse(
                medication_name="Cannot read label",
                simple_instructions="Sorry, I cannot read the medication label clearly. Please take a clearer photo showing the medication name and instructions, or ask your pharmacist for help.",
                dosage="Not visible",
                warnings="Always consult your doctor or pharmacist if you have questions about your medication.",
                model=model,
            )
        
        return MedicationInstructionsResponse(
            medication_name=data.get("medication_name", "Unknown medication"),
            simple_instructions=data.get("simple_instructions", "Please consult your doctor or pharmacist."),
            dosage=data.get("dosage", "See label"),
            warnings=data.get("warnings", "Follow label instructions. Contact your doctor if you have questions."),
            model=model,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")
