import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import {
  startConversation,
  sendMessage,
  fetchSuggestions,
  closeConversation,
} from '../services/chat.js';

const ChatAssistant = () => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setError('');
        const [{ conversation, messages: initialMessages }, suggestionPayload] = await Promise.all([
          startConversation(),
          fetchSuggestions().catch(() => ({ suggestions: [] })),
        ]);

        setConversationId(conversation._id);
        setMessages(initialMessages || []);
        setSuggestions(suggestionPayload?.suggestions || []);
        setIsClosed(conversation.status === 'closed');
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to start chat session.');
      }
    };

    bootstrap();
  }, []);

  const handleSend = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || !conversationId || isClosed) {
      return;
    }

    const userMessage = {
      _id: `local-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const { response, conversation } = await sendMessage(conversationId, trimmed);
      setMessages((prev) => [...prev, { ...response, createdAt: new Date().toISOString() }]);
      if (conversation?.status === 'closed') {
        setIsClosed(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConversation = async () => {
    if (!conversationId || isClosed) return;
    try {
      await closeConversation(conversationId);
      setIsClosed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to close conversation.');
    }
  };

  const groupedMessages = useMemo(() => messages, [messages]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3, borderRadius: 3, minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5">Chat Assistant</Typography>
            <Typography color="text.secondary">
              Ask questions about orders, products, or general support.
            </Typography>
          </Box>
          <IconButton color="inherit" onClick={handleCloseConversation} disabled={isClosed}>
            <CloseIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
          {groupedMessages.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography color="text.secondary">Say hello to get started.</Typography>
            </Box>
          ) : (
            <List>
              {groupedMessages.map((msg, index) => (
                <ListItem
                  key={msg._id || index}
                  sx={{
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                      color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      p: 1.5,
                      maxWidth: '70%',
                    }}
                  >
                    <ListItemText
                      primary={msg.content}
                      secondary={
                        formatTimestamp(msg.createdAt)
                      }
                      secondaryTypographyProps={{
                        color: msg.role === 'user' ? 'inherit' : 'text.secondary',
                        sx: { opacity: 0.8 },
                      }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {suggestions.length > 0 && !isClosed && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {suggestions.slice(0, 5).map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                onClick={() => handleSend(suggestion)}
                disabled={loading}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <TextField
          placeholder={isClosed ? 'This conversation is closed.' : 'Type your message...'}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          disabled={loading || isClosed}
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim() || isClosed}
                >
                  Send
                </Button>
              </InputAdornment>
            ),
          }}
        />
      </Paper>
    </Container>
  );
};

export default ChatAssistant;

