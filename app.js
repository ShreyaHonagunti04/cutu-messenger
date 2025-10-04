// Romantic Interactive Application JavaScript with Bulletproof Email Sharing

// Global state for storing responses
let questionnaireResponses = null;
let submissionTimestamp = null;

// Email sharing configuration
const EMAIL_CONFIG = {
    recipient: "bargavbobby2005@gmail.com",
    subjectPrefix: "💕 Love Questionnaire Responses",
    maxMailtoLength: 2000,
    chunkSize: 1800,
    retryAttempts: 3,
    timeoutMs: 5000,
    lineBreakMailto: "%0D%0A",
    lineBreakText: "\n"
};

// Form submission endpoints (fallbacks)
const FORM_ENDPOINTS = [
    "https://formspree.io/f/placeholder1",
    "https://getform.io/f/placeholder2", 
    "https://formcarry.com/s/placeholder3"
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initFloatingHearts();
    initScrollAnimations();
    initInteractiveHearts();
    initTypewriterEffect();
    initSmoothScrolling();
    initParallaxEffect();
    initNavigation();
    initQuestionnaire();
    initPhotoSection();
    initEmailSharing();
});

// Email Sharing System
function initEmailSharing() {
    // Create email sharing modal
    createEmailSharingModal();
    
    // Initialize clipboard API detection
    detectClipboardSupport();
}

function createEmailSharingModal() {
    const modalHTML = `
        <div class="email-modal hidden" id="emailModal">
            <div class="email-modal-overlay" id="emailModalOverlay"></div>
            <div class="email-modal-content">
                <div class="email-modal-header">
                    <h3>Share Your Beautiful Responses 💕</h3>
                    <button class="email-modal-close" id="emailModalClose">×</button>
                </div>
                <div class="email-modal-body">
                    <p class="email-description">Choose how you'd like to share your heartfelt responses:</p>
                    
                    <div class="email-sharing-options">
                        <button class="email-option-btn" id="mailtoBtn" data-method="mailto">
                            <div class="email-option-icon">📧</div>
                            <div class="email-option-content">
                                <div class="email-option-title">Open Email App</div>
                                <div class="email-option-description">Opens your default email application</div>
                            </div>
                            <div class="email-option-status" id="mailtoStatus"></div>
                        </button>
                        
                        <button class="email-option-btn" id="clipboardBtn" data-method="clipboard">
                            <div class="email-option-icon">📋</div>
                            <div class="email-option-content">
                                <div class="email-option-title">Copy to Clipboard</div>
                                <div class="email-option-description">Copy formatted text to paste anywhere</div>
                            </div>
                            <div class="email-option-status" id="clipboardStatus"></div>
                        </button>
                        
                        <button class="email-option-btn" id="formSubmitBtn" data-method="form">
                            <div class="email-option-icon">🚀</div>
                            <div class="email-option-content">
                                <div class="email-option-title">Send Directly</div>
                                <div class="email-option-description">Send through our secure service</div>
                            </div>
                            <div class="email-option-status" id="formStatus"></div>
                        </button>
                        
                        <button class="email-option-btn" id="downloadBtn" data-method="download">
                            <div class="email-option-icon">💾</div>
                            <div class="email-option-content">
                                <div class="email-option-title">Download as File</div>
                                <div class="email-option-description">Save as a text file to your device</div>
                            </div>
                            <div class="email-option-status" id="downloadStatus"></div>
                        </button>
                    </div>
                    
                    <div class="email-preview-section hidden" id="emailPreview">
                        <h4>Email Preview:</h4>
                        <div class="email-preview-content" id="emailPreviewContent"></div>
                    </div>
                    
                    <div class="email-sharing-result hidden" id="emailResult">
                        <div class="email-result-icon"></div>
                        <div class="email-result-message"></div>
                        <div class="email-result-actions"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    setupEmailModalListeners();
}

function setupEmailModalListeners() {
    const modal = document.getElementById('emailModal');
    const overlay = document.getElementById('emailModalOverlay');
    const closeBtn = document.getElementById('emailModalClose');
    const optionBtns = document.querySelectorAll('.email-option-btn');
    
    // Close modal events
    [overlay, closeBtn].forEach(element => {
        if (element) {
            element.addEventListener('click', closeEmailModal);
        }
    });
    
    // Email sharing method buttons
    optionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const method = this.dataset.method;
            handleEmailSharing(method);
        });
    });
    
    // Keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeEmailModal();
        }
    });
}

function showEmailModal() {
    const modal = document.getElementById('emailModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Reset all statuses
        resetEmailStatuses();
        
        // Show preview
        showEmailPreview();
        
        // Focus first option
        const firstOption = modal.querySelector('.email-option-btn');
        if (firstOption) {
            firstOption.focus();
        }
    }
}

function closeEmailModal() {
    const modal = document.getElementById('emailModal');
    const result = document.getElementById('emailResult');
    
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Hide result section
        if (result) {
            result.classList.add('hidden');
        }
    }
}

function resetEmailStatuses() {
    const statusElements = document.querySelectorAll('.email-option-status');
    statusElements.forEach(el => {
        el.textContent = '';
        el.className = 'email-option-status';
    });
    
    const resultSection = document.getElementById('emailResult');
    if (resultSection) {
        resultSection.classList.add('hidden');
    }
}

function showEmailPreview() {
    const preview = document.getElementById('emailPreview');
    const previewContent = document.getElementById('emailPreviewContent');
    
    if (!questionnaireResponses || !preview || !previewContent) return;
    
    const emailContent = formatEmailContent(questionnaireResponses, 'preview');
    previewContent.innerHTML = `<pre>${escapeHtml(emailContent)}</pre>`;
    preview.classList.remove('hidden');
}

async function handleEmailSharing(method) {
    if (!questionnaireResponses) {
        showEmailResult('error', 'No responses to share', 'Please fill out the questionnaire first.');
        return;
    }
    
    setEmailStatus(method, 'loading', 'Processing...');
    
    try {
        let success = false;
        
        switch (method) {
            case 'mailto':
                success = await handleMailtoSharing();
                break;
            case 'clipboard':
                success = await handleClipboardSharing();
                break;
            case 'form':
                success = await handleFormSubmissionEmail();
                break;
            case 'download':
                success = await handleDownloadSharing();
                break;
            default:
                throw new Error('Unknown sharing method');
        }
        
        if (success) {
            setEmailStatus(method, 'success', 'Success!');
        } else {
            setEmailStatus(method, 'error', 'Failed');
            offerAlternativeMethods(method);
        }
        
    } catch (error) {
        console.error(`Email sharing error (${method}):`, error);
        setEmailStatus(method, 'error', 'Error');
        offerAlternativeMethods(method);
    }
}

// Mailto Link Handler with Chunking
async function handleMailtoSharing() {
    try {
        const emailContent = formatEmailContent(questionnaireResponses, 'mailto');
        const subject = encodeURIComponent(EMAIL_CONFIG.subjectPrefix);
        
        if (emailContent.length > EMAIL_CONFIG.maxMailtoLength) {
            // Content too long, offer chunked emails
            return await handleChunkedMailto(emailContent, subject);
        }
        
        const encodedBody = encodeURIComponent(emailContent);
        const mailtoUrl = `mailto:${EMAIL_CONFIG.recipient}?subject=${subject}&body=${encodedBody}`;
        
        // Test if mailto is supported
        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
        
        showEmailResult('success', 'Email app opened!', 'Your default email application should now be open with your responses ready to send.');
        
        return true;
        
    } catch (error) {
        console.error('Mailto error:', error);
        return false;
    }
}

async function handleChunkedMailto(content, subject) {
    const chunks = chunkEmailContent(content, EMAIL_CONFIG.chunkSize);
    
    if (chunks.length > 1) {
        const proceed = confirm(`Your responses are quite long! This will create ${chunks.length} email drafts. Continue?`);
        if (!proceed) return false;
    }
    
    for (let i = 0; i < chunks.length; i++) {
        const chunkSubject = encodeURIComponent(`${EMAIL_CONFIG.subjectPrefix} (Part ${i + 1}/${chunks.length})`);
        const encodedBody = encodeURIComponent(chunks[i]);
        const mailtoUrl = `mailto:${EMAIL_CONFIG.recipient}?subject=${chunkSubject}&body=${encodedBody}`;
        
        const link = document.createElement('a');
        link.href = mailtoUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Small delay between chunks
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        link.click();
        document.body.removeChild(link);
    }
    
    showEmailResult('success', `${chunks.length} email drafts created!`, 'Multiple email drafts have been created due to length. Please send each one.');
    return true;
}

function chunkEmailContent(content, maxLength) {
    if (content.length <= maxLength) return [content];
    
    const chunks = [];
    let currentChunk = '';
    const lines = content.split('\n');
    
    for (const line of lines) {
        if ((currentChunk + line + '\n').length > maxLength && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }
    
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    
    return chunks;
}

// Clipboard Handler with Fallbacks
async function handleClipboardSharing() {
    const emailContent = formatEmailContent(questionnaireResponses, 'text');
    
    try {
        // Modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(emailContent);
            showEmailResult('success', 'Copied to clipboard!', 'Your responses have been copied. You can now paste them into any email or messaging app.');
            return true;
        }
        
        // Fallback method
        return await fallbackClipboardCopy(emailContent);
        
    } catch (error) {
        console.error('Clipboard error:', error);
        return await fallbackClipboardCopy(emailContent);
    }
}

async function fallbackClipboardCopy(text) {
    try {
        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        
        textarea.focus();
        textarea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
            showEmailResult('success', 'Copied to clipboard!', 'Your responses have been copied using legacy method. You can now paste them anywhere.');
            return true;
        } else {
            throw new Error('execCommand failed');
        }
        
    } catch (error) {
        console.error('Fallback clipboard error:', error);
        
        // Final fallback: show text in modal for manual copy
        showManualCopyModal(text);
        return true; // Consider this a success since we provided the text
    }
}

function showManualCopyModal(text) {
    const modalContent = `
        <div class="manual-copy-modal">
            <h4>Please Copy Manually</h4>
            <p>Automatic copying isn't available. Please select all text below and copy it manually:</p>
            <textarea readonly class="manual-copy-text">${escapeHtml(text)}</textarea>
            <div class="manual-copy-instructions">
                <p><strong>Instructions:</strong></p>
                <p>1. Click in the text area above</p>
                <p>2. Press Ctrl+A (or Cmd+A on Mac) to select all</p>
                <p>3. Press Ctrl+C (or Cmd+C on Mac) to copy</p>
                <p>4. Paste into your email app with Ctrl+V (or Cmd+V on Mac)</p>
            </div>
            <button class="btn-primary" onclick="closeEmailModal()">Got it!</button>
        </div>
    `;
    
    showEmailResult('info', 'Manual Copy Required', modalContent);
    
    // Auto-select the text
    setTimeout(() => {
        const textarea = document.querySelector('.manual-copy-text');
        if (textarea) {
            textarea.focus();
            textarea.select();
        }
    }, 100);
}

// Form Submission Handler with Fallbacks
async function handleFormSubmissionEmail() {
    const emailContent = formatEmailContent(questionnaireResponses, 'text');
    const formData = {
        recipient: EMAIL_CONFIG.recipient,
        subject: EMAIL_CONFIG.subjectPrefix,
        message: emailContent,
        timestamp: new Date().toISOString(),
        responses: questionnaireResponses
    };
    
    // Try each endpoint
    for (let i = 0; i < FORM_ENDPOINTS.length; i++) {
        const endpoint = FORM_ENDPOINTS[i];
        
        try {
            const success = await submitToEndpoint(endpoint, formData);
            if (success) {
                showEmailResult('success', 'Sent successfully!', 'Your responses have been sent directly via our secure service.');
                return true;
            }
        } catch (error) {
            console.error(`Endpoint ${i + 1} failed:`, error);
            continue;
        }
    }
    
    // All endpoints failed
    showEmailResult('error', 'Service temporarily unavailable', 'All our sending services are currently unavailable. Please try the other sharing methods.');
    return false;
}

async function submitToEndpoint(endpoint, data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EMAIL_CONFIG.timeoutMs);
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
        
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Download Handler
async function handleDownloadSharing() {
    try {
        const emailContent = formatEmailContent(questionnaireResponses, 'text');
        const filename = `Love_Responses_${new Date().toISOString().split('T')[0]}.txt`;
        
        const blob = new Blob([emailContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        showEmailResult('success', 'File downloaded!', `Your responses have been saved as "${filename}". You can now attach this file to any email.`);
        return true;
        
    } catch (error) {
        console.error('Download error:', error);
        return false;
    }
}

// Email Content Formatting
function formatEmailContent(responses, format = 'text') {
    const lineBreak = format === 'mailto' ? EMAIL_CONFIG.lineBreakMailto : EMAIL_CONFIG.lineBreakText;
    const doubleBreak = lineBreak + lineBreak;
    
    let content = `${EMAIL_CONFIG.subjectPrefix}${doubleBreak}`;
    content += `Submitted with love on: ${submissionTimestamp ? submissionTimestamp.toLocaleString() : new Date().toLocaleString()}${doubleBreak}`;
    content += `${'='.repeat(50)}${doubleBreak}`;
    
    Object.keys(responses).forEach((key, index) => {
        const response = responses[key];
        content += `${index + 1}. ${response.question}${doubleBreak}`;
        content += `💕 ${response.answer}${doubleBreak}`;
        content += `${'-'.repeat(30)}${doubleBreak}`;
    });
    
    content += `${'='.repeat(50)}${doubleBreak}`;
    content += `Sent with all my love ❤️${doubleBreak}`;
    content += `This was created with our Love Questionnaire App`;
    
    // Additional encoding for mailto
    if (format === 'mailto') {
        // Replace problematic characters
        content = content.replace(/[^\w\s\-_.,!?@#$%^&*()+=[\]{};:'"<>/\\|`~💕❤️💖💗💝💘💞💓🔥💋😍😘🥰]/g, '');
    }
    
    return content;
}

// Status Management
function setEmailStatus(method, status, message) {
    const statusEl = document.getElementById(`${method}Status`);
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = `email-option-status status-${status}`;
    
    // Add appropriate icon
    const icon = {
        loading: '⏳',
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };
    
    statusEl.textContent = `${icon[status]} ${message}`;
}

function showEmailResult(type, title, content) {
    const result = document.getElementById('emailResult');
    if (!result) return;
    
    const icon = result.querySelector('.email-result-icon');
    const message = result.querySelector('.email-result-message');
    const actions = result.querySelector('.email-result-actions');
    
    const icons = {
        success: '🎉',
        error: '😔',
        info: '💡',
        warning: '⚠️'
    };
    
    if (icon) icon.textContent = icons[type] || '💕';
    if (message) {
        message.innerHTML = `<h4>${title}</h4><div class="result-content">${content}</div>`;
    }
    
    // Add action buttons based on type
    if (actions) {
        let actionButtons = '';
        if (type === 'error') {
            actionButtons = `
                <button class="btn-secondary" onclick="offerAllMethods()">Try Other Methods</button>
                <button class="btn-outline" onclick="closeEmailModal()">Close</button>
            `;
        } else {
            actionButtons = `<button class="btn-primary" onclick="closeEmailModal()">Close</button>`;
        }
        actions.innerHTML = actionButtons;
    }
    
    result.classList.remove('hidden');
    result.className = `email-sharing-result result-${type}`;
}

function offerAlternativeMethods(failedMethod) {
    const alternatives = {
        mailto: ['clipboard', 'download', 'form'],
        clipboard: ['mailto', 'download', 'form'],
        form: ['mailto', 'clipboard', 'download'],
        download: ['clipboard', 'mailto', 'form']
    };
    
    const suggested = alternatives[failedMethod] || [];
    const methods = {
        mailto: 'Email App',
        clipboard: 'Copy to Clipboard',
        form: 'Send Directly',
        download: 'Download File'
    };
    
    const suggestions = suggested.map(method => 
        `<button class="btn-outline btn-sm" onclick="handleEmailSharing('${method}')">${methods[method]}</button>`
    ).join(' ');
    
    if (suggestions) {
        const result = document.querySelector('.email-result-actions');
        if (result) {
            result.innerHTML = `
                <p>Try these alternatives:</p>
                <div class="alternative-methods">${suggestions}</div>
                <button class="btn-secondary" onclick="closeEmailModal()">Close</button>
            `;
        }
    }
}

function offerAllMethods() {
    const result = document.getElementById('emailResult');
    if (result) {
        result.classList.add('hidden');
    }
    
    // Reset all statuses
    resetEmailStatuses();
}

// Utility Functions
function detectClipboardSupport() {
    const clipboardBtn = document.getElementById('clipboardBtn');
    if (!clipboardBtn) return;
    
    if (!navigator.clipboard && !document.queryCommandSupported?.('copy')) {
        const status = clipboardBtn.querySelector('.email-option-status');
        if (status) {
            status.textContent = '⚠️ Limited support';
            status.className = 'email-option-status status-warning';
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Fix photo section loading
function initPhotoSection() {
    const photoItems = document.querySelectorAll('.photo-item');
    
    photoItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            // Create placeholder content if image fails to load
            img.addEventListener('error', function() {
                this.style.display = 'none';
                const placeholder = document.createElement('div');
                placeholder.style.cssText = `
                    width: 100%;
                    height: 250px;
                    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                    color: white;
                `;
                placeholder.innerHTML = '💕';
                this.parentNode.insertBefore(placeholder, this);
            });
            
            // Ensure images load with proper timing
            img.addEventListener('load', function() {
                this.parentNode.style.opacity = '1';
                this.parentNode.style.transform = 'translateY(0)';
            });
        }
    });
}

// Navigation functionality
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Calculate offset for fixed navigation
                const navHeight = document.querySelector('.navigation').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Show/hide navigation based on responses
    updateNavigationVisibility();
}

function updateNavigationVisibility() {
    const viewResponsesNav = document.getElementById('viewResponsesNav');
    if (questionnaireResponses) {
        viewResponsesNav.classList.remove('hidden');
    } else {
        viewResponsesNav.classList.add('hidden');
    }
}

// Questionnaire functionality
function initQuestionnaire() {
    const form = document.getElementById('questionnaireForm');
    const thankYouSection = document.getElementById('thankYou');
    const responsesSection = document.getElementById('responses');
    const viewResponsesBtn = document.getElementById('viewResponsesBtn');
    const editResponsesBtn = document.getElementById('editResponsesBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    
    // Form submission - FIXED
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleQuestionnaireSubmission();
        });
    }
    
    // View responses button
    if (viewResponsesBtn) {
        viewResponsesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showResponsesSection();
        });
    }
    
    // Edit responses button
    if (editResponsesBtn) {
        editResponsesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            editResponses();
        });
    }
    
    // Back to form button
    if (backToFormBtn) {
        backToFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            resetQuestionnaire();
        });
    }
    
    // Auto-save functionality (simple)
    const inputs = form ? form.querySelectorAll('.question-input') : [];
    inputs.forEach(input => {
        input.addEventListener('input', debounce(autoSave, 1000));
    });
    
    // Load any existing auto-saved data
    loadAutoSavedData();
}

function handleQuestionnaireSubmission() {
    const form = document.getElementById('questionnaireForm');
    const formData = new FormData(form);
    
    console.log('Form submission started'); // Debug log
    
    // Clear any existing error messages
    clearFormErrors();
    
    // Validate all fields are filled
    const inputs = form.querySelectorAll('.question-input');
    let isValid = true;
    let firstEmptyField = null;
    
    inputs.forEach((input, index) => {
        const value = input.value.trim();
        if (!value) {
            isValid = false;
            input.style.borderColor = '#ff6b6b';
            input.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
            
            if (!firstEmptyField) {
                firstEmptyField = input;
            }
            
            // Add error message to the question card
            const questionCard = input.closest('.question-card');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'field-error';
            errorMsg.textContent = 'Please share your beautiful thoughts here 💕';
            errorMsg.style.cssText = `
                color: #d63031;
                font-size: 14px;
                margin-top: 8px;
                font-style: italic;
            `;
            questionCard.appendChild(errorMsg);
        } else {
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        }
    });
    
    if (!isValid) {
        showFormError(`Please fill in all ${inputs.length} questions before submitting your beautiful responses. Every answer is precious to me! 💕`);
        
        // Scroll to first empty field
        if (firstEmptyField) {
            firstEmptyField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstEmptyField.focus();
        }
        return;
    }
    
    // Create responses object
    questionnaireResponses = {};
    const questions = [
        "What's something you've always wanted to do with me but never said out loud?",
        "What makes you feel most loved and appreciated by me?",
        "What are some small things I could do that would make your day better?",
        "What kind of partner do you need me to be as we grow together?",
        "What's one thing I've done that made you feel deeply loved or proud of me?",
        "What's a fantasy or crazy idea you think we'd actually pull off together?",
        "What's your wildest fantasy that you want to perform with me?",
        "When did you first realize you were falling for me — and what made you sure?",
        "What's your biggest turn on?",
        "How do you imagine our future together, and what can I do to make it closer to that vision?",
        "Any other suggestions or changes that I must incorporate in me to our lives better?"
    ];
    
    for (let i = 1; i <= 11; i++) {
        questionnaireResponses[`question${i}`] = {
            question: questions[i-1],
            answer: formData.get(`question${i}`).trim()
        };
    }
    
    submissionTimestamp = new Date();
    
    console.log('Responses saved:', questionnaireResponses); // Debug log
    
    // Show submission animation
    showSubmissionAnimation();
    
    // Clear auto-saved data
    clearAutoSavedData();
    
    // Update navigation
    updateNavigationVisibility();
    
    // Show thank you section after animation
    setTimeout(() => {
        showThankYouSection();
    }, 1500);
}

function clearFormErrors() {
    // Remove existing error messages
    const errorElements = document.querySelectorAll('.field-error, .form-error');
    errorElements.forEach(el => el.remove());
    
    // Reset input styles
    const inputs = document.querySelectorAll('.question-input');
    inputs.forEach(input => {
        input.style.borderColor = '';
        input.style.backgroundColor = '';
    });
}

function showSubmissionAnimation() {
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-text">Sending Hearts... 💕</span>';
    submitBtn.style.animation = 'heartbeat 0.5s ease-in-out infinite';
    
    // Create heart explosion effect
    createHeartExplosion(submitBtn);
    
    setTimeout(() => {
        submitBtn.style.animation = '';
        submitBtn.innerHTML = '<span class="btn-text">Sent! 💖</span>';
    }, 1500);
}

function createHeartExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const hearts = ['💕', '💖', '💗', '💝', '💘', '💞', '💓'];
    
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.position = 'fixed';
        heart.style.left = centerX + 'px';
        heart.style.top = centerY + 'px';
        heart.style.fontSize = '24px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        
        document.body.appendChild(heart);
        
        const angle = (Math.PI * 2 * i) / 20;
        const distance = 150 + Math.random() * 100;
        const finalX = centerX + Math.cos(angle) * distance;
        const finalY = centerY + Math.sin(angle) * distance;
        
        heart.animate([
            {
                transform: 'translate(-50%, -50%) scale(0)',
                opacity: 1
            },
            {
                transform: `translate(${finalX - centerX - 12}px, ${finalY - centerY - 12}px) scale(1)`,
                opacity: 1
            },
            {
                transform: `translate(${finalX - centerX - 12}px, ${finalY - centerY - 100}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            if (document.body.contains(heart)) {
                document.body.removeChild(heart);
            }
        };
    }
}

function showThankYouSection() {
    const questionnaireSection = document.getElementById('questionnaire');
    const thankYouSection = document.getElementById('thankYou');
    const timestampEl = document.getElementById('submissionTime');
    
    // Hide questionnaire and show thank you
    questionnaireSection.classList.add('hidden');
    thankYouSection.classList.remove('hidden');
    
    // Set timestamp
    if (timestampEl) {
        timestampEl.textContent = `Submitted with love on ${submissionTimestamp.toLocaleDateString()} at ${submissionTimestamp.toLocaleTimeString()}`;
    }
    
    // Scroll to thank you section
    setTimeout(() => {
        thankYouSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    // Add entrance animation
    thankYouSection.style.opacity = '0';
    thankYouSection.style.transform = 'translateY(50px)';
    
    setTimeout(() => {
        thankYouSection.style.transition = 'all 1s ease';
        thankYouSection.style.opacity = '1';
        thankYouSection.style.transform = 'translateY(0)';
    }, 200);
}

function showResponsesSection() {
    if (!questionnaireResponses) {
        console.log('No responses to show');
        return;
    }
    
    const thankYouSection = document.getElementById('thankYou');
    const responsesSection = document.getElementById('responses');
    const responsesContent = document.getElementById('responsesContent');
    
    // Generate responses HTML
    let responsesHTML = '';
    
    Object.keys(questionnaireResponses).forEach((key, index) => {
        const response = questionnaireResponses[key];
        responsesHTML += `
            <div class="response-item fade-in-up" data-delay="${index * 0.1}">
                <div class="response-question">
                    <span class="question-number">${index + 1}</span>
                    ${response.question}
                </div>
                <div class="response-answer">${response.answer}</div>
            </div>
        `;
    });
    
    // Add email sharing button - FIXED
    responsesHTML += `
        <div class="response-actions">
            <button class="btn-primary email-share-btn" onclick="showEmailModal()">
                💕 Share via Email
            </button>
            <p class="share-hint">Share your beautiful responses with me!</p>
        </div>
    `;
    
    if (responsesContent) {
        responsesContent.innerHTML = responsesHTML;
    }
    
    // Hide thank you and show responses
    thankYouSection.classList.add('hidden');
    responsesSection.classList.remove('hidden');
    
    // Scroll to responses section
    setTimeout(() => {
        responsesSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    // Trigger animations
    setTimeout(() => {
        initScrollAnimations();
    }, 200);
}

function editResponses() {
    if (!questionnaireResponses) return;
    
    const responsesSection = document.getElementById('responses');
    const questionnaireSection = document.getElementById('questionnaire');
    const form = document.getElementById('questionnaireForm');
    
    // Populate form with existing responses
    Object.keys(questionnaireResponses).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = questionnaireResponses[key].answer;
        }
    });
    
    // Hide responses and show questionnaire
    responsesSection.classList.add('hidden');
    questionnaireSection.classList.remove('hidden');
    
    // Scroll to questionnaire
    setTimeout(() => {
        questionnaireSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function resetQuestionnaire() {
    const responsesSection = document.getElementById('responses');
    const questionnaireSection = document.getElementById('questionnaire');
    const thankYouSection = document.getElementById('thankYou');
    const form = document.getElementById('questionnaireForm');
    
    // Reset form
    if (form) {
        form.reset();
    }
    
    // Clear responses
    questionnaireResponses = null;
    submissionTimestamp = null;
    
    // Clear any error messages
    clearFormErrors();
    
    // Update navigation
    updateNavigationVisibility();
    
    // Hide other sections and show questionnaire
    responsesSection.classList.add('hidden');
    thankYouSection.classList.add('hidden');
    questionnaireSection.classList.remove('hidden');
    
    // Scroll to questionnaire
    setTimeout(() => {
        questionnaireSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    // Reset submit button
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-text">Send My Heart to You</span><span class="btn-heart">💕</span>';
    }
}

function showFormError(message) {
    // Create or update error message
    let errorEl = document.querySelector('.form-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'form-error';
        errorEl.style.cssText = `
            background: rgba(255, 107, 107, 0.1);
            color: #d63031;
            padding: 16px 20px;
            border-radius: 12px;
            margin: 20px 0;
            border: 2px solid rgba(255, 107, 107, 0.3);
            text-align: center;
            font-family: 'Inter', sans-serif;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
            animation: shake 0.5s ease-in-out;
        `;
        
        const formActions = document.querySelector('.form-actions');
        if (formActions) {
            formActions.insertBefore(errorEl, formActions.firstChild);
        }
    }
    
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    // Add shake animation
    errorEl.style.animation = 'shake 0.5s ease-in-out';
    
    // Hide error after 8 seconds
    setTimeout(() => {
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }, 8000);
}

// Auto-save functionality
function autoSave() {
    const form = document.getElementById('questionnaireForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        if (value.trim()) {
            data[key] = value;
        }
    }
    
    if (Object.keys(data).length > 0) {
        // Store in memory (since localStorage is not available)
        window.autoSavedData = data;
    }
}

function loadAutoSavedData() {
    if (window.autoSavedData) {
        const form = document.getElementById('questionnaireForm');
        if (!form) return;
        
        Object.keys(window.autoSavedData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = window.autoSavedData[key];
            }
        });
    }
}

function clearAutoSavedData() {
    delete window.autoSavedData;
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Floating Hearts Background Animation
function initFloatingHearts() {
    const heartsContainer = document.getElementById('heartsContainer');
    if (!heartsContainer) return;
    
    const heartEmojis = ['❤️', '💖', '💕', '💗', '💝', '💘', '💞', '💓'];
    
    function createFloatingHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        
        // Random starting position
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 3 + 5) + 's';
        heart.style.animationDelay = Math.random() * 2 + 's';
        
        heartsContainer.appendChild(heart);
        
        // Remove heart after animation completes
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
        }, 8000);
    }
    
    // Create hearts continuously
    setInterval(createFloatingHeart, 800);
}

// Scroll-triggered animations using Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.dataset.delay || 0;
                
                setTimeout(() => {
                    element.style.animationPlayState = 'running';
                    element.classList.add('animate');
                }, delay * 1000);
                
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up');
    animatedElements.forEach(element => {
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });
}

// Interactive Hearts with Click Effects
function initInteractiveHearts() {
    const clickableHearts = document.querySelectorAll('.clickable-heart');
    const messageDisplay = document.getElementById('loveMessageDisplay');
    
    clickableHearts.forEach(heart => {
        heart.addEventListener('click', function(e) {
            // Add clicked animation
            this.classList.add('clicked');
            
            // Show love message
            const loveMessage = this.dataset.love;
            if (messageDisplay) {
                messageDisplay.textContent = loveMessage;
                messageDisplay.classList.add('show');
            }
            
            // Create particle effect
            createParticleEffect(e.pageX, e.pageY);
            
            // Remove clicked class after animation
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 600);
            
            // Hide message after 3 seconds
            setTimeout(() => {
                if (messageDisplay) {
                    messageDisplay.classList.remove('show');
                }
            }, 3000);
        });
        
        // Add hover effects
        heart.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        heart.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Particle Effect for Heart Clicks
function createParticleEffect(x, y) {
    const particleCount = 12;
    const particles = ['💖', '💕', '✨', '💫', '⭐'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        
        // Position particle at click location
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random direction and distance
        const angle = (Math.PI * 2 * i) / particleCount;
        const distance = Math.random() * 100 + 50;
        const finalX = x + Math.cos(angle) * distance;
        const finalY = y + Math.sin(angle) * distance;
        
        document.body.appendChild(particle);
        
        // Animate particle
        particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${finalX - x}px, ${finalY - y}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 1500,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            if (document.body.contains(particle)) {
                document.body.removeChild(particle);
            }
        };
    }
}

// Typewriter Effect for Main Title
function initTypewriterEffect() {
    const typewriterElement = document.getElementById('mainTitle');
    if (!typewriterElement) return;
    
    const text = typewriterElement.textContent;
    typewriterElement.textContent = '';
    
    let charIndex = 0;
    
    function typeChar() {
        if (charIndex < text.length) {
            typewriterElement.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(typeChar, 100);
        } else {
            // Remove the cursor after typing is complete
            setTimeout(() => {
                typewriterElement.style.borderRight = 'none';
            }, 1000);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeChar, 1000);
}

// Smooth Scrolling for Navigation
function initSmoothScrolling() {
    // Add scroll indicator click functionality
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.querySelector('.love-message');
            if (nextSection) {
                const navHeight = document.querySelector('.navigation').offsetHeight;
                const targetPosition = nextSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// Parallax Effect for Background Elements
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Enhanced Photo Effects
document.addEventListener('DOMContentLoaded', function() {
    const photoItems = document.querySelectorAll('.photo-item');
    
    photoItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 30px rgba(255, 182, 193, 0.8)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
        
        item.addEventListener('click', function() {
            this.classList.toggle('mobile-active');
        });
    });
});

// Quote Cards Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const quoteCards = document.querySelectorAll('.quote-card');
    
    quoteCards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.2) + 's';
        
        card.addEventListener('click', function() {
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                left: 50%;
                top: 50%;
                width: 20px;
                height: 20px;
                margin-left: -10px;
                margin-top: -10px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (this.contains(ripple)) {
                    this.removeChild(ripple);
                }
            }, 600);
        });
    });
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .photo-item.mobile-active .photo-overlay {
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Mobile Touch Enhancements
if ('ontouchstart' in window) {
    document.addEventListener('DOMContentLoaded', function() {
        const touchElements = document.querySelectorAll('.clickable-heart, .photo-item, .quote-card');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = '';
            });
        });
    });
}

// Questionnaire Input Enhancements
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.question-input');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const length = this.value.length;
            
            if (length > 100) {
                this.style.background = 'rgba(255, 182, 193, 0.1)';
            } else {
                this.style.background = 'rgba(255, 255, 255, 0.8)';
            }
            
            // Clear error styling when user starts typing
            if (length > 0) {
                this.style.borderColor = '';
                this.style.backgroundColor = '';
                
                // Remove error message if exists
                const errorMsg = this.parentNode.querySelector('.field-error');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
        
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.boxShadow = '0 10px 25px rgba(255, 182, 193, 0.3)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
            this.parentElement.style.boxShadow = '';
        });
    });
});

// Window Load Event
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
});

// Error Handling for Images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.fontSize = '48px';
            this.innerHTML = '💕';
            this.style.color = 'white';
        });
    });
});

// Global function to make showEmailModal available from HTML onclick
window.showEmailModal = showEmailModal;
window.closeEmailModal = closeEmailModal;
window.handleEmailSharing = handleEmailSharing;
window.offerAllMethods = offerAllMethods;