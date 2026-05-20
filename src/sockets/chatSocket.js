function setupChatSocket(io) {
  io.on('connection', (socket) => {
    console.log('⚡ user connected:', socket.id);

    socket.on('sendMessage', ({ senderName, message }) => {
      if (!message || !message.trim()) return;

      const chatMessage = {
        senderName: senderName || 'Guest User',
        message: message.trim(),
        time: new Date().toLocaleTimeString()
      };

      socket.broadcast.emit('receiveMessage', chatMessage);
    });

    socket.on('join-team-room', (teamId) => socket.join(`team-${teamId}`));

    socket.on('team-message', ({ teamId, user, message }) => {
      io.to(`team-${teamId}`).emit('team-message', {
        user: user || 'Student',
        message,
        time: new Date().toLocaleTimeString()
      });
    });

    socket.on('disconnect', () => console.log('👋 user disconnected:', socket.id));
  });
}

module.exports = setupChatSocket;
