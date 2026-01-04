# Security Best Practices

## API Key Management

### ⚠️ IMPORTANT: Old API Key Exposure

An old Anthropic API key was exposed in commit `29167d1` in the file `add-api-key.sh`. 

**ACTION REQUIRED:**
1. **Revoke the old API key** in your Anthropic account dashboard
2. Generate a new API key
3. Update it in:
   - `.env.local` (local development)
   - Vercel environment variables (production)

### Current Security Status

✅ **Secure:**
- `.env.local` is in `.gitignore` - local secrets are not committed
- API keys are only stored in environment variables
- No hardcoded secrets in current codebase
- All API key references use environment variables

### Best Practices

1. **Never commit API keys** to git
2. **Always use environment variables** for secrets
3. **Revoke exposed keys immediately** if accidentally committed
4. **Use `.gitignore`** for all files containing secrets
5. **Rotate keys regularly** for production systems

### Environment Variables

All secrets are managed via environment variables:

**Local Development:**
- `.env.local` (gitignored)

**Production (Vercel):**
- Set via Vercel Dashboard → Settings → Environment Variables
- Never commit to git

### Files to Never Commit

- `.env*` files
- `*.key` files
- Files containing API keys or tokens
- Credentials of any kind

### If You Accidentally Commit a Secret

1. **Immediately revoke** the exposed secret
2. **Remove from git history** using `git filter-branch` or BFG Repo-Cleaner
3. **Force push** to update remote repository
4. **Generate new secret** and update all environments
5. **Notify team members** to pull latest changes


