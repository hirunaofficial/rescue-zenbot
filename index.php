<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="assets/css/chatbot.css">
</head>

<div class="chat-container">
    <div class="chat-launcher">
        <div class="ai-icon">
            <img src="assets/img/chatbot/logo.png" alt="AI Chatbot">
            <span class="online-indicator"></span>
        </div>
    </div>

    <div class="chat-modal">
        <div class="chat-header">
            <div class="user-info">
                <div class="ai-icon">
                    <img src="assets/img/chatbot/logo-dark.png" alt="AI Chatbot">
                    <span class="online-indicator"></span>
                </div>
                <div class="user-details">
                    <h3>Rescue ZenBot</h3>
                    <p>Online (Version: 1.0.0)</p>

                </div>
            </div>
            <div class="header-actions">
                <button class="close-btn"><i class="fas fa-times"></i></button>
            </div>
        </div>

        <div class="chat-messages">
            <div class="suggestion-container"></div>
        </div>

        <div class="typing-indicator">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            Rescue ZenBot is typing...
        </div>

        <div class="chat-input">
            <input type="text" id="message-input" placeholder="Type your message...">
            <button class="send-btn">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
</div>

<script src="assets/js/chatbot.js"></script>
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>