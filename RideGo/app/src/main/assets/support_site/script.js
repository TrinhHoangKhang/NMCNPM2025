// Tab Navigation
function switchTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    const selectedBtn = document.querySelector('[data-tab="' + tabName + '"]');
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.getAttribute('data-tab'));
        });
    });

    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
            const answer = question.nextElementSibling;
            if (question.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = 0;
            }
        });
    });

    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const feedbackType = document.getElementById('feedbackType').value;
            const feedbackSubject = document.getElementById('feedbackSubject').value;
            const feedbackMessage = document.getElementById('feedbackMessage').value;
            const feedbackEmail = document.getElementById('feedbackEmail').value;

            if (!feedbackType || !feedbackSubject || !feedbackMessage) {
                showMessage('Vui lòng điền đầy đủ các trường bắt buộc!', 'error');
                return;
            }

            if (feedbackSubject.length < 5) {
                showMessage('Tiêu đề phải có ít nhất 5 ký tự!', 'error');
                return;
            }

            if (feedbackMessage.length < 10) {
                showMessage('Chi tiết phải có ít nhất 10 ký tự!', 'error');
                return;
            }

            const feedbackData = {
                type: feedbackType,
                subject: feedbackSubject,
                message: feedbackMessage,
                contact: feedbackEmail,
                timestamp: new Date().toISOString()
            };

            try {
                let feedbacks = JSON.parse(localStorage.getItem('ridego_feedbacks')) || [];
                feedbacks.push(feedbackData);
                localStorage.setItem('ridego_feedbacks', JSON.stringify(feedbacks));

                showMessage('✓ Cảm ơn bạn! Phản hồi của bạn đã được gửi thành công.', 'success');
                feedbackForm.reset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                showMessage('Lỗi: Không thể gửi phản hồi. Vui lòng thử lại.', 'error');
            }
        });
    }

    function showMessage(text, type) {
        const messageElement = document.querySelector('.feedback-message');
        if (messageElement) {
            messageElement.textContent = text;
            messageElement.className = 'feedback-message ' + type;
            setTimeout(() => {
                messageElement.className = 'feedback-message';
            }, 5000);
        }
    }
});
