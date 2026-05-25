from slowapi import Limiter
from slowapi.util import get_remote_address

_limiter = None

def get_limiter():
    global _limiter
    if _limiter is None:
        _limiter = Limiter(key_func=get_remote_address)
    return _limiter
