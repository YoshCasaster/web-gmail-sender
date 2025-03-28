document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const statusMessage = document.getElementById('statusMessage');
    
    // Handle form submission
    emailForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(emailForm);
      const data = {
        recipients: formData.get('recipients'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        template: formData.get('template'),
        duration: formData.get('duration')
      };
      
      // Show loading state
      const submitBtn = emailForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
      submitBtn.disabled = true;
      
      try {
        // Send data to server
        const response = await fetch('/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        // SYoshCasaster
        const result = await response.json();
        
        if (result.success) {
          // Show success message
          statusMessage.className = 'status-message success';
          statusMessage.innerHTML = `<i class="fas fa-check-circle"></i> ${result.message}`;
          
          // Reset form
          emailForm.reset();
        } else {
          // Show error message
          statusMessage.className = 'status-message error';
          statusMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${result.error || 'Terjadi kesalahan'}`;
        }
      } catch (error) {
        console.error('Error:', error);
        statusMessage.className = 'status-message error';
        statusMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> Gagal mengirim email. Silakan coba lagi.`;
      } finally {
        // Reset button state
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        
        // Hide message after 5 seconds
        setTimeout(() => {
          statusMessage.style.display = 'none';
        }, 5000);
      }
    });
    
    // Add animation to template selection
    const templateBtns = document.querySelectorAll('.template-btn');
    templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
          btn.classList.remove('animate__animated', 'animate__pulse');
        }, 1000);
      });
    });
  });