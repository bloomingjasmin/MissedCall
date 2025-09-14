// MissedCall - script.js
// Handles smooth scrolling, section transitions, audio/video, and interactivity

document.addEventListener('DOMContentLoaded', function () {
  // Global state management
  let audioEnabled = false;
  let soundOn = true;
  let currentSection = 1;
  
  // DOM elements
  const landingPage = document.getElementById('landing-page');
  const navigation = document.getElementById('navigation');
  const soundControl = document.getElementById('sound-control');
  const soundToggle = document.getElementById('sound-toggle');
  const soundIcon = document.querySelector('.sound-icon');
  const ringtone = document.getElementById('ringtone');
  const thunderAudio = document.getElementById('thunder-static');
  const birdsAudio = document.getElementById('birds-chirp');
  const whoosh = document.getElementById('whoosh');
  
  // Section elements
  const sections = [
    document.getElementById('the-call'),
    document.getElementById('the-temptation'),
    document.getElementById('the-choice'),
    document.getElementById('release'),
    document.getElementById('about-artist')
  ];
  
  const navNumbers = document.querySelectorAll('.nav-number');

  // Landing page functionality
  function initLandingPage() {
    const landingSubtitle = document.querySelector('.landing-subtitle');
    landingSubtitle.addEventListener('click', startExperience);
  }

  function startExperience() {
    // Fade out landing page
    landingPage.classList.add('fade-out');
    
    // Show navigation and sound control
    setTimeout(() => {
      navigation.classList.add('visible');
      soundControl.classList.add('visible');
      landingPage.style.display = 'none';
    }, 800);
    
    // Enable audio after user interaction
    enableAudio();
  }

  // Audio control system
  function enableAudio() {
    if (!audioEnabled) {
      audioEnabled = true;
      if (soundOn) {
        playCurrentSectionAudio();
      }
    }
  }

  function toggleSound() {
    soundOn = !soundOn;
    soundIcon.textContent = soundOn ? '🔊' : '🔇';
    
    if (!soundOn) {
      // Pause all audio
      pauseAllAudio();
    } else if (audioEnabled) {
      // Resume audio for current section
      playCurrentSectionAudio();
    }
  }

  function pauseAllAudio() {
    if (ringtone) ringtone.pause();
    if (thunderAudio) thunderAudio.pause();
    if (birdsAudio) birdsAudio.pause();
    if (whoosh) whoosh.pause();
  }

  // Enhanced audio system with scroll-based volume control
  function playCurrentSectionAudio() {
    if (!soundOn || !audioEnabled) return;
    
    // Only handle ringtone for Section 1, other sections handle their own audio
    if (currentSection === 1 && ringtone) {
      ringtone.volume = 0.3; // Quieter volume
      ringtone.muted = false;
      ringtone.play();
    }
  }

  // Handle ringtone for sections 1 and 3
  function handleRingtoneForSection(sectionNumber) {
    const choicePhoneContainer = document.querySelector('.choice-phone-container');
    
    if (sectionNumber === 1) {
      // Section 1: Play ringtone and add shake to phone
      if (soundOn && ringtone) {
        ringtone.volume = 0.3; // Quieter volume
        if (ringtone.paused) {
          ringtone.play().catch(e => console.error("Ringtone autoplay failed:", e));
        }
      }
    } else if (sectionNumber === 3) {
      // Section 3: Play ringtone and add shake to choice phone
      if (soundOn && ringtone) {
        ringtone.volume = 0.2; // Even quieter for Section 3
        if (ringtone.paused) {
          ringtone.play().catch(e => console.error("Ringtone autoplay failed:", e));
        }
      }
      // Add shaking animation to choice phone
      if (choicePhoneContainer) {
        choicePhoneContainer.classList.add('ringing');
      }
    } else {
      // Other sections: Stop ringtone and remove shake
      if (ringtone && !ringtone.paused) {
        ringtone.pause();
      }
      if (choicePhoneContainer) {
        choicePhoneContainer.classList.remove('ringing');
      }
    }
  }

  // Scroll-based audio volume control
  function handleScrollBasedAudio() {
    if (!soundOn || !audioEnabled || !ringtone) return;
    
    const callSection = sections[0]; // Section 1: The Call
    const temptationSection = sections[1]; // Section 2: The Temptation
    
    if (!callSection || !temptationSection) return;
    
    const callRect = callSection.getBoundingClientRect();
    const temptationRect = temptationSection.getBoundingClientRect();
    
    // Calculate scroll progress between Section 1 and Section 2
    // When Section 1 is fully visible: progress = 0 (volume = 1.0)
    // When Section 2 is fully visible: progress = 1 (volume = 0.0)
    let scrollProgress = 0;
    
    if (callRect.bottom > 0 && temptationRect.top < window.innerHeight) {
      // User is transitioning between sections
      const totalTransitionHeight = callRect.height + temptationRect.height;
      const scrolledPastCall = Math.max(0, -callRect.bottom);
      const scrolledIntoTemptation = Math.max(0, window.innerHeight - temptationRect.top);
      const totalScrolled = scrolledPastCall + scrolledIntoTemptation;
      
      // Calculate progress (0 to 1)
      scrollProgress = Math.min(1, totalScrolled / totalTransitionHeight);
    } else if (callRect.bottom <= 0) {
      // Section 1 is completely above viewport
      scrollProgress = 1;
    } else if (temptationRect.top >= window.innerHeight) {
      // Section 2 is completely below viewport
      scrollProgress = 0;
    }
    
    // Map scroll progress to volume (1.0 → 0.0)
    // Use smooth curve for more natural fade, with quieter base volume
    const baseVolume = 0.3; // Quieter base volume
    const volume = Math.max(0, Math.min(baseVolume, baseVolume * (1 - scrollProgress)));
    
    // Apply volume with smooth transition
    if (ringtone) {
      ringtone.volume = volume;
      
      // Start/stop ringtone based on volume
      if (volume > 0 && ringtone.paused) {
        ringtone.muted = false;
        ringtone.play();
      } else if (volume === 0 && !ringtone.paused) {
        // Don't pause immediately, let it fade naturally
        // The volume will be 0 but audio will continue
      }
    }
  }

  // Navigation system
  function initNavigation() {
    navNumbers.forEach((nav, index) => {
      nav.addEventListener('click', () => {
        const targetSection = sections[index];
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function updateNavigation() {
    navNumbers.forEach((nav, index) => {
      nav.classList.toggle('active', index + 1 === currentSection);
    });
  }

  // Section detection and background transitions
  function detectCurrentSection() {
    let newSection = 1;
    
    sections.forEach((section, index) => {
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          newSection = index + 1;
        }
      }
    });
    
    if (newSection !== currentSection) {
      currentSection = newSection;
      updateNavigation();
      // Handle ringtone for sections 1 and 3
      handleRingtoneForSection(newSection);
      // Only play general section audio if not in a special audio handling section
      if (newSection !== 1 && newSection !== 3) {
        playCurrentSectionAudio();
      }
    }
  }

  // Smooth scroll for scroll-down arrow
  function initScrollArrows() {
    document.querySelectorAll('.scroll-down').forEach(arrow => {
      arrow.addEventListener('click', () => {
        const nextSection = arrow.closest('section').nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Section 3: The Choice - Interactive gradient with mouse position tracking
  function initChoiceSection() {
    const choiceSection = document.getElementById('the-choice');
    const declineSide = document.getElementById('decline-side');
    const acceptSide = document.getElementById('accept-side');
    const declineBtn = document.getElementById('decline-btn');
    const acceptBtn = document.getElementById('accept-btn');
    const choicePhoneContainer = document.querySelector('.choice-phone-container');
    
    let isInChoiceSection = false;
    let mouseX = 0;
    let audioFadeInterval = null;
    
    // Audio fade control with immediate volume changes
    function setAudioVolume(audioElement, targetVolume) {
      if (!audioElement || !soundOn) return;
      
      if (audioFadeInterval) {
        clearInterval(audioFadeInterval);
        audioFadeInterval = null;
      }
      
      audioElement.volume = Math.max(0, Math.min(1, targetVolume));
    }
    
    // Update gradient background based on mouse position
    function updateGradientBackground(intensity) {
      // intensity: 0 (far left/white) to 1 (far right/black)
      // Clamp between 0 and 1
      const clampedIntensity = Math.max(0, Math.min(1, intensity));
      
      // Calculate gradient stops based on mouse position
      let leftColor, rightColor;
      
      if (clampedIntensity <= 0.5) {
        // Mouse on left side - moving towards white
        const whiteIntensity = (0.5 - clampedIntensity) * 2; // 0 to 1
        leftColor = '#ffffff';
        // When intensity is 0 (far left), right should also be white
        // When intensity is 0.5 (center), right should be black
        const rightGray = Math.round(255 - (255 * whiteIntensity));
        rightColor = `rgb(${rightGray}, ${rightGray}, ${rightGray})`;
      } else {
        // Mouse on right side - moving towards black
        const blackIntensity = (clampedIntensity - 0.5) * 2; // 0 to 1
        // When intensity is 0.5 (center), left should be white
        // When intensity is 1 (far right), left should be black
        const leftGray = Math.round(255 - (255 * blackIntensity));
        leftColor = `rgb(${leftGray}, ${leftGray}, ${leftGray})`;
        rightColor = '#000000';
      }
      
      // Apply the gradient
      choiceSection.style.background = `linear-gradient(90deg, ${leftColor} 0%, ${rightColor} 100%)`;
    }
    
    // Handle mouse position and update gradient/audio
    function handleMousePosition(mouseX) {
      if (!isInChoiceSection) return;
      
      // Get section width and calculate relative position
      const sectionRect = choiceSection.getBoundingClientRect();
      const sectionWidth = sectionRect.width;
      const relativeX = mouseX - sectionRect.left;
      
      // Calculate intensity: 0 (far left) to 1 (far right)
      const intensity = Math.max(0, Math.min(1, relativeX / sectionWidth));
      
      // Update gradient based on mouse position
      updateGradientBackground(intensity);
      
      // Update audio based on mouse position
      if (soundOn) {
        if (intensity < 0.5) {
          // Mouse on left side - birds audio
          const leftIntensity = (0.5 - intensity) * 2; // Convert to 0-1 range for left side
          if (birdsAudio) {
            if (birdsAudio.paused) birdsAudio.play();
            setAudioVolume(birdsAudio, leftIntensity * 0.8);
          }
          if (thunderAudio) {
            setAudioVolume(thunderAudio, 0);
            if (thunderAudio.volume === 0) thunderAudio.pause();
          }
        } else {
          // Mouse on right side - thunder audio
          const rightIntensity = (intensity - 0.5) * 2; // Convert to 0-1 range for right side
          if (thunderAudio) {
            if (thunderAudio.paused) thunderAudio.play();
            setAudioVolume(thunderAudio, rightIntensity * 0.8);
          }
          if (birdsAudio) {
            setAudioVolume(birdsAudio, 0);
            if (birdsAudio.volume === 0) birdsAudio.pause();
          }
        }
      }
    }
    
    // Reset to neutral state
    function resetChoiceState() {
      // Reset to neutral gradient (white to black)
      updateGradientBackground(0.5); // Center position
      if (thunderAudio) {
        setAudioVolume(thunderAudio, 0);
        thunderAudio.pause();
      }
      if (birdsAudio) {
        setAudioVolume(birdsAudio, 0);
        birdsAudio.pause();
      }
    }
    
    // Mouse tracking for gradient and audio control
    function handleMouseMove(event) {
      if (!isInChoiceSection) return;
      
      const mouseX = event.clientX;
      handleMousePosition(mouseX);
    }
    
    // Mouse events for immediate feedback
    declineSide.addEventListener('mouseenter', () => {
      if (isInChoiceSection) {
        handleMousePosition(choiceSection.getBoundingClientRect().left + choiceSection.getBoundingClientRect().width * 0.2);
      }
    });
    
    acceptSide.addEventListener('mouseenter', () => {
      if (isInChoiceSection) {
        handleMousePosition(choiceSection.getBoundingClientRect().left + choiceSection.getBoundingClientRect().width * 0.8);
      }
    });
    
    // Button click handlers with new navigation logic
    declineBtn.addEventListener('click', () => {
      // Decline: Move forward to Section 4 (Release)
      handleMousePosition(choiceSection.getBoundingClientRect().left);
      setTimeout(() => {
        document.getElementById('release').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (birdsAudio) {
            setAudioVolume(birdsAudio, 0);
            birdsAudio.pause();
          }
        }, 2000);
      }, 500);
    });
    
    acceptBtn.addEventListener('click', () => {
      // Accept: Go back to Section 2 (trapped in the past loop)
      handleMousePosition(choiceSection.getBoundingClientRect().left + choiceSection.getBoundingClientRect().width);
      setTimeout(() => {
        // Navigate back to Section 2 (The Temptation) - "trapped in the past"
        document.getElementById('the-temptation').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (thunderAudio) {
            setAudioVolume(thunderAudio, 0);
            thunderAudio.pause();
          }
          // Restart the video in Section 2
          const video = document.getElementById('temptation-video');
          if (video && video.contentWindow) {
            try {
              // Try to restart iframe video (Google Drive doesn't allow direct control)
              video.src = video.src; // This will reload the iframe
            } catch (e) {
              console.log('Video restart not supported by iframe');
            }
          }
        }, 2000);
      }, 500);
    });
    
    // Section detection and mouse tracking setup
    window.addEventListener('scroll', () => {
      const rect = choiceSection.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isVisible && currentSection === 3) {
        isInChoiceSection = true;
        // Add mouse move listener when in section
        choiceSection.addEventListener('mousemove', handleMouseMove);
        // Start ringtone and add shake animation for choice section
        if (soundOn && ringtone) {
          ringtone.volume = 0.2; // Even quieter for Section 3
          if (ringtone.paused) {
            ringtone.play().catch(e => console.error("Choice ringtone failed:", e));
          }
        }
        if (choicePhoneContainer) {
          choicePhoneContainer.classList.add('ringing');
        }
      } else {
        isInChoiceSection = false;
        // Remove mouse move listener when out of section
        choiceSection.removeEventListener('mousemove', handleMouseMove);
        // Stop ringtone and remove shake animation when leaving choice section
        if (ringtone && !ringtone.paused) {
          ringtone.pause();
        }
        if (choicePhoneContainer) {
          choicePhoneContainer.classList.remove('ringing');
        }
        if (currentSection !== 3) {
          resetChoiceState();
        }
      }
    });
    
    // Initialize audio elements with debugging
    function initAudio() {
      if (thunderAudio) {
        thunderAudio.volume = 0;
        thunderAudio.preload = 'auto';
        thunderAudio.addEventListener('canplaythrough', () => {
          console.log('Thunder audio loaded successfully');
        });
        thunderAudio.addEventListener('error', (e) => {
          console.error('Thunder audio failed to load:', e);
        });
      }
      
      if (birdsAudio) {
        birdsAudio.volume = 0;
        birdsAudio.preload = 'auto';
        birdsAudio.addEventListener('canplaythrough', () => {
          console.log('Birds audio loaded successfully');
        });
        birdsAudio.addEventListener('error', (e) => {
          console.error('Birds audio failed to load:', e);
        });
      }
    }
    
    // Initialize audio
    initAudio();
    
    // Test audio on first user interaction
    document.addEventListener('click', () => {
      if (soundOn && thunderAudio && thunderAudio.paused) {
        thunderAudio.play().then(() => {
          console.log('Audio test successful');
          thunderAudio.pause();
          thunderAudio.currentTime = 0;
        }).catch(e => {
          console.error('Audio test failed:', e);
        });
      }
    }, { once: true });
  }

  // Enhanced Section 4: Release functionality
  function initReleaseSection() {
    const releaseInput = document.getElementById('release-input');
    const letGoBtn = document.getElementById('let-go-btn');
    const releaseContainer = document.getElementById('release-container');
    const releaseMsg = document.getElementById('release-message');
    const whoosh = document.getElementById('whoosh');
    
    // Handle "Let the past go" button click
    if (letGoBtn) {
      letGoBtn.addEventListener('click', () => {
        const userText = releaseInput.value.trim();
        
        if (userText !== '') {
          // Play whoosh sound if sound is enabled
          if (soundOn && whoosh) {
            whoosh.play();
          }
          
          // Fade out the input container over 5 seconds
          releaseContainer.classList.add('fade-out');
          
          // After fade is complete, show the message
          setTimeout(() => {
            releaseContainer.style.display = 'none';
            releaseMsg.textContent = 'You let it go.';
            releaseMsg.classList.add('show');
          }, 5000);
        }
      });
    }
    
    // Handle Enter key in input
    if (releaseInput) {
      releaseInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          letGoBtn.click();
        }
      });
    }
  }

  // Choice buttons functionality (now handled in initChoiceSection)
  function initChoiceButtons() {
    // Button functionality is now integrated into initChoiceSection
    // This function is kept for compatibility but functionality moved
  }

  // Error handling for iframe and console errors
  function initErrorHandling() {
    // Suppress Google Drive iframe console errors
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      // Filter out known Google Drive/YouTube iframe errors
      if (message.includes('postMessage') && 
          (message.includes('youtube.googleapis.com') || 
           message.includes('drive.google.com'))) {
        return; // Suppress these specific errors
      }
      if (message.includes('Content Security Policy') && 
          message.includes('frame-ancestors')) {
        return; // Suppress CSP errors
      }
      if (message.includes('aria-hidden') && 
          message.includes('assistive technology')) {
        return; // Suppress accessibility warnings from iframe
      }
      // Log other errors normally
      originalError.apply(console, args);
    };
    
    // Handle iframe load errors
    const iframe = document.getElementById('temptation-video');
    if (iframe) {
      iframe.addEventListener('error', () => {
        console.log('Video iframe failed to load, using fallback');
        // Could add a fallback image or message here
      });
      
      iframe.addEventListener('load', () => {
        console.log('Video iframe loaded successfully');
      });
    }
  }

  // Initialize all functionality
  function init() {
    initErrorHandling(); // Initialize error handling first
    initLandingPage();
    initNavigation();
    initScrollArrows();
    initChoiceSection();
    initReleaseSection();
    initChoiceButtons();
    
    // Event listeners
    soundToggle.addEventListener('click', toggleSound);
    window.addEventListener('scroll', () => {
      detectCurrentSection();
      handleScrollBasedAudio(); // Add scroll-based audio handling
    });
    
    // Initial setup
    updateNavigation();
  }

  // Start the application
  init();
});