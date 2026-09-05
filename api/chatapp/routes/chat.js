const express = require("express");
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const { getConversationsForUser } = require('../models/chat');
const { getOrCreateConversation } = require('../models/chat');

//get /api/chats
router.get('/conversations', requireAuth, async (req, res) => {
  try {
    const conversations = await getConversationsForUser(req.user.id);
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error('Failed to load conversations:', error);
    res.status(500).json({ success: false, message: 'Failed to load conversations' });
  }
});

//post /api/chats


router.post('/conversations', requireAuth, async (req, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId) {
    return res.status(400).json({ success: false, message: 'otherUserId required' });
  }
  if (otherUserId === req.user.id) {
    return res.status(400).json({ success: false, message: "Can't message yourself" });
  }
  try {
    const conversation = await getOrCreateConversation(req.user.id, otherUserId);
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error('Failed to get/create conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to start conversation' });
  }
});
//delete /api/chats/:id
router.delete('/conversations/:id', requireAuth, async (req, res) => {
  try {
    await clearConversationForUser(req.params.id, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to clear conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to delete chat' });
  }
});

// routes/chatRoutes.js — add this
const { searchUsersByUsername } = require('../models/user');

router.get('/users/search', requireAuth, async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    return res.status(200).json({ success: true, users: [] });
  }
  try {
    const users = await searchUsersByUsername(q.trim(), req.user.id);
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Failed to search users:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});
// routes/chatRoutes.js — add these
const { isParticipant, getMessages, createMessage, markAsRead } = require('../models/messages');

// GET /conversations/:id/messages
router.get('/conversations/:id/messages', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const allowed = await isParticipant(id, req.user.id);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not part of this conversation' });
    }
    const messages = await getMessages(id, req.user.id);
    await markAsRead(id, req.user.id); // mark as read the moment they open the chat
    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Failed to load messages:', error);
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
});

// POST /conversations/:id/messages
router.post('/conversations/:id/messages', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty' });
  }
  try {
    const allowed = await isParticipant(id, req.user.id);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Not part of this conversation' });
    }
    const message = await createMessage(id, req.user.id, content.trim());
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// routes/chatRoutes.js — add this
const { getMessageById, deleteForEveryone, deleteForMe } = require('../models/messages');

// DELETE /messages/:id?scope=everyone|me
router.delete('/messages/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const scope = req.query.scope === 'everyone' ? 'everyone' : 'me';
  try {
    if (scope === 'everyone') {
      await deleteForEveryone(id, req.user.id);
    } else {
      await deleteForMe(id, req.user.id);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    const status = error.status || 500;
    console.error('Failed to delete message:', error);
    res.status(status).json({ success: false, message: error.message || 'Failed to delete message' });
  }
});

module.exports = router;