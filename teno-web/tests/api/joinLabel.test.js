/**
 * api/joinLabel.test.js
 *
 * Unit tests for the Vercel serverless function that handles joining a label.
 * Mocks out firebase-admin completely.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── 1. Mock firebase-admin modules ───────────────────────────────────────────
vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn(() => []),
  initializeApp: vi.fn(),
  cert: vi.fn(),
}))

vi.mock('firebase-admin/auth', () => {
  const verifyIdToken = vi.fn()
  return {
    getAuth: vi.fn(() => ({ verifyIdToken })),
  }
})

vi.mock('firebase-admin/firestore', () => {
  const arrayUnion = vi.fn((val) => `arrayUnion(${val})`)
  const serverTimestamp = vi.fn(() => 'serverTimestamp()')
  
  return {
    getFirestore: vi.fn(),
    FieldValue: {
      arrayUnion,
      serverTimestamp,
    },
  }
})

vi.mock('dotenv', () => ({
  config: vi.fn(),
}))

process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: 'test' })
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import handler from '../../api/joinLabel'

// ── 2. Helper to build mock HTTP req/res ─────────────────────────────────────
function buildHttpMocks(options = {}) {
  const req = {
    method: 'POST',
    body: {},
    ...options.req,
  }
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  }
  return { req, res }
}

// ── 3. Helper to build Firestore mock ────────────────────────────────────────
function setupFirestoreMock({
  labelExists = true,
  isAlreadyMember = false,
  linksCount = 2,
} = {}) {
  const mockBatch = {
    update: vi.fn(),
    commit: vi.fn().mockResolvedValue(),
  }

  const labelDoc = {
    id: 'label-123',
    ref: 'label-123-ref',
    data: () => ({
      memberUids: isAlreadyMember ? ['user-uid'] : ['some-other-uid'],
    }),
  }

  const linksDocs = Array.from({ length: linksCount }).map((_, i) => ({
    id: `link-${i}`,
    ref: `link-${i}-ref`,
    data: () => ({}),
  }))

  const labelsQuery = {
    limit: vi.fn().mockReturnThis(),
    get: vi.fn().mockResolvedValue({
      empty: !labelExists,
      docs: labelExists ? [labelDoc] : [],
    }),
  }

  const linksQuery = {
    get: vi.fn().mockResolvedValue({
      empty: linksCount === 0,
      docs: linksDocs,
    }),
  }

  const collectionMock = vi.fn((path) => {
    if (path === 'labels') {
      return { where: vi.fn().mockReturnValue(labelsQuery) }
    }
    if (path === 'links') {
      return { where: vi.fn().mockReturnValue(linksQuery) }
    }
    return {}
  })

  const mockDb = {
    collection: collectionMock,
    batch: vi.fn(() => mockBatch),
  }

  vi.mocked(getFirestore).mockReturnValue(mockDb)

  return { mockDb, mockBatch, labelDoc, linksDocs }
}

// ── 4. Tests ─────────────────────────────────────────────────────────────────
describe('api/joinLabel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({ project_id: 'test' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    console.error.mockRestore()
  })

  it('returns 405 if method is not POST', async () => {
    const { req, res } = buildHttpMocks({ req: { method: 'GET' } })
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method Not Allowed' })
  })

  it('returns 400 if inviteToken or idToken is missing', async () => {
    const { req, res } = buildHttpMocks({ req: { body: { inviteToken: 'abc' } } }) // missing idToken
    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing inviteToken or idToken' })
  })

  it('returns 500 if auth token verification fails', async () => {
    const { req, res } = buildHttpMocks({
      req: { body: { inviteToken: 'abc', idToken: 'bad-token' } },
    })
    vi.mocked(getAuth().verifyIdToken).mockRejectedValue(new Error('Auth failed'))

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
  })

  it('returns 404 if the invite token does not match any label', async () => {
    const { req, res } = buildHttpMocks({
      req: { body: { inviteToken: 'abc', idToken: 'valid-token' } },
    })
    vi.mocked(getAuth().verifyIdToken).mockResolvedValue({ uid: 'user-uid' })
    setupFirestoreMock({ labelExists: false })

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired invite link' })
  })

  it('returns 200 "Already a member" if the user is already in memberUids', async () => {
    const { req, res } = buildHttpMocks({
      req: { body: { inviteToken: 'abc', idToken: 'valid-token' } },
    })
    vi.mocked(getAuth().verifyIdToken).mockResolvedValue({ uid: 'user-uid' })
    setupFirestoreMock({ labelExists: true, isAlreadyMember: true })

    await handler(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 'joined',
      message: 'Already a member',
      labelId: 'label-123',
    })
  })

  it('adds the user to the label and all associated links, then returns 200', async () => {
    const { req, res } = buildHttpMocks({
      req: {
        body: {
          inviteToken: 'abc',
          idToken: 'valid-token',
          name: 'Req Name',
          email: 'Req Email',
        },
      },
    })
    // Simulate token verification resolving to a user (no name/email in token to test fallback to req body)
    vi.mocked(getAuth().verifyIdToken).mockResolvedValue({ uid: 'new-user-uid' })
    
    const { mockBatch, labelDoc, linksDocs } = setupFirestoreMock({
      labelExists: true,
      isAlreadyMember: false,
      linksCount: 2,
    })

    await handler(req, res)

    // Verify batch operations
    expect(mockBatch.update).toHaveBeenCalledTimes(1 + 2) // 1 for label, 2 for links

    // 1. Label update
    expect(mockBatch.update).toHaveBeenCalledWith(labelDoc.ref, {
      memberUids: `arrayUnion(new-user-uid)`,
      'members.new-user-uid': {
        role: 'editor',
        name: 'Req Name',
        email: 'Req Email',
        joinedAt: 'serverTimestamp()',
      },
    })

    // 2. Links update
    linksDocs.forEach((link) => {
      expect(mockBatch.update).toHaveBeenCalledWith(link.ref, {
        memberUids: `arrayUnion(new-user-uid)`,
      })
    })

    // Verify commit was called
    expect(mockBatch.commit).toHaveBeenCalledTimes(1)

    // Verify final response
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      status: 'joined',
      message: 'Successfully joined label',
      labelId: 'label-123',
    })
  })

  it('uses name and email from the decoded token if available, instead of req.body', async () => {
    const { req, res } = buildHttpMocks({
      req: {
        body: {
          inviteToken: 'abc',
          idToken: 'valid-token',
          name: 'Ignored Req Name',
          email: 'ignored@req.com',
        },
      },
    })
    vi.mocked(getAuth().verifyIdToken).mockResolvedValue({
      uid: 'new-user-uid',
      name: 'Token Name',
      email: 'token@test.com',
    })
    
    const { mockBatch, labelDoc } = setupFirestoreMock({
      labelExists: true,
      isAlreadyMember: false,
      linksCount: 0,
    })

    await handler(req, res)

    expect(mockBatch.update).toHaveBeenCalledWith(labelDoc.ref, expect.objectContaining({
      'members.new-user-uid': expect.objectContaining({
        name: 'Token Name',
        email: 'token@test.com',
      })
    }))
  })
})
