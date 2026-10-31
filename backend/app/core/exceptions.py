from fastapi import HTTPException, status

class DisputePilotException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class EntityNotFoundException(DisputePilotException):
    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            detail=f"{entity_name} with identifier '{entity_id}' not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

class UnauthorizedException(DisputePilotException):
    def __init__(self, detail: str = "Invalid credentials or unauthorized"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)

class ForbiddenException(DisputePilotException):
    def __init__(self, detail: str = "Access forbidden for current role or merchant tenant"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)

class PayPalIntegrationException(DisputePilotException):
    def __init__(self, detail: str, status_code: int = status.HTTP_502_BAD_GATEWAY):
        super().__init__(detail=f"PayPal API error: {detail}", status_code=status_code)
