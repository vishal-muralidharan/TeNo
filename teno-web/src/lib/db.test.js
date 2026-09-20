/**
 * src/lib/db.test.js
 *
 * Unit tests for TeNoDatabase (Firestore wrapper class).
 * Tests cover both new and old schemas where branching occurs,
 * and ensure that Firestore modular SDK methods are called with
 * the correct paths and payloads.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { TeNoDatabase, getDb } from './db'

// ── Mock data ────────────────────────────────────────────────────────────────
const UID = 'user-123'
const MOCK_TIME = { _type: 'serverTimestamp' }

describe('db.js — getDb()', () => {
  it('returns null if no uid is provided', () => {
    expect(getDb(null)).toBeNull()
  })

  it('returns a TeNoDatabase instance when uid is provided', () => {
    const db = getDb(UID, true)
    expect(db).toBeInstanceOf(TeNoDatabase)
    expect(db.uid).toBe(UID)
    expect(db.isNewSchema).toBe(true)
  })
})

describe('TeNoDatabase — Core operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(serverTimestamp).mockReturnValue(MOCK_TIME)
  })

  // ── Links ──────────────────────────────────────────────────────────────────
  describe('Links', () => {
    it('subscribeLinks (new schema) queries "links" collection with array-contains', () => {
      const db = new TeNoDatabase(UID, true)
      db.subscribeLinks(vi.fn())

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'links')
      expect(where).toHaveBeenCalledWith('memberUids', 'array-contains', UID)
      expect(query).toHaveBeenCalled()
      expect(onSnapshot).toHaveBeenCalled()
    })

    it('subscribeLinks (old schema) queries "users/UID/saved_links" collection', () => {
      const db = new TeNoDatabase(UID, false)
      db.subscribeLinks(vi.fn())

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'saved_links')
      expect(query).toHaveBeenCalled()
      expect(onSnapshot).toHaveBeenCalled()
    })

    it('addLink (new schema) writes to "links" collection with memberUids and ownerId', async () => {
      const db = new TeNoDatabase(UID, true)
      await db.addLink({ url: 'https://example.com' })

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'links')
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          url: 'https://example.com',
          ownerId: UID,
          labelId: `default_${UID}`,
          memberUids: [UID],
          createdAt: MOCK_TIME,
        })
      )
    })

    it('addLink (old schema) writes to "users/UID/saved_links"', async () => {
      const db = new TeNoDatabase(UID, false)
      await db.addLink({ url: 'https://example.com' })

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'saved_links')
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          url: 'https://example.com',
          createdAt: MOCK_TIME,
        })
      )
    })

    it('updateLink and deleteLink route to the correct collections based on schema', async () => {
      const dbNew = new TeNoDatabase(UID, true)
      const dbOld = new TeNoDatabase(UID, false)

      await dbNew.updateLink('link1', { url: 'https://a.com' })
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'links', 'link1')
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { url: 'https://a.com' })

      await dbOld.updateLink('link2', { url: 'https://b.com' })
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'saved_links', 'link2')

      await dbNew.deleteLink('link3')
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'links', 'link3')
      expect(deleteDoc).toHaveBeenCalled()

      await dbOld.deleteLink('link4')
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'saved_links', 'link4')
    })
  })

  // ── Cart & Reminders ───────────────────────────────────────────────────────
  describe('Cart and Reminders', () => {
    it('cart operations write to "users/UID/cart_items"', async () => {
      const db = new TeNoDatabase(UID, true)

      db.subscribeCart(vi.fn())
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'cart_items')

      await db.addCartItem({ name: 'Apple' })
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ name: 'Apple', createdAt: MOCK_TIME })
      )

      await db.updateCartItem('c1', { name: 'Banana' })
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'cart_items', 'c1')
      expect(updateDoc).toHaveBeenCalled()

      await db.deleteCartItem('c2')
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'cart_items', 'c2')
      expect(deleteDoc).toHaveBeenCalled()
    })

    it('reminder operations write to "users/UID/reminders"', async () => {
      const db = new TeNoDatabase(UID, true)

      db.subscribeReminders(vi.fn())
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'reminders')

      await db.addReminder({ text: 'Do laundry' })
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ text: 'Do laundry', createdAt: MOCK_TIME })
      )

      await db.updateReminder('r1', { text: 'Done' })
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'reminders', 'r1')
      expect(updateDoc).toHaveBeenCalled()

      await db.deleteReminder('r2')
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'reminders', 'r2')
      expect(deleteDoc).toHaveBeenCalled()
    })

    it('deleteAllReminders uses a writeBatch', async () => {
      const db = new TeNoDatabase(UID, true)
      const mockBatch = { delete: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) }
      vi.mocked(writeBatch).mockReturnValue(mockBatch)

      await db.deleteAllReminders(['r1', 'r2'])
      expect(writeBatch).toHaveBeenCalled()
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'reminders', 'r1')
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'reminders', 'r2')
      expect(mockBatch.delete).toHaveBeenCalledTimes(2)
      expect(mockBatch.commit).toHaveBeenCalledTimes(1)
    })
  })

  // ── Settings ───────────────────────────────────────────────────────────────
  describe('Settings', () => {
    it('subscribeUiSettings and updateUiSettings use "users/UID/settings/ui"', async () => {
      const db = new TeNoDatabase(UID, true)

      db.subscribeUiSettings(vi.fn())
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'settings', 'ui')
      expect(onSnapshot).toHaveBeenCalled()

      await db.updateUiSettings({ theme: 'dark' })
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        { theme: 'dark' },
        { merge: true }
      )
    })

    it('subscribeLabelOrder and updateLabelOrder use "users/UID/settings/labels_xyz"', async () => {
      const db = new TeNoDatabase(UID, true)

      db.subscribeLabelOrder('saved_links', vi.fn())
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', UID, 'settings', 'labels_saved_links')

      await db.updateLabelOrder('saved_links', ['l1', 'l2'])
      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        { order: ['l1', 'l2'] },
        { merge: true }
      )
    })
  })

  // ── Shared Labels & Links ──────────────────────────────────────────────────
  describe('Shared Labels and Links', () => {
    it('subscribeSharedLabels uses "labels" in new schema, "shared_labels" in old', () => {
      const dbNew = new TeNoDatabase(UID, true)
      dbNew.subscribeSharedLabels(vi.fn())
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'labels')
      expect(where).toHaveBeenCalledWith(`members.${UID}`, '!=', null)

      const dbOld = new TeNoDatabase(UID, false)
      dbOld.subscribeSharedLabels(vi.fn())
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'shared_labels')
    })

    it('addSharedLabel populates memberUids from members object in new schema', async () => {
      const db = new TeNoDatabase(UID, true)
      await db.addSharedLabel({ title: 'Work', members: { 'user-1': {}, 'user-2': {} } })
      
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'labels')
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        title: 'Work',
        memberUids: ['user-1', 'user-2'],
        createdAt: MOCK_TIME,
      }))
    })

    it('updateSharedLabel uses the correct collection', async () => {
      const db = new TeNoDatabase(UID, true)
      await db.updateSharedLabel('lab1', { title: 'Updated' })
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'labels', 'lab1')
      expect(updateDoc).toHaveBeenCalled()
    })

    it('batchDeleteSharedLabelAndLinks uses a writeBatch for both label and links', async () => {
      const db = new TeNoDatabase(UID, true)
      const mockBatch = { delete: vi.fn(), commit: vi.fn().mockResolvedValue(undefined) }
      vi.mocked(writeBatch).mockReturnValue(mockBatch)

      await db.batchDeleteSharedLabelAndLinks('lab1', [{ id: 'linkA' }, { id: 'linkB' }])
      
      // 2 links + 1 label = 3 deletes
      expect(mockBatch.delete).toHaveBeenCalledTimes(3)
      expect(mockBatch.commit).toHaveBeenCalledTimes(1)
      
      // Verify paths
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'links', 'linkA')
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'links', 'linkB')
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'labels', 'lab1')
    })

    it('subscribeSharedLinks and addSharedLink use correct collection paths', async () => {
      const db = new TeNoDatabase(UID, true)
      
      db.subscribeSharedLinks('lab1', vi.fn())
      expect(collection).toHaveBeenCalledWith(expect.anything(), 'links')
      expect(where).toHaveBeenCalledWith('labelId', '==', 'lab1')
      expect(onSnapshot).toHaveBeenCalled()

      await db.addSharedLink({ url: 'test.com' })
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
        url: 'test.com',
        createdAt: MOCK_TIME,
      }))
    })

    it('updateSharedLink and deleteSharedLink use correct collection paths', async () => {
      const dbOld = new TeNoDatabase(UID, false)
      
      await dbOld.updateSharedLink('sl1', { url: 'changed.com' })
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'shared_links', 'sl1')
      expect(updateDoc).toHaveBeenCalled()

      await dbOld.deleteSharedLink('sl2')
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'shared_links', 'sl2')
      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  // ── Generic Entry Helpers ──────────────────────────────────────────────────
  describe('Generic Entry Helpers', () => {
    it('subscribeEntries routes to Links or Cart', () => {
      const db = new TeNoDatabase(UID, true)
      const spyLinks = vi.spyOn(db, 'subscribeLinks').mockImplementation(() => {})
      const spyCart = vi.spyOn(db, 'subscribeCart').mockImplementation(() => {})

      db.subscribeEntries('links', vi.fn())
      expect(spyLinks).toHaveBeenCalled()
      
      db.subscribeEntries('cart_items', vi.fn())
      expect(spyCart).toHaveBeenCalled()
    })

    it('addEntry routes to Links or Cart', async () => {
      const db = new TeNoDatabase(UID, true)
      const spyLinks = vi.spyOn(db, 'addLink').mockImplementation(() => Promise.resolve())
      const spyCart = vi.spyOn(db, 'addCartItem').mockImplementation(() => Promise.resolve())

      await db.addEntry('links', { a: 1 })
      expect(spyLinks).toHaveBeenCalledWith({ a: 1 })

      await db.addEntry('cart_items', { b: 2 })
      expect(spyCart).toHaveBeenCalledWith({ b: 2 })
    })

    it('updateEntry routes to Links or Cart', async () => {
      const db = new TeNoDatabase(UID, true)
      const spyLinks = vi.spyOn(db, 'updateLink').mockImplementation(() => Promise.resolve())
      const spyCart = vi.spyOn(db, 'updateCartItem').mockImplementation(() => Promise.resolve())

      await db.updateEntry('links', 'id1', { a: 1 })
      expect(spyLinks).toHaveBeenCalledWith('id1', { a: 1 })

      await db.updateEntry('cart_items', 'id2', { b: 2 })
      expect(spyCart).toHaveBeenCalledWith('id2', { b: 2 })
    })

    it('deleteEntry routes to Links or Cart', async () => {
      const db = new TeNoDatabase(UID, true)
      const spyLinks = vi.spyOn(db, 'deleteLink').mockImplementation(() => Promise.resolve())
      const spyCart = vi.spyOn(db, 'deleteCartItem').mockImplementation(() => Promise.resolve())

      await db.deleteEntry('links', 'id1')
      expect(spyLinks).toHaveBeenCalledWith('id1')

      await db.deleteEntry('cart_items', 'id2')
      expect(spyCart).toHaveBeenCalledWith('id2')
    })
  })
})
