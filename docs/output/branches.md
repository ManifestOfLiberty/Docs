---
title: Branches & Beta Keys
---

# Branches & Beta Keys

Every app has a `branches` section in its depot info that lists all available release channels.

## Branch types

| Branch type | `pwdrequired` | GID storage | How to access |
|------------|--------------|-------------|---------------|
| `public` | `0` | Plain in `manifests.public.gid` | Default, no password |
| Beta (open) | `0` | Plain in `manifests.beta.gid` | No password needed |
| Beta (locked) | `1` | Encrypted as `encrypted_gid_2` | Need a beta password via `check_beta_password()` |

## Accessing a password-protected beta branch

```python
from binascii import unhexlify
import struct
from steam.core.crypto import symmetric_decrypt_ecb

# 1. Validate the password with Steam CM
result = cdn.check_beta_password(app_id, "myBetaPassword123")
# result == EResult.OK means it worked

# 2. Decrypt the encrypted manifest GID from depot info
egid_hex = depot_info["encryptedmanifests"]["beta"]["encrypted_gid_2"]
encrypted = unhexlify(egid_hex)

# check_beta_password() stored the key internally
beta_key     = cdn.beta_passwords[(app_id, "beta")]
decrypted    = symmetric_decrypt_ecb(encrypted, beta_key)
manifest_gid = struct.unpack('<Q', decrypted)[0]  # little-endian uint64

print(f"Beta manifest GID: {manifest_gid}")

# 3. Download normally from here
```
