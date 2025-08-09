// Timer module for download page
(function() {
    'use strict';

    class DownloadTimer {
        constructor() {
            this.packageName = 'com.cricfy.tv';
            this.version = '5.6';
            this.timerDuration = 10; // seconds
            this.downloadUrl = 'https://example.com/downloads/cricfy-tv-v5-6.apk';
            
            // DOM elements
            this.downloadButton = document.getElementById('downloadButton');
            this.timerNumber = document.getElementById('timerNumber');
            this.timerDisplay = document.getElementById('timerDisplay');
            this.buttonText = document.getElementById('buttonText');
            this.buttonIcon = document.getElementById('buttonIcon');
            this.statusTitle = document.getElementById('statusTitle');
            this.statusMessage = document.getElementById('statusMessage');
            this.statusIcon = document.getElementById('statusIcon');
            this.progressContainer = document.getElementById('progressContainer');
            this.progressFill = document.getElementById('progressFill');
            this.progressText = document.getElementById('progressText');
            
            this.currentTime = 0;
            this.isTimerActive = false;
            this.isDownloadReady = false;
            
            this.init();
        }

        init() {
            if (!this.downloadButton) return;
            
            this.loadTimerState();
            this.bindEvents();
            this.startTimer();
        }

        bindEvents() {
            this.downloadButton.addEventListener('click', (e) => {
                this.handleDownloadClick(e);
            });

            // Prevent multiple rapid clicks
            this.downloadButton.addEventListener('click', this.debounce(() => {
                if (this.isDownloadReady) {
                    this.initiateDownload();
                }
            }, 300));
        }

        loadTimerState() {
            const storageKey = `cricfy_timer_${this.packageName}_${this.version}`;
            const savedState = localStorage.getItem(storageKey);
            
            if (savedState) {
                const state = JSON.parse(savedState);
                const now = Date.now();
                const elapsed = Math.floor((now - state.startTime) / 1000);
                
                if (elapsed < this.timerDuration) {
                    this.currentTime = this.timerDuration - elapsed;
                    this.isTimerActive = true;
                } else {
                    this.currentTime = 0;
                    this.isDownloadReady = true;
                    localStorage.removeItem(storageKey);
                }
            } else {
                this.currentTime = this.timerDuration;
            }
        }

        saveTimerState() {
            const storageKey = `cricfy_timer_${this.packageName}_${this.version}`;
            const state = {
                startTime: Date.now(),
                duration: this.timerDuration
            };
            localStorage.setItem(storageKey, JSON.stringify(state));
        }

        startTimer() {
            if (this.isDownloadReady) {
                this.showDownloadReady();
                return;
            }

            if (!this.isTimerActive) {
                this.saveTimerState();
                this.isTimerActive = true;
            }

            this.updateTimerDisplay();
            this.announceTimerStart();

            const interval = setInterval(() => {
                this.currentTime--;
                this.updateTimerDisplay();
                this.updateProgress();

                if (this.currentTime <= 0) {
                    clearInterval(interval);
                    this.onTimerComplete();
                }
            }, 1000);
        }

        updateTimerDisplay() {
            if (this.timerNumber) {
                this.timerNumber.textContent = this.currentTime;
            }

            if (this.buttonText) {
                this.buttonText.textContent = `Generating secure link in ${this.currentTime} seconds`;
            }

            // Update aria-label for accessibility
            if (this.downloadButton) {
                this.downloadButton.setAttribute('aria-label', 
                    `Download will be available in ${this.currentTime} seconds`);
            }
        }

        updateProgress() {
            const progress = ((this.timerDuration - this.currentTime) / this.timerDuration) * 100;
            
            if (this.progressFill) {
                this.progressFill.style.width = `${progress}%`;
            }
            
            if (this.progressText) {
                this.progressText.textContent = `${Math.round(progress)}%`;
            }
        }

        onTimerComplete() {
            this.isTimerActive = false;
            this.isDownloadReady = true;
            
            // Clear saved state
            const storageKey = `cricfy_timer_${this.packageName}_${this.version}`;
            localStorage.removeItem(storageKey);
            
            this.showDownloadReady();
            this.announceTimerComplete();
        }

        showDownloadReady() {
            // Update button
            if (this.downloadButton) {
                this.downloadButton.disabled = false;
                this.downloadButton.classList.add('active');
                this.downloadButton.setAttribute('aria-label', 'Download CricFy TV APK v5.6');
            }

            if (this.buttonText) {
                this.buttonText.textContent = 'Get Download Link';
            }

            if (this.buttonIcon) {
                this.buttonIcon.textContent = '📱';
            }

            // Update status
            if (this.statusTitle) {
                this.statusTitle.textContent = 'Download Ready';
            }

            if (this.statusMessage) {
                this.statusMessage.textContent = 'Your secure download link is ready. Click the button below to proceed.';
            }

            if (this.statusIcon) {
                this.statusIcon.textContent = '✅';
            }

            // Hide timer display
            if (this.timerDisplay) {
                this.timerDisplay.style.display = 'none';
            }

            // Show progress as complete
            if (this.progressFill) {
                this.progressFill.style.width = '100%';
            }
            
            if (this.progressText) {
                this.progressText.textContent = '100%';
            }
        }

        handleDownloadClick(e) {
            if (!this.isDownloadReady) {
                e.preventDefault();
                this.announceWaitMessage();
                return;
            }

            // Prevent default to handle the download ourselves
            e.preventDefault();
            this.initiateDownload();
        }

        initiateDownload() {
            if (!this.isDownloadReady) return;

            // Show loading state
            this.showLoadingState();

            // Simulate brief loading time for better UX
            setTimeout(() => {
                this.redirectToDownload();
            }, 1500);
        }

        showLoadingState() {
            if (this.downloadButton) {
                this.downloadButton.classList.remove('active');
                this.downloadButton.classList.add('loading');
                this.downloadButton.disabled = true;
            }

            if (this.buttonText) {
                this.buttonText.textContent = 'Preparing download...';
            }

            if (this.buttonIcon) {
                this.buttonIcon.textContent = '⏳';
            }

            if (this.statusTitle) {
                this.statusTitle.textContent = 'Preparing Download';
            }

            if (this.statusMessage) {
                this.statusMessage.textContent = 'Please wait while we prepare your secure download...';
            }

            if (this.progressContainer) {
                this.progressContainer.style.display = 'block';
                this.animateProgress();
            }
        }

        animateProgress() {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress > 100) progress = 100;

                if (this.progressFill) {
                    this.progressFill.style.width = `${progress}%`;
                }
                
                if (this.progressText) {
                    this.progressText.textContent = `${Math.round(progress)}%`;
                }

                if (progress >= 100) {
                    clearInterval(interval);
                }
            }, 200);
        }

        redirectToDownload() {
            // In a real implementation, you might want to:
            // 1. Validate the user session
            // 2. Log the download attempt
            // 3. Generate a temporary download token
            
            window.location.href = this.downloadUrl;
            
            // Update UI to show completion
            if (this.statusTitle) {
                this.statusTitle.textContent = 'Download Started';
            }

            if (this.statusMessage) {
                this.statusMessage.textContent = 'Your download should start automatically. If not, please check your downloads folder.';
            }

            if (this.buttonText) {
                this.buttonText.textContent = 'Download Started';
            }

            if (this.buttonIcon) {
                this.buttonIcon.textContent = '✅';
            }
        }

        announceTimerStart() {
            if (window.announceToScreenReader) {
                window.announceToScreenReader(`Download timer started. Please wait ${this.timerDuration} seconds for the download link to become available.`);
            }
        }

        announceTimerComplete() {
            if (window.announceToScreenReader) {
                window.announceToScreenReader('Download link is now ready. You can proceed with the download.');
            }
        }

        announceWaitMessage() {
            if (window.announceToScreenReader) {
                window.announceToScreenReader(`Please wait ${this.currentTime} more seconds for the download link to become available.`);
            }
        }

        // Utility function to debounce rapid clicks
        debounce(func, wait) {
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
    }

    // Initialize timer when DOM is ready
    function initializeTimer() {
        new DownloadTimer();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTimer);
    } else {
        initializeTimer();
    }

})();

