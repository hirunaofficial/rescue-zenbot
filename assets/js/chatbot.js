document.addEventListener('DOMContentLoaded', () => {
    const chatLauncher = document.querySelector('.chat-launcher');
    const chatModal = document.querySelector('.chat-modal');
    const closeBtn = document.querySelector('.close-btn');
    const sendBtn = document.querySelector('.send-btn');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.querySelector('.chat-messages');
    const typingIndicator = document.querySelector('.typing-indicator');
    const menuBtn = document.querySelector('.menu-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const newChatOption = document.getElementById('new-chat-option');
    const shareOption = document.getElementById('share-option');
    const historyOption = document.getElementById('history-option');
    const settingsOption = document.getElementById('settings-option');
    const speakersOption = document.getElementById('speakers-option');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const removeImageBtn = document.getElementById('remove-image-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const startRecordingBtn = document.getElementById('start-recording-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    const languageSelect = document.getElementById('language-select');
    const themeToggle = document.getElementById('theme-toggle');
    let mediaRecorder;
    let audioChunks = [];

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
        const suggestionsHTML = `
            <div class="suggestion-container">
                <div class="suggestion-header">Ask me a question...</div>
                ${getRandomSuggestions().map(suggestion => `
                    <div class="suggestion-item">${suggestion}</div>
                `).join('')}
            </div>
        `;
    
        chatMessages.innerHTML += suggestionsHTML;
    
        // Remove existing event listener to prevent duplication
        chatMessages.removeEventListener('click', handleSuggestionClick);
        chatMessages.addEventListener('click', handleSuggestionClick);
    
        scrollToBottom();
    }    

    function handleSuggestionClick(e) {
        if (e.target.classList.contains('suggestion-item')) {
            messageInput.value = e.target.textContent;
            sendMessage();
        }
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
                        <button class="speaker-btn"><i class="fa-solid fa-volume-up"></i></button>
                    </div>
                </div>
            `;
            chatMessages.innerHTML += botMessageHTML;
            scrollToBottom();
            addSpeakerFunctionality();
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
            chatModal.style.animation = 'slideUp 0.5s ease';
            scrollToBottom();
            showSuggestions();
        } else {
            chatModal.classList.add('slide-down');
            setTimeout(() => {
                chatModal.style.display = 'none';
                chatModal.classList.remove('slide-down');
            }, 500);
        }
    }

    chatLauncher.addEventListener('click', toggleChat);

    closeBtn.addEventListener('click', () => {
        chatModal.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            chatModal.style.display = 'none';
        }, 250);
    });

    // Trigger image input when camera button is clicked
    cameraBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // Handle image upload
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
        }
    });

    // Remove image preview
    removeImageBtn.addEventListener('click', () => {
        previewImg.src = '';
        imagePreview.style.display = 'none';
        imageInput.value = '';
    });

    function sendMessage() {
        const message = messageInput.value.trim();
        const imageSrc = previewImg.src;
        if (!message && !imageSrc) return;
    
        const userMessageHTML = `
            <div class="message user-message">
                <div class="message-content">
                    <p>${message}</p>
                    ${imageSrc && imageInput.files.length > 0 ? `<img src="${imageSrc}" alt="Uploaded Image" style="max-width: 100%; margin-top: 10px;">` : ''}
                    <button class="speaker-btn"><i class="fa-solid fa-volume-up"></i></button>
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
                <img src="assets/img/chatbot/chat-user.png" alt="User" class="message-avatar">
            </div>
        `;
        chatMessages.innerHTML += userMessageHTML;
        messageInput.value = '';
        if (imageSrc && imageInput.files.length > 0) {
            previewImg.src = '';
            imagePreview.style.display = 'none';
            imageInput.value = '';
        }
        typingIndicator.style.display = 'flex';
        socket.emit("chat_message", {
            message: message,
            image: imageSrc && imageInput.files.length > 0 ? imageSrc : null,
            secret_key: SECRET_KEY,
        });
        scrollToBottom();
        addSpeakerFunctionality();
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

    // Toggle dropdown menu visibility
    menuBtn.addEventListener('click', () => {
        if (dropdownMenu.style.display === 'block') {
            dropdownMenu.style.display = 'none';
        } else {
            dropdownMenu.style.display = 'block';
        }
    });

    // Clear chat for "New Chat" option
    newChatOption.addEventListener('click', () => {
        if (confirm('Are you sure you want to start a new chat? This will clear the current conversation.')) {
            chatMessages.innerHTML = `
                <div class="message ai-message">
                    <img src="assets/img/chatbot/chat-bot.png" alt="AI" class="message-avatar">
                    <div class="message-content">
                        <p>Hello! I'm Rescue ZenBot. How can I assist you today?</p>
                        <span class="message-time">${getCurrentTime()}</span>
                    </div>
                </div>
            `;
            messageInput.value = ''; // Clear input field
            dropdownMenu.style.display = 'none'; // Hide menu after action
            // Show suggestions
            showSuggestions();
        }
    });

    // Add functionality to each dropdown item
    shareOption.addEventListener('click', () => {
        alert('Share feature coming soon!');
        dropdownMenu.style.display = 'none';
    });

    historyOption.addEventListener('click', () => {
        alert('Chat history feature coming soon!');
        dropdownMenu.style.display = 'none';
    });

    settingsOption.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        dropdownMenu.style.display = 'none';
    });

    closeSettingsModal.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        updateLanguage(selectedLanguage);
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    function updateLanguage(language) {
        const elementsToTranslate = document.querySelectorAll('.message-content p[data-translate]');
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = translations[language][key];
        });
    }

    const translations = {
        en: {
            greeting: "Hello! I'm Rescue ZenBot. How can I assist you today?",
            typing: "Rescue ZenBot is typing..."
        },
        es: {
            greeting: "¡Hola! Soy Rescue ZenBot. ¿Cómo puedo ayudarte hoy?",
            typing: "Rescue ZenBot está escribiendo..."
        },
        fr: {
            greeting: "Bonjour! Je suis Rescue ZenBot. Comment puis-je vous aider aujourd'hui?",
            typing: "Rescue ZenBot est en train d'écrire..."
        },
        de: {
            greeting: "Hallo! Ich bin Rescue ZenBot. Wie kann ich Ihnen heute helfen?",
            typing: "Rescue ZenBot tippt..."
        }
    };

    speakersOption.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            const messages = document.querySelectorAll('.chat-messages .message-content p');
            const chatText = Array.from(messages).map(msg => msg.textContent).join('. ');
            const speech = new SpeechSynthesisUtterance(chatText);

            function setVoice() {
                const voices = window.speechSynthesis.getVoices();
                const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.gender === 'female');
                if (femaleVoice) {
                    speech.voice = femaleVoice;
                } else if (voices.length > 0) {
                    speech.voice = voices[0];
                }
                window.speechSynthesis.speak(speech);
            }

            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.addEventListener('voiceschanged', setVoice);
            } else {
                setVoice();
            }

            speech.onerror = (event) => {
                console.error('Speech synthesis error:', event.error);
            };
        } else {
            alert('Sorry, your browser does not support speech synthesis.');
        }
        dropdownMenu.style.display = 'none';
    });

    // Hide dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    function addSpeakerFunctionality() {
        const speakerButtons = document.querySelectorAll('.speaker-btn');
        speakerButtons.forEach(button => {
            button.addEventListener('click', () => {
                const messageContent = button.previousElementSibling.textContent;
                if ('speechSynthesis' in window) {
                    const speech = new SpeechSynthesisUtterance(messageContent);
                    function setVoice() {
                        const voices = window.speechSynthesis.getVoices();
                        const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.gender === 'female');
                        if (femaleVoice) {
                            speech.voice = femaleVoice;
                        } else if (voices.length > 0) {
                            speech.voice = voices[0];
                        }
                        window.speechSynthesis.speak(speech);
                    }
                    if (window.speechSynthesis.getVoices().length === 0) {
                        window.speechSynthesis.addEventListener('voiceschanged', setVoice);
                    } else {
                        setVoice();
                    }
                    speech.onerror = (event) => {
                        console.error('Speech synthesis error:', event.error);
                    };
                } else {
                    alert('Sorry, your browser does not support speech synthesis.');
                }
            });
        });
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    startRecordingBtn.addEventListener('click', () => {
        const recordingMessageHTML = `
            <div class="message system-message recording-message">
                <div class="message-content">
                    <p>Recording...</p>
                    <button id="stop-recording-btn" class="action-btn microphone-btn">
                        <i class="fa-solid fa-microphone-slash"></i>
                    </button>
                </div>
            </div>
        `;
        chatMessages.innerHTML += recordingMessageHTML;
        scrollToBottom();
        recognition.start();
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value = transcript;
        sendMessage();
        removeRecordingMessage();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        alert('Failed to recognize speech. Please try again.');
        removeRecordingMessage();
    };

    function removeRecordingMessage() {
        const recordingMessage = document.querySelector('.recording-message');
        if (recordingMessage) {
            recordingMessage.remove();
        }
    }

    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'stop-recording-btn') {
            recognition.stop();
        }
    });
});