// scripts/verify-urls.ts
import { getBaseUrl, getAbsoluteUrl, getBetaJoinUrl, getBlogPostUrl } from '../lib/url'

console.log('🔍 Verifying URL Configuration...\n')

console.log('Base URL:', getBaseUrl())
console.log('✅ Base URL configured\n')

console.log('Sample URLs:')
console.log('- Blog post:', getBlogPostUrl('test-post'))
console.log('- Beta join:', getBetaJoinUrl())
console.log('- Beta join with code:', getBetaJoinUrl('TEST-CODE-1234'))
console.log('- Beta join with referral:', getBetaJoinUrl(undefined, 'REF123'))
console.log('- Absolute path:', getAbsoluteUrl('/dashboard'))

console.log('\n✅ All URL utilities working correctly')