document.addEventListener('DOMContentLoaded', () => {
    const chatLauncher = document.querySelector('.chat-launcher');
    const chatModal = document.querySelector('.chat-modal');
    const closeBtn = document.querySelector('.close-btn');
    const minimizeBtn = document.querySelector('.minimize-btn');
    const sendBtn = document.querySelector('.send-btn');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.querySelector('.chat-messages');
    const typingIndicator = document.querySelector('.typing-indicator');
    const suggestionContainer = document.querySelector('.suggestion-container');

    const SECRET_KEY = "0guFJy9GUFoMcmZ1ZA9UnAjPtn7M58sV";

    const socket = io("http://localhost:5000", {
        extraHeaders: {
            "X-Secret-Key": SECRET_KEY,
        },
    });
        
    // Suggestion messages
    const suggestions = [
        "What are the symptoms of low blood sugar?",
        "What should I do for a back injury?",
        "How do I treat an ear injury?",
        "What should I do if my clothing catches fire"
    ];

    // Function to get a random suggestion
    function getRandomSuggestions() {
        const randomSuggestions = [];
        while (randomSuggestions.length < 4) {
            const randomIndex = Math.floor(Math.random() * suggestions.length);
            if (!randomSuggestions.includes(suggestions[randomIndex])) {
                randomSuggestions.push(suggestions[randomIndex]);
            }
        }
        return randomSuggestions;
    }

    // Function to show suggestions on startup
    function showSuggestions() {
        suggestionContainer.innerHTML = '';
        const promptHTML = `
            <div class="header-actions"><button class="close-btn"><i class="fas fa-times"></i></button></div>
            <div class="suggestion-header">Ask me a question...</div>
           
        `;
        suggestionContainer.innerHTML += promptHTML;
    
        // Get 4 random suggestions from the list
        const randomSuggestions = getRandomSuggestions();
    
        // Display each random suggestion
        randomSuggestions.forEach(suggestion => {
            const randomSuggestionHTML = `
                <div class="suggestion-item">${suggestion}</div>
            `;
            suggestionContainer.innerHTML += randomSuggestionHTML;
        });
    
        // Add event listeners to suggestion items
        const suggestionItems = document.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', (e) => {
                messageInput.value = e.target.textContent;
                hideSuggestions();
                sendMessage();
            });
        });
    }

    // Function to hide suggestions after they are clicked or shown
    function hideSuggestions() {
        suggestionContainer.innerHTML = '';
        suggestionContainer.style.display = 'none';
        
    }

    // Function to scroll chat to the bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Handle incoming messages from the server
    socket.on("chat_response", (data) => {
        setTimeout(() => {
            typingIndicator.style.display = 'none';

            const botMessageHTML = `
                <div class="message ai-message">
                    <img src="assets/img/chatbot/chat-bot.png" alt="AI" class="message-avatar">
                    <div class="message-content">
                        <p>${data.response}</p>
                        <span class="message-time">${getCurrentTime()}</span>
                    </div>
                </div>
            `;
            chatMessages.innerHTML += botMessageHTML;
            scrollToBottom();
        }, 1500);
    });

    // Handle disconnection or authentication issues
    socket.on("disconnect", (reason) => {
        if (reason === "io server disconnect") {
            alert("Disconnected by the server. Please check your secret key.");
        } else {
            console.error("Disconnected:", reason);
            showConnectionError();
        }
    });

    socket.on("connect_error", (error) => {
        console.error("Connection failed:", error);
        showConnectionError();
    });

    function showConnectionError() {
        const errorMessageHTML = `
            <div class="message system-message">
                <div class="message-content">
                    <p>Unable to connect to the server. Please try again later.</p>
                </div>
            </div>
        `;
        chatMessages.innerHTML += errorMessageHTML;
        scrollToBottom();
    }

    function toggleChat() {
        if (chatModal.style.display === 'none' || chatModal.style.display === '') {
            chatModal.style.display = 'flex';
            chatModal.style.animation = 'slideUp 0.3s ease';
            scrollToBottom();
            showSuggestions();
        } else {
            chatModal.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                chatModal.style.display = 'none';
            }, 250);
        }
    }

    chatLauncher.addEventListener('click', toggleChat);

    closeBtn.addEventListener('click', () => {
        chatModal.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            chatModal.style.display = 'none';
        }, 250);
    });

    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        const userMessageHTML = `
            <div class="message user-message">
                <div class="message-content">
                    <p>${message}</p>
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
                <img src="assets/img/chatbot/chat-user.png" alt="User" class="message-avatar">
            </div>
        `;
        chatMessages.innerHTML += userMessageHTML;
        messageInput.value = '';

        typingIndicator.style.display = 'flex';

        socket.emit("chat_message", {
            message: message,
            secret_key: SECRET_KEY,
        });
        scrollToBottom();
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function addTouchSupport() {
        document.addEventListener('touchstart', (e) => {
            if (!chatModal.contains(e.target) && !chatLauncher.contains(e.target)) {
                chatModal.style.display = 'none';
            }
        });

        chatModal.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    addTouchSupport();

    messageInput.addEventListener('focus', () => {
        setTimeout(() => {
            scrollToBottom();
        }, 300);
    });

    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);
});