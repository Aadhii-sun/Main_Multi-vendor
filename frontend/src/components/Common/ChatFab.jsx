import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Fab, Tooltip, Badge } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

/**
 * Floating chat assist button.
 * Appears bottom-right; clicking navigates to /assistant.
 */
const ChatFab = () => {
  const navigate = useNavigate();
  return (
    <Tooltip title="Contact us" placement="left">
      <Badge
        color="secondary"
        overlap="circular"
        badgeContent=""
        variant="dot"
        sx={{ position: 'fixed', right: 24, bottom: 24, zIndex: (t) => t.zIndex.tooltip + 1 }}
      >
        <Fab
          variant="extended"
          color="primary"
          aria-label="contact-us"
          onClick={() => navigate('/assistant')}
          sx={{
            boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
            px: 2.5,
            height: 48,
            borderRadius: 24,
            gap: 1,
          }}
        >
          <ChatBubbleOutlineIcon sx={{ mr: 1 }} />
          Contact us
        </Fab>
      </Badge>
    </Tooltip>
  );
};

export default ChatFab;


